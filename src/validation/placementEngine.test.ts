import { describe, expect, it } from 'vitest'
import { createComponent, createFrame } from '../models/factories'
import { evaluateComponentPlacement } from './validationEngine'

describe('component placement feedback', () => {
  it('accepts a clear snapped position inside the frame', () => {
    const frame = createFrame({ orderIndex: 0, widthMm: 1000, heightMm: 2400, depthMm: 580 })
    const shelf = createComponent('shelf', frame, { yMm: 500 })

    expect(evaluateComponentPlacement(frame, shelf)).toEqual({ valid: true, messageKey: 'placement.valid' })
  })

  it('rejects collisions with an existing component', () => {
    const frame = createFrame({ orderIndex: 0, widthMm: 1000, heightMm: 2400, depthMm: 580 })
    frame.components = [createComponent('drawer', frame, { yMm: 100 })]
    const candidate = createComponent('shelf', frame, { yMm: 150 })

    expect(evaluateComponentPlacement(frame, candidate).messageKey).toBe('placement.collision')
  })

  it('explains when a deep accessory needs a deeper frame', () => {
    const frame = createFrame({ orderIndex: 0, widthMm: 900, heightMm: 2200, depthMm: 450 })
    const basket = createComponent('laundry-basket', frame, { yMm: 100 })

    expect(evaluateComponentPlacement(frame, basket)).toEqual({ valid: false, messageKey: 'placement.needsDeeperFrame' })
  })

  it('keeps lighting in the supported top attachment zone', () => {
    const frame = createFrame({ orderIndex: 0, widthMm: 900, heightMm: 2200, depthMm: 580 })
    const light = createComponent('led-light-strip', frame, { yMm: 300 })

    expect(evaluateComponentPlacement(frame, light).messageKey).toBe('placement.lightTopZone')
  })
})
