# Source layout

The foundation intentionally contains only the application shell. Later phases
should add code along these boundaries without coupling domain rules to React:

```text
src/
  app/                 workspace composition and shell styling
  data/                fictional products and materials
  i18n/                English/Romanian dictionaries and lookup
  models/              design contracts and object factories
  pricing/             pure component and design estimates
  state/               reducer/context and derived state
  utils/               integer-safe dimension conversion/formatting
  validation/          pure rule engine and actionable issue keys
  styles/              tokens and global/reset styles
```

Create feature folders only when the phase that needs them starts. Keep catalog,
pricing, validation, persistence, and export logic free of browser UI concerns so
they can be tested as pure TypeScript modules.
