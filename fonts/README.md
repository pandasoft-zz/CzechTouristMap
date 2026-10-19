# fonts/

Glyph files (SDF PBF) for map labels. MapLibre loads them by `{fontstack}/{range}.pbf`.
Each folder is one font stack. The server has no combined stacks, so a style uses one font per stack.

Ranges: Latin, Latin Extended A/B (Czech letters), Latin Extended Additional, punctuation
(`0-255`, `256-511`, `512-767`, `7680-7935`, `8192-8447`). The server returns an empty file for other ranges.

| Folder | Font | Used for | License |
|---|---|---|---|
| `NotoSans-Regular`, `-Italic`, `-Bold` | [Noto Sans](https://fonts.google.com/noto/specimen/Noto+Sans) | tourist map | SIL OFL 1.1 |
| `TopoSans-Regular`, `-Italic`, `-Bold` | [Liberation Sans 2.1.5](https://github.com/liberationfonts/liberation-fonts), renamed | topographic map (stands in for Arial) | SIL OFL 1.1, `licenses/TopoSans-OFL.txt` |
| `TopoSansNarrow-Regular`, `-Bold` | [Liberation Sans Narrow 1.07.6](https://github.com/liberationfonts/liberation-sans-narrow), renamed | topographic map (stands in for Arial Narrow) | GPL v2 with font exception, `licenses/TopoSansNarrow-*.txt` |
| `BarlowCondensed-Medium` | [Barlow Condensed](https://github.com/jpt/barlow) | topographic map | SIL OFL 1.1, `licenses/BarlowCondensed-OFL.txt` |
| `Roboto-Light` | [Roboto 2.138](https://github.com/googlefonts/roboto-2) | topographic map | Apache 2.0, `licenses/Roboto-Apache-2.0.txt` |

The topographic map uses the fonts of the ČÚZK ZTM10 legend (`docs/standards/vysvetlivky_ZTM10.pdf`):
Arial Narrow Bold, Arial, Arial Italic, Arial Bold, Arial Narrow, Barlow Condensed Medium and Roboto Light.
Arial and Arial Narrow are commercial fonts, so the metric-compatible Liberation fonts stand in for them.

The Liberation fonts are renamed to `TopoSans`: the glyph files are a converted (modified) version, and the
Liberation licenses do not allow the name "Liberation" on modified versions.

## Regenerate

```
cargo install build_pbf_glyphs        # needs Rust 1.87 or newer, e.g. docker image rust:1.88
build_pbf_glyphs <dir-with-ttf-files> /tmp/glyphs
```

Name the TTF files like the target folders (for example `TopoSans-Regular.ttf`).
Copy only the ranges listed above into `fonts/<FontName>/`.
