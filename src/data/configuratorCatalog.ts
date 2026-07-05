import { defineCatalogItem, type CatalogCategory, type CatalogItem } from '../models/catalog'
import type { SizeMm } from '../models/geometry'

const size = (width: number, height: number, depth: number): SizeMm => ({ width, height, depth })

function item(
  id: string,
  sku: string,
  name: string,
  category: CatalogCategory,
  subcategory: string,
  previewModelType: string,
  defaultDimensionsMm: SizeMm,
  basePrice: number,
  overrides: Partial<CatalogItem> = {},
): CatalogItem {
  return defineCatalogItem({
    id,
    sku,
    name,
    category,
    subcategory,
    previewModelType,
    defaultDimensionsMm,
    priceRule: {
      basePrice,
      pricePerWidthMm: 0,
      pricePerHeightMm: 0,
      pricePerArea: 0,
      materialMultiplier: 1,
      accessoryMultiplier: 1,
    },
    ...overrides,
  })
}

export const frameTemplateCatalog: CatalogItem[] = [
  item('flex-frame', 'WS-FRAME-FLEX', 'Flex Frame', 'frames', 'custom-frame', 'procedural-frame', size(1000, 2400, 580), 6500, { minDimensionsMm: size(10, 10, 100), maxDimensionsMm: size(2070, 2800, 1000), validationRules: ['frame-dimensions', 'installation-fit'], tags: ['custom', 'flexible'] }),
  item('slim-frame', 'WS-FRAME-SLIM', 'Slim Reach Frame', 'frames', 'frame-template', 'procedural-frame', size(500, 2200, 450), 7600, { tags: ['small-space', 'hanging'] }),
  item('tall-frame', 'WS-FRAME-TALL', 'Tall Gallery Frame', 'frames', 'frame-template', 'procedural-frame', size(800, 2700, 580), 11200, { tags: ['tall', 'display'] }),
  item('wide-frame', 'WS-FRAME-WIDE', 'Wide Studio Frame', 'frames', 'frame-template', 'procedural-frame', size(1500, 2400, 600), 14200, { tags: ['wide', 'mixed-storage'] }),
  item('shallow-frame', 'WS-FRAME-SHALLOW', 'Shallow Hall Frame', 'frames', 'frame-template', 'procedural-frame', size(900, 2100, 350), 8300, { compatibleFrameDepthsMm: [350], tags: ['shallow', 'hall'] }),
  item('drawer-frame', 'WS-FRAME-DRAW', 'Drawer Tower Frame', 'frames', 'frame-template', 'procedural-frame', size(800, 2200, 580), 12100, { tags: ['drawers', 'folded-storage'] }),
  item('double-hang-frame', 'WS-FRAME-DUAL', 'Dual Hang Frame', 'frames', 'frame-template', 'procedural-frame', size(1000, 2500, 580), 12800, { tags: ['double-hang', 'clothes'] }),
  item('utility-frame', 'WS-FRAME-UTILITY', 'Utility Storage Frame', 'frames', 'frame-template', 'procedural-frame', size(1200, 2300, 600), 13700, { tags: ['utility', 'boxes', 'laundry'] }),
]

export const shelfStorageCatalog: CatalogItem[] = [
  item('adjustable-shelf', 'WS-SHELF-ADJUST', 'Adjustable Plane Shelf', 'shelves', 'adjustable', 'procedural-shelf', size(964, 24, 540), 1800, { placementRules: ['opening-host', 'mounting-pitch'], tags: ['folded-clothes'] }),
  item('fixed-shelf', 'WS-SHELF-FIXED', 'Fixed Brace Shelf', 'shelves', 'fixed', 'procedural-shelf', size(964, 28, 540), 2300, { placementRules: ['opening-host', 'structural'], tags: ['structural'] }),
  item('glass-display-shelf', 'WS-SHELF-GLASS', 'Clear Display Shelf', 'shelves', 'display', 'glass-shelf', size(964, 8, 500), 3200, { compatibleFrameDepthsMm: [450, 580, 600], tags: ['display', 'lighting'] }),
  item('compact-shelf', 'WS-SHELF-COMPACT', 'Compact Cubby Shelf', 'shelves', 'compact', 'procedural-shelf', size(464, 22, 330), 1400, { tags: ['compact', 'boxes'] }),
  item('oval-rail', 'WS-RAIL-OVAL', 'Oval Wardrobe Rail', 'rails', 'clothes-rail', 'procedural-rail', size(964, 30, 30), 1600, { placementRules: ['opening-host', 'hanging-clearance'], tags: ['shirts', 'coats'] }),
  item('trouser-glide', 'WS-RAIL-TROUSER', 'Glide Trouser Rail', 'rails', 'pull-out-rail', 'procedural-trouser-rail', size(700, 90, 480), 5700, { compatibleFrameDepthsMm: [450, 580, 600], validationRules: ['operational-clearance'], tags: ['trousers'] }),
  item('flat-shoe-deck', 'WS-SHOE-FLAT', 'Flat Shoe Deck', 'shoe-storage', 'flat', 'procedural-shoe-shelf', size(800, 50, 330), 2500, { tags: ['shoes'] }),
  item('angled-shoe-deck', 'WS-SHOE-ANGLE', 'Angled Shoe Deck', 'shoe-storage', 'angled', 'procedural-shoe-shelf', size(800, 90, 350), 3200, { placementRules: ['opening-host', 'front-clearance'], tags: ['shoes', 'angled'] }),
  item('vertical-bay-divider', 'WS-DIVIDER-BAY', 'Vertical Bay Divider', 'dividers', 'vertical', 'procedural-divider', size(18, 2000, 540), 3600, { placementRules: ['opening-split'], validationRules: ['opening-topology'], tags: ['split', 'structure'] }),
  item('soft-box-organizer', 'WS-BOX-SOFT', 'Soft Storage Box', 'boxes-organizers', 'box', 'soft-box', size(320, 260, 420), 1500, { placementRules: ['shelf-or-floor-host'], renderHints: { geometryRecipe: 'soft-box', materialSlots: ['fabric'], castShadow: true, receiveShadow: true, levelOfDetail: 'standard', decorativeOnly: false }, tags: ['box', 'organizer'] }),
]

export const drawerBasketTrayCatalog: CatalogItem[] = [
  item('soft-drawer', 'WS-DRAWER-SOFT', 'Soft-Close Drawer', 'drawers', 'standard', 'procedural-drawer', size(964, 180, 500), 6200, { compatibleFrameDepthsMm: [450, 580, 600], validationRules: ['runner-depth', 'operational-clearance'] }),
  item('deep-drawer', 'WS-DRAWER-DEEP', 'Deep Fold Drawer', 'drawers', 'deep', 'procedural-drawer', size(964, 280, 520), 7900, { compatibleFrameDepthsMm: [580, 600], validationRules: ['runner-depth', 'operational-clearance'] }),
  item('shallow-drawer', 'WS-DRAWER-SHALLOW', 'Shallow Accessory Drawer', 'drawers', 'shallow', 'procedural-drawer', size(964, 120, 480), 5400, { compatibleFrameDepthsMm: [450, 580, 600] }),
  item('air-basket', 'WS-BASKET-AIR', 'Airflow Mesh Basket', 'baskets', 'mesh', 'procedural-basket', size(964, 180, 500), 3900, { compatibleFrameDepthsMm: [450, 580, 600], tags: ['ventilated'] }),
  item('wire-basket', 'WS-BASKET-WIRE', 'Fine Wire Basket', 'baskets', 'wire', 'procedural-basket', size(764, 220, 500), 4200, { compatibleFrameDepthsMm: [450, 580, 600] }),
  item('laundry-basket', 'WS-BASKET-LAUNDRY', 'Tall Laundry Basket', 'baskets', 'laundry', 'procedural-basket', size(700, 520, 500), 8200, { compatibleFrameDepthsMm: [580, 600], validationRules: ['runner-depth', 'operational-clearance'] }),
  item('glide-tray', 'WS-TRAY-GLIDE', 'Glide Accessory Tray', 'trays', 'pull-out', 'procedural-tray', size(764, 80, 500), 5100, { compatibleFrameDepthsMm: [450, 580, 600], validationRules: ['operational-clearance'] }),
  item('velvet-tray', 'WS-TRAY-VELVET', 'Velvet Detail Tray', 'trays', 'accessory', 'procedural-tray', size(764, 70, 450), 4600, { compatibleFrameDepthsMm: [450, 580, 600], tags: ['jewelry', 'belts'] }),
]

export const professionalDoorCatalog: CatalogItem[] = [
  item('plain-hinged-door', 'WS-DOOR-PLAIN', 'Plain Hinged Front', 'doors', 'hinged', 'procedural-door', size(500, 2400, 22), 8700, { compatibleDoorTypes: ['hinged'], validationRules: ['hinge-zone', 'swing-clearance'] }),
  item('line-hinged-door', 'WS-DOOR-LINE', 'Line-Relief Front', 'doors', 'hinged', 'procedural-door', size(500, 2400, 22), 10400, { compatibleDoorTypes: ['hinged'] }),
  item('framed-door', 'WS-DOOR-FRAME', 'Craft Framed Front', 'doors', 'framed', 'procedural-framed-door', size(500, 2400, 24), 12400, { compatibleDoorTypes: ['framed'] }),
  item('mirror-door', 'WS-DOOR-MIRROR', 'Clear Mirror Front', 'doors', 'mirror', 'procedural-mirror-door', size(500, 2400, 24), 14900, { compatibleDoorTypes: ['mirror'] }),
  item('veil-glass-door', 'WS-DOOR-VEIL', 'Veil Glass Front', 'doors', 'glass', 'procedural-glass-door', size(500, 2400, 24), 13200, { compatibleDoorTypes: ['glass'] }),
  item('glide-door', 'WS-DOOR-GLIDE', 'Glide Sliding Front', 'doors', 'sliding', 'procedural-sliding-door', size(1000, 2400, 30), 17800, { compatibleDoorTypes: ['sliding'], validationRules: ['track-span', 'sliding-overlap'] }),
  item('double-glide-door', 'WS-DOOR-GLIDE-PAIR', 'Paired Glide Front', 'doors', 'double-sliding', 'procedural-sliding-door', size(1600, 2400, 32), 29400, { compatibleDoorTypes: ['double-sliding'], validationRules: ['track-span', 'sliding-overlap'] }),
  item('louvered-door', 'WS-DOOR-LOUVER', 'Airline Louvered Front', 'doors', 'louvered', 'procedural-louvered-door', size(500, 2400, 24), 13600, { compatibleDoorTypes: ['louvered'], tags: ['ventilated'] }),
]

export const hardwareCatalog: CatalogItem[] = [
  item('linea-handle', 'WS-HANDLE-LINEA', 'Linea Bar Pull', 'handles-knobs', 'bar-pull', 'bar-handle', size(192, 16, 28), 1900, { compatibleDoorTypes: ['hinged', 'flat', 'framed'] }),
  item('arc-handle', 'WS-HANDLE-ARC', 'Arc Bridge Pull', 'handles-knobs', 'handle', 'arc-handle', size(160, 24, 32), 2100, { compatibleDoorTypes: ['hinged', 'framed'] }),
  item('edge-handle', 'WS-HANDLE-EDGE', 'Edge Profile Pull', 'handles-knobs', 'edge-pull', 'edge-handle', size(220, 18, 22), 2400, { compatibleDoorTypes: ['hinged', 'sliding', 'flat'] }),
  item('longline-handle', 'WS-HANDLE-LONG', 'Longline Rail Pull', 'handles-knobs', 'bar-pull', 'bar-handle', size(600, 20, 24), 3600, { compatibleDoorTypes: ['hinged', 'sliding'] }),
  item('recess-handle', 'WS-HANDLE-RECESS', 'Recessed Pocket Pull', 'handles-knobs', 'recessed-pull', 'recessed-handle', size(120, 42, 14), 2800, { compatibleDoorTypes: ['sliding', 'flat'] }),
  item('round-knob', 'WS-KNOB-ROUND', 'Round Pebble Knob', 'handles-knobs', 'knob', 'round-knob', size(36, 36, 30), 1200, { compatibleDoorTypes: ['hinged', 'flat', 'framed'] }),
  item('square-knob', 'WS-KNOB-SQUARE', 'Square Studio Knob', 'handles-knobs', 'knob', 'square-knob', size(34, 34, 28), 1300, { compatibleDoorTypes: ['hinged', 'flat'] }),
  item('wood-knob', 'WS-KNOB-WOOD', 'Timber Dot Knob', 'handles-knobs', 'knob', 'round-knob', size(40, 40, 32), 1500, { compatibleDoorTypes: ['hinged', 'framed'] }),
  item('loop-handle', 'WS-HANDLE-LOOP', 'Soft Loop Pull', 'handles-knobs', 'handle', 'loop-handle', size(128, 24, 30), 1700, { compatibleDoorTypes: ['hinged', 'framed'] }),
  item('flush-handle', 'WS-HANDLE-FLUSH', 'Flush Tab Pull', 'handles-knobs', 'edge-pull', 'edge-handle', size(80, 18, 18), 1600, { compatibleDoorTypes: ['hinged', 'sliding', 'glass'] }),
]

export const contentObjectCatalog: CatalogItem[] = [
  item('shirts-content', 'WS-CONTENT-SHIRTS', 'Shirt Hanger Group', 'clothes-display', 'shirts', 'content-shirts', size(420, 760, 450), 0, { renderHints: { geometryRecipe: 'content-shirts', materialSlots: ['fabric'], castShadow: true, receiveShadow: false, levelOfDetail: 'standard', decorativeOnly: true } }),
  item('coat-content', 'WS-CONTENT-COAT', 'Long Coat Group', 'clothes-display', 'coats', 'content-coats', size(500, 1250, 480), 0),
  item('trouser-content', 'WS-CONTENT-TROUSERS', 'Hanging Trousers', 'clothes-display', 'trousers', 'content-trousers', size(420, 760, 420), 0),
  item('shoe-content', 'WS-CONTENT-SHOES', 'Shoe Pair', 'clothes-display', 'shoes', 'content-shoes', size(280, 150, 340), 0),
  item('handbag-content', 'WS-CONTENT-HANDBAG', 'Display Handbag', 'clothes-display', 'bags', 'content-handbag', size(320, 280, 180), 0),
  item('folded-content', 'WS-CONTENT-FOLDED', 'Folded Clothes Stack', 'clothes-display', 'folded', 'content-folded', size(340, 220, 320), 0),
  item('jewelry-content', 'WS-CONTENT-JEWELRY', 'Jewelry Tray Set', 'clothes-display', 'jewelry', 'content-jewelry', size(420, 30, 300), 0),
  item('belt-content', 'WS-CONTENT-BELTS', 'Belt Display', 'clothes-display', 'belts', 'content-belts', size(340, 80, 260), 0),
  item('towel-content', 'WS-CONTENT-TOWELS', 'Towel Stack', 'clothes-display', 'towels', 'content-towels', size(380, 300, 360), 0),
  item('hanger-content', 'WS-CONTENT-HANGERS', 'Empty Hanger Group', 'clothes-display', 'hangers', 'content-hangers', size(500, 420, 80), 0),
].map((catalogItem) => ({ ...catalogItem, renderHints: { ...catalogItem.renderHints, decorativeOnly: true } }))

export const lightingAccessoryCatalog: CatalogItem[] = [
  item('sense-light', 'WS-LIGHT-SENSE', 'Sense LED Bar', 'lighting', 'sensor-light', 'procedural-light', size(800, 18, 32), 3400, { validationRules: ['power-budget', 'top-zone'] }),
  item('line-light', 'WS-LIGHT-LINE', 'Linear Shelf Light', 'lighting', 'shelf-light', 'procedural-light', size(600, 12, 18), 2800, { validationRules: ['power-budget'] }),
  item('spot-light', 'WS-LIGHT-SPOT', 'Recessed Display Spot', 'lighting', 'spot', 'procedural-spot', size(70, 18, 70), 1900, { validationRules: ['power-budget'] }),
  item('corner-light', 'WS-LIGHT-CORNER', 'Corner Wash Light', 'lighting', 'corner', 'procedural-light', size(900, 14, 14), 3100, { validationRules: ['power-budget'] }),
  item('door-sensor', 'WS-LIGHT-SENSOR', 'Door Motion Sensor', 'lighting', 'sensor', 'sensor', size(60, 24, 35), 2200, { validationRules: ['power-budget', 'door-pairing'] }),
  item('light-driver', 'WS-LIGHT-DRIVER', 'Compact Light Driver', 'lighting', 'driver', 'driver', size(180, 34, 60), 4200, { validationRules: ['driver-capacity'] }),
]

export const wardrobePresetCatalog: CatalogItem[] = [
  item('preset-reach-in', 'WS-PRESET-REACH', 'Reach-In Essential', 'preset-layouts', 'complete-layout', 'preset-layout', size(1800, 2400, 580), 27800, { tags: ['hanging', 'shelves'] }),
  item('preset-double-hang', 'WS-PRESET-DUAL', 'Double Hang Wardrobe', 'preset-layouts', 'complete-layout', 'preset-layout', size(2000, 2500, 580), 34200, { tags: ['double-hang'] }),
  item('preset-drawer-wall', 'WS-PRESET-DRAWER', 'Drawer and Fold Wall', 'preset-layouts', 'complete-layout', 'preset-layout', size(2400, 2400, 580), 48600, { tags: ['drawers', 'folded'] }),
  item('preset-shoe-gallery', 'WS-PRESET-SHOE', 'Shoe Gallery', 'preset-layouts', 'complete-layout', 'preset-layout', size(1600, 2200, 450), 31600, { tags: ['shoes', 'display'] }),
  item('preset-couple', 'WS-PRESET-PAIR', 'Shared Pair Wardrobe', 'preset-layouts', 'complete-layout', 'preset-layout', size(3000, 2500, 600), 59800, { tags: ['shared', 'mixed'] }),
  item('preset-entry', 'WS-PRESET-ENTRY', 'Entry Storage Studio', 'preset-layouts', 'complete-layout', 'preset-layout', size(1800, 2200, 450), 35400, { tags: ['entry', 'shallow'] }),
  item('preset-accessory', 'WS-PRESET-DETAIL', 'Accessory Collection', 'preset-layouts', 'complete-layout', 'preset-layout', size(1400, 2200, 580), 38200, { tags: ['trays', 'jewelry'] }),
  item('preset-utility', 'WS-PRESET-UTILITY', 'Utility and Laundry Store', 'preset-layouts', 'complete-layout', 'preset-layout', size(2400, 2300, 600), 51200, { tags: ['utility', 'laundry', 'boxes'] }),
]

export const configuratorCatalog: CatalogItem[] = [
  ...frameTemplateCatalog,
  ...shelfStorageCatalog,
  ...drawerBasketTrayCatalog,
  ...professionalDoorCatalog,
  ...hardwareCatalog,
  ...contentObjectCatalog,
  ...lightingAccessoryCatalog,
  ...wardrobePresetCatalog,
]

export const getConfiguratorCatalogItem = (id: string): CatalogItem | undefined =>
  configuratorCatalog.find((catalogItem) => catalogItem.id === id)
