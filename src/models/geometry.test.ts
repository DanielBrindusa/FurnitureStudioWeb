import { describe, expect, it } from 'vitest'
import { createComponent, createFrame } from './factories'
import {
  calculateAutoFitCameraDistance,
  calculateComponentBoundingBox,
  calculateFrameBoundingBox,
  calculateFurnitureBounds,
  clampFrameHeight,
  clampFrameWidth,
  detect2DVerticalOverlap,
  detect3DOverlap,
  displayCmToMm,
  getFrameInnerDepth,
  getFrameInnerHeight,
  getFrameInnerWidth,
  mmToDisplayCm,
  mmToMetersFor3D,
} from './geometry'

describe('3D geometry helpers', () => {
  it('converts and clamps dimensions without changing the integer-mm source of truth', () => {
    expect(mmToMetersFor3D(1250)).toBe(1.25)
    expect(mmToDisplayCm(1255)).toBe(125.5)
    expect(displayCmToMm('125.5')).toBe(1255)
    expect(displayCmToMm('125.55')).toBeNull()
    expect(clampFrameWidth(1)).toBe(10)
    expect(clampFrameWidth(3000)).toBe(2070)
    expect(clampFrameHeight(1)).toBe(10)
    expect(clampFrameHeight(3000)).toBe(2800)
    expect(() => mmToMetersFor3D(1.5)).toThrow(RangeError)
  })

  it('calculates inner dimensions and global 3D bounds', () => {
    const first = createFrame({ orderIndex: 0, xMm: 20, widthMm: 1000, heightMm: 2400, depthMm: 580, boardThicknessMm: 18 })
    const second = createFrame({ orderIndex: 1, xMm: 1020, widthMm: 800, heightMm: 2200, depthMm: 450 })
    expect(getFrameInnerWidth(first)).toBe(964)
    expect(getFrameInnerHeight(first)).toBe(2364)
    expect(getFrameInnerDepth(first)).toBe(562)
    expect(calculateFrameBoundingBox(first).max).toEqual({ x: 1020, y: 2400, z: 580 })
    expect(calculateFurnitureBounds([first, second]).size).toEqual({ width: 1800, height: 2400, depth: 580 })
    expect(calculateAutoFitCameraDistance(calculateFurnitureBounds([first, second]))).toBeGreaterThan(0)
  })

  it('detects vertical and full 3D overlap', () => {
    const frame = createFrame({ orderIndex: 0 })
    const first = createComponent('drawer', frame, { positionMm: { x: 20, y: 100, z: 20 }, sizeMm: { width: 500, height: 180, depth: 450 } })
    const second = createComponent('drawer', frame, { positionMm: { x: 20, y: 200, z: 20 }, sizeMm: { width: 500, height: 180, depth: 450 } })
    expect(detect2DVerticalOverlap(first, second)).toBe(true)
    expect(detect3DOverlap(calculateComponentBoundingBox(first), calculateComponentBoundingBox(second))).toBe(true)
    const separated = { ...calculateComponentBoundingBox(second), min: { x: 900, y: 200, z: 20 }, max: { x: 1400, y: 380, z: 470 } }
    expect(detect3DOverlap(calculateComponentBoundingBox(first), separated)).toBe(false)
  })
})
