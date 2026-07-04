export function CanvasControls({
  zoomPercent,
  showDimensions,
  t,
  onZoomIn,
  onZoomOut,
  onFit,
  onReset,
  onToggleDimensions,
}: {
  zoomPercent: number
  showDimensions: boolean
  t: (key: string) => string
  onZoomIn: () => void
  onZoomOut: () => void
  onFit: () => void
  onReset: () => void
  onToggleDimensions: () => void
}) {
  return (
    <div className="canvas-controls" role="toolbar" aria-label={t('label.preview')}>
      <button type="button" onClick={onZoomOut} aria-label={t('button.zoomOut')} title={t('button.zoomOut')}>−</button>
      <output>{zoomPercent}%</output>
      <button type="button" onClick={onZoomIn} aria-label={t('button.zoomIn')} title={t('button.zoomIn')}>+</button>
      <span className="canvas-control-divider" />
      <button type="button" onClick={onFit} aria-label={t('button.fitView')} title={t('button.fitView')}>⌗</button>
      <button type="button" onClick={onReset} aria-label={t('button.resetView')} title={t('button.resetView')}>↺</button>
      <button type="button" className={showDimensions ? 'is-active' : ''} onClick={onToggleDimensions} aria-label={showDimensions ? t('button.hideDimensions') : t('button.showDimensions')} title={showDimensions ? t('button.hideDimensions') : t('button.showDimensions')}>↔</button>
    </div>
  )
}
