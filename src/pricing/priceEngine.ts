import { getCatalogItemByType, getHandle, getMaterial } from '../data/catalog'
import type {
  Design,
  Door,
  Frame,
  FurnitureComponent,
  MoneyCents,
  PriceBreakdown,
} from '../models/design'

const LIGHTING_TYPES = new Set(['led-light-strip', 'sensor-light'])
const ACCESSORY_TYPES = new Set([
  'accessory-tray',
  'trouser-rail',
  'laundry-basket',
  'top-cover-panel',
  'side-cover-panel',
  'plinth-base',
  'handle',
  'knob',
])

const applyMaterialMultiplier = (priceCents: number, materialId: string): MoneyCents => {
  const multiplier = getMaterial(materialId)?.priceMultiplier ?? 1
  const multiplierThousandths = Math.round(multiplier * 1000)
  return Math.round((priceCents * multiplierThousandths) / 1000)
}

const areaPrice = (widthMm: number, heightMm: number, centsPerSquareMetre: number): number =>
  Math.round((widthMm * heightMm * centsPerSquareMetre) / 1_000_000)

export function calculateFramePrice(frame: Frame): MoneyCents {
  const basePrice = 5000
  const carcassAreaPrice = areaPrice(frame.widthMm, frame.heightMm, 1800)
  const depthPrice = frame.depthMm * 4
  const backPanelPrice = frame.backPanelEnabled ? 2200 : 0
  const plinthPrice = frame.plinthEnabled ? 1400 : 0

  return applyMaterialMultiplier(
    basePrice + carcassAreaPrice + depthPrice + backPanelPrice + plinthPrice,
    frame.materialId,
  )
}

export function calculateDoorPrice(door: Door, frame?: Frame): MoneyCents {
  if (door.type === 'open') return 0

  const catalogPrice = getCatalogItemByType(door.type)?.price ?? 8000
  const widthMm = door.widthMm ?? frame?.widthMm ?? 600
  const heightMm = door.heightMm ?? frame?.heightMm ?? 2000
  const sizePrice = areaPrice(widthMm, heightMm, 1200)
  const mirrorPrice = door.mirror ? 5000 : 0
  const glassPrice = door.glass ? 3500 : 0
  const softClosePrice = door.softClose ? 1800 : 0

  return applyMaterialMultiplier(
    catalogPrice + sizePrice + mirrorPrice + glassPrice + softClosePrice,
    door.materialId,
  )
}

export function calculateComponentPrice(component: FurnitureComponent): MoneyCents {
  const catalogPrice = getCatalogItemByType(component.type)?.price ?? 1500
  const usesAreaPricing = [
    'shelf',
    'shoe-shelf',
    'vertical-divider',
    'top-cover-panel',
    'side-cover-panel',
    'plinth-base',
  ].includes(component.type)
  const sizePrice = usesAreaPricing
    ? areaPrice(component.widthMm, component.heightMm, 800)
    : 0

  return applyMaterialMultiplier(catalogPrice + sizePrice, component.materialId)
}

export function getPriceBreakdown(design: Design): PriceBreakdown {
  let frames = 0
  let doors = 0
  let components = 0
  let accessories = 0
  let lighting = 0

  for (const frame of design.furniture.frames) {
    frames += calculateFramePrice(frame)

    for (const door of frame.doors) {
      doors += calculateDoorPrice(door, frame)

      if (door.handleId) {
        accessories += getHandle(door.handleId)?.price ?? 0
      }
    }

    for (const component of frame.components) {
      const componentPrice = calculateComponentPrice(component)

      if (LIGHTING_TYPES.has(component.type)) {
        lighting += componentPrice
      } else if (ACCESSORY_TYPES.has(component.type)) {
        accessories += componentPrice
      } else {
        components += componentPrice
      }
    }
  }

  return {
    frames,
    doors,
    components,
    accessories,
    lighting,
    total: frames + doors + components + accessories + lighting,
  }
}

export function calculateDesignPrice(design: Design): MoneyCents {
  return getPriceBreakdown(design).total
}

export function formatEstimatedPrice(priceCents: MoneyCents, language: 'en' | 'ro'): string {
  return new Intl.NumberFormat(language === 'ro' ? 'ro-RO' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
  }).format(priceCents / 100)
}
