import type { Design, DoorType, FurnitureComponentType } from '../models/design'

export const PROJECT_SCHEMA_VERSION = 1
export const PROJECT_FILE_EXTENSION = '.furniture-studio.json'
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024

export interface ProjectEnvelopeV1 {
  schemaVersion: 1
  app: 'FurnitureStudioWeb'
  exportedAt: string
  design: Design
}

export type ImportResult =
  | { ok: true; design: Design }
  | { ok: false; errorKey: string }

const componentTypes = new Set<FurnitureComponentType>([
  'shelf', 'clothes-rail', 'drawer', 'deep-drawer', 'wire-basket', 'shoe-shelf', 'angled-shoe-shelf',
  'vertical-divider', 'pull-out-tray', 'accessory-tray', 'small-organizer', 'trouser-rail', 'laundry-basket',
  'led-light-strip', 'sensor-light', 'top-cover-panel', 'side-cover-panel', 'plinth-base', 'handle', 'knob',
])
const doorTypes = new Set<DoorType>(['open', 'hinged', 'sliding', 'double-sliding', 'mirror', 'glass-look', 'flat-panel', 'framed-panel'])
const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const isInteger = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value)
const isString = (value: unknown): value is string => typeof value === 'string' && value.length > 0

function isValidDesign(value: unknown): value is Design {
  if (!isObject(value) || !isString(value.id) || !isString(value.name) || !isString(value.createdAt) || !isString(value.updatedAt) || !Array.isArray(value.frames)) return false
  if (!['en', 'ro'].includes(String(value.language)) || !isObject(value.installationSpace) || !isObject(value.viewSettings)) return false
  if (typeof value.viewSettings.showMeasurements !== 'boolean' || typeof value.viewSettings.showDoors !== 'boolean' || typeof value.viewSettings.showIssues !== 'boolean' || !isInteger(value.viewSettings.zoomPercent)) return false
  if (value.selectedItem !== null) {
    if (!isObject(value.selectedItem) || !['frame', 'component', 'door'].includes(String(value.selectedItem.kind)) || !isString(value.selectedItem.id)) return false
  }
  const installation = value.installationSpace
  const installationKeys = ['widthMm', 'heightMm', 'depthMm', 'leftClearanceMm', 'rightClearanceMm', 'topClearanceMm']
  if (!installationKeys.every((key) => isInteger(installation[key]) && Number(installation[key]) >= 0)) return false

  const ids = new Set<string>()
  for (const frame of value.frames) {
    if (!isObject(frame)) return false
    const frameId = frame.id
    if (!isString(frameId) || ids.has(frameId) || !isString(frame.name)) return false
    ids.add(frameId)
    if (!['widthMm', 'heightMm', 'depthMm', 'orderIndex'].every((key) => isInteger(frame[key]))) return false
    if (!isString(frame.materialId) || !isString(frame.finishId) || !Array.isArray(frame.components) || !Array.isArray(frame.doors)) return false
    if (typeof frame.showDoors !== 'boolean' || typeof frame.backPanelEnabled !== 'boolean' || typeof frame.plinthEnabled !== 'boolean') return false
    for (const component of frame.components) {
      if (!isObject(component)) return false
      const componentId = component.id
      if (!isString(componentId) || ids.has(componentId) || !componentTypes.has(component.type as FurnitureComponentType)) return false
      ids.add(componentId)
      if (!['widthMm', 'heightMm', 'depthMm', 'xMm', 'yMm'].every((key) => isInteger(component[key]))) return false
      if (!isString(component.name) || !isString(component.materialId) || !isObject(component.options)) return false
    }
    for (const door of frame.doors) {
      if (!isObject(door)) return false
      const doorId = door.id
      if (!isString(doorId) || ids.has(doorId) || !doorTypes.has(door.type as DoorType)) return false
      ids.add(doorId)
      if (!isString(door.materialId) || !isString(door.finishId) || typeof door.softClose !== 'boolean' || typeof door.mirror !== 'boolean' || typeof door.glass !== 'boolean') return false
      if (door.handleId !== null && !isString(door.handleId)) return false
      if (!['left', 'right', 'center'].includes(String(door.handlePosition))) return false
    }
  }
  return true
}

export function createProjectEnvelope(design: Design): ProjectEnvelopeV1 {
  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    app: 'FurnitureStudioWeb',
    exportedAt: new Date().toISOString(),
    design,
  }
}

export function serializeProject(design: Design): string {
  return JSON.stringify(createProjectEnvelope(design), null, 2)
}

export function parseProjectJson(text: string): ImportResult {
  if (new TextEncoder().encode(text).byteLength > MAX_IMPORT_BYTES) return { ok: false, errorKey: 'import.fileTooLarge' }
  try {
    const parsed: unknown = JSON.parse(text)
    if (!isObject(parsed)) return { ok: false, errorKey: 'import.invalidRoot' }
    if (parsed.schemaVersion !== PROJECT_SCHEMA_VERSION) return { ok: false, errorKey: 'import.unsupportedVersion' }
    if (parsed.app !== 'FurnitureStudioWeb' || !isValidDesign(parsed.design)) return { ok: false, errorKey: 'import.invalidDesign' }
    return { ok: true, design: parsed.design }
  } catch {
    return { ok: false, errorKey: 'import.invalidJson' }
  }
}

export function safeFileName(name: string): string {
  const cleaned = name.trim().replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-+|-+$/g, '')
  return cleaned || 'furniture-design'
}
