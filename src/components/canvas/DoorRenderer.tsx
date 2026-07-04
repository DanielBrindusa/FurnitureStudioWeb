import { getMaterial } from '../../data/catalog'
import type { Door, Frame } from '../../models/design'

export function DoorRenderer({ door, frame, x, y, selected, onSelect }: { door: Door; frame: Frame; x: number; y: number; selected: boolean; onSelect: () => void }) {
  const material = getMaterial(door.materialId)
  const fill = door.mirror ? 'url(#mirror-sheen)' : door.glass ? 'url(#glass-sheen)' : material?.color ?? '#ece6dc'
  const panelX = x + 4
  const panelY = y + 4
  const panelWidth = frame.widthMm - 8
  const panelHeight = frame.heightMm - 8
  const handleX = door.handlePosition === 'left' ? x + frame.widthMm * 0.12 : door.handlePosition === 'center' ? x + frame.widthMm / 2 : x + frame.widthMm * 0.88
  const hasSplit = ['hinged', 'double-sliding', 'framed-panel'].includes(door.type)

  return (
    <g className={`door-renderer is-${door.type}${selected ? ' is-selected' : ''}`} role="button" tabIndex={0} aria-label={door.type} onClick={(event) => { event.stopPropagation(); onSelect() }} onPointerDown={(event) => event.stopPropagation()} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect() } }}>
      <rect className="door-panel" x={panelX} y={panelY} width={panelWidth} height={panelHeight} fill={fill} opacity={door.glass ? 0.62 : door.mirror ? 0.96 : 0.98} rx="4" />
      {hasSplit && <line className="door-seam" x1={x + frame.widthMm / 2} x2={x + frame.widthMm / 2} y1={y + 14} y2={y + frame.heightMm - 14} />}
      {(door.type === 'sliding' || door.type === 'double-sliding') && <>
        <rect className="sliding-overlap" x={x + frame.widthMm * 0.47} y={y + 12} width={frame.widthMm * 0.08} height={frame.heightMm - 24} />
        <line className="door-track" x1={x + 12} x2={x + frame.widthMm - 12} y1={y + 18} y2={y + 18} />
      </>}
      {door.type === 'framed-panel' && <rect className="door-inner-frame" x={x + 45} y={y + 55} width={frame.widthMm - 90} height={frame.heightMm - 110} rx="2" />}
      {door.glass && <path className="glass-highlight" d={`M${x + 32} ${y + frame.heightMm - 50}L${x + frame.widthMm - 90} ${y + 40}`} />}
      {door.handleId && <line className="door-handle" x1={handleX} x2={handleX} y1={y + frame.heightMm * 0.43} y2={y + frame.heightMm * 0.59} />}
      <rect className="door-selection-outline" x={x - 5} y={y - 5} width={frame.widthMm + 10} height={frame.heightMm + 10} rx="5" />
    </g>
  )
}
