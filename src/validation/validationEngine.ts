import { getHandle } from '../data/catalog'
import type {
  Design,
  Door,
  Frame,
  FurnitureComponent,
  FurnitureComponentType,
  ValidationResult,
  ValidationSeverity,
  PlacementFeedback,
} from '../models/design'
import { FRAME_HEIGHT_RANGE, FRAME_WIDTH_RANGE } from '../utils/dimensions'

const DRAWER_TYPES = new Set<FurnitureComponentType>(['drawer', 'deep-drawer'])
const BASKET_TYPES = new Set<FurnitureComponentType>(['wire-basket', 'laundry-basket'])
const SHELF_TYPES = new Set<FurnitureComponentType>(['shelf', 'shoe-shelf', 'angled-shoe-shelf'])
const STORAGE_VOLUME_TYPES = new Set<FurnitureComponentType>([
  'drawer',
  'deep-drawer',
  'wire-basket',
  'laundry-basket',
  'pull-out-tray',
  'accessory-tray',
  'small-organizer',
])

const DEPTH_REQUIREMENTS: Partial<Record<FurnitureComponentType, number>> = {
  'drawer': 450,
  'deep-drawer': 550,
  'wire-basket': 430,
  'pull-out-tray': 450,
  'accessory-tray': 450,
  'trouser-rail': 450,
  'laundry-basket': 550,
  'angled-shoe-shelf': 350,
  'small-organizer': 400,
}

function makeIssue(
  severity: ValidationSeverity,
  code: string,
  targetId: string,
  messageKey: string,
  suggestedFixKey: string,
  discriminator = '',
): ValidationResult {
  return {
    id: [code, targetId, discriminator].filter(Boolean).join(':'),
    severity,
    code,
    messageKey,
    targetId,
    suggestedFixKey,
  }
}

export function rectanglesOverlap(a: FurnitureComponent, b: FurnitureComponent): boolean {
  return (
    a.xMm < b.xMm + b.widthMm &&
    a.xMm + a.widthMm > b.xMm &&
    a.yMm < b.yMm + b.heightMm &&
    a.yMm + a.heightMm > b.yMm
  )
}

export function evaluateComponentPlacement(
  frame: Frame,
  component: FurnitureComponent,
  ignoredComponentId?: string,
): PlacementFeedback {
  const insideFrame = component.xMm >= 18 &&
    component.yMm >= 18 &&
    component.widthMm > 0 &&
    component.heightMm > 0 &&
    component.xMm + component.widthMm <= frame.widthMm - 18 &&
    component.yMm + component.heightMm <= frame.heightMm - 18

  if (!insideFrame) return { valid: false, messageKey: 'placement.outOfBounds' }

  const minimumDepth = DEPTH_REQUIREMENTS[component.type]
  if (component.depthMm > frame.depthMm || (minimumDepth && frame.depthMm < minimumDepth)) {
    return { valid: false, messageKey: 'placement.needsDeeperFrame' }
  }

  if (component.type === 'clothes-rail' && component.yMm < 900) {
    return { valid: false, messageKey: 'placement.railClearance' }
  }

  if ((component.type === 'led-light-strip' && component.yMm < frame.heightMm - 300) ||
      (component.type === 'sensor-light' && component.yMm < frame.heightMm - 400)) {
    return { valid: false, messageKey: 'placement.lightTopZone' }
  }

  if (component.type === 'handle' || component.type === 'knob') {
    return { valid: false, messageKey: 'placement.doorHardware' }
  }

  const collision = frame.components.some((existing) =>
    existing.id !== ignoredComponentId && rectanglesOverlap(existing, component),
  )
  if (collision) return { valid: false, messageKey: 'placement.collision' }

  return { valid: true, messageKey: 'placement.valid' }
}

function validateFrameDimensions(frame: Frame): ValidationResult[] {
  const issues: ValidationResult[] = []

  if (frame.widthMm < FRAME_WIDTH_RANGE.min) {
    issues.push(makeIssue('error', 'frame.width_min', frame.id, 'validation.frameWidthMin', 'fix.increaseFrameWidth'))
  }
  if (frame.widthMm > FRAME_WIDTH_RANGE.max) {
    issues.push(makeIssue('error', 'frame.width_max', frame.id, 'validation.frameWidthMax', 'fix.reduceFrameWidth'))
  }
  if (frame.heightMm < FRAME_HEIGHT_RANGE.min) {
    issues.push(makeIssue('error', 'frame.height_min', frame.id, 'validation.frameHeightMin', 'fix.increaseFrameHeight'))
  }
  if (frame.heightMm > FRAME_HEIGHT_RANGE.max) {
    issues.push(makeIssue('error', 'frame.height_max', frame.id, 'validation.frameHeightMax', 'fix.reduceFrameHeight'))
  }
  if (frame.depthMm <= 0) {
    issues.push(makeIssue('error', 'frame.depth_positive', frame.id, 'validation.frameDepthPositive', 'fix.increaseFrameDepth'))
  }

  if (frame.widthMm < 250 || frame.heightMm < 500 || frame.depthMm < 200) {
    issues.push(makeIssue('warning', 'frame.unusual_tiny', frame.id, 'validation.unusualTinyDimensions', 'fix.reviewDimensions'))
  }

  if (frame.components.length === 0) {
    issues.push(makeIssue('warning', 'frame.empty', frame.id, 'validation.emptyFrame', 'fix.addInteriorComponent'))
  }

  if (frame.components.length > 10) {
    issues.push(makeIssue('warning', 'frame.crowded', frame.id, 'validation.crowdedFrame', 'fix.removeOrRepositionComponents'))
  }

  return issues
}

function validateComponent(frame: Frame, component: FurnitureComponent): ValidationResult[] {
  const issues: ValidationResult[] = []
  const dimensions = [
    component.widthMm,
    component.heightMm,
    component.depthMm,
    component.xMm,
    component.yMm,
  ]

  if (!dimensions.every(Number.isSafeInteger)) {
    issues.push(makeIssue('error', 'component.integer_dimensions', component.id, 'validation.integerDimensions', 'fix.useWholeMillimetres'))
    return issues
  }

  const isOutside =
    component.xMm < 0 ||
    component.yMm < 0 ||
    component.widthMm <= 0 ||
    component.heightMm <= 0 ||
    component.depthMm <= 0 ||
    component.xMm + component.widthMm > frame.widthMm ||
    component.yMm + component.heightMm > frame.heightMm ||
    component.depthMm > frame.depthMm

  if (isOutside) {
    issues.push(makeIssue('error', 'component.out_of_bounds', component.id, 'validation.componentOutOfBounds', 'fix.moveInsideFrame'))
  }

  if (component.type === 'clothes-rail' && component.yMm < 900) {
    issues.push(makeIssue('warning', 'component.rail_clearance', component.id, 'validation.railClearance', 'fix.raiseClothesRail'))
  }

  if (component.type === 'vertical-divider' && component.heightMm > frame.heightMm) {
    issues.push(makeIssue('error', 'component.divider_fit', component.id, 'validation.dividerDoesNotFit', 'fix.resizeDivider'))
  }

  const minimumDepth = DEPTH_REQUIREMENTS[component.type]
  if (minimumDepth && frame.depthMm < minimumDepth) {
    const messageKey = component.type === 'pull-out-tray'
      ? 'validation.pullOutDepth'
      : 'validation.accessoryDepth'
    issues.push(makeIssue('error', 'component.depth_compatibility', component.id, messageKey, 'fix.chooseDeeperFrame'))
  }

  if (component.type === 'led-light-strip' && component.yMm < frame.heightMm - 300) {
    issues.push(makeIssue('warning', 'component.light_position', component.id, 'validation.lightingPlacement', 'fix.moveLightToTop'))
  }

  if (component.type === 'sensor-light' && component.yMm < frame.heightMm - 400) {
    issues.push(makeIssue('warning', 'component.sensor_position', component.id, 'validation.sensorPlacement', 'fix.moveLightToTop'))
  }

  return issues
}

function validateComponentOverlaps(frame: Frame): ValidationResult[] {
  const issues: ValidationResult[] = []

  for (let firstIndex = 0; firstIndex < frame.components.length; firstIndex += 1) {
    const first = frame.components[firstIndex]
    if (!first) continue

    for (let secondIndex = firstIndex + 1; secondIndex < frame.components.length; secondIndex += 1) {
      const second = frame.components[secondIndex]
      if (!second || !rectanglesOverlap(first, second)) continue

      const discriminator = [first.id, second.id].sort().join('-')

      if (DRAWER_TYPES.has(first.type) && DRAWER_TYPES.has(second.type)) {
        issues.push(makeIssue('error', 'component.drawer_overlap', first.id, 'validation.drawerOverlap', 'fix.repositionComponents', discriminator))
      } else if (BASKET_TYPES.has(first.type) && BASKET_TYPES.has(second.type)) {
        issues.push(makeIssue('error', 'component.basket_overlap', first.id, 'validation.basketOverlap', 'fix.repositionComponents', discriminator))
      } else if (SHELF_TYPES.has(first.type) && SHELF_TYPES.has(second.type)) {
        issues.push(makeIssue('error', 'component.shelf_overlap', first.id, 'validation.shelfOverlap', 'fix.spaceShelves', discriminator))
      } else if (STORAGE_VOLUME_TYPES.has(first.type) && STORAGE_VOLUME_TYPES.has(second.type)) {
        issues.push(makeIssue('error', 'component.overlap', first.id, 'validation.componentOverlap', 'fix.repositionComponents', discriminator))
      } else {
        issues.push(makeIssue('error', 'component.overlap', first.id, 'validation.componentOverlap', 'fix.repositionComponents', discriminator))
      }
    }
  }

  return issues
}

function validateDoor(frame: Frame, door: Door): ValidationResult[] {
  const issues: ValidationResult[] = []

  if ((door.type === 'sliding' && frame.widthMm < 1000) ||
      (door.type === 'double-sliding' && frame.widthMm < 1400)) {
    issues.push(makeIssue('error', 'door.sliding_width', door.id, 'validation.slidingDoorWidth', 'fix.increaseFrameWidthOrChangeDoor'))
  }

  if (['hinged', 'mirror', 'glass-look', 'flat-panel', 'framed-panel'].includes(door.type) && frame.widthMm < 300) {
    issues.push(makeIssue('error', 'door.hinged_width', door.id, 'validation.hingedDoorWidth', 'fix.increaseFrameWidthOrOpenFront'))
  }

  if (door.type === 'hinged' && frame.widthMm > 700) {
    issues.push(makeIssue('warning', 'door.hinged_wide', door.id, 'validation.hingedDoorWide', 'fix.chooseSlidingOrNarrowerDoor'))
  }

  if (door.heightMm !== undefined && Math.abs(door.heightMm - frame.heightMm) > 3) {
    issues.push(makeIssue('error', 'door.height_mismatch', door.id, 'validation.doorHeightCompatibility', 'fix.matchDoorHeight'))
  }

  const requiresHandle = ['hinged', 'mirror', 'glass-look', 'flat-panel', 'framed-panel'].includes(door.type)
  if (requiresHandle && !door.handleId) {
    issues.push(makeIssue('warning', 'door.handle_required', door.id, 'validation.handleRequired', 'fix.chooseHandle'))
  }

  if (door.handleId) {
    const handle = getHandle(door.handleId)
    const supportedDoorTypes = handle?.rules.doorTypes
    const isCompatible = Array.isArray(supportedDoorTypes) && supportedDoorTypes.includes(door.type)

    if (!handle || !isCompatible) {
      issues.push(makeIssue('error', 'door.handle_incompatible', door.id, 'validation.handleCompatibility', 'fix.chooseCompatibleHandle'))
    }
  }

  return issues
}

export function validateDesign(design: Design): ValidationResult[] {
  const issues: ValidationResult[] = []
  const { installationSpace } = design

  if (design.frames.length === 0) {
    return [makeIssue('warning', 'design.empty', design.id, 'validation.emptyDesign', 'fix.addFrame')]
  }

  const totalFurnitureWidth = design.frames.reduce((total, frame) => total + frame.widthMm, 0)
  const requiredWidth = totalFurnitureWidth + installationSpace.leftClearanceMm + installationSpace.rightClearanceMm

  if (requiredWidth > installationSpace.widthMm) {
    issues.push(makeIssue('error', 'installation.width_overflow', design.id, 'validation.installationWidthOverflow', 'fix.reduceTotalWidth'))
  }

  for (const frame of design.frames) {
    issues.push(...validateFrameDimensions(frame))

    if (frame.heightMm + installationSpace.topClearanceMm > installationSpace.heightMm) {
      issues.push(makeIssue('error', 'installation.height_overflow', frame.id, 'validation.installationHeightOverflow', 'fix.reduceFrameHeight'))
    }

    if (frame.depthMm > installationSpace.depthMm) {
      issues.push(makeIssue('error', 'installation.depth_overflow', frame.id, 'validation.installationDepthOverflow', 'fix.reduceFrameDepth'))
    }

    for (const component of frame.components) {
      issues.push(...validateComponent(frame, component))
    }

    issues.push(...validateComponentOverlaps(frame))

    for (const door of frame.doors) {
      issues.push(...validateDoor(frame, door))
    }
  }

  return issues
}

export const hasBlockingErrors = (results: ValidationResult[]): boolean =>
  results.some((result) => result.severity === 'error')
