# Prompt 7 data-model upgrade

**Status:** Implemented foundation
**Design schema:** 2
**Project envelope schema:** 2

This phase implements the data architecture described in
`docs/PAX_LEVEL_REBUILD_PLAN.md`. It does not add a WebGL renderer or replace the
current user interface.

## What changed

### Canonical design

`Design` now contains:

- `version: 2`;
- installation space;
- nested `furniture` with frames, global doors, accessories, material palette,
  and derived overall dimensions;
- a structured `selectedObject`;
- camera state and view mode;
- renderer settings;
- validation results and price summary snapshots.

Frames now carry explicit integer-millimeter `xMm`, `yMm`, and `zMm` positions,
board thickness, panel records, feet/plinth/back state, contents, doors,
components, and validation state.

Furniture components now expose canonical `positionMm` and `sizeMm` 3D records,
compatible depths, finish/hardware options, and lock/selection flags. The current
SVG renderer still consumes synchronized flattened `xMm`, `yMm`, `zMm`,
`widthMm`, `heightMm`, and `depthMm` projection fields. These projections are a
temporary migration bridge, not a second source of truth; state commands update
them from the canonical records.

Doors now include a host frame, full 3D dimensions/position, thickness, hinge
side, track requirement, open angle/state, handle/knob references, and selection
state. Hardware and decorative/storage contents are first-class records.

### Model modules

- `src/models/design.ts` — canonical furniture entities.
- `src/models/geometry.ts` — integer-mm vectors, sizes, bounding boxes, unit
  conversion, inner dimensions, overlap, furniture bounds, and auto-fit math.
- `src/models/rendering.ts` — camera, view modes, render settings, and selection.
- `src/models/catalog.ts` — professional catalog, price rule, placement/rule, and
  render-hint contracts.
- `src/models/validation.ts` — validation rules/results and placement feedback.
- `src/models/migrations.ts` — schema-1 to schema-2 design migration.

### Geometry contract

Furniture dimensions and positions must be safe integer millimeters. Floating
point conversion happens only at the renderer boundary through
`mmToMetersFor3D`.

Frame limits remain:

- width: 10–2070 mm;
- height: 10–2800 mm.

The geometry module provides:

- `mmToMetersFor3D`;
- `mmToDisplayCm`;
- `displayCmToMm`;
- `clampFrameWidth`;
- `clampFrameHeight`;
- `getFrameInnerWidth`;
- `getFrameInnerHeight`;
- `getFrameInnerDepth`;
- `calculateFrameBoundingBox`;
- `calculateComponentBoundingBox`;
- `detect2DVerticalOverlap`;
- `detect3DOverlap`;
- `calculateFurnitureBounds`;
- `calculateAutoFitCameraDistance`.

### Catalog

`src/data/configuratorCatalog.ts` adds 68 original fictional records:

- 8 frame templates;
- 10 shelf/storage/rail/shoe/divider/organizer items;
- 8 drawer/basket/tray items;
- 8 doors;
- 10 handles and knobs;
- 10 clothes/display contents;
- 6 lighting/accessory items;
- 8 complete wardrobe presets.

Every item has an original `WS-*` fictional SKU, dimension policies, compatible
depth/front metadata, price rule, validation/placement rule IDs, and rendering
hints. The catalog contains no competitor names, article numbers, assets, or
prices. It is intentionally not exposed in the current UI yet.

### State commands

The reducer now supports:

- design create/load/rename;
- installation changes;
- frame add, resize, move, reorder, focus, duplicate, rename, and delete;
- component add, move, resize, configure, duplicate, replace, and delete;
- door add/configure/replace and open/close toggle;
- hardware attachment to doors;
- content add/update/delete;
- material and finish changes;
- camera mode/update and view mode;
- render-setting changes;
- validation and price recalculation;
- undo/redo.

Pointer previews remain outside canonical state. Each committed model mutation
still produces one undo entry.

### Persistence and migration

New exports use envelope schema 2. Import accepts:

- valid schema-2 projects directly;
- valid schema-1 projects through a deterministic migration;
- no unsupported future schema.

Migration preserves IDs, names, timestamps, installation values, frame order,
dimensions, components, doors, language, selection, visibility, and zoom. It
adds explicit frame positions, 3D component records, generated structural
panels, new camera/render defaults, and derived furniture metrics.

Local saves and autosave continue to use the existing repository API. Loading an
old local project transparently returns a schema-2 design, and its next save uses
schema 2.

## Tests added

- exact unit conversion and dimension clamps;
- inner dimensions and bounding boxes;
- 2D/3D overlap and camera auto-fit math;
- catalog breadth, category coverage, integer values, unique IDs/SKUs, and legal
  naming guard;
- schema-1 migration and schema-2 round trip;
- frame/component/door/hardware/content/camera state commands;
- explicit-position reorder regression;
- undo after view/camera changes.

## Ready for the rendering prompt

The next rendering phase can consume:

1. `design.furniture.frames` as the furniture scene source;
2. each frame's explicit origin and dimensions;
3. frame panels for procedural carcass meshes;
4. component `positionMm` and `sizeMm` for mesh transforms;
5. door open angle/state and host frame;
6. content objects for optional original assets;
7. camera/view/render models;
8. geometry helpers for scene bounds, collision proxies, and auto-fit;
9. catalog render hints and preview model types.

Still deferred:

- Three.js/React Three Fiber dependencies;
- WebGL canvas and renderer boundary;
- procedural mesh implementation;
- raycasting and 3D drag interaction;
- animated fronts and realistic materials/assets;
- final catalog UI.

