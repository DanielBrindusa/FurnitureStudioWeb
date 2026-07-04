export function EmptyCanvasState({
  title,
  actionLabel,
  onAction,
}: {
  title: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="canvas-empty-state">
      <span aria-hidden="true">＋</span>
      <h2>{title}</h2>
      {actionLabel && onAction && <button type="button" className="primary-button" onClick={onAction}>{actionLabel}</button>}
    </div>
  )
}
