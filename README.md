# FurnitureStudioWeb

FurnitureStudioWeb is an original, professional browser application for
designing custom wardrobes and cabinets. It is a furniture-object configurator:
users define a cabinet envelope, construct frames, place internals, choose doors
and finishes, review constraints, estimate price, and export a parts list.

It is **not** a room planner, interior-design tool, desktop companion, ecommerce
store, or clone of any existing furniture planner.

## Project status

The repository is at **Phase 0: product definition and technical foundation**.
It includes a clean Vite + React + TypeScript application shell, an original
visual starting point, product and architecture specifications, and a GitHub
Pages deployment workflow. The configurator itself has intentionally not been
built yet.

## Legal and originality note

The public IKEA PAX planning experience was studied only to understand the
general wardrobe-configurator category and user expectations. IKEA, PAX,
KOMPLEMENT, their product names, article numbers, prices, photography, icons,
copy, typography, layouts, colors, interaction sequence, design system, and
trade dress are not part of this product and must not be reproduced.

FurnitureStudioWeb will use its own:

- brand, writing, information architecture, and interaction model;
- fictional component catalog, SKUs, prices, materials, and compatibility data;
- visual language, UI tokens, icons, and furniture rendering;
- local project/export model rather than retailer account and cart behavior.

Before accepting any future catalog or design-system change, contributors should
check that it is independently designed and does not create source confusion.

## Public planner analysis: learning summary

Research was performed on 4 July 2026 using the public
[planner landing page](https://www.ikea.com/gb/en/planners/pax-planner/), the
[interactive planning tool](https://www.ikea.com/addon-app/storageone/pax/web/latest/gb/en/),
and IKEA's public
[wardrobe planning guide](https://www.ikea.com/be/en/rooms/bedroom/how-to/how-to-design-your-perfect-pax-wardrobe-pub8b76dda0/).
The detailed, point-by-point analysis is in
[docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md).

Useful category lessons:

- A visual start page, ready-made examples, and a clear “new or saved” choice
  reduce blank-canvas anxiety.
- A continuously visible preview and price make each choice feel concrete.
- Compatibility-filtered catalogs prevent many impossible combinations before
  they happen.
- Category navigation makes a large catalog approachable, while undo/redo and
  selected-item actions make experimentation safer.
- Realistic materials, measurements, doors, props, and lighting build purchase
  confidence, but a room-like 3D scene can also distract from the furniture.
- Preset product dimensions are easy to understand but do not meet the needs of
  a truly custom cabinet designer.
- On mobile, a bottom-sheet catalog preserves the preview, but the reduced canvas
  makes precise placement and complex comparisons harder.
- Rules are most useful when explained near the decision, not only as a failure
  after the user tries to continue.

FurnitureStudioWeb will retain the category's confidence-building ideas while
using a different product structure: **Set up → Build → Outfit → Finish → Review**,
with an installation boundary rather than a room and millimetre-level custom
dimensions rather than a retailer's fixed product grid.

## Original app requirements

### Design scope

Users will be able to configure:

- one or more frames/cabinets within an installation boundary;
- integer-millimetre width, height, and depth;
- shelves, dividers, rails, drawers, baskets, panels, plinths, and lighting;
- hinged, sliding, glass, and mirror door treatments where compatible;
- handles, materials, colors, edge treatments, and accessories;
- price estimate, design issues, bill of materials, and printable summary.

Installation space records available width, height, depth, and optional left,
right, and top clearances. It does not model a room.

### Required dimension rules

All lengths are stored as integers in millimetres. Display units are formatting
only and never become the source of truth.

| Property | Internal range / values | Editing step |
| --- | --- | --- |
| Frame width | 10–2070 mm | 1 mm |
| Frame height | 10–2800 mm | 1 mm |
| Frame depth | presets 350, 450, 580, 600 mm; custom depth where supported | 1 mm |
| Clearances | non-negative integer millimetres | 1 mm |

### Visual target

The builder will use a reliable SVG-first 2.5D/front-elevation renderer rather
than unstable free-camera 3D. It should represent board thickness, side/top/
bottom panels, reveals, inner shadow, realistic materials, drawer fronts,
shelves, rails, baskets, glass and mirror effects, handles, seams, lighting,
measurements, selection outlines, and valid/invalid placement feedback.

The initial shell establishes an independent workshop/editorial visual direction:
warm paper, deep forest, clay accents, restrained typography, and technical
drawing details. These are project-owned design decisions, not references to a
retailer identity.

## Technical direction

- Vite, React, TypeScript, and plain CSS.
- No backend, database, authentication, Electron, or paid API.
- Pure TypeScript domain modules for design mutation, validation, pricing,
  persistence, migration, and export.
- Browser `localStorage` with a versioned envelope and recoverable autosave.
- JSON import/export, CSV parts export, and a print-specific HTML summary.
- Relative Vite asset paths and `HashRouter` if routing is introduced, avoiding
  GitHub Pages refresh failures.
- SVG furniture view with pointer and keyboard operations backed by the same
  command layer.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for module boundaries, data
contracts, rule processing, storage, exports, testing, and deployment.

## Planned implementation phases

1. **Foundation** — product specification, architectural contracts, build, Pages
   workflow, design tokens. *(Current.)*
2. **Design kernel** — versioned data model, immutable commands, fixture catalog,
   validation, pricing, storage, migrations, and unit tests.
3. **Frame builder** — installation boundary, frame dimensions, SVG elevation,
   selection, measurements, undo/redo.
4. **Interior builder** — shelves, dividers, rails, drawers, baskets, placement
   previews, collision checks, keyboard placement.
5. **Fronts and finishes** — door systems, handles, panels, material rendering,
   lighting, compatibility rules.
6. **Review and export** — issue center, price breakdown, parts list, JSON/CSV,
   print view, import recovery.
7. **Hardening** — responsive refinement, accessibility audit, performance,
   browser tests, corrupted-storage recovery, deployment QA.

Each phase must end with a usable vertical slice and tests for its domain rules.

## Local development

Prerequisites: Node.js 24 or a supported current LTS release, and npm.

```bash
npm install
npm run dev
```

Production verification:

```bash
npm run typecheck
npm run build
npm run preview
```

The static output is written to `dist/`. The included Pages workflow deploys
that directory on pushes to `main` once GitHub Pages is configured to use
**GitHub Actions** as its source.

## Next implementation prompt

Implement **Phase 1: the design kernel** from `docs/ARCHITECTURE.md`. Add the
versioned TypeScript model, fictional starter catalog, pure command/validation/
pricing engines, localStorage repository with migrations, and focused unit tests.
Do not build drag-and-drop or the full furniture UI yet.
Test