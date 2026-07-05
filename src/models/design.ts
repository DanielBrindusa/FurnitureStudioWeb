import type { PositionMm, SizeMm } from './geometry'
import type { CameraState, RenderSettings, Selection, ViewMode } from './rendering'
import type { ValidationResult, ValidationState } from './validation'

export type { CatalogItem, CatalogCategory, PriceRule } from './catalog'
export type { LegacyCatalogItem } from './catalog'
export type { BoundingBox3D, Millimetres, PositionMm, SizeMm } from './geometry'
export type { CameraMode, CameraState, RenderSettings, SelectedItem, Selection, ViewMode, ViewSettings } from './rendering'
export type { PlacementFeedback, ValidationResult, ValidationSeverity, ValidationState } from './validation'

export type LanguageCode = 'en' | 'ro'
export type MoneyCents = number

export type FinishType =
  | 'matte'
  | 'satin'
  | 'wood-light'
  | 'wood-medium'
  | 'wood-dark'
  | 'mirror'
  | 'glass'
  | 'metal'
  | 'wire'
  | 'fabric'

export type FurnitureComponentType =
  | 'shelf'
  | 'adjustable-shelf'
  | 'fixed-shelf'
  | 'glass-shelf'
  | 'display-shelf'
  | 'clothes-rail'
  | 'drawer'
  | 'deep-drawer'
  | 'shallow-drawer'
  | 'mesh-basket'
  | 'wire-basket'
  | 'shoe-shelf'
  | 'angled-shoe-shelf'
  | 'vertical-divider'
  | 'pull-out-tray'
  | 'accessory-tray'
  | 'small-organizer'
  | 'trouser-rail'
  | 'laundry-basket'
  | 'led-light-strip'
  | 'sensor-light'
  | 'top-cover-panel'
  | 'side-cover-panel'
  | 'plinth-base'
  | 'handle'
  | 'knob'

export type DoorType =
  | 'open'
  | 'hinged'
  | 'sliding'
  | 'double-sliding'
  | 'mirror'
  | 'glass'
  | 'glass-look'
  | 'framed'
  | 'framed-panel'
  | 'flat'
  | 'flat-panel'
  | 'louvered'
  | 'panel-split'

export type HandleOrKnobType = 'handle' | 'knob' | 'edge-pull' | 'bar-pull' | 'recessed-pull'

export type ContentObjectType =
  | 'shirt'
  | 'coat'
  | 'trousers'
  | 'shoes'
  | 'handbag'
  | 'box'
  | 'folded-clothes'
  | 'jewelry'
  | 'belt'
  | 'tie'
  | 'towel-stack'
  | 'basket-contents'
  | 'hanger-group'

export type PanelType = 'left-side' | 'right-side' | 'top' | 'bottom' | 'back' | 'divider' | 'shelf'

export interface InstallationSpace {
  widthMm: number
  heightMm: number
  depthMm: number
  leftClearanceMm: number
  rightClearanceMm: number
  topClearanceMm: number
}

export interface Panel {
  id: string
  type: PanelType
  leftSide: boolean
  rightSide: boolean
  top: boolean
  bottom: boolean
  back: boolean
  divider: boolean
  shelf: boolean
  position: PositionMm
  size: SizeMm
  thicknessMm: number
  materialId: string
  finishId: string
}

/**
 * `positionMm` and `sizeMm` are the canonical 3D fields. The flattened fields
 * remain as a synchronized projection for the current SVG renderer and are
 * removed when that renderer migrates to the geometry helpers.
 */
export interface FurnitureComponent {
  id: string
  type: FurnitureComponentType
  name: string
  positionMm: PositionMm
  sizeMm: SizeMm
  compatibleDepthsMm: number[]
  materialId: string
  finishId: string
  handleId: string | null
  options: Record<string, string | number | boolean>
  locked: boolean
  selected: boolean
  widthMm: number
  heightMm: number
  depthMm: number
  xMm: number
  yMm: number
  zMm: number
}

export interface Door {
  id: string
  type: DoorType
  frameId: string
  xMm: number
  yMm: number
  zMm: number
  widthMm: number
  heightMm: number
  thicknessMm: number
  materialId: string
  finishId: string
  handleId: string | null
  knobId: string | null
  hingeSide: 'left' | 'right' | 'none'
  openAngleDeg: number
  isOpen: boolean
  softClose: boolean
  trackRequired: boolean
  selected: boolean
  mirror: boolean
  glass: boolean
  handlePosition: 'left' | 'right' | 'center'
}

export interface HandleOrKnob {
  id: string
  type: HandleOrKnobType
  materialId: string
  finishId: string
  position: PositionMm
  rotation: { xMilliDeg: number; yMilliDeg: number; zMilliDeg: number }
  compatibleDoorTypes: DoorType[]
}

export interface ContentObject {
  id: string
  type: ContentObjectType
  positionMm: PositionMm
  sizeMm: SizeMm
  colorVariant: string
  density: number
  decorativeOnly: boolean
}

export interface Frame {
  id: string
  name: string
  widthMm: number
  heightMm: number
  depthMm: number
  xMm: number
  yMm: number
  zMm: number
  orderIndex: number
  materialId: string
  finishId: string
  boardThicknessMm: number
  backPanelEnabled: boolean
  plinthEnabled: boolean
  feetEnabled: boolean
  components: FurnitureComponent[]
  doors: Door[]
  contents: ContentObject[]
  panels: Panel[]
  validationState: ValidationState
  /** Transitional visibility preference used by the current SVG UI. */
  showDoors: boolean
}

export interface Furniture {
  frames: Frame[]
  globalDoors: Door[]
  accessories: Array<FurnitureComponent | HandleOrKnob>
  materialPalette: string[]
  totalWidthMm: number
  maxHeightMm: number
  maxDepthMm: number
}

export interface Material {
  id: string
  name: string
  finishType: FinishType
  color: string
  texture: string
  priceMultiplier: number
}

export interface PriceBreakdown {
  frames: MoneyCents
  doors: MoneyCents
  components: MoneyCents
  accessories: MoneyCents
  lighting: MoneyCents
  total: MoneyCents
}

export type PriceSummary = PriceBreakdown

export interface Design {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  version: 2
  language: LanguageCode
  installationSpace: InstallationSpace
  furniture: Furniture
  selectedObject: Selection | null
  camera: CameraState
  viewMode: ViewMode
  renderSettings: RenderSettings
  validationResults: ValidationResult[]
  priceSummary: PriceSummary
}
