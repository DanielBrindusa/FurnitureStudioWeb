import { describe, expect, it } from 'vitest'
import { createComponent, createDesign, createFrame } from '../models/factories'
import { validateDesign } from './validationEngine'

describe('validation engine', () => {
  it('validates frame minimum and maximum dimensions', () => {
    const design = createDesign()
    design.frames = [
      createFrame({ id: 'too-small', orderIndex: 0, widthMm: 9, heightMm: 9 }),
      createFrame({ id: 'too-large', orderIndex: 1, widthMm: 2071, heightMm: 2801 }),
    ]

    const codes = validateDesign(design).map((issue) => issue.code)
    expect(codes).toContain('frame.width_min')
    expect(codes).toContain('frame.height_min')
    expect(codes).toContain('frame.width_max')
    expect(codes).toContain('frame.height_max')
  })

  it('detects total furniture width overflow including clearances', () => {
    const design = createDesign()
    design.installationSpace = {
      ...design.installationSpace,
      widthMm: 1700,
      leftClearanceMm: 100,
      rightClearanceMm: 100,
    }
    design.frames = [
      createFrame({ id: 'frame-a', orderIndex: 0, widthMm: 800 }),
      createFrame({ id: 'frame-b', orderIndex: 1, widthMm: 800 }),
    ]

    expect(validateDesign(design).some((issue) => issue.code === 'installation.width_overflow')).toBe(true)
  })

  it('detects overlapping drawers', () => {
    const design = createDesign()
    const frame = createFrame({ id: 'frame-overlap', orderIndex: 0 })
    frame.components = [
      createComponent('drawer', frame, { id: 'drawer-a', xMm: 20, yMm: 100 }),
      createComponent('deep-drawer', frame, { id: 'drawer-b', xMm: 20, yMm: 150 }),
    ]
    design.frames = [frame]

    expect(validateDesign(design).some((issue) => issue.code === 'component.drawer_overlap')).toBe(true)
  })
})
