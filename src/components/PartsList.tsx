import { useEffect, useMemo, useRef, useState } from 'react'
import { derivePartsList, groupParts, type PartsGrouping } from '../export/partsList'
import { formatEstimatedPrice } from '../pricing/priceEngine'
import { useDesign } from '../state/designState'

export function PartsList({ t }: { t: (key: string) => string }) {
  const { state } = useDesign()
  const [grouping, setGrouping] = useState<PartsGrouping>('category')
  const rows = useMemo(() => derivePartsList(state.design, state.validation), [state.design, state.validation])
  const [isOpen, setIsOpen] = useState(rows.length > 0)
  const hadRows = useRef(rows.length > 0)
  const groups = useMemo(() => groupParts(rows, grouping), [rows, grouping])
  const totalQuantity = rows.reduce((sum, row) => sum + row.quantity, 0)
  const totalPrice = rows.reduce((sum, row) => sum + row.totalPrice, 0)

  useEffect(() => {
    const hasRows = rows.length > 0
    if (hasRows && !hadRows.current) setIsOpen(true)
    if (!hasRows) setIsOpen(false)
    hadRows.current = hasRows
  }, [rows.length])

  return (
    <details className="parts-list" open={isOpen} onToggle={(event) => setIsOpen(event.currentTarget.open)}>
      <summary><span>{t('label.partsList')}</span><strong>{totalQuantity}</strong></summary>
      {rows.length === 0 ? <p className="parts-empty">{t('empty.noParts')}</p> : <>
        <label className="parts-grouping"><span>{t('parts.groupBy')}</span><select value={grouping} onChange={(event) => setGrouping(event.target.value as PartsGrouping)}><option value="category">{t('parts.group.category')}</option><option value="frame">{t('parts.group.frame')}</option><option value="material">{t('parts.group.material')}</option></select></label>
        <div className="parts-groups">
          {[...groups.entries()].map(([group, groupRows]) => (
            <section key={group}><h4>{grouping === 'category' ? t(`parts.category.${group}`) : group}</h4>{groupRows.map((row) => <div className="parts-row" key={row.id}><span><strong>{row.itemName}</strong><small>{row.frameReference} · {row.widthMm} × {row.heightMm} × {row.depthMm} mm</small></span><span>×{row.quantity}</span><em>{formatEstimatedPrice(row.totalPrice, state.design.language)}</em></div>)}</section>
          ))}
        </div>
        <div className="parts-total"><span>{totalQuantity} {t('parts.items')}</span><strong>{formatEstimatedPrice(totalPrice, state.design.language)}</strong></div>
      </>}
    </details>
  )
}
