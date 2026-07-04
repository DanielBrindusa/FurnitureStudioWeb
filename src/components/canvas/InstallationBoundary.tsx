import type { InstallationSpace } from '../../models/design'

export function InstallationBoundary({
  installation,
  furnitureEndX,
  overflow,
}: {
  installation: InstallationSpace
  furnitureEndX: number
  overflow: boolean
}) {
  const remainingStart = Math.min(installation.widthMm, Math.max(0, furnitureEndX))
  const remainingWidth = Math.max(0, installation.widthMm - installation.rightClearanceMm - remainingStart)

  return (
    <g className={`installation-boundary${overflow ? ' has-overflow' : ''}`} pointerEvents="none">
      <rect className="boundary-fill" x="0" y="0" width={installation.widthMm} height={installation.heightMm} rx="8" />
      <rect className="clearance-zone" x="0" y="0" width={installation.leftClearanceMm} height={installation.heightMm} />
      <rect className="clearance-zone" x={installation.widthMm - installation.rightClearanceMm} y="0" width={installation.rightClearanceMm} height={installation.heightMm} />
      <rect className="clearance-zone top-clearance" x="0" y="0" width={installation.widthMm} height={installation.topClearanceMm} />
      {remainingWidth > 0 && <rect className="remaining-zone" x={remainingStart} y={installation.topClearanceMm} width={remainingWidth} height={installation.heightMm - installation.topClearanceMm} />}
      <rect className="boundary-outline" x="0" y="0" width={installation.widthMm} height={installation.heightMm} rx="8" />
    </g>
  )
}
