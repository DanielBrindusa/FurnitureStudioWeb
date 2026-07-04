# FurnitureStudioWeb

FurnitureStudioWeb is an original, browser-based configurator for custom
wardrobes and cabinets. It combines millimetre-precise frame sizing, realistic
SVG furniture rendering, internal components, doors and finishes, fit rules,
fictional pricing, local project storage, and user-controlled exports in a
responsive workspace.

It is a furniture-object planner, not a room planner, ecommerce store, cloud
service, desktop companion, or clone of another furniture planner.

## Screenshots

> Add final desktop, mobile, door-preview, and print-summary screenshots here
> after the public Pages URL is stable.

## Features

- Installation boundaries and clearances entered in centimetres with 1 mm
  internal precision.
- Custom or preset frames from 10–2070 mm wide and 10–2800 mm high.
- Categorized fictional catalog of shelves, dividers, rails, drawers, baskets,
  shoe storage, panels, accessories, handles, and lighting.
- Pointer placement with live snap/validity feedback, plus accessible add,
  duplicate, delete, numeric, and 1 cm movement controls.
- Adaptive internal-layout presets and bounded undo/redo history.
- Hinged, sliding, double-sliding, mirror, glass-look, flat, and framed fronts.
- Original materials and finishes with wood, matte, mirror, glass, metal, mesh,
  drawer, shelf, basket, handle, and lighting effects.
- Friendly validation for furniture fit, collisions, depth, hanging clearance,
  lighting zones, doors, and handles.
- Live fictional estimate split into frames, fronts, components, accessories,
  and lighting.
- English and Romanian interfaces.
- Debounced local autosave and named designs stored only in this browser.
- Versioned JSON backup/import with validation and a replacement preview.
- Spreadsheet-friendly CSV parts list protected against formula injection.
- Groupable on-screen parts list and a print-friendly project summary.
- Desktop, tablet, and 390 px mobile layouts with a preview-first workflow.
- Static GitHub Pages deployment with no server, account, or paid API.

## Technology

- React 19 and TypeScript
- Vite
- Plain CSS and an SVG-first 2.5D/front-elevation renderer
- Vitest for pure domain tests
- Browser `localStorage` for user-owned local data
- GitHub Actions and GitHub Pages

There is no backend, database, authentication, telemetry, automatic sync,
Electron integration, or runtime third-party service.

## Install and run locally

Prerequisites: Node.js 24 (or a supported current LTS release) and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Test, build, and preview

```bash
npm test
npm run typecheck
npm run build
npm run preview
```

The production site is written to `dist/`. Relative asset URLs allow the same
build to work at a root domain or a GitHub repository subpath.

## Deploy to GitHub Pages

The repository includes `.github/workflows/deploy-pages.yml`. It installs the
locked dependencies, runs the production build, uploads `dist/`, and deploys it
with the official GitHub Pages actions.

1. Push the repository to GitHub with the deployment workflow on `main`.
2. Open **Settings → Pages** in the GitHub repository.
3. Set **Source** to **GitHub Actions**.
4. Push to `main`, or run **Deploy FurnitureStudioWeb** manually from the
   **Actions** tab.
5. Wait for both the build and deploy jobs to finish.

`npm run deploy` performs the same local production build check and reminds you
to push `main`; the actual publication remains an auditable GitHub Action rather
than a script that force-pushes generated files.

No router is currently required. If multiple URLs are introduced later, use a
hash-based router so refreshing a GitHub Pages subpath does not require server
rewrites.

## Local saves and autosave

The current draft is autosaved after committed edits. Named designs can be
saved, loaded, duplicated, renamed, and deleted from the Projects dialog.
Summaries include dimensions, frame count, update time, and estimated price.

All data stays in `localStorage` on the current browser profile and device. It is
not uploaded or synchronized. Clearing site data removes these saves. Use JSON
export for portable backups or transfer between devices. The app reports blocked
storage, quota failures, and corrupted records without exposing technical error
details.

## JSON import and export

JSON export creates a readable `.furniture-studio.json` file containing a
versioned envelope and the canonical design. Derived prices, issues, and parts
rows are recalculated after loading.

Import is always user initiated. Files are limited to 5 MB, parsed as data,
checked for the supported schema and required object shapes, and shown as a
preview before replacing the in-memory design. Unsupported or damaged files are
rejected with a friendly message. There is no automatic file or cloud sync.

## CSV parts list

CSV export includes category, item name, fictional SKU, frame reference,
millimetre dimensions, material, quantity, unit estimate, line estimate, and
relevant warning codes. It uses RFC-style quoting, a UTF-8 BOM for common
spreadsheet tools, and formula-prefix protection for user-controlled text.

## Print summary

The print view contains the project name and date, installation and furniture
dimensions, a simplified elevation, frame/front/material data, parts, warnings,
price estimate, fictional-price disclaimer, and independence notice. Print CSS
uses a white background, compact tables, hidden editor controls, and page-break
protection. A browser may save this print view as PDF.

## Dimensions and prices

All stored lengths and positions are integer millimetres. Centimetres are only a
display/input convenience; one decimal centimetre equals one millimetre. Geometry,
validation, prices, saved files, and exports use the millimetre source of truth.

Every catalog name, SKU, material, compatibility rule, and price is fictional.
Price totals are planning estimates only; they do not include tax, delivery,
stock, discounts, installation, or checkout.

## Legal and originality note

FurnitureStudioWeb is an independent project and is not affiliated with,
endorsed by, or connected to IKEA or any other furniture company. IKEA, PAX,
KOMPLEMENT, third-party product names, article numbers, prices, photography,
icons, copy, typography, layouts, colors, interaction sequence, and trade dress
are not used by this project.

The app has its own brand, writing, information architecture, visual language,
fictional catalog, pricing model, data format, and interaction structure.

## Current limitations

- Saves are browser-local and do not roam between devices without JSON export.
- The renderer is a reliable SVG front elevation, not free-camera room-scale 3D.
- Drag interaction is optimized for modern pointer-enabled browsers; touch and
  keyboard users use equivalent add and movement controls.
- The parts list is a planning breakdown, not a manufacturing cut optimizer.
- Imported future schema versions require an app update rather than being guessed.
- Browser print output varies slightly by operating system and print engine.

## Recommended future improvements

- Tested schema migrations for future project versions.
- Optional cut optimization and hardware-pack BOM recipes.
- Automated accessibility checks and a small cross-browser end-to-end suite.
- User-created component templates and reusable material palettes.
- Additional print page-number support where browser engines permit it.

Technical contracts and phased decisions are documented in
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), with product intent in
[docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md).
