package cz.touristmap.tiles;

import com.onthegomap.planetiler.Planetiler;
import com.onthegomap.planetiler.Profile;
import com.onthegomap.planetiler.config.Arguments;
import java.nio.file.Path;

/**
 * Builds one vector PMTiles file from an OSM extract.
 *
 * <p>Usage: {@code java -jar czmap-tiles.jar --profile=base|routes --osm_path=FILE --output=FILE.pmtiles}
 */
public class Main {

    public static void main(String[] args) throws Exception {
        Arguments arguments = Arguments.fromArgsOrConfigFile(args).orElse(Arguments.of(
            "maxzoom", "14",
            "tile_compression", "gzip"
        ));
        String name = arguments.getString("profile", "tile set to build: base or routes", "base");
        Path osm = arguments.file("osm_path", "OSM input file", Path.of("data/czech-republic.osm.pbf"));
        Path output = arguments.file("output", "output file", Path.of("dist", name + ".pmtiles"));

        Profile profile = switch (name) {
            case "base" -> new BaseProfile();
            case "routes" -> new RoutesProfile();
            default -> throw new IllegalArgumentException("Unknown profile: " + name);
        };

        Planetiler.create(arguments)
            .setProfile(profile)
            .addOsmSource("osm", osm)
            .overwriteOutput(output)
            .run();
    }
}
