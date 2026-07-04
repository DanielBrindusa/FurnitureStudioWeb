import type { FurnitureComponentType } from '../models/design'

export type ComponentGroupId = 'structure' | 'hanging' | 'drawers' | 'shoes' | 'accessories' | 'lighting'

export interface ComponentCatalogMeta {
  group: ComponentGroupId
  icon: string
  descriptionKey: string
  hintKey: string
}

export const componentGroups: ComponentGroupId[] = [
  'structure',
  'hanging',
  'drawers',
  'shoes',
  'accessories',
  'lighting',
]

export const componentCatalogMeta: Record<FurnitureComponentType, ComponentCatalogMeta> = {
  shelf: { group: 'structure', icon: '━', descriptionKey: 'catalog.shelf.description', hintKey: 'catalog.hint.customWidth' },
  'vertical-divider': { group: 'structure', icon: '┃', descriptionKey: 'catalog.divider.description', hintKey: 'catalog.hint.fullHeight' },
  'top-cover-panel': { group: 'structure', icon: '▔', descriptionKey: 'catalog.topPanel.description', hintKey: 'catalog.hint.exterior' },
  'side-cover-panel': { group: 'structure', icon: '▏', descriptionKey: 'catalog.sidePanel.description', hintKey: 'catalog.hint.exterior' },
  'plinth-base': { group: 'structure', icon: '▂', descriptionKey: 'catalog.plinth.description', hintKey: 'catalog.hint.customWidth' },
  'clothes-rail': { group: 'hanging', icon: '⌁', descriptionKey: 'catalog.clothesRail.description', hintKey: 'catalog.hint.depth45' },
  'trouser-rail': { group: 'hanging', icon: '≋', descriptionKey: 'catalog.trouserRail.description', hintKey: 'catalog.hint.depth45' },
  drawer: { group: 'drawers', icon: '▤', descriptionKey: 'catalog.drawer.description', hintKey: 'catalog.hint.depth45' },
  'deep-drawer': { group: 'drawers', icon: '▥', descriptionKey: 'catalog.deepDrawer.description', hintKey: 'catalog.hint.depth58' },
  'pull-out-tray': { group: 'drawers', icon: '▱', descriptionKey: 'catalog.pullOut.description', hintKey: 'catalog.hint.depth45' },
  'wire-basket': { group: 'drawers', icon: '▦', descriptionKey: 'catalog.wireBasket.description', hintKey: 'catalog.hint.depth45' },
  'laundry-basket': { group: 'drawers', icon: '▧', descriptionKey: 'catalog.laundry.description', hintKey: 'catalog.hint.depth58' },
  'shoe-shelf': { group: 'shoes', icon: '▰', descriptionKey: 'catalog.shoeShelf.description', hintKey: 'catalog.hint.depth35' },
  'angled-shoe-shelf': { group: 'shoes', icon: '◩', descriptionKey: 'catalog.angledShoe.description', hintKey: 'catalog.hint.depth35' },
  'accessory-tray': { group: 'accessories', icon: '▦', descriptionKey: 'catalog.accessoryTray.description', hintKey: 'catalog.hint.depth45' },
  'small-organizer': { group: 'accessories', icon: '⊞', descriptionKey: 'catalog.organizer.description', hintKey: 'catalog.hint.depth45' },
  handle: { group: 'accessories', icon: '│', descriptionKey: 'catalog.handle.description', hintKey: 'catalog.hint.doorHardware' },
  knob: { group: 'accessories', icon: '●', descriptionKey: 'catalog.knob.description', hintKey: 'catalog.hint.doorHardware' },
  'led-light-strip': { group: 'lighting', icon: '✦', descriptionKey: 'catalog.led.description', hintKey: 'catalog.hint.topZone' },
  'sensor-light': { group: 'lighting', icon: '◉', descriptionKey: 'catalog.sensor.description', hintKey: 'catalog.hint.topZone' },
}
