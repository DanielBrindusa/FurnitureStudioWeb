import { describe, expect, it } from 'vitest'
import {
  clampDimensionMm,
  cmToMm,
  formatDimensionLabel,
  mmToCm,
  parseIntegerMm,
  validateMmRange,
} from './dimensions'

describe('dimension utilities', () => {
  it('formats exact centimetre labels without float artefacts', () => {
    expect(formatDimensionLabel(2070)).toBe('207 cm')
    expect(formatDimensionLabel(2075)).toBe('207.5 cm')
    expect(formatDimensionLabel(10)).toBe('1 cm')
  })

  it('converts centimetres to integer millimetres', () => {
    expect(cmToMm('207.5')).toBe(2075)
    expect(cmToMm('207,5')).toBe(2075)
    expect(cmToMm('207.50')).toBe(2075)
    expect(cmToMm('207.55')).toBeNull()
    expect(mmToCm(2075)).toBe(207.5)
  })

  it('handles invalid input and ranges safely', () => {
    expect(parseIntegerMm('10.5')).toBeNull()
    expect(parseIntegerMm('not a number')).toBeNull()
    expect(clampDimensionMm('5000', 10, 2070)).toBe(2070)
    expect(validateMmRange(2070, 10, 2070)).toBe(true)
    expect(validateMmRange(2071, 10, 2070)).toBe(false)
  })
})
