import { useEffect, useMemo, useRef, useState, type DragEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { componentCatalog } from '../../data/catalog'
import { translate } from '../../i18n'
import { createComponent } from '../../models/factories'
import type { Frame, FurnitureComponent, FurnitureComponentType } from '../../models/design'
import { useDesign } from '../../state/designState'
import { evaluateComponentPlacement } from '../../validation/validationEngine'
import { CanvasControls } from './CanvasControls'
import { ComponentRenderer } from './ComponentRenderer'
import { EmptyCanvasState } from './EmptyCanvasState'
import { FrameView } from './FrameView'
import { FurnitureViewport } from './FurnitureViewport'
import { InstallationBoundary } from './InstallationBoundary'
import { MeasurementOverlay } from './MeasurementOverlay'
import type { FrameLayout, Point } from './types'
import './canvas.css'

interface PanStart { clientX: number; clientY: number; pan: Point }
interface ExistingDrag { frameId: string; componentId: string; pointerId: number }
interface PlacementPreview {
  source: 'catalog' | 'existing'
  frameId: string
  component: FurnitureComponent
  valid: boolean
  messageKey: string
}

const COMPONENT_TYPES = new Set<FurnitureComponentType>([
  'shelf', 'clothes-rail', 'drawer', 'deep-drawer', 'wire-basket', 'shoe-shelf', 'angled-shoe-shelf',
  'vertical-divider', 'pull-out-tray', 'accessory-tray', 'small-organizer', 'trouser-rail', 'laundry-basket',
  'led-light-strip', 'sensor-light', 'top-cover-panel', 'side-cover-panel', 'plinth-base', 'handle', 'knob',
])

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const snap10 = (value: number) => Math.round(value / 10) * 10

function catalogComponent(itemId: string, frame: Frame): FurnitureComponent | null {
  const item = componentCatalog.find((candidate) => candidate.id === itemId)
  if (!item || !COMPONENT_TYPES.has(item.type as FurnitureComponentType)) return null
  const type = item.type as FurnitureComponentType
  const component = createComponent(type, frame, {
    name: item.name,
    widthMm: ['vertical-divider', 'side-cover-panel'].includes(type)
      ? 18
      : ['sensor-light', 'handle', 'knob'].includes(type)
        ? item.dimensions.widthMm ?? 80
        : Math.max(40, frame.widthMm - 36),
    heightMm: item.dimensions.heightMm ?? (type === 'vertical-divider' || type === 'side-cover-panel' ? Math.max(24, frame.heightMm - 36) : 24),
    depthMm: Math.min(item.dimensions.depthMm ?? frame.depthMm - 20, Math.max(1, frame.depthMm - 20)),
  })
  if (type === 'vertical-divider') component.xMm = Math.floor(frame.widthMm / 2) - 9
  return component
}

export function WardrobeCanvas({
  onAddFrame,
  activeCatalogItemId,
  getActiveCatalogItemId,
  onCatalogDragEnd,
  onInspectorRequest,
}: {
  onAddFrame: () => void
  activeCatalogItemId: string | null
  getActiveCatalogItemId: () => string | null
  onCatalogDragEnd: () => void
  onInspectorRequest: () => void
}) {
  const { state, dispatch } = useDesign()
  const { design, validation } = state
  const t = (key: string) => translate(design.language, key)
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 })
  const [placement, setPlacement] = useState<PlacementPreview | null>(null)
  const canvasRoot = useRef<HTMLElement | null>(null)
  const panStart = useRef<PanStart | null>(null)
  const existingDrag = useRef<ExistingDrag | null>(null)
  const installation = design.installationSpace
  const orderedFrames = useMemo(() => [...design.furniture.frames].sort((a, b) => a.orderIndex - b.orderIndex), [design.furniture.frames])
  const layouts = useMemo<FrameLayout[]>(() => {
    let cursor = installation.leftClearanceMm
    return orderedFrames.map((frame) => {
      const layout = { frame, x: cursor, y: installation.heightMm - frame.heightMm }
      cursor += frame.widthMm
      return layout
    })
  }, [installation.heightMm, installation.leftClearanceMm, orderedFrames])
  const totalWidth = orderedFrames.reduce((total, frame) => total + frame.widthMm, 0)
  const remainingWidth = installation.widthMm - installation.leftClearanceMm - installation.rightClearanceMm - totalWidth
  const furnitureEndX = installation.leftClearanceMm + totalWidth
  const hasInstallation = installation.widthMm > 0 && installation.heightMm > 0 && installation.depthMm > 0
  const selectedId = design.selectedObject?.objectId ?? null
  const selectedFrameId = design.selectedObject?.objectType === 'frame'
    ? selectedId
    : orderedFrames.find((frame) => frame.components.some((component) => component.id === selectedId) || frame.doors.some((door) => door.id === selectedId))?.id ?? null
  const selectedComponentId = design.selectedObject?.objectType === 'component' ? selectedId : null
  const selectedDoorId = design.selectedObject?.objectType === 'door' ? selectedId : null
  const zoomPercent = clamp(design.camera.zoom, 40, 220)
  const baseWidth = Math.max(1200, installation.widthMm + 720)
  const baseHeight = Math.max(1200, installation.heightMm + 760)
  const zoomFactor = 100 / zoomPercent
  const viewWidth = baseWidth * zoomFactor
  const viewHeight = baseHeight * zoomFactor
  const centerX = installation.widthMm / 2 + pan.x
  const centerY = installation.heightMm / 2 + pan.y
  const viewX = centerX - viewWidth / 2
  const viewY = centerY - viewHeight / 2
  const viewBox = `${viewX} ${viewY} ${viewWidth} ${viewHeight}`
  const hasBlockingIssue = validation.some((issue) => issue.severity === 'error')

  const toSvgPoint = (svg: SVGSVGElement, clientX: number, clientY: number): Point => {
    const bounds = svg.getBoundingClientRect()
    const scale = Math.min(bounds.width / viewWidth, bounds.height / viewHeight)
    const renderedWidth = viewWidth * scale
    const renderedHeight = viewHeight * scale
    return {
      x: viewX + (clientX - bounds.left - (bounds.width - renderedWidth) / 2) / scale,
      y: viewY + (clientY - bounds.top - (bounds.height - renderedHeight) / 2) / scale,
    }
  }

  const layoutAt = (point: Point) => layouts.find((layout) =>
    point.x >= layout.x && point.x <= layout.x + layout.frame.widthMm && point.y >= layout.y && point.y <= layout.y + layout.frame.heightMm,
  )

  const positionCandidate = (layout: FrameLayout, component: FurnitureComponent, point: Point, preserveX: boolean): FurnitureComponent => {
    const maxX = Math.max(18, layout.frame.widthMm - component.widthMm - 18)
    const maxY = Math.max(18, layout.frame.heightMm - component.heightMm - 18)
    return {
      ...component,
      xMm: preserveX ? component.xMm : snap10(clamp(point.x - layout.x - component.widthMm / 2, 18, maxX)),
      yMm: snap10(clamp(layout.frame.heightMm - (point.y - layout.y) - component.heightMm / 2, 18, maxY)),
    }
  }

  const previewCatalogAt = (svg: SVGSVGElement, clientX: number, clientY: number): PlacementPreview | null => {
    const catalogItemId = getActiveCatalogItemId()
    if (!catalogItemId) return null
    const point = toSvgPoint(svg, clientX, clientY)
    const layout = layoutAt(point)
    if (!layout) { setPlacement(null); return null }
    const component = catalogComponent(catalogItemId, layout.frame)
    if (!component) return null
    const candidate = positionCandidate(layout, component, point, false)
    const result = evaluateComponentPlacement(layout.frame, candidate)
    const next: PlacementPreview = { source: 'catalog', frameId: layout.frame.id, component: candidate, ...result }
    setPlacement(next)
    return next
  }

  const commitCatalogPlacement = (next: PlacementPreview | null) => {
    if (next?.source === 'catalog' && next.valid) {
      dispatch({ type: 'COMPONENT_ADD', frameId: next.frameId, component: next.component })
      dispatch({ type: 'ITEM_SELECT', selectedItem: { kind: 'component', id: next.component.id } })
      onInspectorRequest()
    }
    setPlacement(null)
    onCatalogDragEnd()
  }

  useEffect(() => {
    if (!activeCatalogItemId) return
    const move = (event: PointerEvent) => {
      const svg = canvasRoot.current?.querySelector('svg')
      if (svg) previewCatalogAt(svg, event.clientX, event.clientY)
    }
    const up = (event: PointerEvent) => {
      const svg = canvasRoot.current?.querySelector('svg')
      commitCatalogPlacement(svg ? previewCatalogAt(svg, event.clientX, event.clientY) : null)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up, true)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up, true)
    }
  })

  const handleCatalogDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!getActiveCatalogItemId()) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    const svg = event.currentTarget.querySelector('svg')
    if (svg) previewCatalogAt(svg, event.clientX, event.clientY)
  }

  const handleCatalogDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    commitCatalogPlacement(placement)
  }

  const startComponentDrag = (event: ReactPointerEvent<SVGGElement>, frame: Frame, component: FurnitureComponent) => {
    event.preventDefault()
    event.stopPropagation()
    const svg = event.currentTarget.ownerSVGElement
    svg?.setPointerCapture(event.pointerId)
    existingDrag.current = { frameId: frame.id, componentId: component.id, pointerId: event.pointerId }
    setPlacement({ source: 'existing', frameId: frame.id, component, valid: true, messageKey: 'placement.moveHint' })
    dispatch({ type: 'ITEM_SELECT', selectedItem: { kind: 'component', id: component.id } })
    onInspectorRequest()
  }

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.button !== 0 || existingDrag.current) return
    event.currentTarget.setPointerCapture(event.pointerId)
    panStart.current = { clientX: event.clientX, clientY: event.clientY, pan }
    event.currentTarget.classList.add('is-panning')
  }

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (getActiveCatalogItemId() && !existingDrag.current) {
      previewCatalogAt(event.currentTarget, event.clientX, event.clientY)
      return
    }
    if (existingDrag.current) {
      const drag = existingDrag.current
      const layout = layouts.find((candidate) => candidate.frame.id === drag.frameId)
      const component = layout?.frame.components.find((candidate) => candidate.id === drag.componentId)
      if (!layout || !component) return
      const point = toSvgPoint(event.currentTarget, event.clientX, event.clientY)
      const candidate = positionCandidate(layout, component, point, true)
      const result = evaluateComponentPlacement(layout.frame, candidate, component.id)
      setPlacement({ source: 'existing', frameId: layout.frame.id, component: candidate, ...result })
      return
    }
    if (!panStart.current) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const deltaX = ((event.clientX - panStart.current.clientX) / Math.max(bounds.width, 1)) * viewWidth
    const deltaY = ((event.clientY - panStart.current.clientY) / Math.max(bounds.height, 1)) * viewHeight
    setPan({ x: panStart.current.pan.x - deltaX, y: panStart.current.pan.y - deltaY })
  }

  const handlePointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (getActiveCatalogItemId()) {
      commitCatalogPlacement(placement)
    }
    if (existingDrag.current) {
      if (placement?.source === 'existing' && placement.valid) {
        dispatch({ type: 'COMPONENT_UPDATE', frameId: placement.frameId, componentId: placement.component.id, patch: { xMm: placement.component.xMm, yMm: placement.component.yMm } })
      }
      existingDrag.current = null
      setPlacement(null)
    }
    panStart.current = null
    event.currentTarget.classList.remove('is-panning')
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const updateZoom = (next: number) => dispatch({ type: 'VIEW_SETTINGS_UPDATE', patch: { zoomPercent: clamp(next, 40, 220) } })
  const fit = () => { setPan({ x: 0, y: 0 }); updateZoom(100) }
  const previewLayout = placement ? layouts.find((layout) => layout.frame.id === placement.frameId) : null

  return (
    <section ref={canvasRoot} className={`wardrobe-canvas${activeCatalogItemId ? ' is-catalog-dragging' : ''}`} aria-label={t('label.preview')}>
      {hasBlockingIssue && <div className="canvas-warning-strip" role="status"><span aria-hidden="true">!</span>{remainingWidth < 0 ? t('warning.installationOverflow') : t('warning.designIssues')}</div>}
      {placement && <div className={`placement-feedback${placement.valid ? ' is-valid' : ' is-invalid'}`} role="status"><span aria-hidden="true">{placement.valid ? '✓' : '!'}</span>{t(placement.messageKey)} <strong>{placement.component.yMm} mm</strong></div>}

      <div className="canvas-surface" onDragOver={handleCatalogDragOver} onDrop={handleCatalogDrop} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPlacement(null) }}>
        {hasInstallation && <FurnitureViewport viewBox={viewBox} ariaLabel={t('label.preview')} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
          <defs>
            <linearGradient id="canvas-wall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#f1eee7" /><stop offset="1" stopColor="#ded8cd" /></linearGradient>
            <linearGradient id="mirror-sheen" x1="0" x2="1"><stop offset="0" stopColor="#c9d8d7" /><stop offset="0.45" stopColor="#f7fbfa" /><stop offset="0.58" stopColor="#a9c0bf" /><stop offset="1" stopColor="#dce7e5" /></linearGradient>
            <linearGradient id="glass-sheen" x1="0" x2="1"><stop offset="0" stopColor="#b9d1cd" stopOpacity=".6" /><stop offset=".45" stopColor="#edf7f5" stopOpacity=".35" /><stop offset="1" stopColor="#9bbcb7" stopOpacity=".55" /></linearGradient>
          </defs>
          <rect x={centerX - viewWidth} y={centerY - viewHeight} width={viewWidth * 2} height={viewHeight * 2} fill="url(#canvas-wall)" />
          <InstallationBoundary installation={installation} furnitureEndX={furnitureEndX} overflow={remainingWidth < 0} />
          {layouts.map((layout, index) => <FrameView
            key={layout.frame.id}
            layout={layout}
            selectedFrame={design.selectedObject?.objectType === 'frame' && selectedFrameId === layout.frame.id}
            selectedComponentId={selectedComponentId}
            selectedDoorId={selectedDoorId}
            showDoors={design.renderSettings.showDoors}
            orderLabel={String(index + 1).padStart(2, '0')}
            dropState={placement?.frameId === layout.frame.id ? (placement.valid ? 'valid' : 'invalid') : null}
            onSelectFrame={() => { dispatch({ type: 'ITEM_SELECT', selectedItem: { kind: 'frame', id: layout.frame.id } }); onInspectorRequest() }}
            onSelectComponent={(componentId) => { dispatch({ type: 'ITEM_SELECT', selectedItem: { kind: 'component', id: componentId } }); onInspectorRequest() }}
            onSelectDoor={(doorId) => { dispatch({ type: 'ITEM_SELECT', selectedItem: { kind: 'door', id: doorId } }); onInspectorRequest() }}
            onComponentPointerDown={(event, component) => startComponentDrag(event, layout.frame, component)}
          />)}
          {placement && previewLayout && <>
            <ComponentRenderer component={placement.component} frameHeight={previewLayout.frame.heightMm} frameX={previewLayout.x} frameY={previewLayout.y} preview invalid={!placement.valid} />
            <g className={`position-tooltip${placement.valid ? '' : ' is-invalid'}`} transform={`translate(${previewLayout.x + placement.component.xMm + placement.component.widthMm / 2} ${previewLayout.y + previewLayout.frame.heightMm - placement.component.yMm - placement.component.heightMm - 35})`}><rect x="-68" y="-28" width="136" height="42" rx="12" /><text textAnchor="middle">Y {placement.component.yMm} mm</text></g>
          </>}
          {design.renderSettings.showMeasurements && <MeasurementOverlay installation={installation} layouts={layouts} selectedFrameId={selectedFrameId} totalWidth={totalWidth} remainingWidth={remainingWidth} t={t} />}
        </FurnitureViewport>}

        {!hasInstallation && <EmptyCanvasState title={t('empty.noInstallation')} />}
        {hasInstallation && design.furniture.frames.length === 0 && <EmptyCanvasState title={t('empty.addFirstFrame')} actionLabel={t('button.addFrame')} onAction={onAddFrame} />}
        <CanvasControls zoomPercent={zoomPercent} showDimensions={design.renderSettings.showMeasurements} t={t} onZoomIn={() => updateZoom(zoomPercent + 10)} onZoomOut={() => updateZoom(zoomPercent - 10)} onFit={fit} onReset={() => { setPan({ x: 0, y: 0 }); dispatch({ type: 'VIEW_SETTINGS_UPDATE', patch: { zoomPercent: 100, showMeasurements: true } }) }} onToggleDimensions={() => dispatch({ type: 'VIEW_SETTINGS_UPDATE', patch: { showMeasurements: !design.renderSettings.showMeasurements } })} />
        <p className="canvas-pan-hint">{activeCatalogItemId ? t('placement.dropHint') : t('canvas.panHint')}</p>
      </div>
    </section>
  )
}
