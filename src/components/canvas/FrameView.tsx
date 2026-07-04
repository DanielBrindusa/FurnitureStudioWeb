import { getMaterial } from '../../data/catalog'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { FurnitureComponent } from '../../models/design'
import { ComponentRenderer } from './ComponentRenderer'
import { DoorRenderer } from './DoorRenderer'
import { PanelRenderer } from './PanelRenderer'
import type { FrameLayout } from './types'

const BOARD_THICKNESS_MM = 18

export function FrameView({
  layout,
  selectedFrame,
  selectedComponentId,
  selectedDoorId,
  showDoors,
  orderLabel,
  dropState,
  onSelectFrame,
  onSelectComponent,
  onSelectDoor,
  onComponentPointerDown,
}: {
  layout: FrameLayout
  selectedFrame: boolean
  selectedComponentId: string | null
  selectedDoorId: string | null
  showDoors: boolean
  orderLabel: string
  dropState?: 'valid' | 'invalid' | null
  onSelectFrame: () => void
  onSelectComponent: (componentId: string) => void
  onSelectDoor: (doorId: string) => void
  onComponentPointerDown: (event: ReactPointerEvent<SVGGElement>, component: FurnitureComponent) => void
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
      className={`frame-view${selectedFrame ? ' is-selected' : ''}${dropState ? ` is-drop-${dropState}` : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`${frame.name}, ${frame.widthMm} × ${frame.heightMm} × ${frame.depthMm} mm`}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation()
        onSelectFrame()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelectFrame()
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
          <ComponentRenderer
            key={component.id}
            component={component}
            frameHeight={frame.heightMm}
            frameX={x}
            frameY={y}
            selected={selectedComponentId === component.id}
            onSelect={() => onSelectComponent(component.id)}
            onPointerDown={(event) => onComponentPointerDown(event, component)}
          />
        ))}
      </g>

      {showDoors && frame.showDoors && frame.doors[0] && <DoorRenderer door={frame.doors[0]} frame={frame} x={x} y={y} selected={selectedDoorId === frame.doors[0].id} onSelect={() => onSelectDoor(frame.doors[0]!.id)} />}

      {dropState && <rect className="frame-drop-overlay" x={x + 18} y={y + 18} width={Math.max(0, frame.widthMm - 36)} height={Math.max(0, frame.heightMm - 36)} rx="6" />}

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
