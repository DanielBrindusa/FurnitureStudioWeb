import {
  createComponent,
  createDesign,
  createDoor,
  createFrame,
  recalculateFurniture,
} from './factories'
import { selectionFromLegacy } from './rendering'
import type {
  Design,
  DoorType,
  FurnitureComponentType,
  LanguageCode,
  SelectedItem,
} from './design'

export interface LegacyComponentV1 {
  id: string
  type: FurnitureComponentType
  name: string
  widthMm: number
  heightMm: number
  depthMm: number
  xMm: number
  yMm: number
  materialId: string
  options: Record<string, string | number | boolean>
}

export interface LegacyDoorV1 {
  id: string
  type: DoorType
  materialId: string
  finishId: string
  handleId: string | null
  mirror: boolean
  glass: boolean
  softClose: boolean
  handlePosition: 'left' | 'right' | 'center'
  widthMm?: number
  heightMm?: number
}

export interface LegacyFrameV1 {
  id: string
  name: string
  widthMm: number
  heightMm: number
  depthMm: number
  materialId: string
  finishId: string
  components: LegacyComponentV1[]
  doors: LegacyDoorV1[]
  orderIndex: number
  showDoors: boolean
  backPanelEnabled: boolean
  plinthEnabled: boolean
}

export interface LegacyDesignV1 {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  language: LanguageCode
  installationSpace: Design['installationSpace']
  frames: LegacyFrameV1[]
  selectedItem: SelectedItem
  viewSettings: {
    showMeasurements: boolean
    showDoors: boolean
    showIssues: boolean
    zoomPercent: number
  }
}

export function migrateDesignV1ToV2(legacy: LegacyDesignV1): Design {
  const base = createDesign(legacy.language)
  const orderedLegacy = [...legacy.frames].sort((a, b) => a.orderIndex - b.orderIndex)
  let cursor = legacy.installationSpace.leftClearanceMm
  const frames = orderedLegacy.map((legacyFrame, orderIndex) => {
    const frame = createFrame({
      id: legacyFrame.id,
      name: legacyFrame.name,
      widthMm: legacyFrame.widthMm,
      heightMm: legacyFrame.heightMm,
      depthMm: legacyFrame.depthMm,
      xMm: cursor,
      yMm: 0,
      zMm: 0,
      orderIndex,
      materialId: legacyFrame.materialId,
      finishId: legacyFrame.finishId,
      boardThicknessMm: 18,
      showDoors: legacyFrame.showDoors,
      backPanelEnabled: legacyFrame.backPanelEnabled,
      plinthEnabled: legacyFrame.plinthEnabled,
      feetEnabled: false,
    })
    cursor += frame.widthMm
    frame.components = legacyFrame.components.map((component) => createComponent(component.type, frame, {
      ...component,
      zMm: frame.boardThicknessMm,
      positionMm: { x: component.xMm, y: component.yMm, z: frame.boardThicknessMm },
      sizeMm: { width: component.widthMm, height: component.heightMm, depth: component.depthMm },
      compatibleDepthsMm: [350, 450, 580, 600],
      finishId: frame.finishId,
      handleId: null,
      locked: false,
      selected: false,
    }))
    frame.doors = legacyFrame.doors.map((door) => createDoor(door.type, frame, {
      ...door,
      frameId: frame.id,
      widthMm: door.widthMm ?? frame.widthMm,
      heightMm: door.heightMm ?? frame.heightMm,
    }))
    return frame
  })
  const selectedFrameId = legacy.selectedItem?.kind === 'frame'
    ? legacy.selectedItem.id
    : frames.find((frame) =>
      frame.components.some((component) => component.id === legacy.selectedItem?.id) ||
      frame.doors.some((door) => door.id === legacy.selectedItem?.id),
    )?.id ?? null
  return {
    ...base,
    id: legacy.id,
    name: legacy.name,
    createdAt: legacy.createdAt,
    updatedAt: legacy.updatedAt,
    installationSpace: { ...legacy.installationSpace },
    furniture: recalculateFurniture({ ...base.furniture, frames }),
    selectedObject: selectionFromLegacy(legacy.selectedItem, selectedFrameId),
    camera: { ...base.camera, zoom: legacy.viewSettings.zoomPercent },
    renderSettings: {
      ...base.renderSettings,
      showMeasurements: legacy.viewSettings.showMeasurements,
      showDoors: legacy.viewSettings.showDoors,
      showIssues: legacy.viewSettings.showIssues,
    },
  }
}
