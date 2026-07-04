import type { PointerEventHandler, ReactNode } from 'react'

export function FurnitureViewport({
  viewBox,
  ariaLabel,
  children,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  viewBox: string
  ariaLabel: string
  children: ReactNode
  onPointerDown: PointerEventHandler<SVGSVGElement>
  onPointerMove: PointerEventHandler<SVGSVGElement>
  onPointerUp: PointerEventHandler<SVGSVGElement>
}) {
  return (
    <svg
      className="furniture-viewport"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {children}
    </svg>
  )
}
