export type Millimetres = number

export interface PositionMm {
  x: Millimetres
  y: Millimetres
  z: Millimetres
}

export interface SizeMm {
  width: Millimetres
  height: Millimetres
  depth: Millimetres
}

export interface BoundingBox3D {
  min: PositionMm
  max: PositionMm
  size: SizeMm
}

export interface FrameGeometryLike {
  widthMm: Millimetres
  heightMm: Millimetres
  depthMm: Millimetres
  xMm: Millimetres
  yMm: Millimetres
  zMm: Millimetres
  boardThicknessMm: Millimetres
  backPanelEnabled: boolean
}

export interface ComponentGeometryLike {
  positionMm: PositionMm
  sizeMm: SizeMm
}

export const FRAME_WIDTH_RANGE_MM = { min: 10, max: 2070 } as const
export const FRAME_HEIGHT_RANGE_MM = { min: 10, max: 2800 } as const

const assertIntegerMm = (value: number, label: string): number => {
  if (!Number.isSafeInteger(value)) throw new RangeError(`${label} must be a safe integer millimetre value`)
  return value
}

export function mmToMetersFor3D(valueMm: Millimetres): number {
  return assertIntegerMm(valueMm, 'Millimetres') / 1000
}

export function mmToDisplayCm(valueMm: Millimetres): number {
  return assertIntegerMm(valueMm, 'Millimetres') / 10
}

export function displayCmToMm(valueCm: string | number): Millimetres | null {
  const normalized = String(valueCm).trim().replace(',', '.')
  const match = normalized.match(/^(-?)(\d+)(?:\.(\d+))?$/)
  if (!match) return null
  const whole = Number(match[2])
  const fraction = match[3] ?? ''
  if (!Number.isSafeInteger(whole) || (fraction.slice(1) && /[1-9]/.test(fraction.slice(1)))) return null
  const millimetres = whole * 10 + Number(fraction[0] ?? 0)
  const signed = match[1] === '-' ? -millimetres : millimetres
  return Number.isSafeInteger(signed) ? signed : null
}

export function clampFrameWidth(valueMm: number): Millimetres {
  return Math.min(FRAME_WIDTH_RANGE_MM.max, Math.max(FRAME_WIDTH_RANGE_MM.min, Math.round(valueMm)))
}

export function clampFrameHeight(valueMm: number): Millimetres {
  return Math.min(FRAME_HEIGHT_RANGE_MM.max, Math.max(FRAME_HEIGHT_RANGE_MM.min, Math.round(valueMm)))
}

export function getFrameInnerWidth(frame: Pick<FrameGeometryLike, 'widthMm' | 'boardThicknessMm'>): Millimetres {
  return Math.max(0, frame.widthMm - frame.boardThicknessMm * 2)
}

export function getFrameInnerHeight(frame: Pick<FrameGeometryLike, 'heightMm' | 'boardThicknessMm'>): Millimetres {
  return Math.max(0, frame.heightMm - frame.boardThicknessMm * 2)
}

export function getFrameInnerDepth(frame: Pick<FrameGeometryLike, 'depthMm' | 'boardThicknessMm' | 'backPanelEnabled'>): Millimetres {
  return Math.max(0, frame.depthMm - (frame.backPanelEnabled ? frame.boardThicknessMm : 0))
}

const createBoundingBox = (position: PositionMm, size: SizeMm): BoundingBox3D => ({
  min: { ...position },
  max: {
    x: position.x + size.width,
    y: position.y + size.height,
    z: position.z + size.depth,
  },
  size: { ...size },
})

export function calculateFrameBoundingBox(frame: FrameGeometryLike): BoundingBox3D {
  return createBoundingBox(
    { x: frame.xMm, y: frame.yMm, z: frame.zMm },
    { width: frame.widthMm, height: frame.heightMm, depth: frame.depthMm },
  )
}

export function calculateComponentBoundingBox(
  component: ComponentGeometryLike,
  frameOrigin: PositionMm = { x: 0, y: 0, z: 0 },
): BoundingBox3D {
  return createBoundingBox({
    x: frameOrigin.x + component.positionMm.x,
    y: frameOrigin.y + component.positionMm.y,
    z: frameOrigin.z + component.positionMm.z,
  }, component.sizeMm)
}

export function detect2DVerticalOverlap(
  first: Pick<ComponentGeometryLike, 'positionMm' | 'sizeMm'>,
  second: Pick<ComponentGeometryLike, 'positionMm' | 'sizeMm'>,
): boolean {
  return first.positionMm.y < second.positionMm.y + second.sizeMm.height &&
    first.positionMm.y + first.sizeMm.height > second.positionMm.y
}

export function detect3DOverlap(first: BoundingBox3D, second: BoundingBox3D): boolean {
  return first.min.x < second.max.x && first.max.x > second.min.x &&
    first.min.y < second.max.y && first.max.y > second.min.y &&
    first.min.z < second.max.z && first.max.z > second.min.z
}

export function calculateFurnitureBounds(frames: readonly FrameGeometryLike[]): BoundingBox3D {
  if (frames.length === 0) return createBoundingBox({ x: 0, y: 0, z: 0 }, { width: 0, height: 0, depth: 0 })
  const boxes = frames.map(calculateFrameBoundingBox)
  const min = {
    x: Math.min(...boxes.map((box) => box.min.x)),
    y: Math.min(...boxes.map((box) => box.min.y)),
    z: Math.min(...boxes.map((box) => box.min.z)),
  }
  const max = {
    x: Math.max(...boxes.map((box) => box.max.x)),
    y: Math.max(...boxes.map((box) => box.max.y)),
    z: Math.max(...boxes.map((box) => box.max.z)),
  }
  return createBoundingBox(min, { width: max.x - min.x, height: max.y - min.y, depth: max.z - min.z })
}

export function calculateAutoFitCameraDistance(
  bounds: BoundingBox3D,
  verticalFieldOfViewDeg = 45,
  paddingMultiplier = 1.25,
): number {
  const largestMm = Math.max(bounds.size.width, bounds.size.height, bounds.size.depth, 1)
  const halfMetres = mmToMetersFor3D(Math.ceil(largestMm)) / 2
  const halfFovRadians = Math.max(1, Math.min(179, verticalFieldOfViewDeg)) * Math.PI / 360
  return (halfMetres / Math.tan(halfFovRadians)) * Math.max(1, paddingMultiplier)
}
