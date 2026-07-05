import { describe, expect, it } from 'vitest'
import { createComponent, createDesign, createDoor, createFrame } from '../models/factories'
import {
  calculateDesignPrice,
  calculateFramePrice,
  getPriceBreakdown,
} from './priceEngine'

describe('price engine', () => {
  it('calculates a deterministic frame price in integer cents', () => {
    const frame = createFrame({
      orderIndex: 0,
      widthMm: 1000,
      heightMm: 2000,
      depthMm: 500,
      materialId: 'studio-white',
      backPanelEnabled: false,
      plinthEnabled: false,
    })

    expect(calculateFramePrice(frame)).toBe(10600)
  })

  it('includes doors, components, handles, lighting and accessories', () => {
    const design = createDesign()
    const frame = createFrame({ orderIndex: 0 })
    frame.components = [
      createComponent('shelf', frame),
      createComponent('led-light-strip', frame),
      createComponent('accessory-tray', frame),
    ]
    frame.doors = [createDoor('hinged', frame)]
    design.furniture.frames = [frame]

    const breakdown = getPriceBreakdown(design)
    expect(breakdown.frames).toBeGreaterThan(0)
    expect(breakdown.doors).toBeGreaterThan(0)
    expect(breakdown.components).toBeGreaterThan(0)
    expect(breakdown.accessories).toBeGreaterThan(0)
    expect(breakdown.lighting).toBeGreaterThan(0)
    expect(calculateDesignPrice(design)).toBe(
      breakdown.frames + breakdown.doors + breakdown.components + breakdown.accessories + breakdown.lighting,
    )
  })
})
