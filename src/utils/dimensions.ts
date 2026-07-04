export const FRAME_WIDTH_RANGE = { min: 10, max: 2070 } as const
export const FRAME_HEIGHT_RANGE = { min: 10, max: 2800 } as const

export type DimensionDisplayUnit = 'mm' | 'cm'

export function parseIntegerMm(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) ? value : null
  }

  if (typeof value !== 'string') return null

  const normalized = value.trim()
  if (!/^-?\d+$/.test(normalized)) return null

  const parsed = Number(normalized)
  return Number.isSafeInteger(parsed) ? parsed : null
}

/** Converts centimetres to an exact integer millimetre value without float math. */
export function cmToMm(value: string | number): number | null {
  const normalized = String(value).trim().replace(',', '.')
  const match = normalized.match(/^(-?)(\d+)(?:\.(\d+))?$/)
  if (!match) return null

  const sign = match[1] === '-' ? -1 : 1
  const whole = Number(match[2])
  const fraction = match[3] ?? ''

  if (!Number.isSafeInteger(whole)) return null
  if (fraction.length > 0 && !/^\d+$/.test(fraction)) return null

  const tenths = fraction.length > 0 ? Number(fraction[0]) : 0
  const remainder = fraction.slice(1)
  if (remainder && /[1-9]/.test(remainder)) return null

  const result = sign * (whole * 10 + tenths)
  return Number.isSafeInteger(result) ? result : null
}

/** Display-only conversion. Stored dimensions must remain integer millimetres. */
export function mmToCm(valueMm: number): number | null {
  if (!Number.isSafeInteger(valueMm)) return null
  return valueMm / 10
}

export function clampDimensionMm(value: unknown, minMm: number, maxMm: number): number | null {
  const parsed = parseIntegerMm(value)
  if (parsed === null || !Number.isSafeInteger(minMm) || !Number.isSafeInteger(maxMm)) {
    return null
  }

  return Math.min(Math.max(parsed, minMm), maxMm)
}

export function validateMmRange(value: unknown, minMm: number, maxMm: number): boolean {
  const parsed = parseIntegerMm(value)
  return parsed !== null && parsed >= minMm && parsed <= maxMm
}

export function formatDimensionLabel(valueMm: number, unit: DimensionDisplayUnit = 'cm'): string {
  if (!Number.isSafeInteger(valueMm)) return '—'
  if (unit === 'mm') return `${valueMm} mm`

  const sign = valueMm < 0 ? '-' : ''
  const absolute = Math.abs(valueMm)
  const wholeCm = Math.floor(absolute / 10)
  const remainingMm = absolute % 10
  const formatted = remainingMm === 0 ? `${wholeCm}` : `${wholeCm}.${remainingMm}`

  return `${sign}${formatted} cm`
}
