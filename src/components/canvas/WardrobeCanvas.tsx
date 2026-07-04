import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { translate } from '../../i18n'
import { useDesign } from '../../state/designState'
import { CanvasControls } from './CanvasControls'
import { EmptyCanvasState } from './EmptyCanvasState'
import { FrameView } from './FrameView'
import { FurnitureViewport } from './FurnitureViewport'
import { InstallationBoundary } from './InstallationBoundary'
import { MeasurementOverlay } from './MeasurementOverlay'
import type { FrameLayout, Point } from './types'
import './canvas.css'

interface DragStart {
  clientX: number
  clientY: number
  pan: Point
}

export function WardrobeCanvas({ onAddFrame }: { onAddFrame: () => void }) {
  const { state, dispatch } = useDesign()
  const { design, validation } = state
  const t = (key: string) => translate(design.language, key)
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 })
  const dragStart = useRef<DragStart | null>(null)
  const installation = design.installationSpace
  const orderedFrames = useMemo(
    () => [...design.frames].sort((a, b) => a.orderIndex - b.orderIndex),
    [design.frames],
  )
  const layouts = useMemo<FrameLayout[]>(() => {
    let cursor = installation.leftClearanceMm
    return orderedFrames.map((frame) => {
      const layout = {
        frame,
        x: cursor,
        y: installation.heightMm - frame.heightMm,
      }
      cursor += frame.widthMm
      return layout
    })
  }, [installation.heightMm, installation.leftClearanceMm, orderedFrames])
  const totalWidth = orderedFrames.reduce((total, frame) => total + frame.widthMm, 0)
  const remainingWidth = installation.widthMm - installation.leftClearanceMm - installation.rightClearanceMm - totalWidth
  const furnitureEndX = installation.leftClearanceMm + totalWidth
  const hasInstallation = installation.widthMm > 0 && installation.heightMm > 0 && installation.depthMm > 0
  const selectedFrameId = design.selectedItem?.kind === 'frame' ? design.selectedItem.id : null
  const zoomPercent = Math.max(40, Math.min(220, design.viewSettings.zoomPercent))
  const baseWidth = Math.max(1200, installation.widthMm + 720)
  const baseHeight = Math.max(1200, installation.heightMm + 760)
  const zoomFactor = 100 / zoomPercent
  const viewWidth = baseWidth * zoomFactor
  const viewHeight = baseHeight * zoomFactor
  const centerX = installation.widthMm / 2 + pan.x
  const centerY = installation.heightMm / 2 + pan.y
  const viewBox = `${centerX - viewWidth / 2} ${centerY - viewHeight / 2} ${viewWidth} ${viewHeight}`
  const hasBlockingIssue = validation.some((issue) => issue.severity === 'error')

  const updateZoom = (next: number) => {
    dispatch({ type: 'VIEW_SETTINGS_UPDATE', patch: { zoomPercent: Math.max(40, Math.min(220, next)) } })
  }

  const fit = () => {
    setPan({ x: 0, y: 0 })
    updateZoom(100)
  }

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStart.current = { clientX: event.clientX, clientY: event.clientY, pan }
    event.currentTarget.classList.add('is-panning')
  }

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragStart.current) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const deltaX = ((event.clientX - dragStart.current.clientX) / Math.max(bounds.width, 1)) * viewWidth
    const deltaY = ((event.clientY - dragStart.current.clientY) / Math.max(bounds.height, 1)) * viewHeight
    setPan({ x: dragStart.current.pan.x - deltaX, y: dragStart.current.pan.y - deltaY })
  }

  const handlePointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    dragStart.current = null
    event.currentTarget.classList.remove('is-panning')
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return (
    <section className="wardrobe-canvas" aria-label={t('label.preview')}>
      {hasBlockingIssue && (
        <div className="canvas-warning-strip" role="status">
          <span aria-hidden="true">!</span>
          {remainingWidth < 0 ? t('warning.installationOverflow') : t('warning.designIssues')}
        </div>
      )}

      <div className="canvas-surface">
        {hasInstallation && (
          <FurnitureViewport
            viewBox={viewBox}
            ariaLabel={t('label.preview')}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <defs>
              <linearGradient id="canvas-wall" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#f1eee7" />
                <stop offset="1" stopColor="#ded8cd" />
              </linearGradient>
              <linearGradient id="mirror-sheen" x1="0" x2="1">
                <stop offset="0" stopColor="#c9d8d7" />
                <stop offset="0.45" stopColor="#f7fbfa" />
                <stop offset="0.58" stopColor="#a9c0bf" />
                <stop offset="1" stopColor="#dce7e5" />
              </linearGradient>
            </defs>
            <rect x={centerX - viewWidth} y={centerY - viewHeight} width={viewWidth * 2} height={viewHeight * 2} fill="url(#canvas-wall)" />
            <InstallationBoundary installation={installation} furnitureEndX={furnitureEndX} overflow={remainingWidth < 0} />
            {layouts.map((layout, index) => (
              <FrameView
                key={layout.frame.id}
                layout={layout}
                selected={selectedFrameId === layout.frame.id}
                showDoors={design.viewSettings.showDoors}
                orderLabel={String(index + 1).padStart(2, '0')}
                onSelect={() => dispatch({ type: 'ITEM_SELECT', selectedItem: { kind: 'frame', id: layout.frame.id } })}
              />
            ))}
            {design.viewSettings.showMeasurements && (
              <MeasurementOverlay
                installation={installation}
                layouts={layouts}
                selectedFrameId={selectedFrameId}
                totalWidth={totalWidth}
                remainingWidth={remainingWidth}
                t={t}
              />
            )}
          </FurnitureViewport>
        )}

        {!hasInstallation && <EmptyCanvasState title={t('empty.noInstallation')} />}
        {hasInstallation && design.frames.length === 0 && (
          <EmptyCanvasState title={t('empty.addFirstFrame')} actionLabel={t('button.addFrame')} onAction={onAddFrame} />
        )}

        <CanvasControls
          zoomPercent={zoomPercent}
          showDimensions={design.viewSettings.showMeasurements}
          t={t}
          onZoomIn={() => updateZoom(zoomPercent + 10)}
          onZoomOut={() => updateZoom(zoomPercent - 10)}
          onFit={fit}
          onReset={() => {
            setPan({ x: 0, y: 0 })
            dispatch({ type: 'VIEW_SETTINGS_UPDATE', patch: { zoomPercent: 100, showMeasurements: true } })
          }}
          onToggleDimensions={() => dispatch({ type: 'VIEW_SETTINGS_UPDATE', patch: { showMeasurements: !design.viewSettings.showMeasurements } })}
        />
        <p className="canvas-pan-hint">{t('canvas.panHint')}</p>
      </div>
    </section>
  )
}
