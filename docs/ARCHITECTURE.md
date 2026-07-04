# FurnitureStudioWeb — Technical architecture

**Status:** Release-candidate implementation
**Runtime:** Static browser application on GitHub Pages  
**Stack:** Vite, React, TypeScript, plain CSS

## 1. Architectural principles

1. **The design is data, not DOM.** Furniture geometry, compatibility, price,
   validation, storage, and export live in pure TypeScript modules.
2. **Millimetres are canonical.** Every stored length is an integer millimetre.
   Conversions happen only at input/output boundaries.
3. **One command path.** Pointer, touch, keyboard, numeric fields, templates, and
   imported fixes all invoke the same typed design commands.
4. **Derived facts are reproducible.** Bounds, issues, BOM, and price are computed
   from design + catalog, not saved as competing sources of truth.
5. **Invalid states are explainable.** The editor may temporarily contain an
   invalid state so users can understand and fix it; misleading export is blocked.
6. **Files belong to the user.** Local persistence is convenient, while versioned
   JSON is the portable source of truth.
7. **Static hosting is a feature.** The app must not depend on server rewrites,
   secrets, background APIs, or network availability after its assets load.

## 2. Logical layers

```text
React screens and controls
        │ typed commands / view models
        ▼
Design session (reducer, selection, undo/redo)
        │
        ├── Design model + geometry derivation
        ├── Catalog + compatibility
        ├── Validation rule registry
        ├── BOM derivation → pricing
        ├── Project repository + migrations
        └── JSON / CSV / print adapters
```

The React layer may read prepared view models but must not calculate furniture
fit, manufacture parts, or prices. A catalog card never decides its own
compatibility; it asks the compatibility engine.

## 3. Planned source boundaries

```text
src/
  app/
    App.tsx
    providers/
    routes/                 HashRouter routes when more than one view exists
  components/               generic accessible UI controls
  core/
    catalog/                catalog types, original fixtures, lookup indexes
    design/                 model, units, geometry, commands, undo/redo
    validation/             rules, issue index, suggested fixes
    pricing/                BOM, pricing rules, totals, formatting
    storage/                local repository, autosave, migration, recovery
    export/                 JSON, CSV, print view models
  features/
    projects/               launcher, local project management, import
    setup/                  installation boundary
    builder/                frame construction and SVG elevation
    outfit/                 interior components and placement
    finish/                 doors, panels, handles, material, lighting
    review/                 health, estimate, BOM, export, print
  styles/                   tokens, reset, print, shared utilities
```

Dependency direction is inward: features may depend on `core`; `core` never
imports React or feature code. Core packages should be importable in unit tests
without `window` except the storage adapter.

## 4. Units and numeric policy

Use branded aliases to make intent visible even though runtime values are numbers:

```ts
type Millimetres = number & { readonly __unit: 'mm' }
type MinorCurrency = number & { readonly __unit: 'minor-currency' }

const mm = (value: number): Millimetres => {
  if (!Number.isSafeInteger(value)) throw new Error('Length must be an integer')
  return value as Millimetres
}
```

- Frame width: 10–2070 mm inclusive, step 1 mm.
- Frame height: 10–2800 mm inclusive, step 1 mm.
- Common depths: 350, 450, 580, and 600 mm; custom integer depth is allowed only
  when the selected construction and front rules support it.
- Clearances are non-negative integer millimetres.
- Coordinates use the frame's internal front-left-bottom origin. `x` grows right
  and `y` grows upward in domain math; the SVG adapter converts to screen `y`.
- Currency is stored in integer minor units. Percentage/m² calculations use
  integer numerator/denominator operations and an explicit rounding policy.
- Locale-aware formatting is view-only. Parsing normalizes decimal separators
  before validating and rounding is never silent.

## 5. Versioned data model

The following is a direction, not yet an implementation API:

```ts
interface DesignDocumentV1 {
  schemaVersion: 1
  id: string
  name: string
  createdAt: string
  updatedAt: string
  currency: 'EUR'
  displayUnit: 'mm' | 'cm'
  installation: InstallationBoundary
  frames: Frame[]
  componentOrder: string[]
  componentsById: Record<string, Component>
  acknowledgedIssueIds: string[]
}

interface InstallationBoundary {
  widthMm: Millimetres
  heightMm: Millimetres
  depthMm: Millimetres
  clearanceLeftMm: Millimetres
  clearanceRightMm: Millimetres
  clearanceTopMm: Millimetres
}

interface Frame {
  id: string
  name: string
  xMm: Millimetres
  widthMm: Millimetres
  heightMm: Millimetres
  depthMm: Millimetres
  constructionId: string
  materialId: string
  boardThicknessMm: Millimetres
  frontSystemId?: string
}

type Component =
  | ShelfComponent
  | DividerComponent
  | RailComponent
  | DrawerComponent
  | BasketComponent
  | DoorComponent
  | HandleComponent
  | PanelComponent
  | LightComponent
  | AccessoryComponent

interface ComponentBase {
  id: string
  kind: string
  frameId: string
  catalogItemId: string
  xMm: Millimetres
  yMm: Millimetres
  widthMm: Millimetres
  heightMm: Millimetres
  depthMm: Millimetres
  materialId?: string
}
```

Use discriminated unions for component-specific properties. Do not store class
instances, functions, JSX, `Map`, `Set`, browser objects, or preformatted strings
in the design file.

### IDs and ordering

Use `crypto.randomUUID()` for document object IDs with a small deterministic test
adapter. Store ordering explicitly; never infer visual or export order from object
key enumeration. Catalog IDs are stable fictional identifiers owned by this app.

### Derived data

Do not persist:

- overall furniture bounds or usable internal dimensions;
- compatibility status or validation issues;
- price totals or formatted values;
- BOM lines or cut dimensions;
- SVG paths, selection, hover, open panels, or camera state;
- undo history.

They are recomputed when a document is loaded. Small UI preferences may use a
separate, versioned settings key.

## 6. Fictional catalog architecture

Catalog data is checked-in TypeScript or JSON, not fetched from a retailer. Every
entry has an original name, fictional SKU, component type, dimension policy,
compatible construction/front families, material options, placement constraints,
BOM recipe, and pricing rule.

```ts
interface CatalogItem {
  id: string
  sku: string
  name: string
  kind: Component['kind']
  description: string
  tags: string[]
  dimensionPolicy: DimensionPolicy
  compatibility: CompatibilitySpec
  placement: PlacementSpec
  bomRecipeId: string
  pricingRuleId: string
}
```

Catalog fixtures must be internally validated at build/test time: unique IDs and
SKUs, referenced materials/rules present, valid ranges, and no cyclic recipes.
Names and prices remain explicitly fictional in UI and exports.

## 7. Command and history architecture

Design mutations are serializable discriminated commands:

```ts
type DesignCommand =
  | { type: 'frame/add'; frame: Frame }
  | { type: 'frame/update-dimensions'; frameId: string; patch: DimensionPatch }
  | { type: 'component/add'; component: Component }
  | { type: 'component/move'; componentId: string; xMm: Millimetres; yMm: Millimetres }
  | { type: 'entity/duplicate'; entityId: string }
  | { type: 'entity/remove'; entityId: string }
  | { type: 'template/apply'; templateId: string; targetFrameId: string }
```

`applyCommand(document, command)` is pure and returns the next document plus
metadata about changed entity IDs. History stores bounded before/after documents
or inverse commands after measurement proves which is safer. Continuous pointer
movement is preview state and commits one history entry on drop; numeric field
typing commits on blur/Enter rather than each keypress.

The first release uses a React reducer plus memoized selectors. Add a state library
only if measured complexity justifies it.

## 8. Geometry and SVG rendering

### Domain geometry

Pure geometry functions calculate:

- frame exterior and internal boxes;
- furniture aggregate bounds and installation fit;
- board, reveal, hinge, track, and clearance zones;
- component collision and support/mount positions;
- drop candidates and snap points;
- dimensions used by BOM recipes.

Use axis-aligned boxes for the initial front-elevation product. Avoid polygon or
physics systems until a proven rule requires them.

### Renderer

- SVG `viewBox` coordinates correspond to millimetres.
- A view transform fits design bounds while reserving readable annotation space.
- Groups are layered: backdrop, cabinet shadow, carcasses, internals, fronts,
  hardware, lighting, measurements, selection, drag preview, issues.
- Board thickness is geometrically represented. Controlled gradients, masks, and
  project-owned patterns add depth without obscuring edges.
- DOM nodes are keyed by stable entity IDs. Material definitions are deduplicated.
- Pointer hit areas may be larger than visible parts but must not overlap in ways
  that make selection unpredictable.
- A synchronized accessible tree/list gives every frame and component a semantic
  name, dimensions, state, and actions. SVG alone is not the accessibility model.

No canvas/WebGL dependency is planned. If SVG performance later fails a measured
target, optimize selectors and node density before changing rendering technology.

## 9. Validation architecture

Validation is a registry of deterministic rules. A rule declares its dependencies
so only affected scopes need rerunning after a command.

```ts
type IssueSeverity = 'error' | 'warning' | 'info'

interface DesignIssue {
  id: string
  ruleId: string
  severity: IssueSeverity
  entityIds: string[]
  title: string
  message: string
  measured?: { actualMm: Millimetres; limitMm: Millimetres }
  fixCommands?: DesignCommand[]
  blocks: Array<'json' | 'csv' | 'print'>
}

interface ValidationRule {
  id: string
  appliesTo: Array<'document' | Component['kind']>
  evaluate(context: ValidationContext): DesignIssue[]
}
```

Issue IDs are stable hashes of rule ID + affected IDs + relevant measurement, so
selection and acknowledgement survive harmless edits.

### Rule order

1. **Shape/input:** safe integers, IDs/references, required fields, schema limits.
2. **Intrinsic:** legal frame dimensions, component ranges, catalog option exists.
3. **Containment:** component is inside usable frame space and supported.
4. **Relationship:** collisions, drawer/door/hinge conflicts, handle/front pairing,
   lighting driver capacity, span or load advisories.
5. **Installation:** total width/depth/height and specified clearances.
6. **Export readiness:** unresolved dimensions, unpriced parts, or unsupported
   derived output.

Rules report facts; React decides presentation. Input controls may show immediate
field errors, but they use the same rule IDs and messages as the issue center.

### Prevention and temporary invalidity

- Catalog queries return compatible, incompatible-with-reasons, and unknown.
- Drop candidates return valid, warning, or invalid plus rule IDs.
- Impossible imported data is quarantined rather than coerced silently.
- During drag or typing, preview validation can be lightweight. Full validation
  runs on command commit.
- Errors block only the output they would make unreliable. JSON backup export
  should usually remain available so work is never trapped.

## 10. BOM and pricing architecture

Pricing is downstream of a derived bill of materials:

```text
Design + catalog
  → geometry-derived manufactured parts
  → catalog accessories/hardware
  → normalized BOM lines
  → price each line
  → group and total
```

This keeps the parts list and price from disagreeing.

```ts
interface BomLine {
  id: string
  parentFrameId: string
  sourceEntityIds: string[]
  sku: string
  category: 'board' | 'front' | 'hardware' | 'interior' | 'lighting' | 'accessory'
  description: string
  quantity: number
  finishedWidthMm?: Millimetres
  finishedHeightMm?: Millimetres
  finishedDepthMm?: Millimetres
  materialId?: string
  pricing: PriceBasis
}

interface PricedLine extends BomLine {
  unitPriceMinor: MinorCurrency
  lineTotalMinor: MinorCurrency
  priceRuleId: string
  estimateNote?: string
}
```

Supported fictional price bases may include fixed each, fixed pair/set, linear
millimetre, square millimetre, and tiered material uplift. Calculate rationally
with integers, round once at the line level using a documented half-up policy,
then sum line totals. Never sum formatted decimal strings.

The price result contains currency, subtotal, optional fictional service/finish
groups, total, unpriced line IDs, and a deterministic revision fingerprint.
Taxes, delivery, discounts, stock, and checkout are out of scope. UI and exports
label all prices as estimates from a fictional catalog.

## 11. Storage architecture

Use a small repository interface so browser storage is replaceable in tests:

```ts
interface ProjectRepository {
  list(): ProjectSummary[]
  load(id: string): LoadResult
  save(document: DesignDocument): SaveResult
  remove(id: string): void
  duplicate(id: string, newName: string): DesignDocument
}
```

### localStorage keys

```text
furniture-studio:index:v1
furniture-studio:project:<uuid>
furniture-studio:project:<uuid>:backup
furniture-studio:project:<uuid>:pending
furniture-studio:settings:v1
```

Store each project separately so one large document does not rewrite every
project. The index contains only summaries and storage revision IDs.

### Save and recovery protocol

1. Serialize a versioned envelope with document, saved timestamp, revision, and
   checksum of the canonical JSON payload.
2. Write to `:pending`, read back, parse, and verify.
3. Copy the current committed value to `:backup`.
4. Write the verified pending value to the main key, update the index, then remove
   `:pending`.
5. On load, prefer a valid main value, otherwise offer backup/pending recovery.

Autosave is debounced after committed commands (target 700–1200 ms) and flushes
on page visibility change when possible. The header shows Saving, Saved locally,
or Save failed. Catch quota/security exceptions and immediately offer JSON export.

Multiple tabs compare revision IDs through the `storage` event. Do not silently
overwrite a newer external revision; offer Keep this tab, Load newer, or Save copy.

## 12. Schema migration and import safety

Every persisted/exported envelope has an explicit schema version and app version.
Migrations are pure one-step functions (`v1 → v2`) applied sequentially, tested
with frozen fixtures, and never mutate the source object.

Import pipeline:

1. Reject files over the documented limit (initially 5 MB).
2. Parse JSON as data; reject dangerous object keys and unexpected root shapes.
3. Validate the envelope and supported schema range.
4. Migrate a copy to current schema.
5. Run shape and catalog-reference validation.
6. Show a preview with project name, dimensions, counts, warnings, and whether IDs
   will be remapped.
7. Import as a new project; never overwrite based only on a file ID.

Unknown future versions are not guessed. Preserve the file and report the minimum
app version required.

## 13. Export architecture

### JSON

- MIME `application/json`, UTF-8, extension `.furniture-studio.json`.
- Contains envelope metadata and canonical design only, not cached derived data.
- Pretty-print with two spaces for inspectability.
- Filename uses sanitized project name + ISO date.

### CSV parts list

Stable headers:

```text
frame,category,sku,description,quantity,width_mm,height_mm,depth_mm,material,
unit_price_minor,line_total_minor,currency,notes
```

Use RFC 4180-style quoting: double embedded quotes and quote values containing
comma, quote, or newline. Prevent spreadsheet formula execution by prefixing
text values that begin with `=`, `+`, `-`, or `@`. Add a UTF-8 BOM only if testing
shows it is needed for target spreadsheet compatibility.

### Print summary

Use semantic HTML with `@media print`, not a screenshot or generated PDF library.
Print includes project/date, elevation SVG, dimensions and clearances, issue
status, price estimate disclaimer, grouped BOM, and page numbers where browser
support permits. Hide interactive chrome and ensure grayscale distinctions.

Browser-created PDF through the print dialog is a user option; native PDF file
generation is not required.

## 14. Routing and GitHub Pages

The foundation has a single view and no router. When separate Projects, Builder,
and Review URLs add meaningful navigation, use React Router's `HashRouter`:

```text
/#/projects
/#/design/<local-id>/build
/#/design/<local-id>/review
```

Never place full design JSON in the URL. `vite.config.ts` uses `base: './'`, so
assets resolve on both account Pages and repository Pages without knowing the
repository name at build time.

Deployment workflow:

1. Checkout `main`.
2. Install the lockfile with `npm ci` on Node 24.
3. Run typecheck/build through `npm run build`.
4. Upload `dist/` as a Pages artifact.
5. Deploy with official GitHub Pages actions.

No `404.html` redirect hack is needed with hash routing. Do not commit `dist/`.

## 15. Responsive and accessibility implementation contracts

- Use CSS grid/container queries for shell layout; renderer calculations receive
  measured viewport size only for fitting, never for furniture geometry.
- Mobile bottom-sheet state is UI state, not document state.
- Pointer gestures use Pointer Events and set `touch-action` only on the active
  manipulation surface, preserving page scroll elsewhere.
- All command actions expose labeled buttons/menu items and keyboard bindings.
- A visually hidden design tree mirrors the SVG entity hierarchy and selection.
- Announcements are consolidated after command commit to avoid live-region spam.
- Focus returns predictably after delete, panel close, undo, and import dialogs.
- Modal/sheet focus is trapped only while truly modal; Escape cancels previews.
- Run automated accessibility checks plus keyboard and screen-reader manual tests.

## 16. Performance targets

For the initial catalog and designs up to 20 frames / 500 components on a modern
mid-range laptop:

- committed command feedback visible within 100 ms;
- pointer preview holds 50–60 fps where hardware permits;
- full validation + BOM + price under 150 ms after a committed edit;
- project autosave serialization under 100 ms;
- initial production JavaScript kept below 350 kB gzip unless a measured feature
  justifies growth.

Use memoized indexes keyed by stable IDs and changed-entity metadata. Defer full
catalog search indexes and a Web Worker until profiling shows main-thread work is
the bottleneck.

## 17. Error handling and privacy

- A top-level React error boundary offers reload and local project JSON recovery.
- Storage/import/export failures use actionable messages and preserve current
  in-memory work.
- Console diagnostics contain rule IDs and stack details only in development;
  never log full imported documents in production.
- No telemetry, trackers, fonts, or runtime third-party calls are required.
- Content Security Policy should be added when the final asset strategy is known;
  avoid inline scripts and remote assets now so a strict policy remains possible.

## 18. Testing strategy

### Unit tests

- unit constructors and boundary limits;
- command behavior and immutability;
- geometry, collisions, and snap candidates;
- each validation rule with valid/boundary/invalid fixtures;
- BOM recipes, integer rounding, and price/BOM agreement;
- migration chains and unsupported versions;
- CSV escaping and injection protection.

### Component tests

- dimension inputs and error association;
- catalog compatibility explanations;
- inspector commands and focus behavior;
- issue-to-entity navigation;
- project recovery and import preview.

### Browser flows

- create → build → resolve overflow → save → reload;
- keyboard-only component placement and undo/redo;
- JSON round trip and invalid import recovery;
- CSV download and print stylesheet;
- desktop, tablet, and 390 px mobile layout;
- GitHub Pages base path and hash-route refresh.

Prefer Vitest + React Testing Library for unit/component tests and Playwright for a
small number of high-value flows when their implementation phase begins.

## 19. Implementation phases and exit gates

### Phase 0 — foundation (complete)

Vite shell, original tokens, specs, Pages workflow, install and production build.

### Phase 1 — design kernel (complete foundation)

Versioned model, original fixture catalog, commands, geometry basics, validation,
BOM/pricing, storage/migration, JSON/CSV adapters, and unit tests. Exit when a
headless two-frame fixture round-trips and produces stable issues/BOM/price.

### Phase 2 — frame builder (core complete)

The delivered core includes installation presets and centimetre inputs backed by
integer millimetres, preset and custom frames, precise dimension controls,
selection, duplication and ordering, material/finish choices, responsive panels,
live validation/pricing, and a proportional SVG elevation with measurements,
zoom, pan, fit, and reset controls. The frame set can be built and corrected on
desktop and mobile. Project launcher, bounded history, and autosave remain the
next cross-cutting additions.

### Phase 3 — interior builder (complete)

The delivered builder includes a categorized fictional component catalog,
pointer/native drag placement with snapped live previews, collision and depth
feedback, realistic component visuals, selection, precise numeric editing,
duplicate/delete and 1 cm movement controls, adaptive internal presets, and
bounded undo/redo. Touch users have equivalent add and movement controls, and the
flow is verified at 390 px.

### Phase 4 — fronts and finishes (core complete)

Open, hinged, sliding, double-sliding, mirror, glass-look, flat and framed fronts
are configurable with material, finish, handle, position, soft-close and
doors/internals preview controls. SVG rendering includes seams, overlap, mirror,
glass, handles and shadows. Lighting, accessories, compatibility rules and price
categories are integrated; full manufacturing BOM recipes remain review-phase
work.

### Phase 5 — review and export (complete)

The release includes debounced local draft autosave, named browser projects,
load/duplicate/rename/delete operations, versioned and validated JSON transfer,
spreadsheet-safe CSV, groupable parts review, price categories, and a semantic
print sheet with a simplified elevation. Storage, quota, corrupted-data, import,
and download failures have friendly user-facing paths.

### Phase 6 — hardening (release baseline complete)

The app has an error boundary, skip link, semantic dialogs, keyboard alternatives,
visible focus, responsive side panels and mobile project actions, 390 px overflow
QA, bilingual microcopy, print CSS, pure export tests, a configurable Vite base,
and an official Pages workflow that runs tests before deployment. Broader
cross-browser automation and measured performance profiling remain incremental
maintenance work.

## 20. Immediate next step

Maintain the release candidate: add tested schema migrations when the saved-data
shape changes, expand cross-browser accessibility automation, and introduce
manufacturing cut optimization only behind the existing derived-parts boundary.
