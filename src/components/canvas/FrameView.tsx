import { getMaterial } from '../../data/catalog'
import type { FurnitureComponent } from '../../models/design'
import { PanelRenderer } from './PanelRenderer'
import type { FrameLayout } from './types'

const BOARD_THICKNESS_MM = 18

function ComponentShape({ component, frameHeight, frameX, frameY }: {
  component: FurnitureComponent
  frameHeight: number
  frameX: number
  frameY: number
}) {
  const x = frameX + component.xMm
  const y = frameY + frameHeight - component.yMm - component.heightMm

  if (component.type === 'clothes-rail' || component.type === 'trouser-rail') {
    return <line className="rendered-rail" x1={x} x2={x + component.widthMm} y1={y + component.heightMm / 2} y2={y + component.heightMm / 2} />
  }

  if (component.type === 'led-light-strip' || component.type === 'sensor-light') {
    return <rect className="rendered-light" x={x} y={y} width={component.widthMm} height={Math.max(component.heightMm, 8)} rx={4} />
  }

  return (
    <g className={`rendered-component is-${component.type}`}>
      <rect x={x} y={y} width={component.widthMm} height={component.heightMm} rx={component.type.includes('drawer') ? 4 : 1} />
      {component.type.includes('drawer') && (
        <line x1={x + component.widthMm * 0.36} x2={x + component.widthMm * 0.64} y1={y + 18} y2={y + 18} />
      )}
    </g>
  )
}

export function FrameView({
  layout,
  selected,
  showDoors,
  orderLabel,
  onSelect,
}: {
  layout: FrameLayout
  selected: boolean
  showDoors: boolean
  orderLabel: string
  onSelect: () => void
}) {
  const { frame, x, y } = layout
  const material = getMaterial(frame.materialId)
  const color = material?.color ?? '#f2eee5'
  const patternId = `material-${frame.id.replace(/[^a-zA-Z0-9-_]/g, '')}`
  const gradientId = `edge-${frame.id.replace(/[^a-zA-Z0-9-_]/g, '')}`
  const shadowId = `shadow-${frame.id.replace(/[^a-zA-Z0-9-_]/g, '')}`
  const depthOffset = Math.max(8, Math.min(24, frame.depthMm / 32))
  const innerWidth = Math.max(0, frame.widthMm - BOARD_THICKNESS_MM * 2)
  const innerHeight = Math.max(0, frame.heightMm - BOARD_THICKNESS_MM * 2)
  const isWood = material?.finishType.startsWith('wood') ?? false

  return (
    <g
      className={`frame-view${selected ? ' is-selected' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`${frame.name}, ${frame.widthMm} × ${frame.heightMm} × ${frame.depthMm} mm`}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation()
        onSelect()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={color} />
          <stop offset="0.55" stopColor={color} stopOpacity="0.94" />
          <stop offset="1" stopColor="#554d42" stopOpacity="0.28" />
        </linearGradient>
        <pattern id={patternId} width={isWood ? 72 : 20} height={isWood ? 28 : 20} patternUnits="userSpaceOnUse">
          <rect width="100%" height="100%" fill={color} />
          {isWood ? (
            <>
              <path d="M0 7 C18 1 38 14 72 5 M0 18 C24 10 44 28 72 17" fill="none" stroke="#5c4630" strokeOpacity="0.14" strokeWidth="2" />
              <path d="M8 0 C14 9 14 19 6 28 M46 0 C38 8 41 20 52 28" fill="none" stroke="#fff" strokeOpacity="0.09" strokeWidth="3" />
            </>
          ) : (
            <circle cx="4" cy="5" r="1" fill="#fff" opacity="0.12" />
          )}
        </pattern>
        <filter id={shadowId} x="-20%" y="-20%" width="150%" height="160%">
          <feDropShadow dx="8" dy="14" stdDeviation="10" floodColor="#40372d" floodOpacity="0.2" />
        </filter>
      </defs>

      <polygon
        className="frame-depth-side"
        points={`${x + frame.widthMm},${y + depthOffset} ${x + frame.widthMm + depthOffset},${y} ${x + frame.widthMm + depthOffset},${y + frame.heightMm - depthOffset} ${x + frame.widthMm},${y + frame.heightMm}`}
        fill={`url(#${gradientId})`}
      />
      <polygon
        className="frame-depth-top"
        points={`${x},${y} ${x + depthOffset},${y - depthOffset} ${x + frame.widthMm + depthOffset},${y - depthOffset} ${x + frame.widthMm},${y}`}
        fill={`url(#${gradientId})`}
      />

      <rect className="frame-shadow-shape" x={x} y={y} width={frame.widthMm} height={frame.heightMm} fill="transparent" filter={`url(#${shadowId})`} />
      <rect className="frame-cavity" x={x + BOARD_THICKNESS_MM} y={y + BOARD_THICKNESS_MM} width={innerWidth} height={innerHeight} rx={3} />

      {frame.backPanelEnabled && (
        <rect className="back-panel" x={x + BOARD_THICKNESS_MM + 3} y={y + BOARD_THICKNESS_MM + 3} width={Math.max(0, innerWidth - 6)} height={Math.max(0, innerHeight - 6)} fill={color} opacity="0.2" />
      )}

      <PanelRenderer x={x} y={y} width={BOARD_THICKNESS_MM} height={frame.heightMm} fill={`url(#${patternId})`} className="side-panel" />
      <PanelRenderer x={x + frame.widthMm - BOARD_THICKNESS_MM} y={y} width={BOARD_THICKNESS_MM} height={frame.heightMm} fill={`url(#${patternId})`} className="side-panel" />
      <PanelRenderer x={x + BOARD_THICKNESS_MM} y={y} width={innerWidth} height={BOARD_THICKNESS_MM} fill={`url(#${patternId})`} className="top-panel" />
      <PanelRenderer x={x + BOARD_THICKNESS_MM} y={y + frame.heightMm - BOARD_THICKNESS_MM} width={innerWidth} height={BOARD_THICKNESS_MM} fill={`url(#${patternId})`} className="bottom-panel" />

      <g className="frame-components">
        {frame.components.map((component) => (
          <ComponentShape key={component.id} component={component} frameHeight={frame.heightMm} frameX={x} frameY={y} />
        ))}
      </g>

      {showDoors && frame.showDoors && frame.doors.length > 0 && (
        <g className="rendered-door">
          <rect x={x + 4} y={y + 4} width={frame.widthMm - 8} height={frame.heightMm - 8} fill={frame.doors[0]?.mirror ? 'url(#mirror-sheen)' : color} opacity={frame.doors[0]?.mirror ? 0.72 : 0.9} rx={3} />
          <line x1={x + frame.widthMm / 2} x2={x + frame.widthMm / 2} y1={y + 12} y2={y + frame.heightMm - 12} />
          <line className="door-handle" x1={x + frame.widthMm * 0.54} x2={x + frame.widthMm * 0.54} y1={y + frame.heightMm * 0.45} y2={y + frame.heightMm * 0.59} />
        </g>
      )}

      <rect className="frame-hit-outline" x={x - 4} y={y - 4} width={frame.widthMm + 8} height={frame.heightMm + 8} rx={4} />
      <g className="frame-order-badge" transform={`translate(${x + 34} ${y + 34})`}>
        <circle r="25" />
        <text textAnchor="middle" dominantBaseline="central">{orderLabel}</text>
      </g>
      <text className="frame-name-label" x={x + frame.widthMm / 2} y={y + frame.heightMm + 72} textAnchor="middle">{frame.name}</text>
      <text className="frame-size-label" x={x + frame.widthMm / 2} y={y + frame.heightMm + 112} textAnchor="middle">{frame.widthMm} × {frame.heightMm} × {frame.depthMm} mm</text>
    </g>
  )
}
