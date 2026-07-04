# Source layout

The foundation intentionally contains only the application shell. Later phases
should add code along these boundaries without coupling domain rules to React:

```text
src/
  app/                 workspace composition and shell styling
  components/          setup, inspector, precision, and accessible UI controls
    canvas/            proportional SVG furniture renderer and viewport controls
  data/                fictional products and materials
  i18n/                English/Romanian dictionaries and lookup
  models/              design contracts and object factories
  pricing/             pure component and design estimates
  export/              versioned JSON, parts derivation, CSV and downloads
  storage/             browser-local draft and named-project repository
  state/               reducer/context and derived state
  utils/               integer-safe dimension conversion/formatting
  validation/          pure rule engine and actionable issue keys
  styles/              tokens and global/reset styles
```

Create feature folders only when the phase that needs them starts. Keep catalog,
pricing, validation, persistence, and export logic free of browser UI concerns so
they can be tested as pure TypeScript modules.
