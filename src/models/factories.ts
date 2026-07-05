import { defaultCameraState, defaultRenderSettings } from './rendering'
import { calculateFurnitureBounds } from './geometry'
import type {
  ContentObject,
  ContentObjectType,
  Design,
  Door,
  DoorType,
  Frame,
  Furniture,
  FurnitureComponent,
  FurnitureComponentType,
  HandleOrKnob,
  HandleOrKnobType,
  LanguageCode,
  Panel,
  PanelType,
  PriceBreakdown,
} from './design'

export const createId = (prefix: string): string => {
  const suffix = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
  return `${prefix}-${suffix}`
}

const EMPTY_PRICE: PriceBreakdown = {
  frames: 0,
  doors: 0,
  components: 0,
  accessories: 0,
  lighting: 0,
  total: 0,
}

const componentNames: Record<FurnitureComponentType, string> = {
  shelf: 'Shelf',
  'adjustable-shelf': 'Adjustable shelf',
  'fixed-shelf': 'Fixed shelf',
  'glass-shelf': 'Glass shelf',
  'display-shelf': 'Display shelf',
  'clothes-rail': 'Clothes rail',
  drawer: 'Drawer',
  'deep-drawer': 'Deep drawer',
  'shallow-drawer': 'Shallow drawer',
  'mesh-basket': 'Mesh basket',
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

export function recalculateFurniture(furniture: Furniture): Furniture {
  const frames = [...furniture.frames].sort((a, b) => a.orderIndex - b.orderIndex)
  const bounds = calculateFurnitureBounds(frames)
  return {
    ...furniture,
    frames,
    totalWidthMm: bounds.size.width,
    maxHeightMm: bounds.size.height,
    maxDepthMm: bounds.size.depth,
    materialPalette: [...new Set([
      ...furniture.materialPalette,
      ...frames.map((frame) => frame.materialId),
      ...frames.flatMap((frame) => frame.components.map((component) => component.materialId)),
      ...frames.flatMap((frame) => frame.doors.map((door) => door.materialId)),
    ])],
  }
}

export function reflowFrameRun(frames: Frame[], startXMm = 0, gapMm = 0): Frame[] {
  let cursor = startXMm
  return [...frames]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((frame, orderIndex) => {
      const next = { ...frame, orderIndex, xMm: cursor }
      cursor += frame.widthMm + gapMm
      return next
    })
}

export function createDesign(language: LanguageCode = 'en'): Design {
  const now = new Date().toISOString()
  return {
    id: createId('design'),
    name: 'Untitled furniture design',
    createdAt: now,
    updatedAt: now,
    version: 2,
    language,
    installationSpace: {
      widthMm: 3000,
      heightMm: 2600,
      depthMm: 650,
      leftClearanceMm: 20,
      rightClearanceMm: 20,
      topClearanceMm: 30,
    },
    furniture: {
      frames: [],
      globalDoors: [],
      accessories: [],
      materialPalette: ['studio-white'],
      totalWidthMm: 0,
      maxHeightMm: 0,
      maxDepthMm: 0,
    },
    selectedObject: null,
    camera: defaultCameraState(),
    viewMode: 'fullFurniture',
    renderSettings: defaultRenderSettings(),
    validationResults: [],
    priceSummary: { ...EMPTY_PRICE },
  }
}

export function createFrame(
  overrides: Partial<Omit<Frame, 'components' | 'doors' | 'contents' | 'panels'>> &
    Pick<Frame, 'orderIndex'> & {
      components?: FurnitureComponent[]
      doors?: Door[]
      contents?: ContentObject[]
      panels?: Panel[]
    },
): Frame {
  const widthMm = overrides.widthMm ?? 1000
  const heightMm = overrides.heightMm ?? 2360
  const depthMm = overrides.depthMm ?? 580
  const boardThicknessMm = overrides.boardThicknessMm ?? 18
  const xMm = overrides.xMm ?? overrides.orderIndex * widthMm
  const base: Frame = {
    id: createId('frame'),
    name: `Frame ${overrides.orderIndex + 1}`,
    widthMm,
    heightMm,
    depthMm,
    xMm,
    yMm: 0,
    zMm: 0,
    materialId: 'studio-white',
    finishId: 'matte',
    boardThicknessMm,
    backPanelEnabled: true,
    plinthEnabled: true,
    feetEnabled: false,
    components: [],
    doors: [],
    contents: [],
    panels: [],
    validationState: 'unchecked',
    showDoors: true,
    ...overrides,
  }
  return {
    ...base,
    components: overrides.components ?? [],
    doors: (overrides.doors ?? []).map((door) => ({ ...door, frameId: base.id })),
    contents: overrides.contents ?? [],
    panels: overrides.panels ?? createFramePanels(base),
  }
}

export function synchronizeComponent(component: FurnitureComponent): FurnitureComponent {
  const positionMm = component.positionMm ?? { x: component.xMm, y: component.yMm, z: component.zMm }
  const sizeMm = component.sizeMm ?? { width: component.widthMm, height: component.heightMm, depth: component.depthMm }
  return {
    ...component,
    positionMm,
    sizeMm,
    xMm: positionMm.x,
    yMm: positionMm.y,
    zMm: positionMm.z,
    widthMm: sizeMm.width,
    heightMm: sizeMm.height,
    depthMm: sizeMm.depth,
  }
}

export function createComponent(
  type: FurnitureComponentType,
  frame: Frame,
  overrides: Partial<FurnitureComponent> = {},
): FurnitureComponent {
  const defaults: Partial<Record<FurnitureComponentType, Partial<FurnitureComponent>>> = {
    shelf: { heightMm: 24 },
    'adjustable-shelf': { heightMm: 24 },
    'fixed-shelf': { heightMm: 28 },
    'glass-shelf': { heightMm: 8, materialId: 'clear-veil-glass' },
    'display-shelf': { heightMm: 30 },
    'clothes-rail': { heightMm: 30, depthMm: 30 },
    drawer: { heightMm: 180, depthMm: Math.min(500, frame.depthMm - 20) },
    'shallow-drawer': { heightMm: 120, depthMm: Math.min(480, frame.depthMm - 20) },
    'deep-drawer': { heightMm: 280, depthMm: Math.min(520, frame.depthMm - 20) },
    'mesh-basket': { heightMm: 180, depthMm: Math.min(500, frame.depthMm - 20), materialId: 'graphite-wire' },
    'wire-basket': { heightMm: 180, depthMm: Math.min(500, frame.depthMm - 20), materialId: 'graphite-wire' },
    'laundry-basket': { heightMm: 520, depthMm: Math.min(500, frame.depthMm - 20), materialId: 'graphite-wire' },
    'shoe-shelf': { heightMm: 60, depthMm: Math.min(330, frame.depthMm - 20) },
    'angled-shoe-shelf': { heightMm: 90, depthMm: Math.min(350, frame.depthMm - 20) },
    'vertical-divider': { widthMm: frame.boardThicknessMm, heightMm: Math.max(24, frame.heightMm - frame.boardThicknessMm * 2), yMm: frame.boardThicknessMm },
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
  const baseFlat = {
    widthMm: Math.max(10, frame.widthMm - frame.boardThicknessMm * 2),
    heightMm: 24,
    depthMm: Math.max(10, frame.depthMm - 20),
    xMm: frame.boardThicknessMm,
    yMm: 100,
    zMm: frame.boardThicknessMm,
  }
  const typeDefaults = defaults[type] ?? {}
  const flat = { ...baseFlat, ...typeDefaults, ...overrides }
  const positionMm = overrides.positionMm ?? {
    x: flat.xMm,
    y: flat.yMm,
    z: flat.zMm,
  }
  const sizeMm = overrides.sizeMm ?? {
    width: flat.widthMm,
    height: flat.heightMm,
    depth: flat.depthMm,
  }
  return synchronizeComponent({
    id: createId('component'),
    type,
    name: componentNames[type],
    compatibleDepthsMm: [350, 450, 580, 600],
    materialId: frame.materialId,
    finishId: frame.finishId,
    handleId: null,
    options: {},
    locked: false,
    selected: false,
    ...flat,
    ...overrides,
    positionMm,
    sizeMm,
  } as FurnitureComponent)
}

export function createDoor(type: DoorType, frame: Frame, overrides: Partial<Door> = {}): Door {
  const mirror = type === 'mirror'
  const glass = type === 'glass' || type === 'glass-look'
  const trackRequired = type === 'sliding' || type === 'double-sliding'
  return {
    id: createId('door'),
    type,
    frameId: frame.id,
    xMm: 0,
    yMm: 0,
    zMm: frame.depthMm,
    widthMm: frame.widthMm,
    heightMm: frame.heightMm,
    thicknessMm: 22,
    materialId: mirror ? 'reflective-silver' : glass ? 'clear-veil-glass' : frame.materialId,
    finishId: mirror ? 'mirror' : glass ? 'glass' : frame.finishId,
    handleId: type === 'open' ? null : 'slim-bar-handle',
    knobId: null,
    hingeSide: trackRequired || type === 'open' ? 'none' : 'right',
    openAngleDeg: 0,
    isOpen: false,
    softClose: type !== 'open',
    trackRequired,
    selected: false,
    mirror,
    glass,
    handlePosition: 'right',
    ...overrides,
  }
}

export function createPanel(type: PanelType, frame: Frame, overrides: Partial<Panel> = {}): Panel {
  const isVertical = type === 'left-side' || type === 'right-side' || type === 'divider'
  const isBack = type === 'back'
  const size = isBack
    ? { width: frame.widthMm, height: frame.heightMm, depth: frame.boardThicknessMm }
    : isVertical
      ? { width: frame.boardThicknessMm, height: frame.heightMm, depth: frame.depthMm }
      : { width: frame.widthMm, height: frame.boardThicknessMm, depth: frame.depthMm }
  return {
    id: createId('panel'),
    type,
    leftSide: type === 'left-side',
    rightSide: type === 'right-side',
    top: type === 'top',
    bottom: type === 'bottom',
    back: isBack,
    divider: type === 'divider',
    shelf: type === 'shelf',
    position: { x: 0, y: 0, z: 0 },
    size,
    thicknessMm: frame.boardThicknessMm,
    materialId: frame.materialId,
    finishId: frame.finishId,
    ...overrides,
  }
}

export function createFramePanels(frame: Frame): Panel[] {
  return [
    createPanel('left-side', frame, { position: { x: 0, y: 0, z: 0 } }),
    createPanel('right-side', frame, { position: { x: frame.widthMm - frame.boardThicknessMm, y: 0, z: 0 } }),
    createPanel('top', frame, { position: { x: 0, y: frame.heightMm - frame.boardThicknessMm, z: 0 } }),
    createPanel('bottom', frame, { position: { x: 0, y: 0, z: 0 } }),
    ...(frame.backPanelEnabled ? [createPanel('back', frame, { position: { x: 0, y: 0, z: 0 } })] : []),
  ]
}

export function synchronizeFrameStructure(frame: Frame): Frame {
  const existingByType = new Map(frame.panels.map((panel) => [panel.type, panel]))
  const panels = createFramePanels(frame).map((panel) => ({
    ...panel,
    id: existingByType.get(panel.type)?.id ?? panel.id,
  }))
  return {
    ...frame,
    panels,
    doors: frame.doors.map((door) => ({
      ...door,
      frameId: frame.id,
      widthMm: frame.widthMm,
      heightMm: frame.heightMm,
      zMm: frame.depthMm,
    })),
  }
}

export function createHandleOrKnob(type: HandleOrKnobType, overrides: Partial<HandleOrKnob> = {}): HandleOrKnob {
  return {
    id: createId('hardware'),
    type,
    materialId: 'brushed-alloy',
    finishId: 'satin',
    position: { x: 0, y: 1000, z: 0 },
    rotation: { xMilliDeg: 0, yMilliDeg: 0, zMilliDeg: 0 },
    compatibleDoorTypes: ['hinged', 'mirror', 'glass-look', 'flat-panel', 'framed-panel'],
    ...overrides,
  }
}

export function createContentObject(type: ContentObjectType, overrides: Partial<ContentObject> = {}): ContentObject {
  return {
    id: createId('content'),
    type,
    positionMm: { x: 0, y: 0, z: 0 },
    sizeMm: { width: 300, height: 300, depth: 300 },
    colorVariant: 'neutral',
    density: 1,
    decorativeOnly: true,
    ...overrides,
  }
}
