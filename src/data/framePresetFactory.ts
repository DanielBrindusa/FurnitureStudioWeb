import { createComponent, createFrame } from '../models/factories'
import type { Frame, FurnitureComponent, LegacyCatalogItem } from '../models/design'

const shelf = (frame: Frame, yMm: number, widthMm = frame.widthMm - 36, xMm = 18): FurnitureComponent =>
  createComponent('shelf', frame, { yMm, widthMm, xMm, heightMm: 24 })

export function buildFrameFromPreset(preset: LegacyCatalogItem, orderIndex: number): Frame {
  const frame = createFrame({
    orderIndex,
    name: preset.name,
    widthMm: preset.dimensions.widthMm ?? 1000,
    heightMm: preset.dimensions.heightMm ?? 2360,
    depthMm: preset.dimensions.depthMm ?? 580,
  })

  switch (preset.id) {
    case 'frame-compact-hanging':
      frame.components = [
        shelf(frame, frame.heightMm - 280),
        createComponent('clothes-rail', frame, { yMm: frame.heightMm - 500, heightMm: 30, depthMm: 30 }),
      ]
      break

    case 'frame-shelf-storage':
      frame.components = Array.from({ length: 5 }, (_, index) => shelf(frame, 300 + index * 360))
      break

    case 'frame-drawer-storage':
      frame.components = [
        ...Array.from({ length: 4 }, (_, index) => createComponent('drawer', frame, { yMm: 90 + index * 210 })),
        shelf(frame, 1050),
        shelf(frame, 1550),
      ]
      break

    case 'frame-mixed-wardrobe': {
      const halfWidth = Math.floor((frame.widthMm - 54) / 2)
      frame.components = [
        createComponent('vertical-divider', frame, {
          xMm: Math.floor(frame.widthMm / 2) - 9,
          yMm: 18,
          widthMm: 18,
          heightMm: frame.heightMm - 36,
        }),
        shelf(frame, frame.heightMm - 300, halfWidth, 18),
        createComponent('clothes-rail', frame, {
          xMm: 18,
          yMm: frame.heightMm - 520,
          widthMm: halfWidth,
          heightMm: 30,
          depthMm: 30,
        }),
        ...Array.from({ length: 3 }, (_, index) => createComponent('drawer', frame, {
          xMm: Math.floor(frame.widthMm / 2) + 9,
          widthMm: halfWidth,
          yMm: 90 + index * 210,
        })),
        shelf(frame, 950, halfWidth, Math.floor(frame.widthMm / 2) + 9),
        shelf(frame, 1400, halfWidth, Math.floor(frame.widthMm / 2) + 9),
      ]
      break
    }

    case 'frame-shoe-storage':
      frame.components = Array.from({ length: 6 }, (_, index) =>
        createComponent('shoe-shelf', frame, { yMm: 180 + index * 260, heightMm: 60 }))
      break

    default:
      frame.components = []
  }

  return frame
}
