package cz.touristmap.tiles;

import com.onthegomap.planetiler.Planetiler;
import com.onthegomap.planetiler.Profile;
import com.onthegomap.planetiler.config.Arguments;
import java.nio.file.Path;

/**
 * Builds one vector PMTiles file: base and routes from an OSM extract, contours from a GeoPackage.
 *
 * <p>Usage: {@code java -jar czmap-tiles.jar --profile=base|routes|contours --osm_path=FILE --output=FILE.pmtiles}
 * <br>Contours read {@code --contours_path} (default {@code data/contours/cz.gpkg}).
 */
public class Main {

    public static void main(String[] args) throws Exception {
        Arguments arguments = Arguments.fromArgsOrConfigFile(args).orElse(Arguments.of(
            "maxzoom", "14",
            "tile_compression", "gzip"
        ));
        String name = arguments.getString("profile", "tile set to build: base, routes or contours", "base");
        Path osm = arguments.file("osm_path", "OSM input file", Path.of("data/czech-republic.osm.pbf"));
        Path contours = arguments.file("contours_path", "contour GeoPackage", Path.of("data/contours/cz.gpkg"));
        Path output = arguments.file("output", "output file", Path.of("dist", name + ".pmtiles"));

        Profile profile = switch (name) {
            case "base" -> new BaseProfile();
            case "routes" -> new RoutesProfile();
            case "contours" -> new ContoursProfile();
            default -> throw new IllegalArgumentException("Unknown profile: " + name);
        };

        Planetiler planetiler = Planetiler.create(arguments).setProfile(profile);
        if (profile instanceof ContoursProfile) {
            planetiler.addGeoPackageSource("contours", contours, null);
        } else {
            planetiler.addOsmSource("osm", osm);
        }
        planetiler.overwriteOutput(output).run();
    }
}
