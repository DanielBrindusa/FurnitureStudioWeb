import { useEffect, useMemo } from 'react'
import { derivePartsList } from '../export/partsList'
import { getMaterial } from '../data/catalog'
import { formatEstimatedPrice } from '../pricing/priceEngine'
import { useDesign } from '../state/designState'

function PrintElevation() {
  const { state } = useDesign()
  const frames = [...state.design.furniture.frames].sort((a, b) => a.orderIndex - b.orderIndex)
  const totalWidth = Math.max(1, frames.reduce((sum, frame) => sum + frame.widthMm, 0))
  const maxHeight = Math.max(1, ...frames.map((frame) => frame.heightMm))
  let cursor = 0
  return <svg className="print-elevation" viewBox={`0 0 ${totalWidth} ${maxHeight + 100}`} role="img" aria-label={state.design.name}>{frames.map((frame) => {
    const x = cursor; cursor += frame.widthMm
    return <g key={frame.id}><rect x={x + 3} y={maxHeight - frame.heightMm + 3} width={frame.widthMm - 6} height={frame.heightMm - 6} fill={getMaterial(frame.materialId)?.color ?? '#eee'} stroke="#333" strokeWidth="6" />{frame.components.map((component) => <line key={component.id} x1={x + component.xMm} x2={x + component.xMm + component.widthMm} y1={maxHeight - component.yMm} y2={maxHeight - component.yMm} stroke="#444" strokeWidth={Math.max(5, component.heightMm / 10)} />)}<text x={x + frame.widthMm / 2} y={maxHeight + 55} textAnchor="middle" fontSize="28">{frame.name}</text></g>
  })}</svg>
}

export function PrintSummary({ open, onClose, t }: { open: boolean; onClose: () => void; t: (key: string) => string }) {
  const { state } = useDesign()
  const rows = useMemo(() => derivePartsList(state.design, state.validation), [state.design, state.validation])
  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open, onClose])
  if (!open) return null
  const frames = [...state.design.furniture.frames].sort((a, b) => a.orderIndex - b.orderIndex)
  const width = frames.reduce((sum, frame) => sum + frame.widthMm, 0)
  const height = frames.reduce((max, frame) => Math.max(max, frame.heightMm), 0)
  const depth = frames.reduce((max, frame) => Math.max(max, frame.depthMm), 0)

  return (
    <div className="print-summary is-open" role="dialog" aria-modal="true" aria-labelledby="print-title">
      <div className="print-toolbar"><button type="button" onClick={onClose}>{t('button.close')}</button><button type="button" className="primary-button" onClick={() => window.print()}>{t('button.print')}</button></div>
      <article className="print-sheet">
        <header><div><span>FSW</span><div><h1 id="print-title">{state.design.name}</h1><p>{t('print.subtitle')}</p></div></div><time>{new Date().toLocaleDateString(state.design.language === 'ro' ? 'ro-RO' : 'en-GB')}</time></header>
        <section className="print-project-metrics"><div><span>{t('label.installationSpace')}</span><strong>{state.design.installationSpace.widthMm} × {state.design.installationSpace.heightMm} × {state.design.installationSpace.depthMm} mm</strong></div><div><span>{t('summary.overallWidth')}</span><strong>{width} × {height} × {depth} mm</strong></div><div><span>{t('label.estimatedPrice')}</span><strong>{formatEstimatedPrice(state.price.total, state.design.language)}</strong></div></section>
        <PrintElevation />
        <section><h2>{t('label.frames')}</h2><table><thead><tr><th>{t('label.frame')}</th><th>{t('label.width')}</th><th>{t('label.height')}</th><th>{t('label.depth')}</th><th>{t('label.material')}</th><th>{t('label.doors')}</th></tr></thead><tbody>{frames.map((frame) => <tr key={frame.id}><td>{frame.name}</td><td>{frame.widthMm} mm</td><td>{frame.heightMm} mm</td><td>{frame.depthMm} mm</td><td>{getMaterial(frame.materialId)?.name ?? frame.materialId}</td><td>{frame.doors[0] ? t(`door.${frame.doors[0].type}`) : t('door.open')}</td></tr>)}</tbody></table></section>
        <section><h2>{t('label.partsList')}</h2><table><thead><tr><th>{t('parts.item')}</th><th>{t('parts.sku')}</th><th>{t('label.frame')}</th><th>{t('parts.dimensions')}</th><th>{t('label.material')}</th><th>{t('label.estimatedPrice')}</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.itemName}</td><td>{row.sku}</td><td>{row.frameReference}</td><td>{row.widthMm} × {row.heightMm} × {row.depthMm} mm</td><td>{row.material}</td><td>{formatEstimatedPrice(row.totalPrice, state.design.language)}</td></tr>)}</tbody></table></section>
        <section className="print-issues"><h2>{t('label.issues')}</h2>{state.validation.length === 0 ? <p>{t('empty.noIssues')}</p> : state.validation.map((issue) => <p key={issue.id}>{t(issue.messageKey)}</p>)}</section>
        <footer><p>{t('price.fictionalNote')}</p><p>{t('legal.notAffiliated')}</p></footer>
      </article>
    </div>
  )
}
