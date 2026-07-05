# Wardrobe Studio Web: professional 3D rebuild plan

**Status:** Architecture and delivery plan only  
**Research date:** 2026-07-05  
**Immediate next phase:** Prompt 7 — 3D foundation and model migration  
**Implementation constraint for this document:** No 3D engine or new drag-and-drop implementation is included in this phase.

## 1. Purpose, evidence, and legal boundary

This document defines how FurnitureStudioWeb can evolve from a capable 2D
wardrobe planner into an original, professional furniture-design application.
The target is parity in usefulness and confidence with mature wardrobe
configurators, while keeping the product focused on furniture rather than room
planning.

The research combines:

- direct inspection of the public PAX planner at desktop and 390 px mobile width;
- public IKEA planning and buying guides;
- public IKEA compatibility and design-code help pages;
- the current FurnitureStudioWeb source, tests, product specification, and
  architecture;
- public user reports, used only as anecdotal signals rather than facts about
  every session;
- a published accessibility study of the PAX planning experience.

Primary research links:

- [Public PAX planner](https://www.ikea.com/addon-app/storageone/pax/web/latest/us/en/)
- [PAX planner entry page](https://www.ikea.com/us/en/planners/pax-planner/)
- [IKEA: five steps to a PAX wardrobe](https://www.ikea.com/us/en/rooms/bedroom/how-to/how-to-design-your-perfect-pax-wardrobe-pub8b76dda0/)
- [2025 PAX/KOMPLEMENT buying guide](https://www.ikea.com/us/en/files/pdf/da/59/da59c634/pax_oct_2025.pdf)
- [IKEA: door and hinge planning constraints](https://www.ikea.com/nl/en/customer-service/knowledge/articles/f0d385d3-26c4-41e5-8e10-bc68f84bc95b.html)
- [IKEA: planning-code persistence](https://www.ikea.com/nl/en/customer-service/knowledge/articles/be23fdfb-2297-4b9c-g16c-fd185b44dcf9.html)
- [Accessibility study of the PAX planner](https://www.diva-portal.org/smash/get/diva2%3A1810697/FULLTEXT01.pdf)
- [Recent public report about unclear placement prerequisites](https://www.reddit.com/r/IKEA/comments/1sdvzyn/ikea_pax_planner_not_working_cant_place_anything/)
- [Recent public discussion of millimeter discrepancies and tolerances](https://www.reddit.com/r/IKEA/comments/1r7ie5z/size_doesnt_match_on_pax_planner_and_the_product/)

Public competitor research establishes expectations, not a design template. We
must never copy IKEA branding, colors, layout, icons, wording, product names,
article numbers, prices, photography, 3D assets, interaction details, or trade
dress. We must not scrape or reverse-engineer IKEA product data or assets. All
catalog items, geometry, materials, rules, thumbnails, identifiers, copy, and
prices in FurnitureStudioWeb must remain original and fictional.

## 2. Executive decision

### 2.1 Product decision

Build a **furniture-first hybrid precision/realism configurator**:

- orthographic front mode for accurate placement;
- constrained perspective mode for realistic inspection;
- a neutral studio background, not a furnished room;
- a visible installation-volume boundary defined only by available width,
  height, depth, and optional clearances;
- explicit focus mode for editing one frame or opening;
- direct manipulation backed by exact millimeter inputs and keyboard controls;
- procedural geometry so custom dimensions are genuinely represented;
- realistic but original materials, lighting, hardware, clothes, and objects;
- continuous compatibility, validation, parts, and price feedback.

### 2.2 Engineering decision

Use an **evolutionary rebuild**, not a full rewrite.

Keep and strengthen:

- integer-millimeter source of truth;
- dimension ranges and input controls;
- pure TypeScript validation, price, BOM, import/export, and storage modules;
- installation boundary and clearances;
- undo/redo behavior;
- versioned local persistence and JSON migration approach;
- CSV, print, bilingual UI, responsive shell, and GitHub Pages workflow;
- the SVG elevation as a low-graphics fallback, accessible companion, and print
  renderer.

Refactor or replace:

- the SVG canvas as the primary interactive renderer;
- linear `orderIndex` layout as the only frame-position model;
- flat rectangle-only placement and collision rules;
- the monolithic design reducer snapshots as the long-term command model;
- `doors[0]` and handle-as-string representations;
- the catalog's limited geometry and compatibility metadata;
- scene selection, camera, hover, and drag state mixed into UI components.

The transition must be behind a renderer boundary and versioned data migration.
Existing working features remain available until the 3D replacement passes the
same acceptance scenarios.

## 3. Forty-angle UX teardown

The observations below describe broad public behavior and interaction patterns,
not visual details to reproduce.

| # | Practical angle | Observed public planning pattern | FurnitureStudioWeb decision |
|---:|---|---|---|
| 1 | Landing/start | The landing page separates starting a design, reopening a saved design, and a gallery of combinations. Returning to the planner can show a recovery prompt for unfinished work. | Open with three original paths: blank design, template, or saved/imported project. Recover autosave explicitly and show its timestamp. |
| 2 | Starting new | The user enters a dedicated product planner; a new design is distinct from continuing a recovered one. | Use a project launcher before the heavy 3D bundle loads. Ask only for installation dimensions and starting intent. |
| 3 | Scratch or templates | Both are supported. Public guides recommend starting from a ready-made combination and customizing it, while scratch remains available. | Offer original intent-based templates plus a true blank start. Every template must preview included objects, occupied space, and fictional price. |
| 4 | Catalog organization | The live sidebar separates Frames, Add-on units, Doors, Handles, Interiors, Organisers, and Lights. Interiors additionally split layouts from individual items. | Organize by user job: Structure, Divide, Hang, Fold, Drawers, Shoes, Accessories, Fronts, Hardware, Lighting, Decor. Keep search and compatibility filters shared. |
| 5 | Frame selection | Frame cards are filtered by selected depth and height, show width, finish, price, information, and an in-design state. | Show procedural preview, exact dimensions, material, construction type, price delta, and compatibility. Allow preset or custom frame creation. |
| 6 | Frame size | Public products use a small set of fixed widths, heights, and depths selected with segmented controls. Assembly-height guidance appears next to height. | Support continuous width 10–2070 mm and height 10–2800 mm at 1 mm precision. Keep useful presets but never round the canonical value. Explain assembly and installation clearance separately. |
| 7 | Frame color/material | Compact swatches update the frame and scene immediately. | Use named material cards with original thumbnails, finish, texture, contrast-safe selection, price tier, and text alternatives. Never rely on color alone. |
| 8 | Multiple frames | Additional compatible frames can be added; the product system encourages adjacent combinations and corner add-ons. | Add, duplicate, reorder, align, gap, and remove frames. Default to a straight furniture run; do not introduce arbitrary room walls. |
| 9 | Frame positioning | The public product planner places product units as a combination and uses direct scene selection/context actions. Exact world coordinates are not presented as the primary concept. | Use a linear-run solver by default with explicit `xMm`, baseline alignment, optional inter-frame gap, and constrained reorder. Avoid free-floating room placement. |
| 10 | Focus on one section | Selecting a frame outlines it and scopes interiors/layouts to that frame; contextual delete, duplicate, and info actions appear in the scene. No strong isolation mode was discoverable. | Add an explicit Focus mode that fits one frame/opening, ghosts siblings, preserves context, hides or opens fronts, and returns to the prior camera exactly. |
| 11 | 3D camera | A perspective furniture-in-room scene supplies depth and material context. Camera behavior is primarily direct manipulation rather than a labeled mode system. | Provide two named modes: Front Precision and 3D Inspect. Constrain orbit around the furniture, not a room. Persist camera per project only as optional view state. |
| 12 | Zoom | Mouse-wheel zoom works and can move from a distant view to a very close cabinet view. A visible fit/reset affordance was not obvious in the inspected state. | Support wheel/pinch and labeled Zoom in, Zoom out, Fit all, Fit selection, and 100% controls. Clamp distance and keep the selection in view. |
| 13 | Rotation | Perspective communicates depth, but explicit rotation controls or orientation labels were not discoverable during the public session. | Add an original orientation control with Front, Left, Right, and Perspective presets plus constrained orbit. Announce orientation changes accessibly. |
| 14 | Pan | Direct scene navigation exists, but gesture mapping and recovery are not self-explanatory. | Reserve empty-space drag or modified drag for pan, display a one-time hint, provide keyboard pan, and always expose Fit all. |
| 15 | Preventing 3D disorientation | Measurements remain over the object; furniture selection and the fixed catalog panel provide anchors. The room can still dominate or leave a tiny object in the distance. | Use an orthographic default, stable furniture baseline, orientation label, breadcrumbs, focus mode, fit controls, context ghosting, and a small overview navigator for long runs. |
| 16 | Adding internals | The selected frame determines compatible interior layouts and an individual-interior list. Applying an item changes the scene and price. | Catalog drag, click-to-add, and keyboard placement all target a selected opening. Preview the candidate and price before commit. |
| 17 | Shelves | Shelves are available in compatible sizes and layout presets; the frame's mounting system governs practical positions. | Drag a shelf into a highlighted opening; snap to mounting positions but allow exact 1 mm custom construction where the catalog policy permits it. Show clear distance above/below. |
| 18 | Drawers | Drawers are compatibility-sensitive because runners, hinges, door leaves, and nearby fittings share space or mounting locations. | Preview the drawer box plus pull-out operational volume. Block collisions with hinges/runners and show the nearest valid slot and exact reason. |
| 19 | Rails | A compatible clothes rail can be supplied by a layout or individual list and is shown with hanging garments. | Drag or add a rail to an opening, snap to valid supports, show hanging-clearance guides, and optionally add removable garment props. |
| 20 | Baskets | Baskets belong to interiors and use size/depth compatibility similar to drawers. | Model basket body, runner envelope, pull-out clearance, load warning, and front/hinge conflicts. |
| 21 | Shoe shelves | Public guides distinguish several shoe-storage approaches and recommend them by storage need. | Offer flat, angled, and pull-out original shoe components. Preview shoe capacity, required pitch, and door clearance. |
| 22 | Small trays | Accessory trays and organizers are separated from structural interiors; some objects can only sit on a shelf or frame bottom. | Represent a tray as mounted furniture and its inserts as child accessories. Enforce host-surface rules and explain them before placement. |
| 23 | Handles and knobs | Handles are a separate catalog branch. The live planner can explain that the chosen front already has integrated handles, eliminating irrelevant choices. | Treat hardware as placeable objects hosted by front leaves. Filter by front system but keep incompatible choices discoverable with a reason. Support exact horizontal/vertical offsets. |
| 24 | Doors | A door catalog includes an explicit no-door option, product information, filters, finish preview, and compatibility with the selected frame. | Model open, hinged, paired hinged, sliding, and multi-panel front systems. Apply them to openings/runs, not as one opaque door per frame. |
| 25 | Door open/closed preview | The inspected scene exposes a global Doors control that hides/shows fronts. No discoverable per-leaf angle scrubber was found. | Provide Hide fronts, Open all, Close all, and per-leaf 0–100% controls. Animate only when motion is allowed; validate swept volumes. |
| 26 | Seeing internals | Hiding fronts immediately exposes internals and clothing. Interior configuration can be done while fronts are out of the way. | In focus mode, default fronts to transparent/ghosted or open. Let the user pin a front state and compare open/closed without losing selection. |
| 27 | Clothes and objects | Realistic hanging garments make capacity and scale legible. Organiser products and props add lived-in context. | Supply original, lightweight clothes, shoes, boxes, bags, and folded-stack props. Keep them optional, non-BOM, selectable as decoration, and removable with one action. |
| 28 | Measurements | Width, height, and depth labels remain over the scene and can be toggled. | Show overall run, installation clearance, selected frame, selected object, and live drag distances. Prioritize labels and hide overlaps intelligently. |
| 29 | Preventing invalid placement | Catalog choices are narrowed by the current frame; impossible combinations may be unavailable. Public reports show that prerequisites can still be unclear. | Keep Compatible only as default but provide Show all. Disabled cards explain the exact unmet rule. During drag, invalid zones remain visible and reject the commit. |
| 30 | Explaining compatibility | Inline notes explain assembly height, included hinges, integrated handles, and shelf-only organizer hosts. Some rules remain implicit in filtering. | Every rule produces human-readable because/therefore/fix data. The same rule drives catalog availability, drag feedback, inspector issues, and export readiness. |
| 31 | Price and parts | Estimate stays in the header; summary/product-list workflows turn the design into an actionable list. Public guides state that price, save, and print/product list are supported. | Keep estimate persistent, show last delta, and derive BOM and price from one recipe graph. Group by frame, category, and material with fictional SKUs and pricing. |
| 32 | Save/load | The planner supports Save, Save as, My designs, Share Design, and start-page reopening; profile save is visible. | Preserve named local saves, autosave, JSON import/export, duplicate/rename/delete, and recovery. Cloud accounts are optional future work, not required for professional local use. |
| 33 | Design code/persistence | Public help explains that share/finalize can create a design code and that codes can change after edits. | Use immutable project IDs plus schema-versioned files. If sharing is ever added, use versioned snapshots; never make a changing opaque code the only recovery mechanism. |
| 34 | Recommendations | Optimized layouts, intent guidance, filters, and current-selection compatibility reduce decision load. | Recommend original layouts from storage intent and available volume. Explain why, show capacity/parts/price, and require confirmation before replacing internals. |
| 35 | Templates/combinations | A large landing carousel and buying guide encourage selecting a combination and customizing it. | Create a small curated template library by use case and size band. Templates are data fixtures with migration tests, not hard-coded UI. |
| 36 | Mobile/tablet | At 390 px the canvas remains on top, price stays compact in the header, tools overlay the scene, and catalog categories become a horizontal bottom section. Precise dragging competes with scroll and reduced scene size. | Make mobile excellent for setup, catalog, tap-to-place, numeric editing, review, and export. Direct drag remains optional. Use a three-state bottom sheet and a dedicated full-screen focus editor. |
| 37 | Excellent | Realistic immediate feedback, visible dimensions, live estimate, compatibility-aware choices, real objects in the wardrobe, strong catalog breadth, recovery, and actionable summary. | Match confidence and responsiveness while using our own product model and visual language. |
| 38 | Frustrating | Room scenery consumes space; navigation gestures and recovery can be unclear; fixed product sizes limit custom work; filters can hide why an item is unavailable; public reports mention placement prerequisites, persistence problems, and dimension/tolerance confusion. | Keep furniture dominant, expose controls and rule reasons, make every value exact, show manufacturing versus installation tolerances, and keep portable user-owned saves. |
| 39 | What we can do better | The reference experience is retail-product-first and room-context-heavy. | Be furniture-engineering-first: flexible dimensions, precise focus editing, transparent rules, reversible actions, traceable BOM, and a fast 2D fallback. |
| 40 | Never copy | Brand marks, brand colors, layout, icons, text, trade dress, product names, article numbers, prices, assets, models, photos, and catalog data are protected or proprietary. | Build original identity, geometry recipes, assets, names, SKUs, pricing, rules, layout, icons, and writing. Document provenance for every visual asset. |

## 4. Current-app feature gap analysis

### 4.1 What the app already does well

- Canonical integer-millimeter design data.
- Required frame width range of 10–2070 mm and height range of 10–2800 mm.
- Installation width, height, depth, and optional clearances.
- Custom/preset frames, materials, fronts, components, lighting, and accessories.
- 2D pointer/native drag for components with 10 mm visual snapping, placement
  preview, containment, depth, and overlap checks.
- Numeric component editing and 1 mm dimension controls.
- Proportional SVG elevation, pseudo-depth, zoom, pan, fit, measurements, door
  visibility, and selected-object rendering.
- Validation, fictional price, parts list, JSON, CSV, print, local save, autosave,
  recovery, undo/redo, English/Romanian UI, mobile shell, and Pages deployment.
- Pure modules with tests around dimensions, placement, validation, pricing, and
  export.

This is meaningful product infrastructure. Replacing it wholesale would add risk
without adding user value.

### 4.2 Blocking gaps for a professional 3D tool

| Area | Current limitation | Required change |
|---|---|---|
| Rendering | SVG front elevation with decorative depth only. | Lazy-loaded WebGL 3D renderer with procedural geometry and the SVG renderer retained as fallback/print. |
| Frame layout | Frames are derived from `orderIndex` and placed edge-to-edge. | Explicit constrained run placement with integer `xMm`, `gapMm`, baseline, and transform-ready schema. |
| Geometry | Flat x/y rectangles; depth is mostly a scalar compatibility check. | 3D bounds, mounting surfaces, anchor points, openings, operational/swept volumes, and support relationships. |
| Internal space | Components attach directly to a frame. | Openings/bays as first-class hosts so dividers create independent placement regions. |
| Fronts | The renderer and model effectively assume one primary door per frame. | Front systems containing one or more leaves, tracks, hinges, states, and host openings. |
| Hardware | A door stores one `handleId`; handles also exist as generic component types. | Hardware placements hosted by a front leaf with position, orientation, and compatibility. |
| Catalog | Basic item type, dimensions, ranges, rules, and price. | Geometry recipe, dimension policy, placement policy, rule IDs, BOM recipe, asset/LOD metadata, capacity, tags, and accessibility copy. |
| Camera | Zoom plus component-local pan; no orientation or focus model. | Explicit camera modes, fit targets, constrained orbit/pan/zoom, saved return position, and focus mode. |
| Drag state | Pointer logic lives in `WardrobeCanvas`; catalog and existing-item drag paths are coupled to SVG. | Renderer-independent interaction state machine and placement service. |
| Validation | 2D AABB overlap and selected hard-coded rules. | Layered rule registry with host, support, 3D collision, operational clearance, front/hardware, load, power, and export readiness. |
| State/history | Whole-design snapshots are acceptable now but scale poorly with props and richer entities. | Normalized design entities plus command transactions; one undo entry per committed gesture. |
| Decor | Some component illustrations imply clothes/objects, but props are not semantic entities. | Optional content-prop entities with host slots, original low-poly assets, visibility, and non-BOM behavior. |
| Accessibility | Semantic app controls exist, but the visual scene is not yet fully keyboard-equivalent. | Parallel scene tree, keyboard manipulation, placement dialogs, focus management, throttled announcements, and SVG fallback. |
| Mobile | Responsive shell works; precision drag is still a pointer-first interaction. | Tap-to-place, focus editor, bottom-sheet states, gesture arbitration, and numeric-first editing. |

### 4.3 Critical current-model risks

1. `Millimetres` is currently a number alias, so runtime and compile-time code can
   still pass fractional values. Version 2 must validate every persisted and
   command-bound dimension as a safe integer.
2. Component placement snaps to 10 mm in the SVG canvas even though custom
   design requires 1 mm precision. Snap policy must come from the catalog and
   never alter exact numeric entry.
3. Dividers do not create real child openings, so future drawer/shelf placement
   cannot reason reliably about bays.
4. Front/hardware state cannot express a paired hinged front, sliding tracks,
   individual leaf openness, or swept collision volume.
5. Scene-local state and canonical furniture state need a strict boundary before
   a second renderer is introduced.

## 5. New product vision

> Design made-to-fit wardrobes with the realism of a showroom and the precision
> of a workshop, without leaving the browser.

### Product principles

1. **Furniture owns the screen.** The installation volume is context; a room is
   not the product.
2. **Millimeters are truth.** Every canonical dimension and position is a safe
   integer millimeter.
3. **Direct and exact are peers.** Every drag operation has numeric and keyboard
   equivalents.
4. **Invalid states teach.** Never silently hide a rule that the user needs to
   understand.
5. **Realism serves decisions.** Materials, shadows, clothes, and motion explain
   scale, depth, capacity, and operation; they are not decoration for its own sake.
6. **The design belongs to the user.** Autosave, named saves, and portable files
   work without an account.
7. **One model, many views.** 3D, SVG, BOM, price, validation, save, and print are
   projections of the same canonical design.

### Explicit non-goals

- No general room planner, windows, doors, wall drawing, beds, desks, or decor
  layout.
- No retailer checkout, stock, delivery, tax, or real-world article catalog.
- No photogrammetry, augmented reality, or multi-user cloud collaboration in the
  next nine prompts.
- No manufacturing CNC export until the construction model has a separately
  validated specification.

## 6. New user journey

```text
Launcher
  → Blank / original template / saved project / import
  → Installation space (W × H × D + clearances)
  → Choose or create frames
  → Arrange the furniture run
  → Focus a frame or opening
  → Add dividers and internals
  → Add fronts and hardware
  → Add lighting and optional content props
  → Inspect open/closed in 3D
  → Resolve validation issues
  → Review price + parts
  → Save / JSON / CSV / print
```

At every design step:

- the project autosaves;
- undo/redo is available;
- estimate and design health remain visible;
- Front Precision and 3D Inspect can be switched without changing design data;
- the selected item appears in both the scene and semantic object tree;
- the user can enter or exit Focus mode without losing camera context.

## 7. New screen architecture

### 7.1 Project launcher

- Start blank.
- Start from an original template.
- Recover the latest autosave.
- Open, duplicate, rename, or delete a named local project.
- Import a versioned project.
- Explain local-only storage before the user depends on it.

### 7.2 Designer shell

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Project   Save state   Undo/Redo   View mode   Health   Estimate   Review    │
├──────────────┬───────────────────────────────────────────┬───────────────────┤
│ Build rail   │                                           │ Inspector         │
│ Structure    │     Furniture-first 3D / front view       │ Selection         │
│ Internals    │     Installation boundary + guides        │ Dimensions        │
│ Fronts       │     Focus breadcrumb + camera controls    │ Material/state    │
│ Hardware     │                                           │ Issues/actions    │
│ Accessories  │                                           │                   │
├──────────────┴───────────────────────────────────────────┴───────────────────┤
│ Searchable catalog / recommendations / issue tray                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

The center view must retain at least 55% of desktop width. Catalog and inspector
may collapse; the furniture view never becomes the residual column.

### 7.3 Focus editor

Focus mode is a state of the same designer, not a new route:

- breadcrumb: Run → Frame 02 → Left opening;
- fit-to-opening camera transition;
- sibling frames at 12–20% opacity or hidden by user choice;
- fronts ghosted/open while editing internals;
- mounting grid and nearest clearances visible;
- local object tree and compatible catalog only;
- Escape/Back returns to the exact previous selection and camera.

### 7.4 Review

- hero 3D snapshot plus deterministic SVG elevation;
- installation and overall dimensions;
- acknowledged and unresolved issues;
- estimated price with latest delta and category breakdown;
- grouped BOM/parts list;
- JSON, CSV, print, and save-copy actions;
- fictional-price and independence notice.

### 7.5 Mobile and tablet

- Canvas occupies the upper region; a three-state sheet contains catalog or
  inspector.
- Tap an object to select; tap a catalog item, then a highlighted target to place.
- Focus mode becomes a dedicated full-screen editor.
- Numeric inputs and arrow nudges are primary; dragging is optional.
- Two-finger gestures control camera; one-finger gestures manipulate only after
  an explicit object handle is active.
- Tablet supports split canvas/inspector with a collapsible catalog rail.

## 8. New 3D architecture

### 8.1 Recommended stack

Use:

- `three` for WebGL rendering and geometry;
- `@react-three/fiber` for React lifecycle integration;
- selected `@react-three/drei` helpers behind local adapters;
- optional `three-mesh-bvh` only after profiling proves raycast or collision need;
- existing React/TypeScript/Vite/Vitest stack;
- the current SVG renderer as fallback and print/elevation output.

React Three Fiber is preferred over a separate imperative engine because the app
is already React-based, but canonical geometry, placement, validation, and BOM
must remain framework-independent pure TypeScript.

### 8.2 Architectural boundaries

```text
Canonical Design v2 (integer mm)
        │
        ├── Geometry kernel ── bounds, openings, anchors, snap candidates
        ├── Rule engine ────── compatibility, validation, suggested fixes
        ├── BOM/price ──────── derived parts and fictional estimate
        ├── SVG projection ─── fallback, accessibility companion, print
        └── Scene mapper ───── immutable render DTOs
                                  │
                                  ▼
                    Three.js scene + ephemeral UI state
                    camera / hover / drag preview / animation
```

The renderer never writes directly to design objects. It dispatches typed
commands. Preview movement stays ephemeral and commits exactly one command when
accepted.

### 8.3 Scene graph

```text
DesignerScene
  InstallationBoundary
  FurnitureRun
    FrameGroup[]
      Carcass
      Openings[]
        MountedComponents[]
        ContentProps[]
      FrontSystem
        FrontLeaf[]
        HardwarePlacements[]
      Lighting[]
  MeasurementLayer
  InteractionLayer
  SelectionAndIssueLayer
```

### 8.4 Coordinate system

- Canonical dimensions and positions: integer millimeters.
- Furniture-run origin: installation boundary's front-left-bottom point.
- `x` increases to the right, `y` upward, `z` toward the viewer/front.
- Render conversion: `1 mm = 0.001 Three.js world units` (meters).
- Derived floating matrices exist only in render DTOs.
- Rotations are constrained by object policy; if persisted, store integer
  millidegrees rather than arbitrary floating transforms.

### 8.5 Camera model

- **Front Precision:** orthographic, locked near-front orientation, pan/zoom,
  exact measurement priority.
- **3D Inspect:** perspective, constrained azimuth/elevation, target fixed to
  furniture bounds or current selection.
- Presets: Front, Left, Right, Perspective, Fit all, Fit selection.
- Focus mode stores a return-camera snapshot.
- Zoom-to-pointer/pinch is clamped to prevent entering geometry or losing the
  run.
- Camera reset must always be visible and keyboard accessible.
- Camera state is ephemeral by default; an optional compact view bookmark may be
  saved separately from design geometry.

### 8.6 Renderer migration boundary

Introduce a `DesignerRenderer` contract:

```ts
interface DesignerRendererProps {
  scene: SceneViewModel
  interaction: InteractionController
  mode: 'front-2d' | 'front-3d' | 'perspective-3d'
}
```

The existing SVG renderer implements `front-2d`. The new WebGL renderer is
lazy-loaded and feature-detected. Context loss, unsupported WebGL, reduced-data
preference, or low-power mode can fall back without losing any design ability.

## 9. New object model

The following is a target shape, not code for this phase:

```ts
type Mm = number // validated safe integer at every boundary
type EntityId = string

interface DesignV2 {
  schemaVersion: 2
  id: EntityId
  name: string
  createdAt: string
  updatedAt: string
  language: 'en' | 'ro'
  installation: InstallationVolume
  run: FurnitureRun
  entities: DesignEntities
  viewPreferences: ViewPreferences
}

interface InstallationVolume {
  widthMm: Mm
  heightMm: Mm
  depthMm: Mm
  clearances: {
    leftMm: Mm
    rightMm: Mm
    topMm: Mm
    backMm: Mm
    frontMm: Mm
  }
}

interface FurnitureRun {
  id: EntityId
  frameIds: EntityId[]
  originMm: { x: Mm; y: Mm; z: Mm }
  gapMm: Mm
  alignment: 'left' | 'center' | 'right'
}

interface FrameV2 {
  id: EntityId
  name: string
  catalogItemId: string | null
  xMm: Mm
  widthMm: Mm       // 10..2070
  heightMm: Mm      // 10..2800
  depthMm: Mm
  constructionProfileId: string
  carcassMaterialId: string
  openingIds: EntityId[]
  frontSystemId: EntityId | null
}

interface Opening {
  id: EntityId
  frameId: EntityId
  parentOpeningId: EntityId | null
  boundsMm: { x: Mm; y: Mm; z: Mm; width: Mm; height: Mm; depth: Mm }
  mountingProfileId: string
  componentIds: EntityId[]
}

interface PlacedComponent {
  id: EntityId
  catalogItemId: string
  hostOpeningId: EntityId
  anchorId: string
  positionMm: { x: Mm; y: Mm; z: Mm }
  sizeMm: { width: Mm; height: Mm; depth: Mm }
  materialId: string
  optionValues: Record<string, string | number | boolean>
}

interface FrontSystem {
  id: EntityId
  type: 'open' | 'hinged' | 'paired-hinged' | 'sliding' | 'multi-panel'
  hostOpeningIds: EntityId[]
  leafIds: EntityId[]
  trackCatalogItemId: string | null
}

interface FrontLeaf {
  id: EntityId
  catalogItemId: string
  hingeSide: 'left' | 'right' | null
  openPermille: number // integer 0..1000
  materialId: string
  hardwarePlacementIds: EntityId[]
}

interface HardwarePlacement {
  id: EntityId
  catalogItemId: string
  hostLeafId: EntityId
  offsetMm: { horizontal: Mm; vertical: Mm; depth: Mm }
  rotationMilliDegrees: number
}

interface ContentProp {
  id: EntityId
  propCatalogItemId: string
  hostId: EntityId
  slotId: string
  positionMm: { x: Mm; y: Mm; z: Mm }
  visible: boolean
}
```

`DesignEntities` uses normalized `byId` maps and explicit order arrays. Selection,
hover, camera, open animation progress during playback, drag previews, and panel
state are not canonical furniture data.

### Migration from version 1

1. Convert ordered frames to explicit `xMm` positions.
2. Create one root opening inside each frame.
3. Convert a vertical divider into child openings when geometry is unambiguous;
   otherwise retain the component in the root opening and mark the design for a
   non-blocking review.
4. Convert each existing component to a host opening and 3D position.
5. Convert existing primary door data into one `FrontSystem` and leaf.
6. Convert handle IDs into `HardwarePlacement` defaults.
7. Preserve project IDs, names, timestamps, language, save slots, and exports.
8. Round no dimension silently. Reject fractional/corrupt values with a recovery
   copy.

## 10. New catalog model

All catalog content is original and project-owned.

```ts
interface CatalogItemV2 {
  id: string
  fictionalSku: string
  kind: 'frame' | 'divider' | 'shelf' | 'drawer' | 'basket' | 'rail' |
    'tray' | 'front-system' | 'front-leaf' | 'hardware' | 'light' |
    'accessory' | 'content-prop'
  labelKey: string
  descriptionKey: string
  categoryId: string
  tags: string[]
  dimensionPolicyId: string
  geometryRecipeId: string
  placementPolicyId: string
  compatibilityRuleIds: string[]
  bomRecipeId: string | null
  priceRuleId: string | null
  materialOptionIds: string[]
  asset: AssetManifest | null
  capacity: CapacityMetadata | null
  accessibility: { objectRoleKey: string; placementHintKey: string }
}
```

Supporting registries:

- **Dimension policy:** fixed, range, derived-to-opening, pitch, and exact custom
  rules.
- **Geometry recipe:** procedural boards, panels, drawers, rails, fronts, and
  assembly offsets.
- **Placement policy:** valid hosts, anchors, snap pitch, minimum edges, allowed
  axes, and operational volume.
- **Compatibility rule:** data-driven rule IDs; no executable strings in catalog
  JSON.
- **BOM recipe:** part yields, hardware sets, cut dimensions, quantities, and
  notes.
- **Price rule:** fictional fixed, area, length, set, or material multiplier.
- **Asset manifest:** original GLB/texture URLs, attribution/provenance, byte size,
  bounds, LODs, and fallback primitive.
- **Capacity metadata:** garments, shoe pairs, folded stacks, or nominal load for
  recommendations—not a guarantee.

Catalog search indexes labels, tags, capacity, width/depth fit, material, and
price tier. Compatibility filtering consumes the same rule registry as drag and
validation.

## 11. New interaction model

### 11.1 Interaction state machine

```text
idle
  → hovering(object)
  → selected(object)
  → cameraNavigating
  → catalogArmed(item)
      → previewing(item, host, snappedPosition, issues)
      → committed(command) | cancelled
  → moving(existingObject)
      → previewingMove(position, issues)
      → committed(command) | cancelled
  → focusTransition(target)
      → focused(target)
```

Only `committed(command)` changes canonical design or history.

### 11.2 Placement behavior

- Drag a catalog card into the scene on desktop.
- Tap a catalog card, then a highlighted host on touch or keyboard.
- Raycast only against interaction surfaces, not every visual mesh.
- Ask the geometry kernel for candidate host, anchor, and snap positions.
- Display a ghost mesh, X/Y/Z labels, clearances, and valid/warning/invalid state.
- Show nearest valid alternative when rejected.
- Commit on drop only when blocking rules pass.
- Press Escape to cancel and restore the original object/camera.
- Arrow keys nudge by 1 mm; Shift+Arrow by 10 mm; configurable larger steps are
  available without changing canonical precision.

### 11.3 Object-specific placement

- Shelves, drawers, baskets, rails, and trays target openings.
- Dividers modify opening topology through a command, not by visual overlap.
- Front systems target compatible frame openings or contiguous frame spans.
- Handles/knobs target front leaves and show drill offsets.
- Accessories target declared support slots or surfaces.
- Content props target decorative slots and never enter the BOM.

### 11.4 Door preview

- Front visibility is independent from physical openness.
- Global preview: Closed, Open all, Hide fronts.
- Individual leaf: accessible slider/button from 0–100%.
- Hinged leaves rotate around hinge anchors; sliding leaves move on track axes.
- During animation, operational collision results remain visible.
- Reduced-motion preference jumps to the final state without animation.

## 12. New validation model

### 12.1 Rule layers

1. **Schema:** required IDs, safe integer millimeters, finite ranges, references.
2. **Intrinsic:** 10–2070 mm frame width, 10–2800 mm frame height, valid depth,
   construction minimums, catalog policies.
3. **Installation:** run fits available width/height/depth and clearances.
4. **Host/support:** object has a compatible opening, surface, anchor, runner, or
   track.
5. **Containment:** solid bounds stay within usable host volume.
6. **Collision:** solid volumes do not intersect illegally.
7. **Operation:** drawers, baskets, trays, doors, and handles have swept clearance.
8. **Front/hardware:** hinge zones, tracks, leaf counts, handle drilling, and
   internal conflicts.
9. **Capacity/load:** advisory shelf spans, rail loads, lighting power, and
   content capacity.
10. **Output readiness:** BOM recipe, price rule, material, and required options
    are complete.

### 12.2 Rule output

```ts
interface RuleResult {
  id: string
  ruleId: string
  severity: 'blocker' | 'warning' | 'advice'
  targetIds: string[]
  titleKey: string
  explanationKey: string
  parameters: Record<string, string | number>
  fixActions: SuggestedFix[]
  geometryHint?: BoundsOrVolume
}
```

The result must answer:

- What is wrong or constrained?
- Why does the rule exist?
- Which objects are involved?
- What consequence occurs?
- What exact action can fix it?

### 12.3 Evaluation strategy

- **Candidate evaluation:** fast host, range, containment, and nearby collision
  checks during pointer movement.
- **Commit evaluation:** all rules affected by the command.
- **Full audit:** deterministic design-wide validation before review/export.
- Maintain a dependency index so editing one shelf does not revalidate every
  texture or unrelated frame.
- Cache opening geometry, bounds, and operational volumes by entity revision.
- The catalog uses rule preconditions, so compatibility never diverges from the
  committed validator.

## 13. New rendering strategy

### 13.1 Visual target

- Neutral warm/cool studio background with a subtle ground/baseline.
- Translucent installation-volume box and clearance planes on demand.
- Procedural carcasses with board thickness, edge band, cavity, back, plinth,
  mounting rows, and panel seams.
- PBR materials using original or appropriately licensed textures.
- Soft key/fill lighting, contact shadows, restrained ambient occlusion, and
  consistent tone mapping.
- Mirror and glass that read clearly without expensive full-room reflection.
- Smooth but short door/drawer motion.
- Original low-poly clothes and storage props that communicate scale.

### 13.2 Procedural-first geometry

Custom widths and heights make static product models unsuitable as the primary
source. Frames, shelves, drawers, rails, panels, doors, and most hardware should
be generated from recipes. Decorative objects may use original GLB assets.

Geometry cache keys include recipe version, dimensions, construction profile,
and required material slots. A material change must not rebuild geometry.

### 13.3 Measurement rendering

- Render guide lines in a dedicated overlay layer with occlusion-aware anchors.
- Use DOM labels for readable text, focus, localization, and high contrast.
- Prioritize: active drag → selected object → focused opening → frame → overall
  run → installation.
- Collapse lower-priority labels when they overlap.
- Print uses deterministic SVG labels, not WebGL screenshots alone.

### 13.4 Fallback strategy

- Keep SVG as a selectable Front 2D mode.
- Automatically offer 2D when WebGL initialization/context recovery fails.
- All editing remains possible through object tree, inspector, and numeric
  placement even if the 3D canvas is unavailable.
- Never make save, export, validation, or BOM depend on GPU state.

## 14. New performance strategy

### Budgets

- Existing app shell interactive before loading 3D.
- Lazy 3D chunk target: ≤ 450 kB gzip excluding optional props/textures.
- First useful scene on a mid-range laptop: ≤ 3 seconds after opening designer.
- Pointer-to-preview response: ≤ 50 ms; target 60 fps desktop and 30 fps mobile.
- Committed validation + BOM + price for 20 frames / 500 components: ≤ 150 ms.
- Baseline scene: 20 frames, 500 furniture components, 200 optional props.
- Typical visible draw calls: target < 250; typical texture memory < 128 MB.

### Techniques

- Lazy-load WebGL, catalogs by category, and decorative assets.
- Use `frameloop="demand"`; render continuously only during camera movement,
  drag, or animation.
- Cache and reuse procedural geometries and materials.
- Instance repeated hardware, mounting holes, hangers, and props.
- Use LODs and texture atlases for content props.
- Raycast against simplified proxy surfaces.
- Dispose textures/geometries deterministically on catalog or project changes.
- Memoize scene DTOs by entity revision; never rebuild the entire scene for a
  selection highlight.
- Use dynamic resolution and shadow quality tiers on mobile/low-power devices.
- Introduce a worker for full validation/BOM only if profiling shows >50 ms main-
  thread tasks; do not add worker complexity preemptively.
- Test WebGL context loss, asset failure, slow network, and memory pressure.

## 15. New accessibility strategy

Target WCAG 2.2 AA for the application around the inherently visual scene.

- Maintain a synchronized semantic scene tree: run → frames → openings →
  components → fronts → hardware → props.
- Selection in the tree and scene is bidirectional.
- Every drag operation has Add to selected opening, Move to position, numeric,
  and keyboard-nudge equivalents.
- Provide skip links to catalog, scene tree, inspector, canvas, issues, and review.
- Keep visible focus and predictable restoration after dialogs, delete, undo,
  focus mode, and imports.
- Announce committed changes, invalid placement, selected object, save state, and
  total changes through throttled live regions.
- Do not announce every pointer-move millimeter.
- Give camera orientation and focus target text labels.
- Ensure touch targets are at least 44 × 44 CSS px.
- Use pattern/icon/text in addition to color for placement and issue state.
- Respect reduced motion, reduced transparency where practical, contrast, and
  browser zoom to 200%.
- Keep materials named and described; never make a swatch color-only.
- Preserve full edit/review/export workflows in 2D mode.
- Add automated axe checks plus manual screen-reader and keyboard scenario tests.

The public accessibility study is historically useful because it identified
keyboard control, names/roles, and focus visibility as critical risks in a 3D
planner. Our architecture treats semantic control as a parallel product surface,
not a late canvas patch.

## 16. Persistence, BOM, price, and deployment

### Persistence

- Add a schema-2 migration without invalidating schema-1 saved projects.
- Keep autosave and named saves local-first.
- Store decorative asset IDs, not asset binaries.
- Preserve a recovery copy before every migration.
- JSON export includes schema/app version and catalog revision.
- Loading a file with unavailable optional assets falls back to primitives; it
  does not lose furniture geometry.

### Parts and price

- Geometry and catalog recipes derive BOM lines.
- Front systems derive leaves, tracks, hinges, buffers, and hardware sets.
- Custom panels derive integer finished dimensions.
- Every BOM line references its source entity and rule.
- Price consumes BOM lines, preventing estimate/list disagreement.
- Decorations are excluded unless explicitly promoted to purchasable accessories.
- All SKUs and prices remain fictional and visibly labeled.

### GitHub Pages

- Retain relative/configurable Vite base.
- Deploy hashed static assets and original models/textures from the repository.
- Keep official Pages artifact actions and test/typecheck/build gates.
- Add asset-path smoke tests under the project subpath.
- Enforce file-size budgets in CI before 3D assets merge.
- Do not require a server for editing, persistence, or export.

## 17. Implementation roadmap: next nine prompts

Each prompt is a bounded implementation issue. A prompt is complete only when its
acceptance criteria pass; later prompts must not bypass failed foundations.

### Prompt 7 — 3D foundation, renderer boundary, and schema v2

**Goal:** Introduce the technical seam for 3D without attempting the full
configurator.

Tasks:

- **P7-001:** Add `three`, React Three Fiber, selected Drei helpers, and test
  utilities; document licenses and bundle impact.
- **P7-002:** Create the `DesignerRenderer` boundary and adapt the current SVG
  canvas as `front-2d`.
- **P7-003:** Add a lazy-loaded WebGL scene shell with neutral background,
  installation-volume box, grid/baseline, lighting, resize handling, context-loss
  fallback, and an original loading/error state.
- **P7-004:** Define Design v2 types, branded/validated millimeter constructors,
  normalized entities, frame `xMm`, openings, front systems, hardware placements,
  content props, and view preferences.
- **P7-005:** Implement schema-1 → schema-2 migration with fixtures and recovery;
  do not destroy existing local projects.
- **P7-006:** Add the pure scene-view-model mapper and renderer-independent
  selection command interface.
- **P7-007:** Add a feature flag/view toggle so 2D remains the safe default while
  the 3D shell matures.
- **P7-008:** Add unit tests for millimeter invariants, migration, entity
  references, scene mapping, and fallback behavior.
- **P7-009:** Measure bundle size and verify GitHub Pages asset paths.

Acceptance criteria:

- Existing design/edit/save/export workflows still work in 2D.
- A schema-1 project round-trips through schema 2 without changed dimensions,
  frame order, components, fronts, or user-visible price.
- The 3D route/chunk renders only an installation box and one test frame proxy
  from the scene DTO; it is not yet the production furniture renderer.
- WebGL failure returns to 2D with a friendly message.
- Typecheck, existing tests, new migration tests, and production build pass.
- No drag-and-drop rewrite, realistic assets, front animation, or catalog overhaul
  is attempted in Prompt 7.

### Prompt 8 — Procedural frame/opening geometry and materials

**Goal:** Render exact custom furniture structure in 3D.

Tasks:

- **P8-001:** Implement board/carcass geometry recipes from integer mm.
- **P8-002:** Build opening topology and divider-generated bays.
- **P8-003:** Render back, plinth, fillers, cover panels, edges, and mounting rows.
- **P8-004:** Add original PBR material registry and accessible material cards.
- **P8-005:** Add geometry/material cache and disposal tests.
- **P8-006:** Verify 10/2070 mm widths and 10/2800 mm heights at boundaries.

Acceptance: one- and multi-frame fixtures match SVG dimensions and derived bounds;
custom dimensions change geometry without stale meshes or fractional persisted mm.

### Prompt 9 — Camera, focus mode, selection, and measurement system

**Goal:** Make navigation precise, recoverable, and understandable.

Tasks:

- **P9-001:** Front Precision and constrained 3D Inspect cameras.
- **P9-002:** Fit all/selection, orientation presets, wheel/pinch zoom, pan, reset.
- **P9-003:** Frame/opening focus mode with breadcrumbs and camera restoration.
- **P9-004:** Raycast selection plus synchronized semantic object tree.
- **P9-005:** Occlusion-aware DOM measurement labels and mounting guides.
- **P9-006:** Keyboard camera and selection alternatives.

Acceptance: users cannot permanently lose the furniture; every camera action has a
visible control; focus entry/exit restores prior state exactly.

### Prompt 10 — Renderer-independent placement and drag-and-drop internals

**Goal:** Add professional placement for shelves, drawers, rails, baskets, trays,
shoe storage, and dividers.

Tasks:

- **P10-001:** Interaction state machine and typed command transactions.
- **P10-002:** Catalog drag, tap-to-place, keyboard place, cancel, and one-step
  undo.
- **P10-003:** Host surfaces, anchors, catalog snap policies, and 1/10 mm nudges.
- **P10-004:** Ghost previews, live measurements, valid/invalid zones, nearest
  valid suggestion.
- **P10-005:** Object move between openings and divider topology commands.
- **P10-006:** Operational proxy volumes for pull-outs.

Acceptance: every direct manipulation has numeric and keyboard parity; invalid
drops never mutate the design; one gesture creates one undo entry.

### Prompt 11 — Front systems, handles, and open/closed preview

**Goal:** Model and render complete front/hardware behavior.

Tasks:

- **P11-001:** Hinged, paired, sliding, multi-panel, and open systems.
- **P11-002:** Front-leaf materials, tracks, hinges, overlays, and seams.
- **P11-003:** Handle/knob placement on leaves with exact offsets.
- **P11-004:** Per-leaf and global open/close/hide controls.
- **P11-005:** Swept-volume collision and internal hinge/runner rules.
- **P11-006:** Reduced-motion and keyboard-accessible preview controls.

Acceptance: internals are inspectable with fronts hidden/open; collisions identify
both objects and offer a fix; BOM includes derived front hardware.

### Prompt 12 — Professional catalog, templates, recommendations, and props

**Goal:** Make the tool feel complete before adding more engine complexity.

Tasks:

- **P12-001:** Catalog v2 registries and original fictional fixtures.
- **P12-002:** Search, filters, Compatible/Show all, and disabled explanations.
- **P12-003:** Intent-based original templates and preview-before-apply.
- **P12-004:** Capacity metadata and explainable layout recommendations.
- **P12-005:** Original low-poly clothes, shoes, boxes, bags, and folded props with
  provenance manifests and LODs.
- **P12-006:** Asset loading, fallbacks, retry, and size-budget tests.

Acceptance: no catalog entry depends on competitor data/assets; recommendations
state why they fit; props can be hidden globally and never corrupt BOM.

### Prompt 13 — Validation and compatibility engine v2

**Goal:** Make every configuration trustworthy and every failure explainable.

Tasks:

- **P13-001:** Rule registry and structured results/fix actions.
- **P13-002:** Schema, intrinsic, installation, host, containment, collision,
  operation, front/hardware, load/power, and output rules.
- **P13-003:** Fast candidate evaluation and affected-entity commit evaluation.
- **P13-004:** Shared compatibility preconditions for catalog and placement.
- **P13-005:** Scene highlights, issue navigation, and one-click safe fixes.
- **P13-006:** Boundary and conflict fixture matrix.

Acceptance: catalog, drag, inspector, review, and export report the same rule
truth; every blocker names cause, consequence, targets, and fix.

### Prompt 14 — BOM, estimate, persistence, import/export, and review v2

**Goal:** Reconnect professional 3D design to reliable project outputs.

Tasks:

- **P14-001:** BOM recipes for procedural frames, internals, fronts, and hardware.
- **P14-002:** BOM-driven fictional price with visible change delta.
- **P14-003:** Schema-2 local saves/autosave/recovery and robust import preview.
- **P14-004:** Updated JSON and CSV contracts plus migration tests.
- **P14-005:** Review screen with 3D snapshot, SVG elevation, dimensions, issues,
  price, and grouped parts.
- **P14-006:** Print pagination and grayscale verification.

Acceptance: a saved/reloaded/imported design has identical geometry fingerprint,
issues, BOM, and price; every priced line maps to a source entity.

### Prompt 15 — Accessibility, mobile, performance, QA, and release

**Goal:** Turn the rebuilt slices into a stable production release.

Tasks:

- **P15-001:** Complete semantic scene tree and keyboard workflow.
- **P15-002:** Mobile focus editor, bottom sheets, tap placement, and gesture
  arbitration.
- **P15-003:** Reduced motion/data, contrast, screen-reader, zoom, and touch QA.
- **P15-004:** Profiling, instancing, LOD, draw-call, memory, and bundle budgets.
- **P15-005:** Context-loss/offline/asset-failure and corrupt-project recovery.
- **P15-006:** End-to-end scenarios across desktop/mobile and 2D/3D.
- **P15-007:** GitHub Pages subpath smoke test, CI budgets, documentation, and
  release checklist.

Acceptance: target performance and accessibility budgets pass; production build
works under the Pages subpath; 2D fallback preserves all essential workflows.

## 18. Exact handoff for Prompt 7

Prompt 7 must build the **foundation only**:

1. Install and document the chosen 3D dependencies.
2. Add a renderer abstraction and keep the SVG experience fully functional.
3. Define and validate Design v2 with normalized frames, openings, fronts,
   hardware, props, and integer-mm invariants.
4. Migrate Design v1 safely with recovery and test fixtures.
5. Lazy-load a minimal Three.js scene shell that renders the installation volume
   and one frame proxy from a pure scene DTO.
6. Add neutral lighting, resize handling, feature detection, context-loss error,
   and automatic 2D fallback.
7. Add a temporary 2D/3D view toggle behind a feature flag.
8. Test migration, scene mapping, fallback, asset paths, bundle size, existing
   workflows, and the production build.

Prompt 7 must **not** implement production procedural furniture geometry, new
drag-and-drop, camera focus mode, realistic materials, doors, handles, clothes,
catalog v2, or validation v2. Those have separate prompts so foundation defects
cannot hide inside feature work.

## 19. Definition of success for the nine-prompt rebuild

A user can start from scratch or an original template, define only the furniture
installation volume, build a multi-frame wardrobe with 10–2070 mm widths and
10–2800 mm heights at exact integer-mm precision, focus one opening, place and
move internals by drag/tap/keyboard/numeric input, add compatible fronts and
hardware, inspect realistic materials and optional contents, open/close fronts,
understand every invalid state, recover/save/import the project, and produce a
consistent fictional estimate and parts list. The same project remains editable
in a complete 2D fallback and deploys as a static GitHub Pages application.

