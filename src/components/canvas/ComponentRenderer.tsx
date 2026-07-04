import type { PointerEvent as ReactPointerEvent } from 'react'
import { getMaterial } from '../../data/catalog'
import type { FurnitureComponent } from '../../models/design'

export function ComponentRenderer({
  component,
  frameHeight,
  frameX,
  frameY,
  selected = false,
  preview = false,
  invalid = false,
  onSelect,
  onPointerDown,
}: {
  component: FurnitureComponent
  frameHeight: number
  frameX: number
  frameY: number
  selected?: boolean
  preview?: boolean
  invalid?: boolean
  onSelect?: () => void
  onPointerDown?: (event: ReactPointerEvent<SVGGElement>) => void
}) {
  const x = frameX + component.xMm
  const y = frameY + frameHeight - component.yMm - component.heightMm
  const material = getMaterial(component.materialId)
  const fill = material?.color ?? '#e6ded0'
  const id = component.id.replace(/[^a-zA-Z0-9-_]/g, '')
  const isRail = component.type === 'clothes-rail' || component.type === 'trouser-rail'
  const isDrawer = component.type === 'drawer' || component.type === 'deep-drawer'
  const isBasket = component.type === 'wire-basket' || component.type === 'laundry-basket'
  const isShoe = component.type === 'shoe-shelf' || component.type === 'angled-shoe-shelf'
  const isLight = component.type === 'led-light-strip' || component.type === 'sensor-light'
  const interactive = Boolean(onSelect || onPointerDown)

  return (
    <g
      className={`component-shape is-${component.type}${selected ? ' is-selected' : ''}${preview ? ' is-preview' : ''}${invalid ? ' is-invalid' : ''}`}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `${component.name}, ${component.yMm} mm` : undefined}
      onPointerDown={onPointerDown}
      onClick={(event) => { if (onSelect) { event.stopPropagation(); onSelect() } }}
      onKeyDown={(event) => {
        if (onSelect && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onSelect() }
      }}
    >
      <defs>
        <pattern id={`mesh-${id}`} width="28" height="28" patternUnits="userSpaceOnUse">
          <rect width="28" height="28" fill={fill} fillOpacity="0.2" />
          <path d="M0 0L28 28M28 0L0 28" stroke={fill} strokeWidth="3" strokeOpacity="0.8" />
        </pattern>
        <filter id={`glow-${id}`} x="-80%" y="-400%" width="260%" height="900%">
          <feGaussianBlur stdDeviation="18" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {selected && component.type === 'clothes-rail' && (
        <rect className="hanging-clearance-zone" x={x} y={y + component.heightMm} width={component.widthMm} height={Math.min(900, frameY + frameHeight - y - component.heightMm - 18)} />
      )}

      {isRail && (
        <g className="component-rail">
          <circle cx={x + 10} cy={y + component.heightMm / 2} r="12" />
          <circle cx={x + component.widthMm - 10} cy={y + component.heightMm / 2} r="12" />
          <line x1={x + 10} x2={x + component.widthMm - 10} y1={y + component.heightMm / 2} y2={y + component.heightMm / 2} />
          {component.type === 'trouser-rail' && Array.from({ length: 7 }, (_, index) => (
            <line key={index} x1={x + 40 + index * Math.max(20, (component.widthMm - 80) / 7)} x2={x + 40 + index * Math.max(20, (component.widthMm - 80) / 7)} y1={y + component.heightMm / 2} y2={y + component.heightMm} />
          ))}
        </g>
      )}

      {isDrawer && (
        <g className="component-drawer">
          <rect x={x} y={y} width={component.widthMm} height={component.heightMm} rx="6" fill={fill} />
          <rect x={x + 10} y={y + 10} width={Math.max(0, component.widthMm - 20)} height={Math.max(0, component.heightMm - 20)} rx="4" />
          <line x1={x + component.widthMm * 0.38} x2={x + component.widthMm * 0.62} y1={y + 28} y2={y + 28} />
          {component.type === 'deep-drawer' && <path d={`M${x + 18} ${y + component.heightMm - 40}H${x + component.widthMm - 18}`} />}
        </g>
      )}

      {isBasket && (
        <g className="component-basket">
          <rect x={x} y={y} width={component.widthMm} height={component.heightMm} rx="7" fill={`url(#mesh-${id})`} />
          <path d={`M${x + 8} ${y + 18}H${x + component.widthMm - 8}V${y + component.heightMm - 10}H${x + 8}Z`} />
          {component.type === 'laundry-basket' && <line x1={x + component.widthMm * 0.35} x2={x + component.widthMm * 0.65} y1={y + 28} y2={y + 28} />}
        </g>
      )}

      {isShoe && (
        <g className="component-shoe">
          <polygon points={`${x},${y + component.heightMm * 0.72} ${x + component.widthMm},${y + component.heightMm * 0.22} ${x + component.widthMm},${y + component.heightMm * 0.55} ${x},${y + component.heightMm}`} fill={fill} />
          {Array.from({ length: 5 }, (_, index) => <line key={index} x1={x + component.widthMm * (index + 1) / 6} x2={x + component.widthMm * (index + 1) / 6 + 22} y1={y + component.heightMm * 0.65} y2={y + component.heightMm * 0.3} />)}
        </g>
      )}

      {(component.type === 'shelf' || component.type === 'top-cover-panel' || component.type === 'side-cover-panel' || component.type === 'vertical-divider' || component.type === 'plinth-base') && (
        <g className="component-board">
          <rect x={x} y={y} width={component.widthMm} height={component.heightMm} fill={fill} rx="2" />
          <line x1={x + 2} x2={x + component.widthMm - 2} y1={y + 3} y2={y + 3} />
        </g>
      )}

      {(component.type === 'pull-out-tray' || component.type === 'accessory-tray' || component.type === 'small-organizer') && (
        <g className="component-tray">
          <rect x={x} y={y} width={component.widthMm} height={component.heightMm} rx="5" fill={fill} />
          <path d={`M${x + 8} ${y + 12}V${y + component.heightMm - 10}H${x + component.widthMm - 8}V${y + 12}`} />
          {(component.type === 'accessory-tray' || component.type === 'small-organizer') && <>
            <line x1={x + component.widthMm / 3} x2={x + component.widthMm / 3} y1={y + 12} y2={y + component.heightMm - 10} />
            <line x1={x + component.widthMm * 2 / 3} x2={x + component.widthMm * 2 / 3} y1={y + 12} y2={y + component.heightMm - 10} />
          </>}
        </g>
      )}

      {isLight && (
        <g className="component-light" filter={`url(#glow-${id})`}>
          <rect x={x} y={y} width={component.widthMm} height={Math.max(component.heightMm, 10)} rx="7" />
          {component.type === 'sensor-light' && <circle cx={x + component.widthMm / 2} cy={y + component.heightMm / 2} r="7" />}
        </g>
      )}

      {component.type === 'handle' && <line className="standalone-handle" x1={x} x2={x + component.widthMm} y1={y + component.heightMm / 2} y2={y + component.heightMm / 2} />}
      {component.type === 'knob' && <circle className="standalone-knob" cx={x + component.widthMm / 2} cy={y + component.heightMm / 2} r={Math.min(component.widthMm, component.heightMm) / 2} />}

      <rect className="component-selection-outline" x={x - 8} y={y - 8} width={component.widthMm + 16} height={component.heightMm + 16} rx="7" />
    </g>
  )
}
