import { getCatalogItemByType, getHandle, getMaterial } from '../data/catalog'
import type { Design, FurnitureComponentType, ValidationResult } from '../models/design'
import { calculateComponentPrice, calculateDoorPrice, calculateFramePrice } from '../pricing/priceEngine'

export type PartCategory = 'frames' | 'doors' | 'shelves' | 'drawers' | 'rails' | 'baskets' | 'panels' | 'handles' | 'lighting' | 'accessories'
export type PartsGrouping = 'category' | 'frame' | 'material'

export interface PartRow {
  id: string
  category: PartCategory
  itemName: string
  sku: string
  frameReference: string
  widthMm: number
  heightMm: number
  depthMm: number
  material: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes: string
}

const categoryFor = (type: FurnitureComponentType): PartCategory => {
  if (type === 'shelf' || type === 'shoe-shelf' || type === 'angled-shoe-shelf') return 'shelves'
  if (type === 'drawer' || type === 'deep-drawer' || type === 'pull-out-tray') return 'drawers'
  if (type === 'clothes-rail' || type === 'trouser-rail') return 'rails'
  if (type === 'wire-basket' || type === 'laundry-basket') return 'baskets'
  if (type === 'top-cover-panel' || type === 'side-cover-panel' || type === 'vertical-divider' || type === 'plinth-base') return 'panels'
  if (type === 'handle' || type === 'knob') return 'handles'
  if (type === 'led-light-strip' || type === 'sensor-light') return 'lighting'
  return 'accessories'
}

const notesFor = (id: string, validation: ValidationResult[]) => validation
  .filter((issue) => issue.targetId === id)
  .map((issue) => `${issue.severity}: ${issue.code}`)
  .join('; ')

export function derivePartsList(design: Design, validation: ValidationResult[] = []): PartRow[] {
  const rows: PartRow[] = []
  const orderedFrames = [...design.furniture.frames].sort((a, b) => a.orderIndex - b.orderIndex)

  orderedFrames.forEach((frame, index) => {
    const frameReference = `${index + 1}. ${frame.name}`
    const framePrice = calculateFramePrice(frame)
    rows.push({
      id: frame.id,
      category: 'frames',
      itemName: frame.name,
      sku: 'FSW-FRAME-CUSTOM',
      frameReference,
      widthMm: frame.widthMm,
      heightMm: frame.heightMm,
      depthMm: frame.depthMm,
      material: getMaterial(frame.materialId)?.name ?? frame.materialId,
      quantity: 1,
      unitPrice: framePrice,
      totalPrice: framePrice,
      notes: notesFor(frame.id, validation),
    })

    frame.doors.forEach((door) => {
      const item = getCatalogItemByType(door.type)
      const unitPrice = calculateDoorPrice(door, frame)
      rows.push({
        id: door.id,
        category: 'doors',
        itemName: item?.name ?? door.type,
        sku: item?.sku ?? 'FSW-DOOR-CUSTOM',
        frameReference,
        widthMm: door.widthMm ?? frame.widthMm,
        heightMm: door.heightMm ?? frame.heightMm,
        depthMm: 0,
        material: getMaterial(door.materialId)?.name ?? door.materialId,
        quantity: 1,
        unitPrice,
        totalPrice: unitPrice,
        notes: notesFor(door.id, validation),
      })
      if (door.handleId) {
        const handle = getHandle(door.handleId)
        rows.push({
          id: `${door.id}-handle`, category: 'handles', itemName: handle?.name ?? door.handleId,
          sku: handle?.sku ?? 'FSW-HANDLE-CUSTOM', frameReference,
          widthMm: handle?.dimensions.widthMm ?? 0, heightMm: handle?.dimensions.heightMm ?? 0, depthMm: handle?.dimensions.depthMm ?? 0,
          material: 'Brushed Alloy', quantity: 1, unitPrice: handle?.price ?? 0, totalPrice: handle?.price ?? 0, notes: '',
        })
      }
    })

    frame.components.forEach((component) => {
      const item = getCatalogItemByType(component.type)
      const unitPrice = calculateComponentPrice(component)
      rows.push({
        id: component.id,
        category: categoryFor(component.type),
        itemName: component.name,
        sku: item?.sku ?? 'FSW-COMPONENT-CUSTOM',
        frameReference,
        widthMm: component.widthMm,
        heightMm: component.heightMm,
        depthMm: component.depthMm,
        material: getMaterial(component.materialId)?.name ?? component.materialId,
        quantity: 1,
        unitPrice,
        totalPrice: unitPrice,
        notes: notesFor(component.id, validation),
      })
    })
  })

  return rows
}

export function groupParts(rows: PartRow[], grouping: PartsGrouping): Map<string, PartRow[]> {
  const groups = new Map<string, PartRow[]>()
  for (const row of rows) {
    const key = grouping === 'category' ? row.category : grouping === 'frame' ? row.frameReference : row.material
    groups.set(key, [...(groups.get(key) ?? []), row])
  }
  return groups
}

const guardSpreadsheetFormula = (value: string) => /^[=+\-@]/.test(value) ? `'${value}` : value
const csvCell = (value: string | number) => {
  const text = guardSpreadsheetFormula(String(value))
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function partsListToCsv(rows: PartRow[]): string {
  const headers = ['item_category', 'item_name', 'fictional_sku', 'frame_reference', 'width_mm', 'height_mm', 'depth_mm', 'material', 'quantity', 'unit_estimated_price_cents', 'total_estimated_price_cents', 'notes_warnings']
  const lines = rows.map((row) => [row.category, row.itemName, row.sku, row.frameReference, row.widthMm, row.heightMm, row.depthMm, row.material, row.quantity, row.unitPrice, row.totalPrice, row.notes].map(csvCell).join(','))
  return `\uFEFF${[headers.join(','), ...lines].join('\r\n')}`
}
