import type {
  Design,
  Door,
  DoorType,
  Frame,
  FurnitureComponent,
  FurnitureComponentType,
  LanguageCode,
} from './design'

const createId = (prefix: string): string => {
  const suffix = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
  return `${prefix}-${suffix}`
}

const componentNames: Record<FurnitureComponentType, string> = {
  shelf: 'Shelf',
  'clothes-rail': 'Clothes rail',
  drawer: 'Drawer',
  'deep-drawer': 'Deep drawer',
  'wire-basket': 'Wire basket',
  'shoe-shelf': 'Shoe shelf',
  'angled-shoe-shelf': 'Angled shoe shelf',
  'vertical-divider': 'Vertical divider',
  'pull-out-tray': 'Pull-out tray',
  'accessory-tray': 'Accessory tray',
  'small-organizer': 'Small organizer',
  'trouser-rail': 'Trouser rail',
  'laundry-basket': 'Laundry basket',
  'led-light-strip': 'LED light strip',
  'sensor-light': 'Sensor light',
  'top-cover-panel': 'Top cover panel',
  'side-cover-panel': 'Side cover panel',
  'plinth-base': 'Plinth/base',
  handle: 'Handle',
  knob: 'Knob',
}

export function createDesign(language: LanguageCode = 'en'): Design {
  const now = new Date().toISOString()

  return {
    id: createId('design'),
    name: 'Untitled furniture design',
    createdAt: now,
    updatedAt: now,
    language,
    installationSpace: {
      widthMm: 3000,
      heightMm: 2600,
      depthMm: 650,
      leftClearanceMm: 20,
      rightClearanceMm: 20,
      topClearanceMm: 30,
    },
    frames: [],
    selectedItem: null,
    viewSettings: {
      showMeasurements: true,
      showDoors: true,
      showIssues: true,
      zoomPercent: 100,
    },
  }
}

export function createFrame(
  overrides: Partial<Omit<Frame, 'components' | 'doors'>> &
    Pick<Frame, 'orderIndex'> & {
      components?: FurnitureComponent[]
      doors?: Door[]
    },
): Frame {
  return {
    id: createId('frame'),
    name: `Frame ${overrides.orderIndex + 1}`,
    widthMm: 1000,
    heightMm: 2360,
    depthMm: 580,
    materialId: 'studio-white',
    finishId: 'matte',
    components: [],
    doors: [],
    showDoors: true,
    backPanelEnabled: true,
    plinthEnabled: true,
    ...overrides,
  }
}

export function createComponent(
  type: FurnitureComponentType,
  frame: Frame,
  overrides: Partial<FurnitureComponent> = {},
): FurnitureComponent {
  const defaults: Partial<Record<FurnitureComponentType, Partial<FurnitureComponent>>> = {
    shelf: { heightMm: 24 },
    'clothes-rail': { heightMm: 30, depthMm: 30 },
    drawer: { heightMm: 180, depthMm: Math.min(500, frame.depthMm - 20) },
    'deep-drawer': { heightMm: 280, depthMm: Math.min(520, frame.depthMm - 20) },
    'wire-basket': { heightMm: 180, depthMm: Math.min(500, frame.depthMm - 20), materialId: 'graphite-wire' },
    'laundry-basket': { heightMm: 520, depthMm: Math.min(500, frame.depthMm - 20), materialId: 'graphite-wire' },
    'shoe-shelf': { heightMm: 60, depthMm: Math.min(330, frame.depthMm - 20) },
    'angled-shoe-shelf': { heightMm: 90, depthMm: Math.min(350, frame.depthMm - 20) },
    'vertical-divider': { widthMm: 18, heightMm: Math.max(24, frame.heightMm - 36), yMm: 18 },
    'pull-out-tray': { heightMm: 80, depthMm: Math.min(500, frame.depthMm - 20) },
    'accessory-tray': { heightMm: 70, depthMm: Math.min(450, frame.depthMm - 20) },
    'small-organizer': { heightMm: 100, depthMm: Math.min(380, frame.depthMm - 20) },
    'trouser-rail': { heightMm: 90, depthMm: Math.min(480, frame.depthMm - 20) },
    'led-light-strip': { heightMm: 12, depthMm: 18, yMm: Math.max(18, frame.heightMm - 54) },
    'sensor-light': { widthMm: 80, heightMm: 24, depthMm: 35, yMm: Math.max(18, frame.heightMm - 70) },
    'top-cover-panel': { heightMm: 18, yMm: Math.max(18, frame.heightMm - 36) },
    'side-cover-panel': { widthMm: 18, heightMm: Math.max(24, frame.heightMm - 36), yMm: 18 },
    'plinth-base': { heightMm: 80, yMm: 18 },
    handle: { widthMm: 192, heightMm: 16, depthMm: 28, materialId: 'brushed-alloy' },
    knob: { widthMm: 34, heightMm: 34, depthMm: 28, materialId: 'brushed-alloy' },
  }
  const typeDefaults = defaults[type] ?? { heightMm: 24 }

  return {
    id: createId('component'),
    type,
    name: componentNames[type],
    widthMm: Math.max(10, frame.widthMm - 36),
    heightMm: 24,
    depthMm: Math.max(10, frame.depthMm - 20),
    xMm: 18,
    yMm: 100,
    materialId: frame.materialId,
    options: {},
    ...typeDefaults,
    ...overrides,
  }
}

export function createDoor(type: DoorType, frame: Frame, overrides: Partial<Door> = {}): Door {
  return {
    id: createId('door'),
    type,
    materialId: type === 'mirror' ? 'reflective-silver' : frame.materialId,
    finishId: type === 'mirror' ? 'mirror' : frame.finishId,
    handleId: type === 'open' ? null : 'slim-bar-handle',
    mirror: type === 'mirror',
    glass: type === 'glass-look',
    softClose: type !== 'open',
    handlePosition: 'right',
    widthMm: frame.widthMm,
    heightMm: frame.heightMm,
    ...overrides,
  }
}
