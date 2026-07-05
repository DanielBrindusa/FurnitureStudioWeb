import { describe, expect, it } from 'vitest'
import {
  configuratorCatalog,
  contentObjectCatalog,
  drawerBasketTrayCatalog,
  frameTemplateCatalog,
  hardwareCatalog,
  lightingAccessoryCatalog,
  professionalDoorCatalog,
  shelfStorageCatalog,
  wardrobePresetCatalog,
} from './configuratorCatalog'

describe('professional fictional catalog', () => {
  it('meets the configurator breadth requirements', () => {
    expect(frameTemplateCatalog.length).toBeGreaterThanOrEqual(8)
    expect(shelfStorageCatalog.length).toBeGreaterThanOrEqual(10)
    expect(drawerBasketTrayCatalog.length).toBeGreaterThanOrEqual(8)
    expect(professionalDoorCatalog.length).toBeGreaterThanOrEqual(8)
    expect(hardwareCatalog.length).toBeGreaterThanOrEqual(10)
    expect(contentObjectCatalog.length).toBeGreaterThanOrEqual(10)
    expect(lightingAccessoryCatalog.length).toBeGreaterThanOrEqual(6)
    expect(wardrobePresetCatalog.length).toBeGreaterThanOrEqual(8)
  })

  it('uses unique original IDs and fictional SKUs with integer dimensions and prices', () => {
    expect(new Set(configuratorCatalog.map((item) => item.id)).size).toBe(configuratorCatalog.length)
    expect(new Set(configuratorCatalog.map((item) => item.sku)).size).toBe(configuratorCatalog.length)
    for (const catalogItem of configuratorCatalog) {
      expect(catalogItem.sku.startsWith('WS-')).toBe(true)
      expect(`${catalogItem.name} ${catalogItem.sku}`.toLowerCase()).not.toMatch(/ikea|pax|komplement/)
      expect(Object.values(catalogItem.defaultDimensionsMm).every(Number.isSafeInteger)).toBe(true)
      expect(Number.isSafeInteger(catalogItem.priceRule.basePrice)).toBe(true)
    }
  })

  it('covers every requested top-level category', () => {
    const categories = new Set(configuratorCatalog.map((item) => item.category))
    expect(categories).toEqual(new Set([
      'frames', 'shelves', 'drawers', 'rails', 'baskets', 'shoe-storage', 'trays', 'dividers',
      'doors', 'handles-knobs', 'lighting', 'clothes-display', 'boxes-organizers', 'preset-layouts',
    ]))
  })
})
