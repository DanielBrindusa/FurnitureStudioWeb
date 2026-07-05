import type { SizeMm } from './geometry'

export type CatalogCategory =
  | 'frames'
  | 'shelves'
  | 'drawers'
  | 'rails'
  | 'baskets'
  | 'shoe-storage'
  | 'trays'
  | 'dividers'
  | 'doors'
  | 'handles-knobs'
  | 'lighting'
  | 'clothes-display'
  | 'boxes-organizers'
  | 'preset-layouts'

export interface CatalogDimensionsMm {
  widthMm?: number
  heightMm?: number
  depthMm?: number
}

export interface PriceRule {
  basePrice: number
  pricePerWidthMm: number
  pricePerHeightMm: number
  pricePerArea: number
  materialMultiplier: number
  accessoryMultiplier: number
}

export interface CatalogRenderHints {
  geometryRecipe: string
  materialSlots: string[]
  castShadow: boolean
  receiveShadow: boolean
  levelOfDetail: 'primitive' | 'standard' | 'detailed'
  decorativeOnly: boolean
}

export interface CatalogItem {
  id: string
  sku: string
  name: string
  nameKey: string
  descriptionKey: string
  category: CatalogCategory
  subcategory: string
  icon: string
  previewModelType: string
  defaultDimensionsMm: SizeMm
  minDimensionsMm: SizeMm
  maxDimensionsMm: SizeMm
  compatibleFrameDepthsMm: number[]
  compatibleDoorTypes: string[]
  priceRule: PriceRule
  validationRules: string[]
  placementRules: string[]
  renderHints: CatalogRenderHints
  tags: string[]
}

/** Existing 2D catalog contract retained until its UI migrates to CatalogItem. */
export type LegacyCatalogCategory = 'frames' | 'interiors' | 'doors' | 'handles' | 'lighting' | 'accessories' | 'panels'
export interface LegacyCatalogItem {
  id: string
  sku: string
  name: string
  type: string
  category: LegacyCatalogCategory
  dimensions: CatalogDimensionsMm
  compatibleDepths: number[]
  minWidthMm: number
  maxWidthMm: number
  minHeightMm: number
  maxHeightMm: number
  price: number
  rules: Record<string, string | number | boolean | readonly string[]>
}

export interface CatalogItemSeed extends Omit<Partial<CatalogItem>, 'id' | 'sku' | 'name' | 'category' | 'subcategory' | 'previewModelType'> {
  id: string
  sku: string
  name: string
  category: CatalogCategory
  subcategory: string
  previewModelType: string
}

const ZERO_SIZE: SizeMm = { width: 0, height: 0, depth: 0 }

export function defineCatalogItem(seed: CatalogItemSeed): CatalogItem {
  return {
    nameKey: `catalog.${seed.id}.name`,
    descriptionKey: `catalog.${seed.id}.description`,
    icon: seed.category,
    defaultDimensionsMm: ZERO_SIZE,
    minDimensionsMm: ZERO_SIZE,
    maxDimensionsMm: { width: 2070, height: 2800, depth: 1000 },
    compatibleFrameDepthsMm: [350, 450, 580, 600],
    compatibleDoorTypes: [],
    priceRule: {
      basePrice: 0,
      pricePerWidthMm: 0,
      pricePerHeightMm: 0,
      pricePerArea: 0,
      materialMultiplier: 1,
      accessoryMultiplier: 1,
    },
    validationRules: [],
    placementRules: [],
    renderHints: {
      geometryRecipe: seed.previewModelType,
      materialSlots: ['primary'],
      castShadow: true,
      receiveShadow: true,
      levelOfDetail: 'standard',
      decorativeOnly: false,
    },
    tags: [],
    ...seed,
  }
}
