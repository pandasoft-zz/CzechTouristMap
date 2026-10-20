package cz.touristmap.tiles;

import com.onthegomap.planetiler.FeatureCollector;
import com.onthegomap.planetiler.FeatureMerge;
import com.onthegomap.planetiler.Profile;
import com.onthegomap.planetiler.VectorTile;
import com.onthegomap.planetiler.geo.GeometryException;
import com.onthegomap.planetiler.reader.SourceFeature;
import java.util.List;

/**
 * Contour lines from {@code data/contours/<part>.gpkg} (made by {@code relief/build_contours.py}).
 *
 * <p>One layer {@code contours} with the attribute {@code ele} (metres). Lines appear by height step:
 * every 100 m from zoom 11, every 50 m from zoom 12 and all lines (10 m) from zoom 13.
 */
public class ContoursProfile implements Profile {

    /** Minimum zoom of a contour line by its height. */
    static int minZoom(int ele) {
        if (ele % 100 == 0) {
            return 11;
        }
        if (ele % 50 == 0) {
            return 12;
        }
        return 13;
    }

    @Override
    public void processFeature(SourceFeature sf, FeatureCollector features) {
        if (!sf.canBeLine()) {
            return;
        }
        int ele = (int) sf.getLong("ele");
        features.line("contours")
            .setAttr("ele", ele)
            .setMinZoom(minZoom(ele))
            .setMinPixelSize(2);
    }

    @Override
    public List<VectorTile.Feature> postProcessLayerFeatures(String layer, int zoom, List<VectorTile.Feature> items)
        throws GeometryException {
        // Join the line parts of one height that were cut at the 1 degree DEM tile edges.
        return FeatureMerge.mergeLineStrings(items, 0.5, 0.25, 4);
    }

    @Override
    public String name() {
        return "Czech Tourist Map - contours";
    }

    @Override
    public String description() {
        return "Contour lines of the Czech Republic";
    }

    @Override
    public String attribution() {
        return "<a href=\"https://sonny.4lima.de/\">© Sonny's LiDAR DTM</a> "
            + "<a href=\"https://geoportal.cuzk.gov.cz/\">© ČÚZK</a>";
    }

    @Override
    public boolean isOverlay() {
        return true;
    }
}
