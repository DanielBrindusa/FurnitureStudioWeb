import { useMemo, useState, type DragEvent, type PointerEvent } from 'react'
import { componentCatalog } from '../data/catalog'
import { componentCatalogMeta, componentGroups } from '../data/componentCatalogMeta'
import { createComponent } from '../models/factories'
import type { Frame, FurnitureComponent, FurnitureComponentType } from '../models/design'
import { formatEstimatedPrice } from '../pricing/priceEngine'
import { useDesign } from '../state/designState'
import { evaluateComponentPlacement } from '../validation/validationEngine'

function findPlacement(frame: Frame, itemId: string): FurnitureComponent | null {
  const item = componentCatalog.find((candidate) => candidate.id === itemId)
  if (!item || item.type === 'frame' || ['open', 'hinged', 'sliding', 'double-sliding', 'mirror', 'glass-look', 'flat-panel', 'framed-panel'].includes(item.type)) return null
  const type = item.type as FurnitureComponentType

  const component = createComponent(type, frame, {
    name: item.name,
    widthMm: type === 'vertical-divider' || type === 'side-cover-panel'
      ? 18
      : type === 'sensor-light' || type === 'knob' || type === 'handle'
        ? item.dimensions.widthMm ?? 80
        : Math.max(40, frame.widthMm - 36),
    heightMm: item.dimensions.heightMm ?? (type === 'vertical-divider' || type === 'side-cover-panel' ? Math.max(24, frame.heightMm - 36) : 24),
    depthMm: Math.min(item.dimensions.depthMm ?? frame.depthMm - 20, Math.max(1, frame.depthMm - 20)),
  })

  if (type === 'vertical-divider') component.xMm = Math.floor(frame.widthMm / 2) - 9
  if (type === 'sensor-light') component.xMm = Math.floor((frame.widthMm - component.widthMm) / 2)

  const preferred = [component.yMm, ...Array.from({ length: Math.max(1, Math.floor(frame.heightMm / 50)) }, (_, index) => 50 + index * 50)]
  for (const yMm of preferred) {
    const candidate = { ...component, yMm: Math.min(frame.heightMm - component.heightMm - 18, yMm) }
    if (evaluateComponentPlacement(frame, candidate).valid) return candidate
  }
  return component
}

export function ComponentCatalogPanel({
  frame,
  t,
  onDragStart,
  onDragEnd,
  onAdded,
}: {
  frame: Frame | null
  t: (key: string) => string
  onDragStart: (itemId: string) => void
  onDragEnd: () => void
  onAdded: () => void
}) {
  const { state, dispatch } = useDesign()
  const [activeGroup, setActiveGroup] = useState(componentGroups[0])
  const [notice, setNotice] = useState<string | null>(null)
  const items = useMemo(
    () => componentCatalog.filter((item) => componentCatalogMeta[item.type as keyof typeof componentCatalogMeta]?.group === activeGroup),
    [activeGroup],
  )

  const addItem = (itemId: string) => {
    if (!frame) {
      setNotice('catalog.selectFrameFirst')
      return
    }
    const component = findPlacement(frame, itemId)
    if (!component) return
    const placement = evaluateComponentPlacement(frame, component)
    if (!placement.valid) {
      setNotice(placement.messageKey)
      return
    }
    dispatch({ type: 'COMPONENT_ADD', frameId: frame.id, component })
    dispatch({ type: 'ITEM_SELECT', selectedItem: { kind: 'component', id: component.id } })
    setNotice('placement.added')
    onAdded()
  }

  const startPointerDrag = (event: PointerEvent<HTMLElement>, itemId: string) => {
    if (!event.isPrimary || (event.target as HTMLElement).closest('button')) return
    onDragStart(itemId)
    setNotice(null)
  }

  const startNativeDrag = (event: DragEvent<HTMLElement>, itemId: string) => {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('application/x-furniture-component', itemId)
    event.dataTransfer.setData('text/plain', itemId)
    onDragStart(itemId)
    setNotice(null)
  }

  return (
    <section className="component-catalog panel-section">
      <div className="section-heading">
        <div><span>{t('nav.outfit')}</span><h2>{t('catalog.components')}</h2></div>
        <span>{componentCatalog.length}</span>
      </div>

      <div className="component-category-tabs" role="tablist" aria-label={t('catalog.categories')}>
        {componentGroups.map((group) => (
          <button key={group} type="button" role="tab" aria-selected={activeGroup === group} onClick={() => setActiveGroup(group)}>
            {t(`catalog.group.${group}`)}
          </button>
        ))}
      </div>

      <p className="catalog-drag-hint">{frame ? t('catalog.dragHint') : t('catalog.selectFrameFirst')}</p>
      {notice && <p className="catalog-notice" role="status">{t(notice)}</p>}

      <div className="component-catalog-list">
        {items.map((item) => {
          const meta = componentCatalogMeta[item.type as keyof typeof componentCatalogMeta]
          if (!meta) return null
          return (
            <article
              className="component-catalog-card"
              key={item.id}
              draggable={Boolean(frame)}
              onDragStart={(event) => startNativeDrag(event, item.id)}
              onDragEnd={onDragEnd}
              onPointerDown={(event) => startPointerDrag(event, item.id)}
              onPointerCancel={onDragEnd}
            >
              <span className={`component-icon is-${item.type}`} aria-hidden="true">{meta.icon}</span>
              <span className="component-card-copy">
                <strong>{t(`component.${item.type}`)}</strong>
                <small>{t(meta.descriptionKey)}</small>
                <em>{formatEstimatedPrice(item.price, state.design.language)} · {t(meta.hintKey)}</em>
              </span>
              <button type="button" disabled={!frame} onClick={() => addItem(item.id)} aria-label={`${t('button.add')} ${t(`component.${item.type}`)}`}>
                <span aria-hidden="true">＋</span>
              </button>
              <span className="drag-grip" aria-hidden="true">⠿</span>
            </article>
          )
        })}
      </div>
    </section>
  )
}
