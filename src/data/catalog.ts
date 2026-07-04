import type { CatalogItem, Material } from '../models/design'

const COMMON_DEPTHS = [350, 450, 580, 600]

export const materials: Material[] = [
  { id: 'studio-white', name: 'Studio White', finishType: 'matte', color: '#f3f0e8', texture: 'solid', priceMultiplier: 1 },
  { id: 'warm-oak', name: 'Warm Oak', finishType: 'wood-medium', color: '#b88a56', texture: 'oak-grain', priceMultiplier: 1.18 },
  { id: 'natural-birch', name: 'Natural Birch', finishType: 'wood-light', color: '#d8bd8b', texture: 'birch-grain', priceMultiplier: 1.14 },
  { id: 'smoked-walnut', name: 'Smoked Walnut', finishType: 'wood-dark', color: '#584234', texture: 'walnut-grain', priceMultiplier: 1.32 },
  { id: 'soft-grey', name: 'Soft Grey', finishType: 'satin', color: '#cbc9c1', texture: 'solid', priceMultiplier: 1.06 },
  { id: 'graphite-matte', name: 'Graphite Matte', finishType: 'matte', color: '#3d423f', texture: 'solid', priceMultiplier: 1.12 },
  { id: 'sand-beige', name: 'Sand Beige', finishType: 'satin', color: '#c8b698', texture: 'solid', priceMultiplier: 1.08 },
  { id: 'linen-beige', name: 'Linen Beige', finishType: 'matte', color: '#d8ccba', texture: 'linen', priceMultiplier: 1.1 },
  { id: 'deep-forest', name: 'Deep Forest', finishType: 'matte', color: '#29453a', texture: 'solid', priceMultiplier: 1.16 },
  { id: 'custom-neutral', name: 'Custom Neutral', finishType: 'satin', color: '#aaa397', texture: 'solid', priceMultiplier: 1.25 },
  { id: 'reflective-silver', name: 'Reflective Silver', finishType: 'mirror', color: '#c8d1d0', texture: 'mirror', priceMultiplier: 1.45 },
  { id: 'clear-veil-glass', name: 'Clear Veil Glass', finishType: 'glass', color: '#dbe7e3', texture: 'glass', priceMultiplier: 1.38 },
  { id: 'brushed-alloy', name: 'Brushed Alloy', finishType: 'metal', color: '#9b9d99', texture: 'brushed-metal', priceMultiplier: 1.2 },
  { id: 'graphite-wire', name: 'Graphite Wire', finishType: 'wire', color: '#4c514e', texture: 'wire', priceMultiplier: 1.1 },
]

export const boardMaterials = materials.filter((material) =>
  !['mirror', 'glass', 'metal', 'wire'].includes(material.finishType),
)

export const framePresets: CatalogItem[] = [
  {
    id: 'frame-custom', sku: 'WS-FRAME-CUSTOM', name: 'Empty custom frame', type: 'frame', category: 'frames',
    dimensions: { widthMm: 1000, heightMm: 2400, depthMm: 580 }, compatibleDepths: COMMON_DEPTHS,
    minWidthMm: 10, maxWidthMm: 2070, minHeightMm: 10, maxHeightMm: 2800, price: 6500,
    rules: { preset: 'empty' },
  },
  {
    id: 'frame-compact-hanging', sku: 'WS-FRAME-HANG-COMPACT', name: 'Compact hanging frame', type: 'frame', category: 'frames',
    dimensions: { widthMm: 800, heightMm: 2200, depthMm: 580 }, compatibleDepths: [580, 600],
    minWidthMm: 500, maxWidthMm: 1200, minHeightMm: 1600, maxHeightMm: 2800, price: 11900,
    rules: { preset: 'hanging', includes: ['clothes-rail', 'shelf'] },
  },
  {
    id: 'frame-shelf-storage', sku: 'WS-FRAME-SHELF', name: 'Shelf storage frame', type: 'frame', category: 'frames',
    dimensions: { widthMm: 900, heightMm: 2200, depthMm: 450 }, compatibleDepths: COMMON_DEPTHS,
    minWidthMm: 350, maxWidthMm: 1400, minHeightMm: 800, maxHeightMm: 2800, price: 13200,
    rules: { preset: 'shelves', includes: ['shelf'] },
  },
  {
    id: 'frame-drawer-storage', sku: 'WS-FRAME-DRAWER', name: 'Drawer storage frame', type: 'frame', category: 'frames',
    dimensions: { widthMm: 1000, heightMm: 2200, depthMm: 580 }, compatibleDepths: [450, 580, 600],
    minWidthMm: 450, maxWidthMm: 1400, minHeightMm: 800, maxHeightMm: 2800, price: 17800,
    rules: { preset: 'drawers', includes: ['drawer', 'deep-drawer'] },
  },
  {
    id: 'frame-mixed-wardrobe', sku: 'WS-FRAME-MIXED', name: 'Mixed wardrobe frame', type: 'frame', category: 'frames',
    dimensions: { widthMm: 1200, heightMm: 2400, depthMm: 580 }, compatibleDepths: [580, 600],
    minWidthMm: 700, maxWidthMm: 1800, minHeightMm: 1600, maxHeightMm: 2800, price: 21400,
    rules: { preset: 'mixed', includes: ['vertical-divider', 'clothes-rail', 'shelf', 'drawer'] },
  },
  {
    id: 'frame-shoe-storage', sku: 'WS-FRAME-SHOE', name: 'Shoe storage frame', type: 'frame', category: 'frames',
    dimensions: { widthMm: 800, heightMm: 2000, depthMm: 350 }, compatibleDepths: [350, 450],
    minWidthMm: 350, maxWidthMm: 1200, minHeightMm: 800, maxHeightMm: 2600, price: 14600,
    rules: { preset: 'shoes', includes: ['shoe-shelf'] },
  },
  {
    id: 'frame-accessory', sku: 'WS-FRAME-ACCESSORY', name: 'Accessory frame', type: 'frame', category: 'frames',
    dimensions: { widthMm: 700, heightMm: 1800, depthMm: 450 }, compatibleDepths: [450, 580, 600],
    minWidthMm: 400, maxWidthMm: 1200, minHeightMm: 800, maxHeightMm: 2600, price: 16400,
    rules: { preset: 'accessories', includes: ['accessory-tray', 'pull-out-tray', 'trouser-rail'] },
  },
]

export const componentCatalog: CatalogItem[] = [
  { id: 'shelf-standard', sku: 'WS-SHELF-STD', name: 'Shelf', type: 'shelf', category: 'interiors', dimensions: { heightMm: 24, depthMm: 550 }, compatibleDepths: COMMON_DEPTHS, minWidthMm: 200, maxWidthMm: 2070, minHeightMm: 24, maxHeightMm: 40, price: 1800, rules: { supportsCustomWidth: true } },
  { id: 'clothes-rail', sku: 'WS-RAIL-CLOTHES', name: 'Clothes rail', type: 'clothes-rail', category: 'interiors', dimensions: { heightMm: 30, depthMm: 30 }, compatibleDepths: [450, 580, 600], minWidthMm: 350, maxWidthMm: 1800, minHeightMm: 20, maxHeightMm: 50, price: 1600, rules: { hangingClearanceMm: 900 } },
  { id: 'drawer-standard', sku: 'WS-DRAWER-STD', name: 'Drawer', type: 'drawer', category: 'interiors', dimensions: { heightMm: 180, depthMm: 500 }, compatibleDepths: [450, 580, 600], minWidthMm: 350, maxWidthMm: 1200, minHeightMm: 140, maxHeightMm: 240, price: 6200, rules: { minimumDepthMm: 450 } },
  { id: 'drawer-deep', sku: 'WS-DRAWER-DEEP', name: 'Deep drawer', type: 'deep-drawer', category: 'interiors', dimensions: { heightMm: 280, depthMm: 520 }, compatibleDepths: [580, 600], minWidthMm: 450, maxWidthMm: 1200, minHeightMm: 240, maxHeightMm: 360, price: 7900, rules: { minimumDepthMm: 550 } },
  { id: 'basket-wire', sku: 'WS-BASKET-WIRE', name: 'Wire basket', type: 'wire-basket', category: 'interiors', dimensions: { heightMm: 180, depthMm: 500 }, compatibleDepths: [450, 580, 600], minWidthMm: 350, maxWidthMm: 1200, minHeightMm: 140, maxHeightMm: 260, price: 3900, rules: { minimumDepthMm: 430 } },
  { id: 'shelf-shoe', sku: 'WS-SHELF-SHOE', name: 'Shoe shelf', type: 'shoe-shelf', category: 'interiors', dimensions: { heightMm: 60, depthMm: 330 }, compatibleDepths: COMMON_DEPTHS, minWidthMm: 300, maxWidthMm: 1400, minHeightMm: 40, maxHeightMm: 120, price: 2700, rules: { angled: true } },
  { id: 'shelf-shoe-angled', sku: 'WS-SHELF-SHOE-ANGLE', name: 'Angled shoe shelf', type: 'angled-shoe-shelf', category: 'interiors', dimensions: { heightMm: 90, depthMm: 350 }, compatibleDepths: COMMON_DEPTHS, minWidthMm: 300, maxWidthMm: 1400, minHeightMm: 60, maxHeightMm: 140, price: 3200, rules: { angled: true, minimumDepthMm: 350 } },
  { id: 'divider-vertical', sku: 'WS-DIVIDER-VERT', name: 'Vertical divider', type: 'vertical-divider', category: 'interiors', dimensions: { widthMm: 24, depthMm: 550 }, compatibleDepths: COMMON_DEPTHS, minWidthMm: 18, maxWidthMm: 40, minHeightMm: 300, maxHeightMm: 2800, price: 3600, rules: { supportsCustomHeight: true } },
  { id: 'tray-pull-out', sku: 'WS-TRAY-PULLOUT', name: 'Pull-out tray', type: 'pull-out-tray', category: 'accessories', dimensions: { heightMm: 80, depthMm: 500 }, compatibleDepths: [450, 580, 600], minWidthMm: 350, maxWidthMm: 1200, minHeightMm: 60, maxHeightMm: 140, price: 5100, rules: { minimumDepthMm: 450 } },
  { id: 'tray-accessory', sku: 'WS-TRAY-ACCESSORY', name: 'Accessory tray', type: 'accessory-tray', category: 'accessories', dimensions: { heightMm: 70, depthMm: 450 }, compatibleDepths: [450, 580, 600], minWidthMm: 350, maxWidthMm: 1200, minHeightMm: 50, maxHeightMm: 120, price: 4600, rules: { minimumDepthMm: 450 } },
  { id: 'organizer-small', sku: 'WS-ORGANIZER-SMALL', name: 'Small organizer', type: 'small-organizer', category: 'accessories', dimensions: { heightMm: 100, depthMm: 380 }, compatibleDepths: [450, 580, 600], minWidthMm: 250, maxWidthMm: 1000, minHeightMm: 70, maxHeightMm: 160, price: 2800, rules: { minimumDepthMm: 400 } },
  { id: 'rail-trouser', sku: 'WS-RAIL-TROUSER', name: 'Trouser rail', type: 'trouser-rail', category: 'accessories', dimensions: { heightMm: 90, depthMm: 480 }, compatibleDepths: [450, 580, 600], minWidthMm: 400, maxWidthMm: 1200, minHeightMm: 70, maxHeightMm: 140, price: 5700, rules: { minimumDepthMm: 450 } },
  { id: 'basket-laundry', sku: 'WS-BASKET-LAUNDRY', name: 'Laundry basket', type: 'laundry-basket', category: 'accessories', dimensions: { heightMm: 520, depthMm: 500 }, compatibleDepths: [580, 600], minWidthMm: 400, maxWidthMm: 1000, minHeightMm: 450, maxHeightMm: 650, price: 8200, rules: { minimumDepthMm: 550 } },
  { id: 'light-led-strip', sku: 'WS-LIGHT-LED', name: 'LED light strip', type: 'led-light-strip', category: 'lighting', dimensions: { heightMm: 12, depthMm: 18 }, compatibleDepths: COMMON_DEPTHS, minWidthMm: 200, maxWidthMm: 2070, minHeightMm: 8, maxHeightMm: 30, price: 3400, rules: { topZoneMm: 300 } },
  { id: 'light-sensor', sku: 'WS-LIGHT-SENSOR', name: 'Sensor light', type: 'sensor-light', category: 'lighting', dimensions: { widthMm: 80, heightMm: 24, depthMm: 35 }, compatibleDepths: COMMON_DEPTHS, minWidthMm: 40, maxWidthMm: 300, minHeightMm: 15, maxHeightMm: 60, price: 2900, rules: { topZoneMm: 400 } },
  { id: 'panel-top-cover', sku: 'WS-PANEL-TOP', name: 'Top cover panel', type: 'top-cover-panel', category: 'panels', dimensions: { heightMm: 18, depthMm: 600 }, compatibleDepths: COMMON_DEPTHS, minWidthMm: 200, maxWidthMm: 2070, minHeightMm: 12, maxHeightMm: 40, price: 4200, rules: { exterior: true } },
  { id: 'panel-side-cover', sku: 'WS-PANEL-SIDE', name: 'Side cover panel', type: 'side-cover-panel', category: 'panels', dimensions: { widthMm: 18, depthMm: 600 }, compatibleDepths: COMMON_DEPTHS, minWidthMm: 12, maxWidthMm: 40, minHeightMm: 300, maxHeightMm: 2800, price: 5600, rules: { exterior: true } },
  { id: 'plinth-base', sku: 'WS-PLINTH-BASE', name: 'Plinth/base', type: 'plinth-base', category: 'panels', dimensions: { heightMm: 80, depthMm: 550 }, compatibleDepths: COMMON_DEPTHS, minWidthMm: 200, maxWidthMm: 2070, minHeightMm: 40, maxHeightMm: 200, price: 3300, rules: { exterior: true } },
  { id: 'handle-component', sku: 'WS-HANDLE-GENERIC', name: 'Handle', type: 'handle', category: 'handles', dimensions: { widthMm: 192, heightMm: 16, depthMm: 28 }, compatibleDepths: COMMON_DEPTHS, minWidthMm: 60, maxWidthMm: 800, minHeightMm: 10, maxHeightMm: 60, price: 1900, rules: { doorHardware: true } },
  { id: 'knob-component', sku: 'WS-KNOB-GENERIC', name: 'Knob', type: 'knob', category: 'handles', dimensions: { widthMm: 34, heightMm: 34, depthMm: 28 }, compatibleDepths: COMMON_DEPTHS, minWidthMm: 20, maxWidthMm: 80, minHeightMm: 20, maxHeightMm: 80, price: 1200, rules: { doorHardware: true } },
]

export const doorCatalog: CatalogItem[] = [
  { id: 'door-open', sku: 'WS-DOOR-OPEN', name: 'Open wardrobe', type: 'open', category: 'doors', dimensions: {}, compatibleDepths: COMMON_DEPTHS, minWidthMm: 10, maxWidthMm: 2070, minHeightMm: 10, maxHeightMm: 2800, price: 0, rules: { requiresHandle: false } },
  { id: 'door-hinged', sku: 'WS-DOOR-HINGED', name: 'Hinged door', type: 'hinged', category: 'doors', dimensions: {}, compatibleDepths: COMMON_DEPTHS, minWidthMm: 300, maxWidthMm: 700, minHeightMm: 500, maxHeightMm: 2800, price: 8700, rules: { requiresHandle: true, minimumWidthMm: 300 } },
  { id: 'door-sliding', sku: 'WS-DOOR-SLIDING', name: 'Sliding door', type: 'sliding', category: 'doors', dimensions: {}, compatibleDepths: [580, 600], minWidthMm: 1000, maxWidthMm: 2070, minHeightMm: 1200, maxHeightMm: 2800, price: 17800, rules: { requiresHandle: false, minimumWidthMm: 1000 } },
  { id: 'door-double-sliding', sku: 'WS-DOOR-DOUBLE-SLIDING', name: 'Double sliding door', type: 'double-sliding', category: 'doors', dimensions: {}, compatibleDepths: [580, 600], minWidthMm: 1400, maxWidthMm: 2070, minHeightMm: 1200, maxHeightMm: 2800, price: 29400, rules: { requiresHandle: false, minimumWidthMm: 1400 } },
  { id: 'door-mirror', sku: 'WS-DOOR-MIRROR', name: 'Mirror door', type: 'mirror', category: 'doors', dimensions: {}, compatibleDepths: COMMON_DEPTHS, minWidthMm: 300, maxWidthMm: 1200, minHeightMm: 800, maxHeightMm: 2800, price: 14900, rules: { requiresHandle: true, finishType: 'mirror' } },
  { id: 'door-glass-look', sku: 'WS-DOOR-GLASS', name: 'Glass-look door', type: 'glass-look', category: 'doors', dimensions: {}, compatibleDepths: COMMON_DEPTHS, minWidthMm: 300, maxWidthMm: 1200, minHeightMm: 800, maxHeightMm: 2800, price: 13200, rules: { requiresHandle: true, finishType: 'glass' } },
  { id: 'door-flat-panel', sku: 'WS-DOOR-FLAT', name: 'Flat panel door', type: 'flat-panel', category: 'doors', dimensions: {}, compatibleDepths: COMMON_DEPTHS, minWidthMm: 300, maxWidthMm: 1200, minHeightMm: 500, maxHeightMm: 2800, price: 9600, rules: { requiresHandle: true } },
  { id: 'door-framed-panel', sku: 'WS-DOOR-FRAMED', name: 'Framed panel door', type: 'framed-panel', category: 'doors', dimensions: {}, compatibleDepths: COMMON_DEPTHS, minWidthMm: 350, maxWidthMm: 1200, minHeightMm: 700, maxHeightMm: 2800, price: 12400, rules: { requiresHandle: true } },
]

export const handleCatalog: CatalogItem[] = [
  { id: 'slim-bar-handle', sku: 'WS-HANDLE-SLIM', name: 'Slim Bar Handle', type: 'handle', category: 'handles', dimensions: { widthMm: 192, heightMm: 14, depthMm: 28 }, compatibleDepths: COMMON_DEPTHS, minWidthMm: 80, maxWidthMm: 600, minHeightMm: 10, maxHeightMm: 40, price: 1900, rules: { doorTypes: ['hinged', 'mirror', 'glass-look', 'flat-panel', 'framed-panel'] } },
  { id: 'round-soft-knob', sku: 'WS-HANDLE-ROUND', name: 'Round Soft Knob', type: 'knob', category: 'handles', dimensions: { widthMm: 36, heightMm: 36, depthMm: 30 }, compatibleDepths: COMMON_DEPTHS, minWidthMm: 20, maxWidthMm: 80, minHeightMm: 20, maxHeightMm: 80, price: 1200, rules: { doorTypes: ['hinged', 'mirror', 'flat-panel', 'framed-panel'] } },
  { id: 'edge-pull-handle', sku: 'WS-HANDLE-EDGE', name: 'Edge Pull Handle', type: 'handle', category: 'handles', dimensions: { widthMm: 220, heightMm: 18, depthMm: 22 }, compatibleDepths: COMMON_DEPTHS, minWidthMm: 100, maxWidthMm: 900, minHeightMm: 10, maxHeightMm: 50, price: 2400, rules: { doorTypes: ['hinged', 'sliding', 'double-sliding', 'flat-panel'] } },
  { id: 'minimal-rail-handle', sku: 'WS-HANDLE-RAIL', name: 'Minimal Rail Handle', type: 'handle', category: 'handles', dimensions: { widthMm: 600, heightMm: 20, depthMm: 24 }, compatibleDepths: COMMON_DEPTHS, minWidthMm: 300, maxWidthMm: 1800, minHeightMm: 10, maxHeightMm: 60, price: 3100, rules: { doorTypes: ['sliding', 'double-sliding', 'flat-panel'] } },
  { id: 'classic-pull-handle', sku: 'WS-HANDLE-CLASSIC', name: 'Classic Pull Handle', type: 'handle', category: 'handles', dimensions: { widthMm: 160, heightMm: 24, depthMm: 36 }, compatibleDepths: COMMON_DEPTHS, minWidthMm: 80, maxWidthMm: 500, minHeightMm: 15, maxHeightMm: 60, price: 2200, rules: { doorTypes: ['hinged', 'mirror', 'glass-look', 'framed-panel'] } },
]

export const catalogItems: CatalogItem[] = [
  ...framePresets,
  ...componentCatalog,
  ...doorCatalog,
  ...handleCatalog,
]

export const getMaterial = (materialId: string): Material | undefined =>
  materials.find((material) => material.id === materialId)

export const getCatalogItem = (itemId: string): CatalogItem | undefined =>
  catalogItems.find((item) => item.id === itemId)

export const getCatalogItemByType = (type: CatalogItem['type']): CatalogItem | undefined =>
  catalogItems.find((item) => item.type === type)

export const getHandle = (handleId: string): CatalogItem | undefined =>
  handleCatalog.find((handle) => handle.id === handleId)
