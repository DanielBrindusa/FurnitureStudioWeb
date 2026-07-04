export function PanelRenderer({
  x,
  y,
  width,
  height,
  fill,
  className = '',
}: {
  x: number
  y: number
  width: number
  height: number
  fill: string
  className?: string
}) {
  return (
    <rect
      className={`cabinet-panel ${className}`.trim()}
      x={x}
      y={y}
      width={Math.max(0, width)}
      height={Math.max(0, height)}
      fill={fill}
      rx={2}
    />
  )
}
