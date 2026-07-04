# Source layout

The foundation intentionally contains only the application shell. Later phases
should add code along these boundaries without coupling domain rules to React:

```text
src/
  app/                 composition, routing, providers, global UI shell
  components/          reusable presentational controls
  core/
    catalog/           fictional products, materials, compatibility metadata
    design/            versioned design model and mutations
    pricing/           pure line-item and total calculations
    validation/        pure rule registry and issue model
  features/
    builder/           frame/component editing experience
    projects/          local save/load and JSON import/export
    review/            summary, parts list, CSV, and print view
  styles/              tokens and global/reset styles
```

Create feature folders only when the phase that needs them starts. Keep catalog,
pricing, validation, persistence, and export logic free of browser UI concerns so
they can be tested as pure TypeScript modules.
