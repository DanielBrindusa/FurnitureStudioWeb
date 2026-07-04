import type { InstallationSpace } from '../../models/design'
import type { FrameLayout } from './types'

function HorizontalDimension({ x1, x2, y, label, tone = 'default' }: { x1: number; x2: number; y: number; label: string; tone?: 'default' | 'accent' | 'warning' }) {
  return (
    <g className={`measurement is-${tone}`}>
      <line x1={x1} x2={x2} y1={y} y2={y} markerStart="url(#measure-arrow-start)" markerEnd="url(#measure-arrow-end)" />
      <line x1={x1} x2={x1} y1={y - 28} y2={y + 28} />
      <line x1={x2} x2={x2} y1={y - 28} y2={y + 28} />
      <text x={(x1 + x2) / 2} y={y - 22} textAnchor="middle">{label}</text>
    </g>
  )
}

function VerticalDimension({ x, y1, y2, label }: { x: number; y1: number; y2: number; label: string }) {
  return (
    <g className="measurement">
      <line x1={x} x2={x} y1={y1} y2={y2} markerStart="url(#measure-arrow-start)" markerEnd="url(#measure-arrow-end)" />
      <line x1={x - 28} x2={x + 28} y1={y1} y2={y1} />
      <line x1={x - 28} x2={x + 28} y1={y2} y2={y2} />
      <text x={x + 36} y={(y1 + y2) / 2} transform={`rotate(90 ${x + 36} ${(y1 + y2) / 2})`} textAnchor="middle">{label}</text>
    </g>
  )
}

export function MeasurementOverlay({
  installation,
  layouts,
  selectedFrameId,
  totalWidth,
  remainingWidth,
  t,
}: {
  installation: InstallationSpace
  layouts: FrameLayout[]
  selectedFrameId: string | null
  totalWidth: number
  remainingWidth: number
  t: (key: string) => string
}) {
  const selected = layouts.find((layout) => layout.frame.id === selectedFrameId)
  const furnitureStart = installation.leftClearanceMm
  const furnitureEnd = furnitureStart + totalWidth

  return (
    <g className="measurement-overlay" pointerEvents="none">
      <defs>
        <marker id="measure-arrow-start" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto-start-reverse">
          <path d="M9 1 L1 5 L9 9" fill="none" stroke="context-stroke" strokeWidth="1.5" />
        </marker>
        <marker id="measure-arrow-end" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
          <path d="M1 1 L9 5 L1 9" fill="none" stroke="context-stroke" strokeWidth="1.5" />
        </marker>
      </defs>

      <HorizontalDimension x1={0} x2={installation.widthMm} y={-180} label={`${t('canvas.availableWidth')}: ${installation.widthMm} mm`} />
      <VerticalDimension x={installation.widthMm + 160} y1={0} y2={installation.heightMm} label={`${t('canvas.availableHeight')}: ${installation.heightMm} mm`} />
      <HorizontalDimension x1={furnitureStart} x2={furnitureEnd} y={installation.heightMm + 190} label={`${t('canvas.totalWidth')}: ${totalWidth} mm`} tone="accent" />

      {selected && (
        <>
          <HorizontalDimension x1={selected.x} x2={selected.x + selected.frame.widthMm} y={selected.y - 75} label={`${selected.frame.widthMm} mm`} tone="accent" />
          <VerticalDimension x={selected.x - 78} y1={selected.y} y2={selected.y + selected.frame.heightMm} label={`${selected.frame.heightMm} mm`} />
        </>
      )}

      <text className={`remaining-width-label${remainingWidth < 0 ? ' is-negative' : ''}`} x={installation.widthMm / 2} y={installation.heightMm + 285} textAnchor="middle">
        {t('canvas.remainingWidth')}: {remainingWidth} mm
      </text>
    </g>
  )
}
