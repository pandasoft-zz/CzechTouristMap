# fonts/

Glyph files (SDF PBF) for map labels. MapLibre loads them by `{fontstack}/{range}.pbf`.

- Font: [Noto Sans](https://fonts.google.com/noto/specimen/Noto+Sans) Regular, Italic, Bold
- License: SIL Open Font License 1.1
- Ranges: Latin, Latin Extended A/B (Czech letters), Latin Extended Additional, punctuation

The server returns an empty file for other ranges.

## Regenerate

```
cargo install build_pbf_glyphs
build_pbf_glyphs <dir-with-ttf-files> /tmp/glyphs
```

Copy only the ranges listed above (`0-255`, `256-511`, `512-767`, `7680-7935`, `8192-8447`) into `fonts/<FontName>/`.
