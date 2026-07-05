import { describe, expect, it } from 'vitest'
import { createComponent, createDesign, createDoor, createFrame } from '../models/factories'
import { validateDesign } from './validationEngine'

describe('validation engine', () => {
  it('validates frame minimum and maximum dimensions', () => {
    const design = createDesign()
    design.furniture.frames = [
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
    design.furniture.frames = [
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
    design.furniture.frames = [frame]

    expect(validateDesign(design).some((issue) => issue.code === 'component.drawer_overlap')).toBe(true)
  })

  it('detects installation height overflow and out-of-bounds components', () => {
    const design = createDesign()
    design.installationSpace.heightMm = 2000
    const frame = createFrame({ id: 'too-tall', orderIndex: 0, heightMm: 2100 })
    frame.components = [createComponent('shelf', frame, { id: 'outside', yMm: 2090 })]
    design.furniture.frames = [frame]

    const codes = validateDesign(design).map((issue) => issue.code)
    expect(codes).toContain('installation.height_overflow')
    expect(codes).toContain('component.out_of_bounds')
  })

  it('validates sliding-door width and handle compatibility', () => {
    const design = createDesign()
    const frame = createFrame({ id: 'door-frame', orderIndex: 0, widthMm: 800 })
    frame.doors = [createDoor('sliding', frame, { id: 'sliding-door', handleId: 'round-soft-knob' })]
    design.furniture.frames = [frame]

    const codes = validateDesign(design).map((issue) => issue.code)
    expect(codes).toContain('door.sliding_width')
    expect(codes).toContain('door.handle_incompatible')
  })
})
