import type { Design, DoorType, FurnitureComponentType } from '../models/design'
import { migrateDesignV1ToV2, type LegacyDesignV1 } from '../models/migrations'

export const PROJECT_SCHEMA_VERSION = 2
export const PROJECT_FILE_EXTENSION = '.furniture-studio.json'
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024

export interface ProjectEnvelopeV2 {
  schemaVersion: 2
  app: 'FurnitureStudioWeb'
  exportedAt: string
  design: Design
}

export type ImportResult =
  | { ok: true; design: Design; migratedFromVersion?: 1 }
  | { ok: false; errorKey: string }

const componentTypes = new Set<FurnitureComponentType>([
  'shelf', 'adjustable-shelf', 'fixed-shelf', 'glass-shelf', 'display-shelf', 'clothes-rail',
  'drawer', 'deep-drawer', 'shallow-drawer', 'mesh-basket', 'wire-basket', 'shoe-shelf',
  'angled-shoe-shelf', 'vertical-divider', 'pull-out-tray', 'accessory-tray', 'small-organizer',
  'trouser-rail', 'laundry-basket', 'led-light-strip', 'sensor-light', 'top-cover-panel',
  'side-cover-panel', 'plinth-base', 'handle', 'knob',
])
const doorTypes = new Set<DoorType>([
  'open', 'hinged', 'sliding', 'double-sliding', 'mirror', 'glass', 'glass-look',
  'framed', 'framed-panel', 'flat', 'flat-panel', 'louvered', 'panel-split',
])
const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
const isInteger = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value)
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const isString = (value: unknown): value is string => typeof value === 'string' && value.length > 0
const hasIntegerKeys = (value: Record<string, unknown>, keys: string[]) => keys.every((key) => isInteger(value[key]))

function isPosition(value: unknown): value is { x: number; y: number; z: number } {
  return isObject(value) && hasIntegerKeys(value, ['x', 'y', 'z'])
}

function isSize(value: unknown): value is { width: number; height: number; depth: number } {
  return isObject(value) && hasIntegerKeys(value, ['width', 'height', 'depth'])
}

function isValidLegacyDesign(value: unknown): value is LegacyDesignV1 {
  if (!isObject(value) || !isString(value.id) || !isString(value.name) || !isString(value.createdAt) || !isString(value.updatedAt) || !Array.isArray(value.frames)) return false
  if (!['en', 'ro'].includes(String(value.language)) || !isObject(value.installationSpace) || !isObject(value.viewSettings)) return false
  if (typeof value.viewSettings.showMeasurements !== 'boolean' || typeof value.viewSettings.showDoors !== 'boolean' || typeof value.viewSettings.showIssues !== 'boolean' || !isInteger(value.viewSettings.zoomPercent)) return false
  if (value.selectedItem !== null && (!isObject(value.selectedItem) || !['frame', 'component', 'door'].includes(String(value.selectedItem.kind)) || !isString(value.selectedItem.id))) return false
  if (!hasIntegerKeys(value.installationSpace, ['widthMm', 'heightMm', 'depthMm', 'leftClearanceMm', 'rightClearanceMm', 'topClearanceMm'])) return false
  const ids = new Set<string>()
  for (const frame of value.frames) {
    if (!isObject(frame) || !isString(frame.id) || ids.has(frame.id) || !isString(frame.name)) return false
    ids.add(frame.id)
    if (!hasIntegerKeys(frame, ['widthMm', 'heightMm', 'depthMm', 'orderIndex']) || !Array.isArray(frame.components) || !Array.isArray(frame.doors)) return false
    if (!isString(frame.materialId) || !isString(frame.finishId) || typeof frame.showDoors !== 'boolean' || typeof frame.backPanelEnabled !== 'boolean' || typeof frame.plinthEnabled !== 'boolean') return false
    for (const component of frame.components) {
      if (!isObject(component) || !isString(component.id) || ids.has(component.id) || !componentTypes.has(component.type as FurnitureComponentType)) return false
      ids.add(component.id)
      if (!hasIntegerKeys(component, ['widthMm', 'heightMm', 'depthMm', 'xMm', 'yMm']) || !isString(component.name) || !isString(component.materialId) || !isObject(component.options)) return false
    }
    for (const door of frame.doors) {
      if (!isObject(door) || !isString(door.id) || ids.has(door.id) || !doorTypes.has(door.type as DoorType)) return false
      ids.add(door.id)
      if (!isString(door.materialId) || !isString(door.finishId) || typeof door.softClose !== 'boolean' || typeof door.mirror !== 'boolean' || typeof door.glass !== 'boolean') return false
    }
  }
  return true
}

function isValidDesignV2(value: unknown): value is Design {
  if (!isObject(value) || value.version !== 2 || !isString(value.id) || !isString(value.name) || !isString(value.createdAt) || !isString(value.updatedAt)) return false
  if (!['en', 'ro'].includes(String(value.language)) || !isObject(value.installationSpace) || !isObject(value.furniture)) return false
  if (!hasIntegerKeys(value.installationSpace, ['widthMm', 'heightMm', 'depthMm', 'leftClearanceMm', 'rightClearanceMm', 'topClearanceMm'])) return false
  const furniture = value.furniture
  if (!Array.isArray(furniture.frames) || !Array.isArray(furniture.globalDoors) || !Array.isArray(furniture.accessories) || !Array.isArray(furniture.materialPalette)) return false
  if (!hasIntegerKeys(furniture, ['totalWidthMm', 'maxHeightMm', 'maxDepthMm'])) return false
  if (!isObject(value.camera) || !isPosition(value.camera.position) || !isPosition(value.camera.target) || !isInteger(value.camera.zoom) || !isString(value.camera.mode)) return false
  if (!isObject(value.renderSettings) || typeof value.renderSettings.showMeasurements !== 'boolean' || typeof value.renderSettings.showDoors !== 'boolean' || typeof value.renderSettings.showIssues !== 'boolean') return false
  if (!isString(value.viewMode) || !Array.isArray(value.validationResults) || !isObject(value.priceSummary) || !isNumber(value.priceSummary.total)) return false
  if (value.selectedObject !== null && (!isObject(value.selectedObject) || !isString(value.selectedObject.objectType) || !isString(value.selectedObject.objectId))) return false

  const ids = new Set<string>()
  for (const frame of furniture.frames) {
    if (!isObject(frame) || !isString(frame.id) || ids.has(frame.id) || !isString(frame.name)) return false
    ids.add(frame.id)
    if (!hasIntegerKeys(frame, ['widthMm', 'heightMm', 'depthMm', 'xMm', 'yMm', 'zMm', 'orderIndex', 'boardThicknessMm'])) return false
    if (!isString(frame.materialId) || !isString(frame.finishId) || !Array.isArray(frame.components) || !Array.isArray(frame.doors) || !Array.isArray(frame.contents) || !Array.isArray(frame.panels)) return false
    if (typeof frame.backPanelEnabled !== 'boolean' || typeof frame.plinthEnabled !== 'boolean' || typeof frame.feetEnabled !== 'boolean') return false
    for (const component of frame.components) {
      if (!isObject(component) || !isString(component.id) || ids.has(component.id) || !componentTypes.has(component.type as FurnitureComponentType)) return false
      ids.add(component.id)
      if (!isPosition(component.positionMm) || !isSize(component.sizeMm) || !hasIntegerKeys(component, ['widthMm', 'heightMm', 'depthMm', 'xMm', 'yMm', 'zMm'])) return false
      if (component.positionMm.x !== component.xMm || component.positionMm.y !== component.yMm || component.positionMm.z !== component.zMm) return false
      if (component.sizeMm.width !== component.widthMm || component.sizeMm.height !== component.heightMm || component.sizeMm.depth !== component.depthMm) return false
      if (!isString(component.name) || !isString(component.materialId) || !isString(component.finishId) || !isObject(component.options) || !Array.isArray(component.compatibleDepthsMm)) return false
    }
    for (const door of frame.doors) {
      if (!isObject(door) || !isString(door.id) || ids.has(door.id) || !doorTypes.has(door.type as DoorType)) return false
      ids.add(door.id)
      if (!hasIntegerKeys(door, ['xMm', 'yMm', 'zMm', 'widthMm', 'heightMm', 'thicknessMm']) || !isString(door.frameId) || !isString(door.materialId) || !isString(door.finishId)) return false
      if (typeof door.isOpen !== 'boolean' || typeof door.softClose !== 'boolean' || typeof door.trackRequired !== 'boolean' || !isNumber(door.openAngleDeg)) return false
    }
    for (const content of frame.contents) {
      if (!isObject(content) || !isString(content.id) || ids.has(content.id) || !isPosition(content.positionMm) || !isSize(content.sizeMm)) return false
      ids.add(content.id)
    }
    for (const panel of frame.panels) {
      if (!isObject(panel) || !isString(panel.id) || ids.has(panel.id) || !isPosition(panel.position) || !isSize(panel.size) || !isInteger(panel.thicknessMm)) return false
      ids.add(panel.id)
    }
  }
  return true
}

export function createProjectEnvelope(design: Design): ProjectEnvelopeV2 {
  return { schemaVersion: PROJECT_SCHEMA_VERSION, app: 'FurnitureStudioWeb', exportedAt: new Date().toISOString(), design }
}

export function serializeProject(design: Design): string {
  return JSON.stringify(createProjectEnvelope(design), null, 2)
}

export function parseProjectJson(text: string): ImportResult {
  if (new TextEncoder().encode(text).byteLength > MAX_IMPORT_BYTES) return { ok: false, errorKey: 'import.fileTooLarge' }
  try {
    const parsed: unknown = JSON.parse(text)
    if (!isObject(parsed)) return { ok: false, errorKey: 'import.invalidRoot' }
    if (parsed.app !== 'FurnitureStudioWeb') return { ok: false, errorKey: 'import.invalidDesign' }
    if (parsed.schemaVersion === 1) {
      if (!isValidLegacyDesign(parsed.design)) return { ok: false, errorKey: 'import.invalidDesign' }
      return { ok: true, design: migrateDesignV1ToV2(parsed.design), migratedFromVersion: 1 }
    }
    if (parsed.schemaVersion !== PROJECT_SCHEMA_VERSION) return { ok: false, errorKey: 'import.unsupportedVersion' }
    if (!isValidDesignV2(parsed.design)) return { ok: false, errorKey: 'import.invalidDesign' }
    return { ok: true, design: parsed.design }
  } catch {
    return { ok: false, errorKey: 'import.invalidJson' }
  }
}

export function safeFileName(name: string): string {
  const cleaned = name.trim().replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-+|-+$/g, '')
  return cleaned || 'furniture-design'
}
