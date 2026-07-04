# FurnitureStudioWeb — Product specification

**Status:** Foundation specification  
**Research date:** 4 July 2026  
**Product type:** Browser-based custom wardrobe/cabinet configurator

## 1. Product definition

FurnitureStudioWeb helps a non-specialist create a buildable wardrobe or
cabinet and understand its dimensions, contents, constraints, estimated price,
and parts. It models the furniture object and its installation boundary—not the
surrounding room.

The primary product promise is:

> Make custom cabinet decisions visible, understandable, and recoverable before
> any material is cut or purchased.

### Goals

- Support custom frame dimensions at 1 mm resolution within the stated limits.
- Make every edit immediately visible in a polished 2.5D elevation.
- Prevent or clearly explain incompatible and physically impossible designs.
- Keep pricing and parts traceable to the exact design state.
- Work without an account, backend, database, or paid service.
- Produce portable project JSON, useful CSV, and a clear printed summary.

### Non-goals

- Room layouts, walls, windows, doors, decor, or general interior design.
- Photorealistic free-camera 3D or augmented reality.
- Manufacturing CNC/CAM output in the first product.
- Live stock, checkout, delivery, assembly booking, or real retailer products.
- Multi-user collaboration, cloud sync, or authentication.

## 2. Public IKEA PAX planner analysis (learning only)

The public experience was reviewed to understand category conventions. Sources:

- [Public planner landing page](https://www.ikea.com/gb/en/planners/pax-planner/)
- [Public interactive planner](https://www.ikea.com/addon-app/storageone/pax/web/latest/gb/en/)
- [Public planning guide](https://www.ikea.com/be/en/rooms/bedroom/how-to/how-to-design-your-perfect-pax-wardrobe-pub8b76dda0/)

This section describes product lessons; it is not a design brief to reproduce
screens, language, styling, product data, or trade dress.

### 2.1 First impression

**Observed:** The entry experience offers three low-risk starting modes: begin a
new design, reopen a saved design, or customize a ready-made combination. Large
lifestyle imagery gives the category emotional context before the technical work.

**What works:** Users are not dropped directly into a blank technical canvas.
Examples communicate the possible result and provide a shortcut for people who
do not yet understand frame/interior systems.

**Friction:** The emotional landing page and the highly technical planner feel
like two different modes. A large example gallery can also make the tool feel
like product selection rather than object design.

**Our response:** Start with one calm project launcher: New design, Open local
project, Import JSON, and three original intent-based templates. Templates are
structural starting points—not purchasable combinations.

### 2.2 Onboarding

**Observed:** The planner quickly opens a blank scene with a visible component
menu. Its public planning guide teaches frame choice, doors, interiors, lighting,
and purchase as a separate editorial sequence.

**What works:** Getting to an editable scene is fast, and the guide provides
category education for users who seek it.

**Friction:** The blank canvas does not immediately explain the prerequisite
measurements or why a user should choose one frame over another. Education lives
partly outside the working context.

**Our response:** A three-question setup card captures installation width,
height, and depth first, with optional clearances. A short “why this matters” note
is adjacent to each measurement. The user can skip with explicit defaults.

### 2.3 Navigation

**Observed:** A category panel exposes Frames, Add-on units, Doors, Handles,
Interiors, Organisers, and Lights. Back navigation returns to the category list.
Global controls include menu, save, price/summary, canvas display toggles, and
undo/redo.

**What works:** Product categories tame catalog breadth. Undo/redo is always near
the scene, and save/summary remain globally available.

**Friction:** The category taxonomy mixes construction phases, product families,
and merchandising terms. Moving back and forth can obscure the user's current
design task.

**Our response:** Use task phases—Set up, Build, Outfit, Finish, Review—with a
small catalog inside each. A persistent inspector shows the selected object's
properties; users do not have to leave the phase to edit an existing item.

### 2.4 Frame selection

**Observed:** Frame cards are filtered by selected depth and height presets, and
color is chosen above them. Clicking a compatible card immediately places a
frame and marks the card as present in the design.

**What works:** Presets make frame creation fast, and instant placement creates a
strong action-to-result connection.

**Friction:** A retail catalog's available sizes become the design model. A user
with a nonstandard opening cannot describe their actual desired frame.

**Our response:** The primary control is a custom frame with width, height, and
depth in millimetres. Common depths are shortcuts, not restrictions. “Duplicate
frame” supports repeated bays without forcing a product-card flow.

### 2.5 Dimension handling

**Observed:** Depth and height are segmented presets; frame widths are product
options. The 3D view displays measured exterior dimensions and explains required
ceiling clearance for assembly.

**What works:** Dimensions are visible on both the selection controls and the
object, while assembly clearance turns a hidden constraint into useful guidance.

**Friction:** Rounded centimetre presentation and fixed variants are unsuitable
for bespoke work. Clearance messages can appear informational rather than tied
to a complete installation-space calculation.

**Our response:** Store integer millimetres, edit at 1 mm steps, and display
millimetres by default. A clearance ribbon compares furniture bounds with the
installation boundary continuously and tells the user the exact remaining or
missing space.

### 2.6 Interior component selection

**Observed:** Interiors offer suggested layouts and an individual component list.
The list automatically narrows to components compatible with the selected frame;
filters provide further narrowing.

**What works:** Complete layouts speed up common storage scenarios, while the
component list supports granular control. Compatibility filtering reduces noise.

**Friction:** Suggested layouts can hide what will be added and why. Separating
“interiors” from “organisers” may not match how a novice thinks about storage.

**Our response:** Outfit is organized by intent—Hang, Fold, Drawers, Shoes,
Accessories, Light—while every suggestion previews its parts, occupied height,
and price delta before application.

### 2.7 Door configuration

**Observed:** Door choices are filtered into hinged/sliding types and available
widths. A no-door state is explicit. Selecting a door immediately changes the
render and exterior depth; mirror fronts show a reflective effect.

**What works:** An explicit open configuration avoids treating “none” as missing
data. Visual effects make door materials legible, and total dimensions respond.

**Friction:** Door width, hinge direction, collision zones, handle requirements,
and interior conflicts can become distributed decisions.

**Our response:** Finish presents door system first, then panel style, swing or
track behavior, and handle. The elevation overlays swing/overlap zones. The issue
panel groups all related conflicts under the affected opening.

### 2.8 Material and color selection

**Observed:** Circular surface swatches update frame or component color, and
product images represent available finishes.

**What works:** Swatches are compact and direct, and the scene provides immediate
feedback.

**Friction:** Small texture circles are difficult to distinguish and can lack
names, material properties, and accessible non-color cues.

**Our response:** Material cards include an original texture tile, plain-language
name, finish, color family, price tier, and durable selected state. Every swatch
has text and does not rely on color alone.

### 2.9 Component placement

**Observed:** Choosing a compatible rail placed it automatically at a sensible
default height. Selected frames expose contextual delete, duplicate, and info
actions. The live scene supports direct manipulation and undo/redo.

**What works:** Automatic defaults make the first result fast, and contextual
actions keep object operations close to the object.

**Friction:** Automatic placement may be surprising when the exact slot is not
previewed first. Drag operations can be fragile on touch devices or under poor
performance, and exact alignment is difficult without numeric alternatives.

**Our response:** Hover/focus previews a ghost before commit. Dragging snaps to
valid mounting intervals with green/amber/red feedback. Every drag action also
has numeric position controls and keyboard nudge commands.

### 2.10 Visual preview behavior

**Observed:** A room-like 3D stage includes floor, wall, props, material effects,
measurement labels, door visibility, night mode, and scene customization.

**What works:** Depth, scale, materials, doors, and lighting are easier to trust
than in a flat diagram. Visual mode toggles let users inspect internals.

**Friction:** The room scene consumes rendering and screen space without making
the cabinet more buildable. Perspective can obscure exact spacing. On initial
placement a small frame can appear distant.

**Our response:** Default to a large orthographic front elevation with subtle
2.5D board depth and shadows. Add a controlled side/elevation toggle, fit-to-
selection, internals/doors overlay, and optional neutral backdrop—never a room.

### 2.11 Product summary

**Observed:** Price and a Summary action remain in the global header. The wider
public experience connects a completed plan with a product/shopping summary.

**What works:** A persistent route to completion prevents the builder from
becoming an endless canvas.

**Friction:** A retailer summary naturally prioritizes purchasable products and
checkout readiness over design rationale, warnings, or dimensional proof.

**Our response:** Review is an engineering-friendly checkpoint: elevation,
overall dimensions, clearances, design health, price breakdown, grouped parts,
and export actions. There is no cart.

### 2.12 Price display

**Observed:** Total price updates immediately in the header as frames and
components are added; product cards show individual prices.

**What works:** Continuous price feedback lets users understand the cost of each
decision and compare alternatives without a separate calculation step.

**Friction:** A single total does not explain derived panels, hardware, material
uplifts, or why a change affected the estimate.

**Our response:** Show total plus the most recent delta, with drill-down by Frame,
Interiors, Fronts, Finish, Lighting, and Hardware. Every line records quantity,
unit basis, unit price, and source rule. All data is fictional and clearly marked
as an estimate.

### 2.13 Parts list

**Observed:** Public guides describe a product list/shopping list connected to a
saved plan. The planner's price indicator also exposes an “included in price”
affordance.

**What works:** Users leave with something actionable rather than only an image.

**Friction:** A retail list is optimized around article numbers and order units;
it may not expose derived cut dimensions, parent frame, or validation status.

**Our response:** Group the bill of materials by frame and part class. Include
fictional SKU, description, finished dimensions in mm, material, quantity, unit
price, line total, and notes. CSV uses stable machine-readable headers.

### 2.14 Save and load behavior

**Observed:** The start page offers saved-design reopening. The project menu
exposes Save, Save as, Share, My designs, Open design code, and Start from
scratch; account entry is visible in the public shell.

**What works:** Multiple recovery paths support returning users and shared
planning sessions.

**Friction:** Accounts, external design codes, and retailer ownership add privacy
and availability dependencies. Users can be unsure whether work is saved locally
or remotely.

**Our response:** “Saved on this device” is explicit. Autosave status is visible;
projects can be named, duplicated, deleted with confirmation, and exported as
versioned JSON. Import is the portable share mechanism.

### 2.15 Error prevention

**Observed:** Catalog options adapt to the selected frame size, impossible items
are largely removed from choice, and ceiling-height guidance appears before
assembly becomes a surprise.

**What works:** Prevention is quieter and more efficient than repeated error
dialogs.

**Friction:** Hiding an item can make users wonder where it went. Compatibility
rules are harder to learn when only valid choices remain.

**Our response:** Default to Compatible only, with an optional “Show all” mode.
Disabled items remain discoverable and state the exact requirement. Placement
previews show why a target is invalid before drop.

### 2.16 Validation messages

**Observed:** Informational messages explain assembly clearance close to height
controls. Selection state and disabled undo/redo provide additional quiet status.

**What works:** Contextual, plain-language guidance reduces surprise.

**Friction:** Information, warnings, and blocking errors are not necessarily
summarized in one design-health view, so cross-object problems can be missed.

**Our response:** A persistent design-health chip counts blocking errors and
warnings. Each issue contains a title, consequence, affected object, exact rule,
and one or more fix actions. Selecting an issue focuses the relevant part.

### 2.17 Mobile and responsive behavior

**Observed at 390 × 844:** The preview remains above a bottom-sheet catalog.
Price and summary collapse into a compact header, category content becomes
horizontally browsable, and undo/redo remains over the canvas. Some desktop
actions are moved into the menu.

**What works:** The furniture never disappears completely, and primary actions
remain reachable with a thumb.

**Friction:** The preview becomes small and precise dragging competes with page
scrolling and sheet gestures. Product comparison is more serial.

**Our response:** Mobile is fully supported for setup, numeric editing, catalog
choices, review, and export. Direct free dragging is optional; tap-to-place and
numeric position controls are first-class. The bottom sheet has defined compact,
half, and full states.

### 2.18 What feels polished

- Immediate, realistic scene updates.
- Persistent price and completion route.
- Product compatibility reflected in available choices.
- Measurement labels and assembly guidance.
- Contextual selected-object actions and undo/redo.
- Meaningful material effects such as mirror reflection.
- Responsive transition from side panel to bottom sheet.

### 2.19 What feels confusing or fragile

- A retail taxonomy is not the same as a user's task sequence.
- Room-stage controls dilute a furniture-only job.
- Fixed product sizes prevent true customization.
- Automatic placement can happen before the target slot is understood.
- Dense catalog cards and tiny swatches reduce scanability and accessibility.
- Hidden incompatible products teach less than disabled, explained choices.
- Mobile direct manipulation has less precision than numeric editing.

### 2.20 What FurnitureStudioWeb can do better

1. Lead with the installation boundary and storage intent, not a room.
2. Make exact millimetres the core model while keeping helpful presets.
3. Organize navigation around the design task rather than product families.
4. Pair every direct manipulation with an exact numeric and keyboard method.
5. Explain invalid options and placements without removing them from discovery.
6. Make design health, clearances, and consequences persistent and actionable.
7. Provide traceable derived price and part lines, not only a total.
8. Keep projects user-owned through local autosave and portable files.
9. Prefer a large, legible 2.5D elevation over a resource-heavy room scene.
10. Treat accessibility and touch precision as model-level requirements, not
    final visual polish.

## 3. Primary users and jobs

### Careful homeowner

“Help me design storage that actually fits and tell me what I forgot.” Needs
guided setup, plain language, templates, visible clearances, and reliable save.

### Experienced DIY builder

“Let me enter exact sizes and get a trustworthy part breakdown.” Needs 1 mm
editing, keyboard speed, derived dimensions, transparent rules, JSON, and CSV.

### Small furniture consultant

“Help me explore alternatives with a customer and print a clear proposal.” Needs
fast duplication, material alternatives, price deltas, and a polished summary.

## 4. Main user flow

```text
Projects
  → Set up installation boundary and units
  → Build one or more cabinet frames
  → Outfit internal bays
  → Finish doors, panels, handles, materials, and lighting
  → Resolve blocking issues
  → Review dimensions, price, and parts
  → Save locally / export JSON / export CSV / print
```

The user may move backward at any point. All mutating operations use one command
history so undo/redo works across phases. Review is always reachable but export
surfaces unresolved warnings and blocks only exports that would be misleading.

## 5. App sections

### Project launcher

- New blank design
- Original templates: Reach-in, Tall utility, Drawer wall
- Local projects with last-edited time and dimensions
- Import JSON
- Recovery copy after interrupted/corrupt autosave

### Set up

- Project name and display units (mm default; cm display optional)
- Available width, height, and depth
- Optional left, right, and top clearances
- Boundary summary: usable dimensions after clearances

### Build

- Add, duplicate, reorder, and remove frames
- Width 10–2070 mm, height 10–2800 mm, 1 mm step
- Depth presets 350/450/580/600 mm and supported custom depth
- Board thickness and construction preset from the fictional catalog
- Dividers, plinth, filler/end panels

### Outfit

- Shelves, drawers, rails, baskets, dividers, and accessories
- Suggested groups previewed before commit
- Direct, numeric, and keyboard placement
- Visibility filters by compatible, intent, material, and price tier

### Finish

- Open, hinged, sliding, glass, and mirror front systems when compatible
- Handle and handleless treatments
- Surface material/color/edge treatment
- Side, top, infill, and decorative panels
- Integrated lighting and required drivers/accessories

### Review

- Scaled elevation and overall dimensions
- Installation clearances
- Blocking errors, warnings, and acknowledged advisories
- Price breakdown and last-updated state
- Grouped parts list
- Save copy, JSON export, CSV export, and print

## 6. Desktop UI layout

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Brand / project        autosave        undo redo      health   estimate     │
├─────────────┬──────────────────────────────────────────┬────────────────────┤
│ Phase rail  │                                          │ Inspector          │
│ Set up      │      2.5D SVG elevation / placement      │ selected object    │
│ Build       │      measurements / drop feedback        │ dimensions         │
│ Outfit      │                                          │ material / actions │
│ Finish      │                                          │                    │
│ Review      │                                          │                    │
├─────────────┴──────────────────────────────────────────┴────────────────────┤
│ Collapsible catalog / issue tray                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

The center canvas is visually dominant. The phase rail changes the catalog
context, while the inspector always edits the current selection. Catalog cards
never double as property editors.

## 7. Visual design direction

**Theme:** precise workshop meets calm editorial publication.

- Warm parchment surfaces and deep green structural UI.
- Clay/copper for actions and measured highlights; cool sage for valid states.
- Original geometric sans for interface and restrained serif display type only
  in project/empty states.
- 8 px base spacing, generous canvas margins, compact property rows.
- Original line icons with consistent 1.75 px stroke and descriptive labels.
- Material thumbnails use generated/project-owned textures with text equivalents.
- Motion is short and functional: placement, state changes, panel transitions.

Never use color alone for compatibility. Valid, warning, and invalid states use
shape, icon, text, and ARIA announcements in addition to color.

## 8. Responsive strategy

### ≥ 1180 px

Phase rail, canvas, and inspector are simultaneously visible. Catalog opens as a
tray or replaces the lower inspector section without shrinking the canvas below
its minimum useful width.

### 768–1179 px

Phase rail collapses to labeled icons; inspector becomes a resizable side sheet.
Catalog uses a bottom tray. Canvas keeps fit-to-design behavior.

### 320–767 px

Compact top bar, full-width canvas, and a three-state bottom sheet. Selection
opens an inspector sheet; back returns to catalog. Exact input and tap-to-place
are promoted above drag. Review becomes a normal vertical document.

No essential action depends on hover. Touch targets are at least 44 × 44 CSS px.

## 9. Accessibility strategy

- Target WCAG 2.2 AA.
- Semantic landmarks, heading order, named controls, and visible focus.
- Full keyboard path for catalog, selection, add, move, resize, duplicate,
  delete, undo/redo, and export.
- SVG objects expose a parallel semantic tree/list; the visual SVG is not the
  only way to understand or edit the design.
- Drag actions have “place at position” dialogs and arrow-key alternatives.
- Live regions announce totals, constraint changes, placement validity, save
  status, and undo results without excessive chatter.
- Inputs expose unit, valid range, current error, and correction hint.
- Minimum 4.5:1 body-text contrast and 3:1 component/focus contrast.
- Reduced-motion mode removes zoom/slide flourishes without hiding state.
- Print output retains meaning in grayscale.

## 10. Product acceptance criteria for the first usable slice

A user can create a project, enter an installation boundary, add two custom-sized
frames, see correct total dimensions in an SVG elevation, receive a blocking
overflow issue, correct it, observe a deterministic fictional price, undo/redo,
reload from localStorage, export/import JSON, export a grouped CSV, and print a
summary using only keyboard controls if needed.

Detailed data, engine, storage, and deployment contracts are defined in
`docs/ARCHITECTURE.md`.
