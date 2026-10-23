package cz.touristmap.tiles;

import com.onthegomap.planetiler.FeatureCollector;
import com.onthegomap.planetiler.FeatureMerge;
import com.onthegomap.planetiler.Profile;
import com.onthegomap.planetiler.VectorTile;
import com.onthegomap.planetiler.geo.GeometryException;
import com.onthegomap.planetiler.reader.SourceFeature;
import com.onthegomap.planetiler.reader.osm.OsmElement;
import com.onthegomap.planetiler.reader.osm.OsmRelationInfo;
import com.onthegomap.planetiler.util.Parse;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.LineString;

/**
 * Base map without POIs: land cover, water, roads, railways, buildings, boundaries and labels.
 *
 * <p>Source layers and attributes are documented in {@code docs/tile-schema.md}.
 */
public class BaseProfile implements Profile {

    /** Land cover kind for landuse / natural / leisure tags. Farmland is the map background, so it is not stored. */
    private static final Map<String, String> LANDCOVER = Map.ofEntries(
        Map.entry("landuse=forest", "forest"),
        Map.entry("natural=wood", "forest"),
        Map.entry("landuse=meadow", "grass"),
        Map.entry("landuse=grass", "grass"),
        Map.entry("natural=grassland", "grass"),
        Map.entry("landuse=village_green", "grass"),
        Map.entry("landuse=orchard", "orchard"),
        Map.entry("landuse=vineyard", "vineyard"),
        Map.entry("landuse=plant_nursery", "orchard"),
        Map.entry("natural=scrub", "scrub"),
        Map.entry("natural=heath", "heath"),
        Map.entry("natural=wetland", "wetland"),
        Map.entry("landuse=residential", "residential"),
        Map.entry("landuse=industrial", "industrial"),
        Map.entry("landuse=commercial", "industrial"),
        Map.entry("landuse=retail", "industrial"),
        Map.entry("landuse=farmyard", "farmyard"),
        Map.entry("landuse=cemetery", "cemetery"),
        Map.entry("amenity=grave_yard", "cemetery"),
        Map.entry("leisure=park", "park"),
        Map.entry("leisure=garden", "park"),
        Map.entry("landuse=allotments", "allotments"),
        Map.entry("landuse=quarry", "quarry"),
        Map.entry("natural=bare_rock", "rock"),
        Map.entry("natural=scree", "scree"),
        Map.entry("natural=sand", "sand"),
        Map.entry("leisure=pitch", "sport"),
        Map.entry("leisure=golf_course", "sport")
    );

    private static final String[] LANDCOVER_KEYS = {"landuse", "natural", "leisure", "amenity"};

    /** Min zoom for each land cover kind. Small areas are dropped by min pixel size. */
    private static final Map<String, Integer> LANDCOVER_MINZOOM = Map.ofEntries(
        Map.entry("forest", 7),
        Map.entry("residential", 8),
        Map.entry("industrial", 10),
        Map.entry("grass", 10),
        Map.entry("orchard", 11),
        Map.entry("vineyard", 11),
        Map.entry("scrub", 11),
        Map.entry("heath", 11),
        Map.entry("wetland", 11),
        Map.entry("farmyard", 12),
        Map.entry("cemetery", 12),
        Map.entry("park", 12),
        Map.entry("allotments", 12),
        Map.entry("quarry", 11),
        Map.entry("rock", 12),
        Map.entry("scree", 12),
        Map.entry("sand", 12),
        Map.entry("sport", 13)
    );

    /** Road kind and min zoom. */
    private record RoadClass(String kind, int minZoom, int rank) {}

    private static final Map<String, RoadClass> ROADS = Map.ofEntries(
        Map.entry("motorway", new RoadClass("motorway", 5, 9)),
        Map.entry("motorway_link", new RoadClass("motorway", 11, 9)),
        Map.entry("trunk", new RoadClass("trunk", 6, 8)),
        Map.entry("trunk_link", new RoadClass("trunk", 11, 8)),
        Map.entry("primary", new RoadClass("primary", 7, 7)),
        Map.entry("primary_link", new RoadClass("primary", 12, 7)),
        Map.entry("secondary", new RoadClass("secondary", 9, 6)),
        Map.entry("secondary_link", new RoadClass("secondary", 12, 6)),
        Map.entry("tertiary", new RoadClass("tertiary", 10, 5)),
        Map.entry("tertiary_link", new RoadClass("tertiary", 13, 5)),
        Map.entry("unclassified", new RoadClass("minor", 11, 4)),
        Map.entry("residential", new RoadClass("minor", 12, 4)),
        Map.entry("living_street", new RoadClass("minor", 13, 4)),
        Map.entry("road", new RoadClass("minor", 13, 4)),
        Map.entry("pedestrian", new RoadClass("pedestrian", 13, 3)),
        Map.entry("service", new RoadClass("service", 13, 3)),
        Map.entry("track", new RoadClass("track", 12, 2)),
        Map.entry("path", new RoadClass("path", 13, 1)),
        Map.entry("footway", new RoadClass("path", 14, 1)),
        Map.entry("bridleway", new RoadClass("path", 13, 1)),
        Map.entry("cycleway", new RoadClass("cycleway", 13, 1)),
        Map.entry("steps", new RoadClass("steps", 14, 1))
    );

    private static final Map<String, Integer> PLACE_MINZOOM = Map.of(
        "city", 5,
        "town", 8,
        "village", 11,
        "suburb", 12,
        "hamlet", 13,
        "isolated_dwelling", 14,
        "locality", 14
    );

    /** Administrative boundary relation, stored on member ways. */
    private record AdminInfo(long id, int adminLevel) implements OsmRelationInfo {}

    @Override
    public List<OsmRelationInfo> preprocessOsmRelation(OsmElement.Relation relation) {
        if (relation.hasTag("type", "boundary") && relation.hasTag("boundary", "administrative")) {
            Integer level = Parse.parseIntOrNull(relation.getString("admin_level"));
            if (level != null && (level == 2 || level == 6)) {
                return List.of(new AdminInfo(relation.id(), level));
            }
        }
        return null;
    }

    @Override
    public void processFeature(SourceFeature sf, FeatureCollector features) {
        if (sf.canBePolygon()) {
            processArea(sf, features);
        }
        if (sf.canBeLine()) {
            processLine(sf, features);
        }
        if (sf.isPoint()) {
            processPoint(sf, features);
        }
        if (sf.canBeLine() && sf.hasRelationInfo()) {
            processBoundary(sf, features);
        }
    }

    private void processArea(SourceFeature sf, FeatureCollector features) {
        // Water areas
        if (sf.hasTag("natural", "water") || sf.hasTag("waterway", "riverbank")
            || sf.hasTag("landuse", "reservoir", "basin")) {
            if (sf.hasTag("water", "wastewater", "swimming_pool") || sf.hasTag("leisure", "swimming_pool")) {
                return;
            }
            features.polygon("water")
                .setMinZoom(6)
                .setMinPixelSize(2);
            String name = sf.getString("name");
            if (name != null) {
                features.pointOnSurface("water_labels")
                    .setAttr("name", name)
                    .setMinZoom(features.getMinZoomForPixelSize(64))
                    .setPointLabelGridSizeAndLimit(13, 64, 1);
            }
            return;
        }

        // Pedestrian areas: squares and pedestrian zones drawn as areas. They lie above other land cover.
        if (sf.hasTag("highway", "pedestrian", "footway") && sf.hasTag("area", "yes")
            || sf.hasTag("area:highway", "pedestrian", "footway") || sf.hasTag("place", "square")) {
            features.polygon("landcover")
                .setAttr("kind", "pedestrian")
                .setMinZoom(13)
                .setMinPixelSize(2)
                .setSortKey(10);
            return;
        }

        // Land cover
        String kind = landcoverKind(sf);
        if (kind != null) {
            var feature = features.polygon("landcover")
                .setAttr("kind", kind)
                .setMinZoom(LANDCOVER_MINZOOM.getOrDefault(kind, 12))
                .setMinPixelSize(2);
            if (kind.equals("forest")) {
                String leaf = sf.getString("leaf_type");
                if ("needleleaved".equals(leaf)) {
                    feature.setAttrWithMinzoom("leaf", "needle", 12);
                }
            }
        }

        // Buildings
        if (sf.hasTag("building") && !sf.hasTag("building", "no")) {
            features.polygon("buildings")
                .setMinZoom(13)
                .setMinPixelSize(1)
                .setPixelTolerance(0.4);
        }

        // Protected areas (national parks, CHKO, nature reserves)
        String protectedKind = protectedKind(sf);
        if (protectedKind != null) {
            features.polygon("protected")
                .setAttr("kind", protectedKind)
                .setAttr("name", sf.getString("name"))
                .setMinZoom(protectedKind.equals("reserve") ? 11 : 7)
                .setMinPixelSize(4);
        }
    }

    private static String landcoverKind(SourceFeature sf) {
        for (String key : LANDCOVER_KEYS) {
            Object value = sf.getTag(key);
            if (value != null) {
                String kind = LANDCOVER.get(key + "=" + value);
                if (kind != null) {
                    return kind;
                }
            }
        }
        return null;
    }

    private static String protectedKind(SourceFeature sf) {
        if (sf.hasTag("boundary", "national_park")) {
            return "national_park";
        }
        if (sf.hasTag("boundary", "protected_area")) {
            String cls = sf.getString("protect_class", "");
            return switch (cls) {
                case "2" -> "national_park";
                case "5" -> "landscape";
                case "1", "1a", "1b", "4" -> "reserve";
                default -> null;
            };
        }
        if (sf.hasTag("leisure", "nature_reserve")) {
            return "reserve";
        }
        return null;
    }

    private void processLine(SourceFeature sf, FeatureCollector features) {
        String highway = sf.getString("highway");
        if (highway != null) {
            processRoad(sf, features, highway);
            return;
        }
        String railway = sf.getString("railway");
        if (railway != null) {
            processRail(sf, features, railway);
            return;
        }
        String waterway = sf.getString("waterway");
        if (waterway != null) {
            processWaterway(sf, features, waterway);
            return;
        }
        processCliff(sf, features);
    }

    /**
     * Cliffs and steep banks. In OSM the lower side is on the right of the way direction, so these lines keep
     * their direction: they are not merged in {@link #postProcessLayerFeatures}.
     */
    private void processCliff(SourceFeature sf, FeatureCollector features) {
        String kind;
        if (sf.hasTag("natural", "cliff")) {
            kind = "cliff";
        } else if (sf.hasTag("natural", "earth_bank") || sf.hasTag("man_made", "embankment")) {
            kind = "bank";
        } else {
            return;
        }
        features.line("cliffs")
            .setAttr("kind", kind)
            .setMinZoom(kind.equals("cliff") ? 13 : 14)
            .setMinPixelSize(0);
    }

    private void processRoad(SourceFeature sf, FeatureCollector features, String highway) {
        RoadClass road = ROADS.get(highway);
        if (road == null) {
            return;
        }
        // Skip details that only add size: sidewalks, crossings, parking aisles, driveways.
        if (sf.hasTag("footway", "sidewalk", "crossing") || sf.hasTag("service", "parking_aisle", "driveway")
            || sf.hasTag("area", "yes") || sf.hasTag("access", "private", "no") && road.rank < 4) {
            return;
        }
        int minZoom = road.minZoom;
        if (road.kind.equals("track") && sf.hasTag("tracktype", "grade1", "grade2")) {
            minZoom = 12;
        }
        var feature = features.line("roads")
            .setAttr("kind", road.kind)
            .setMinZoom(minZoom)
            .setSortKey(layer(sf) * 10 + road.rank)
            .setMinPixelSize(0);
        if (highway.endsWith("_link")) {
            feature.setAttr("link", 1);
        }
        if (road.kind.equals("track")) {
            String grade = sf.getString("tracktype");
            if (grade != null && grade.startsWith("grade")) {
                feature.setAttrWithMinzoom("grade", Parse.parseIntOrNull(grade.substring(5)), 13);
            }
        }
        setStructure(sf, feature, 12);
        if (road.rank >= 5) {
            feature.setAttrWithMinzoom("ref", sf.getString("ref"), 10);
        }
        if (road.rank >= 3) {
            feature.setAttrWithMinzoom("name", sf.getString("name"), road.rank >= 5 ? 13 : 15);
        }
    }

    private void processRail(SourceFeature sf, FeatureCollector features, String railway) {
        String kind = switch (railway) {
            case "rail" -> "rail";
            case "narrow_gauge", "light_rail", "funicular" -> "narrow";
            case "tram" -> "tram";
            default -> null;
        };
        if (kind == null) {
            return;
        }
        boolean service = sf.hasTag("service");
        int minZoom = switch (kind) {
            case "rail" -> service ? 13 : 8;
            case "narrow" -> 11;
            default -> 13;
        };
        var feature = features.line("rail")
            .setAttr("kind", kind)
            .setMinZoom(minZoom)
            .setSortKey(layer(sf));
        if (service) {
            feature.setAttr("service", 1);
        }
        setStructure(sf, feature, 12);
    }

    private void processWaterway(SourceFeature sf, FeatureCollector features, String waterway) {
        int minZoom = switch (waterway) {
            case "river" -> 8;
            case "canal" -> 10;
            case "stream" -> 12;
            case "ditch", "drain" -> 14;
            default -> -1;
        };
        if (minZoom < 0) {
            return;
        }
        String kind = waterway.equals("river") || waterway.equals("canal") ? "river" : "stream";
        var feature = features.line("waterway")
            .setAttr("kind", kind)
            .setMinZoom(minZoom);
        if (sf.hasTag("intermittent", "yes")) {
            feature.setAttr("intermittent", 1);
        }
        if (sf.hasTag("tunnel", "culvert", "yes")) {
            feature.setAttr("tunnel", 1);
        }
        feature.setAttrWithMinzoom("name", sf.getString("name"), kind.equals("river") ? 12 : 14);
    }

    private void processBoundary(SourceFeature sf, FeatureCollector features) {
        int level = Integer.MAX_VALUE;
        for (var member : sf.relationInfo(AdminInfo.class)) {
            level = Math.min(level, member.relation().adminLevel());
        }
        if (level == Integer.MAX_VALUE) {
            return;
        }
        features.line("boundaries")
            .setAttr("level", level)
            .setMinZoom(level == 2 ? 0 : 7);
    }

    private void processPoint(SourceFeature sf, FeatureCollector features) {
        String place = sf.getString("place");
        String name = sf.getString("name");
        if (place != null && name != null) {
            Integer minZoom = PLACE_MINZOOM.get(place);
            if (minZoom == null) {
                return;
            }
            Long population = Parse.parseLongOrNull(sf.getString("population"));
            long pop = population == null ? 0 : population;
            if (place.equals("city") && pop < 100_000) {
                minZoom = 6;
            }
            features.point("places")
                .setAttr("kind", place)
                .setAttr("name", name)
                .setMinZoom(minZoom)
                .setSortKeyDescending((int) Math.min(pop / 100, 100_000))
                .setPointLabelGridSizeAndLimit(12, 32, 4);
            return;
        }
        if (sf.hasTag("natural", "peak") && name != null) {
            Double ele = Parse.parseDoubleOrNull(sf.getString("ele"));
            int e = ele == null ? 0 : (int) Math.round(ele);
            features.point("peaks")
                .setAttr("name", name)
                .setAttr("ele", e > 0 ? e : null)
                .setMinZoom(e >= 1000 ? 10 : 12)
                .setSortKeyDescending(e)
                .setPointLabelGridSizeAndLimit(13, 64, 1);
        }
    }

    private static void setStructure(SourceFeature sf, FeatureCollector.Feature feature, int minZoom) {
        if (sf.hasTag("bridge") && !sf.hasTag("bridge", "no")) {
            feature.setAttrWithMinzoom("bridge", 1, minZoom);
        } else if (sf.hasTag("tunnel") && !sf.hasTag("tunnel", "no")) {
            feature.setAttrWithMinzoom("tunnel", 1, minZoom);
        }
    }

    private static int layer(SourceFeature sf) {
        Integer layer = Parse.parseIntOrNull(sf.getString("layer"));
        return layer == null ? 0 : Math.max(-5, Math.min(5, layer));
    }

    @Override
    public List<VectorTile.Feature> postProcessLayerFeatures(String layer, int zoom, List<VectorTile.Feature> items)
        throws GeometryException {
        return switch (layer) {
            case "rail" -> FeatureMerge.mergeLineStrings(mergeParallelTram(items, zoom), zoom < 13 ? 0.5 : 0, 0.25, 4);
            case "roads", "waterway", "boundaries" ->
                FeatureMerge.mergeLineStrings(items, zoom < 13 ? 0.5 : 0, 0.25, 4);
            // Union only. mergeNearbyPolygons() would join close areas with bridges and make wedge artifacts.
            case "landcover", "water" -> zoom < 13
                ? FeatureMerge.mergeOverlappingPolygons(items, 1)
                : FeatureMerge.mergeMultiPolygon(items);
            case "buildings" -> zoom < 14
                ? FeatureMerge.mergeNearbyPolygons(items, 4, 4, 0.75, 4)
                : FeatureMerge.mergeMultiPolygon(items);
            default -> items;
        };
    }

    /** Distance in metres up to which two tram tracks count as one line. */
    private static final double TRAM_TRACK_DISTANCE = 10;

    /**
     * Draw a double tram track as one line: from the longest track down, remove the parts of each
     * track that run within {@link #TRAM_TRACK_DISTANCE} of a track already kept. Tracks that split
     * (loops, junctions) stay. Geometries are in tile pixels (256 per tile).
     */
    static List<VectorTile.Feature> mergeParallelTram(List<VectorTile.Feature> items, int zoom)
        throws GeometryException {
        double metresPerPixel = 40_075_016.686 * Math.cos(Math.toRadians(49.8)) / (256.0 * (1 << zoom));
        double distance = TRAM_TRACK_DISTANCE / metresPerPixel;
        List<VectorTile.Feature> result = new ArrayList<>();
        List<VectorTile.Feature> trams = new ArrayList<>();
        Map<VectorTile.Feature, Geometry> geometries = new IdentityHashMap<>();
        for (VectorTile.Feature item : items) {
            if ("tram".equals(item.tags().get("kind"))) {
                trams.add(item);
                geometries.put(item, item.geometry().decode());
            } else {
                result.add(item);
            }
        }
        trams.sort(Comparator.comparingDouble((VectorTile.Feature f) -> geometries.get(f).getLength()).reversed());
        Geometry covered = null;
        for (VectorTile.Feature tram : trams) {
            Geometry line = geometries.get(tram);
            Geometry rest = covered == null ? line : line.difference(covered);
            List<Geometry> parts = new ArrayList<>();
            for (int i = 0; i < rest.getNumGeometries(); i++) {
                Geometry part = rest.getGeometryN(i);
                // Short pieces are the ends of a removed track next to the kept one.
                if (part instanceof LineString && part.getLength() > 2 * distance) {
                    parts.add(part);
                }
            }
            if (parts.isEmpty()) {
                continue;
            }
            Geometry kept = line.getFactory().buildGeometry(parts);
            result.add(tram.copyWithNewGeometry(kept));
            Geometry area = kept.buffer(distance);
            covered = covered == null ? area : covered.union(area);
        }
        return result;
    }

    @Override
    public String name() {
        return "Czech Tourist Map - base";
    }

    @Override
    public String description() {
        return "Base map of the Czech Republic without POIs";
    }

    @Override
    public String attribution() {
        return OSM_ATTRIBUTION;
    }
}
