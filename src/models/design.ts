export type LanguageCode = 'en' | 'ro'

export type Millimetres = number
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

export type FurnitureComponentType =
  | 'shelf'
  | 'clothes-rail'
  | 'drawer'
  | 'deep-drawer'
  | 'wire-basket'
  | 'shoe-shelf'
  | 'vertical-divider'
  | 'pull-out-tray'
  | 'accessory-tray'
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
  | 'glass-look'
  | 'flat-panel'
  | 'framed-panel'

export type SelectedItem =
  | { kind: 'frame' | 'component' | 'door'; id: string }
  | null

export interface InstallationSpace {
  widthMm: Millimetres
  heightMm: Millimetres
  depthMm: Millimetres
  leftClearanceMm: Millimetres
  rightClearanceMm: Millimetres
  topClearanceMm: Millimetres
}

export interface FurnitureComponent {
  id: string
  type: FurnitureComponentType
  name: string
  widthMm: Millimetres
  heightMm: Millimetres
  depthMm: Millimetres
  xMm: Millimetres
  yMm: Millimetres
  materialId: string
  options: Record<string, string | number | boolean>
}

export interface Door {
  id: string
  type: DoorType
  materialId: string
  finishId: string
  handleId: string | null
  mirror: boolean
  glass: boolean
  softClose: boolean
  widthMm?: Millimetres
  heightMm?: Millimetres
}

export interface Frame {
  id: string
  name: string
  widthMm: Millimetres
  heightMm: Millimetres
  depthMm: Millimetres
  materialId: string
  finishId: string
  components: FurnitureComponent[]
  doors: Door[]
  orderIndex: number
  showDoors: boolean
  backPanelEnabled: boolean
  plinthEnabled: boolean
}

export interface ViewSettings {
  showMeasurements: boolean
  showDoors: boolean
  showIssues: boolean
  zoomPercent: number
}

export interface Design {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  language: LanguageCode
  installationSpace: InstallationSpace
  frames: Frame[]
  selectedItem: SelectedItem
  viewSettings: ViewSettings
}

export interface Material {
  id: string
  name: string
  finishType: FinishType
  color: string
  texture: string
  priceMultiplier: number
}

export type CatalogCategory =
  | 'frames'
  | 'interiors'
  | 'doors'
  | 'handles'
  | 'lighting'
  | 'accessories'
  | 'panels'

export type CatalogItemType = 'frame' | FurnitureComponentType | DoorType

export interface CatalogDimensions {
  widthMm?: Millimetres
  heightMm?: Millimetres
  depthMm?: Millimetres
}

export interface CatalogItem {
  id: string
  sku: string
  name: string
  type: CatalogItemType
  category: CatalogCategory
  dimensions: CatalogDimensions
  compatibleDepths: Millimetres[]
  minWidthMm: Millimetres
  maxWidthMm: Millimetres
  minHeightMm: Millimetres
  maxHeightMm: Millimetres
  /** Fictional unit price in integer euro cents. */
  price: MoneyCents
  rules: Record<string, string | number | boolean | readonly string[]>
}

export type ValidationSeverity = 'error' | 'warning' | 'info'

export interface ValidationResult {
  id: string
  severity: ValidationSeverity
  code: string
  messageKey: string
  targetId: string
  suggestedFixKey: string
}

export interface PriceBreakdown {
  frames: MoneyCents
  doors: MoneyCents
  components: MoneyCents
  accessories: MoneyCents
  lighting: MoneyCents
  total: MoneyCents
}
