import type { PositionMm } from './geometry'

export type CameraMode = 'perspective' | 'orthographic' | 'front' | 'isometric' | 'top'

export type ViewMode =
  | 'fullFurniture'
  | 'focusedFrame'
  | 'internalsOnly'
  | 'doorsClosed'
  | 'doorsOpen'
  | 'transparentDoors'
  | 'exploded'
  | 'measurement'

export type SelectionObjectType = 'frame' | 'component' | 'door' | 'hardware' | 'content' | 'panel'

export interface Selection {
  objectType: SelectionObjectType
  objectId: string
  frameId: string | null
  componentId: string | null
  doorId: string | null
}

export interface CameraRotation {
  pitchMilliDeg: number
  yawMilliDeg: number
  rollMilliDeg: number
}

export interface CameraState {
  mode: CameraMode
  perspective: boolean
  orthographic: boolean
  front: boolean
  isometric: boolean
  top: boolean
  focusedFrameId: string | null
  position: PositionMm
  target: PositionMm
  zoom: number
  rotation: CameraRotation
  autoFitEnabled: boolean
}

export interface RenderSettings {
  showMeasurements: boolean
  showDoors: boolean
  showIssues: boolean
  showContents: boolean
  showInstallationSpace: boolean
  transparentUnfocusedFrames: boolean
  shadowsEnabled: boolean
  ambientOcclusionEnabled: boolean
  quality: 'low' | 'medium' | 'high'
  reducedMotion: boolean
}

/** Transitional patch shape used by the current SVG controls. */
export interface ViewSettings {
  showMeasurements: boolean
  showDoors: boolean
  showIssues: boolean
  zoomPercent: number
}

export type SelectedItem =
  | { kind: 'frame' | 'component' | 'door'; id: string }
  | null

export function selectionFromLegacy(item: SelectedItem, frameId: string | null = null): Selection | null {
  if (!item) return null
  return {
    objectType: item.kind,
    objectId: item.id,
    frameId: item.kind === 'frame' ? item.id : frameId,
    componentId: item.kind === 'component' ? item.id : null,
    doorId: item.kind === 'door' ? item.id : null,
  }
}

export const defaultCameraState = (): CameraState => ({
  mode: 'front',
  perspective: false,
  orthographic: true,
  front: true,
  isometric: false,
  top: false,
  focusedFrameId: null,
  position: { x: 1500, y: 1300, z: 5000 },
  target: { x: 1500, y: 1300, z: 0 },
  zoom: 100,
  rotation: { pitchMilliDeg: 0, yawMilliDeg: 0, rollMilliDeg: 0 },
  autoFitEnabled: true,
})

export const defaultRenderSettings = (): RenderSettings => ({
  showMeasurements: true,
  showDoors: true,
  showIssues: true,
  showContents: true,
  showInstallationSpace: true,
  transparentUnfocusedFrames: true,
  shadowsEnabled: true,
  ambientOcclusionEnabled: true,
  quality: 'high',
  reducedMotion: false,
})
