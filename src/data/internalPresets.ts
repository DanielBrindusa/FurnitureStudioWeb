import { createComponent } from '../models/factories'
import type { Frame, FurnitureComponent } from '../models/design'

export type InternalPresetId =
  | 'basic-hanging'
  | 'shelves-only'
  | 'drawer-stack'
  | 'mixed-storage'
  | 'shoes-accessories'
  | 'laundry-baskets'

export const internalPresetIds: InternalPresetId[] = [
  'basic-hanging',
  'shelves-only',
  'drawer-stack',
  'mixed-storage',
  'shoes-accessories',
  'laundry-baskets',
]

export interface InternalPresetResult {
  components: FurnitureComponent[]
  fits: boolean
  messageKey: string
}

const shelf = (frame: Frame, yMm: number, widthMm = frame.widthMm - 36, xMm = 18) =>
  createComponent('shelf', frame, { xMm, yMm, widthMm, heightMm: 24 })

export function buildInternalPreset(id: InternalPresetId, frame: Frame): InternalPresetResult {
  const innerWidth = Math.max(100, frame.widthMm - 36)
  const halfWidth = Math.max(120, Math.floor((frame.widthMm - 54) / 2))
  let components: FurnitureComponent[] = []
  let fits = true

  switch (id) {
    case 'basic-hanging':
      fits = frame.heightMm >= 1200 && frame.depthMm >= 450
      components = [
        shelf(frame, frame.heightMm - 280),
        createComponent('clothes-rail', frame, { yMm: frame.heightMm - 520, widthMm: innerWidth }),
        shelf(frame, 120),
      ]
      break

    case 'shelves-only': {
      fits = frame.heightMm >= 600
      const count = Math.max(2, Math.min(7, Math.floor((frame.heightMm - 220) / 320)))
      const spacing = Math.floor((frame.heightMm - 240) / count)
      components = Array.from({ length: count }, (_, index) => shelf(frame, 120 + index * spacing))
      break
    }

    case 'drawer-stack':
      fits = frame.heightMm >= 900 && frame.depthMm >= 450 && frame.widthMm >= 380
      components = [
        ...Array.from({ length: 3 }, (_, index) => createComponent('drawer', frame, { yMm: 90 + index * 205, widthMm: innerWidth })),
        shelf(frame, 760),
      ]
      break

    case 'mixed-storage':
      fits = frame.heightMm >= 1500 && frame.depthMm >= 450 && frame.widthMm >= 700
      components = [
        createComponent('vertical-divider', frame, { xMm: Math.floor(frame.widthMm / 2) - 9, yMm: 18, widthMm: 18, heightMm: frame.heightMm - 36 }),
        createComponent('clothes-rail', frame, { xMm: 18, yMm: frame.heightMm - 420, widthMm: halfWidth }),
        shelf(frame, frame.heightMm - 220, halfWidth, 18),
        ...Array.from({ length: 3 }, (_, index) => createComponent('drawer', frame, { xMm: Math.floor(frame.widthMm / 2) + 9, yMm: 90 + index * 205, widthMm: halfWidth })),
        shelf(frame, 790, halfWidth, Math.floor(frame.widthMm / 2) + 9),
      ]
      break

    case 'shoes-accessories': {
      fits = frame.heightMm >= 900 && frame.depthMm >= 350
      const count = Math.max(3, Math.min(6, Math.floor(frame.heightMm / 300)))
      components = [
        ...Array.from({ length: count }, (_, index) => createComponent('angled-shoe-shelf', frame, { yMm: 120 + index * 250, widthMm: innerWidth })),
        createComponent('accessory-tray', frame, { yMm: Math.min(frame.heightMm - 170, 120 + count * 250), widthMm: innerWidth }),
      ]
      break
    }

    case 'laundry-baskets':
      fits = frame.heightMm >= 1200 && frame.depthMm >= 550 && frame.widthMm >= 450
      components = [
        createComponent('laundry-basket', frame, { yMm: 90, widthMm: innerWidth }),
        createComponent('wire-basket', frame, { yMm: 660, widthMm: innerWidth }),
        createComponent('wire-basket', frame, { yMm: 890, widthMm: innerWidth }),
        shelf(frame, 1140),
      ]
      break
  }

  return {
    components: fits ? components : [],
    fits,
    messageKey: fits ? 'preset.applied' : 'preset.doesNotFit',
  }
}
