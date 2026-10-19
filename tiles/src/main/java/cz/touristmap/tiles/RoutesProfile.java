package cz.touristmap.tiles;

import com.onthegomap.planetiler.FeatureCollector;
import com.onthegomap.planetiler.FeatureMerge;
import com.onthegomap.planetiler.Profile;
import com.onthegomap.planetiler.VectorTile;
import com.onthegomap.planetiler.geo.GeometryException;
import com.onthegomap.planetiler.reader.SourceFeature;
import com.onthegomap.planetiler.reader.osm.OsmElement;
import com.onthegomap.planetiler.reader.osm.OsmRelationInfo;
import java.util.List;
import java.util.Locale;
import java.util.TreeSet;

/**
 * Hiking and cycling route overlay.
 *
 * <p>Route relations are flattened to their member ways. One way can carry many routes, so each hiking colour gets a
 * {@code slot} and the style shifts the line by the slot to draw parallel stripes.
 */
public class RoutesProfile implements Profile {

    /** KČT colours in drawing order. */
    private static final List<String> COLORS = List.of("red", "blue", "green", "yellow");

    /** Hiking route kinds, best first. */
    private static final List<String> KINDS = List.of("major", "local", "learning", "other");

    private record HikingRoute(long id, String color, String kind) implements OsmRelationInfo {}

    private record CycleRoute(long id, String ref, int network, boolean mtb) implements OsmRelationInfo {}

    @Override
    public List<OsmRelationInfo> preprocessOsmRelation(OsmElement.Relation relation) {
        if (!relation.hasTag("type", "route") || relation.hasTag("state", "proposed")) {
            return null;
        }
        if (relation.hasTag("route", "hiking", "foot")) {
            String color = hikingColor(relation);
            return color == null ? null : List.of(new HikingRoute(relation.id(), color, hikingKind(relation, color)));
        }
        if (relation.hasTag("route", "bicycle", "mtb")) {
            int network = switch (relation.getString("network", "")) {
                case "icn" -> 0;
                case "ncn" -> 1;
                case "rcn" -> 2;
                default -> 3;
            };
            return List.of(new CycleRoute(relation.id(), relation.getString("ref"), network,
                relation.hasTag("route", "mtb")));
        }
        return null;
    }

    /** Colour from osmc:symbol (first part), with fallback to the colour tag. */
    private static String hikingColor(OsmElement.Relation relation) {
        String symbol = relation.getString("osmc:symbol");
        String color = symbol != null ? symbol.split(":", 2)[0] : relation.getString("colour");
        if (color == null) {
            return null;
        }
        color = color.toLowerCase(Locale.ROOT).trim();
        return COLORS.contains(color) ? color : null;
    }

    /** Route kind from kct_* tags (Czech Tourist Club). */
    private static String hikingKind(OsmElement.Relation relation, String color) {
        String kct = relation.getString("kct_" + color, "");
        return switch (kct) {
            case "major" -> "major";
            case "local" -> "local";
            case "learning" -> "learning";
            case "" -> "major";
            default -> "other";
        };
    }

    @Override
    public void processFeature(SourceFeature sf, FeatureCollector features) {
        if (!sf.canBeLine() || !sf.hasRelationInfo()) {
            return;
        }
        processHiking(sf, features);
        processCycling(sf, features);
    }

    private void processHiking(SourceFeature sf, FeatureCollector features) {
        var routes = sf.relationInfo(HikingRoute.class);
        if (routes.isEmpty()) {
            return;
        }
        // Best kind for each colour present on this way.
        String[] kinds = new String[COLORS.size()];
        for (var member : routes) {
            HikingRoute route = member.relation();
            int i = COLORS.indexOf(route.color());
            if (kinds[i] == null || KINDS.indexOf(route.kind()) < KINDS.indexOf(kinds[i])) {
                kinds[i] = route.kind();
            }
        }
        int count = 0;
        for (String kind : kinds) {
            if (kind != null) {
                count++;
            }
        }
        int slot = 0;
        for (int i = 0; i < COLORS.size(); i++) {
            if (kinds[i] == null) {
                continue;
            }
            features.line("hiking")
                .setAttr("color", COLORS.get(i))
                .setAttr("kind", kinds[i])
                .setAttr("slot", slot)
                .setAttr("count", count)
                .setMinZoom(kinds[i].equals("major") ? 9 : 11)
                .setSortKey(i);
            slot++;
        }
    }

    private void processCycling(SourceFeature sf, FeatureCollector features) {
        var routes = sf.relationInfo(CycleRoute.class);
        if (routes.isEmpty()) {
            return;
        }
        TreeSet<String> refs = new TreeSet<>((a, b) -> {
            // Sort numbers by value, other refs by text.
            boolean an = a.chars().allMatch(Character::isDigit);
            boolean bn = b.chars().allMatch(Character::isDigit);
            if (an && bn) {
                return Long.compare(Long.parseLong(a), Long.parseLong(b));
            }
            return an ? -1 : bn ? 1 : a.compareTo(b);
        });
        int network = 3;
        boolean mtbOnly = true;
        for (var member : routes) {
            CycleRoute route = member.relation();
            if (route.ref() != null && !route.ref().isBlank() && route.ref().length() <= 8) {
                refs.add(route.ref().trim());
            }
            network = Math.min(network, route.network());
            mtbOnly &= route.mtb();
        }
        var feature = features.line("cycling")
            .setAttr("network", network)
            .setMinZoom(network <= 1 ? 8 : 10)
            .setSortKeyDescending(network);
        if (mtbOnly) {
            feature.setAttr("mtb", 1);
        }
        if (!refs.isEmpty()) {
            feature.setAttrWithMinzoom("refs", String.join(", ", refs), 12);
        }
    }

    @Override
    public List<VectorTile.Feature> postProcessLayerFeatures(String layer, int zoom, List<VectorTile.Feature> items)
        throws GeometryException {
        return FeatureMerge.mergeLineStrings(items, zoom < 12 ? 0.5 : 0, 0.25, 4);
    }

    @Override
    public String name() {
        return "Czech Tourist Map - routes";
    }

    @Override
    public String description() {
        return "Hiking and cycling routes of the Czech Republic";
    }

    @Override
    public String attribution() {
        return OSM_ATTRIBUTION;
    }

    @Override
    public boolean isOverlay() {
        return true;
    }
}
