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
    heightMm: 2400,
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
  const defaultHeight = type === 'drawer' ? 180 : type === 'deep-drawer' ? 280 : 24

  return {
    id: createId('component'),
    type,
    name: type,
    widthMm: Math.max(10, frame.widthMm - 36),
    heightMm: defaultHeight,
    depthMm: Math.max(10, frame.depthMm - 20),
    xMm: 18,
    yMm: 100,
    materialId: frame.materialId,
    options: {},
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
    widthMm: frame.widthMm,
    heightMm: frame.heightMm,
    ...overrides,
  }
}
