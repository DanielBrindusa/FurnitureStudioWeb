import type { InstallationSpace } from '../models/design'

export interface InstallationPreset {
  id: 'compact-niche' | 'standard-wall' | 'wide-wall' | 'tall-custom'
  nameKey: string
  values: InstallationSpace
}

export const installationPresets: InstallationPreset[] = [
  {
    id: 'compact-niche',
    nameKey: 'installation.compactNiche',
    values: {
      widthMm: 1600,
      heightMm: 2400,
      depthMm: 620,
      leftClearanceMm: 20,
      rightClearanceMm: 20,
      topClearanceMm: 30,
    },
  },
  {
    id: 'standard-wall',
    nameKey: 'installation.standardWall',
    values: {
      widthMm: 3000,
      heightMm: 2600,
      depthMm: 650,
      leftClearanceMm: 20,
      rightClearanceMm: 20,
      topClearanceMm: 30,
    },
  },
  {
    id: 'wide-wall',
    nameKey: 'installation.wideWall',
    values: {
      widthMm: 5000,
      heightMm: 2700,
      depthMm: 700,
      leftClearanceMm: 30,
      rightClearanceMm: 30,
      topClearanceMm: 40,
    },
  },
  {
    id: 'tall-custom',
    nameKey: 'installation.tallCustom',
    values: {
      widthMm: 3600,
      heightMm: 3000,
      depthMm: 700,
      leftClearanceMm: 25,
      rightClearanceMm: 25,
      topClearanceMm: 50,
    },
  },
]
