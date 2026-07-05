import { useEffect, useMemo, useRef, useState } from 'react'
import { ComponentCatalogPanel } from '../components/ComponentCatalogPanel'
import { ComponentInspector } from '../components/ComponentInspector'
import { DoorConfigurator } from '../components/DoorConfigurator'
import { DimensionEditor } from '../components/DimensionEditor'
import { InstallationSetup } from '../components/InstallationSetup'
import { InternalPresetPanel } from '../components/InternalPresetPanel'
import { ExportDialog } from '../components/ExportDialog'
import { PartsList } from '../components/PartsList'
import { PrintSummary } from '../components/PrintSummary'
import { SavedProjectsDialog } from '../components/SavedProjectsDialog'
import { WardrobeCanvas } from '../components/canvas/WardrobeCanvas'
import { framePresets } from '../data/catalog'
import { buildFrameFromPreset } from '../data/framePresetFactory'
import { translate } from '../i18n'
import type { LanguageCode, LegacyCatalogItem } from '../models/design'
import { formatEstimatedPrice } from '../pricing/priceEngine'
import { useDesign } from '../state/designState'
import { projectRepository } from '../storage/projectRepository'
import { formatDimensionLabel } from '../utils/dimensions'
import './app.css'

type MobilePanel = 'catalog' | 'inspector' | 'summary'

export function App() {
  const { state, dispatch } = useDesign()
  const { design, validation, price } = state
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('catalog')
  const [activeCatalogItemId, setActiveCatalogItemId] = useState<string | null>(null)
  const [projectsOpen, setProjectsOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [printOpen, setPrintOpen] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [storageMessage, setStorageMessage] = useState<string | null>(state.startupErrorKey)
  const activeCatalogItemRef = useRef<string | null>(null)
  const t = (key: string) => translate(design.language, key)
  const orderedFrames = useMemo(
    () => [...design.furniture.frames].sort((a, b) => a.orderIndex - b.orderIndex),
    [design.furniture.frames],
  )
  const selectedFrame = orderedFrames.find((frame) =>
    (design.selectedObject?.objectType === 'frame' && frame.id === design.selectedObject.objectId) ||
    (design.selectedObject?.objectType === 'component' && frame.components.some((component) => component.id === design.selectedObject?.objectId)) ||
    (design.selectedObject?.objectType === 'door' && frame.doors.some((door) => door.id === design.selectedObject?.objectId)),
  ) ?? null
  const selectedComponent = selectedFrame?.components.find((component) => component.id === design.selectedObject?.objectId) ?? null
  const selectedDoor = selectedFrame?.doors.find((door) => door.id === design.selectedObject?.objectId) ?? null
  const totalWidth = orderedFrames.reduce((sum, frame) => sum + frame.widthMm, 0)
  const maximumHeight = orderedFrames.reduce((max, frame) => Math.max(max, frame.heightMm), 0)
  const maximumDepth = orderedFrames.reduce((max, frame) => Math.max(max, frame.depthMm), 0)
  const remainingWidth = design.installationSpace.widthMm
    - design.installationSpace.leftClearanceMm
    - design.installationSpace.rightClearanceMm
    - totalWidth
  const errorCount = validation.filter((issue) => issue.severity === 'error').length
  const warningCount = validation.filter((issue) => issue.severity === 'warning').length
  const frameIssues = selectedFrame
    ? validation.filter((issue) => issue.targetId === selectedFrame.id || selectedFrame.components.some((component) => component.id === issue.targetId) || selectedFrame.doors.some((door) => door.id === issue.targetId))
    : []
  const componentIssues = selectedComponent ? validation.filter((issue) => issue.targetId === selectedComponent.id) : []
  const totalComponents = orderedFrames.reduce((sum, frame) => sum + frame.components.length, 0)

  const addFrameFromPreset = (preset: LegacyCatalogItem) => {
    const frame = buildFrameFromPreset(preset, design.furniture.frames.length)
    dispatch({ type: 'FRAME_ADD', frame })
    setMobilePanel('inspector')
  }

  const addDefaultFrame = () => {
    const customPreset = framePresets.find((preset) => preset.id === 'frame-custom')
    if (customPreset) addFrameFromPreset(customPreset)
  }

  const updateLanguage = (language: LanguageCode) => dispatch({ type: 'LANGUAGE_UPDATE', language })
  const beginCatalogDrag = (itemId: string) => {
    activeCatalogItemRef.current = itemId
    setActiveCatalogItemId(itemId)
  }
  const endCatalogDrag = () => {
    activeCatalogItemRef.current = null
    setActiveCatalogItemId(null)
  }

  useEffect(() => {
    const handleHistoryKeys = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, select')) return
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        dispatch({ type: event.shiftKey ? 'REDO' : 'UNDO' })
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        dispatch({ type: 'REDO' })
      }
    }
    window.addEventListener('keydown', handleHistoryKeys)
    return () => window.removeEventListener('keydown', handleHistoryKeys)
  }, [dispatch])

  useEffect(() => {
    const clearPointerDrag = () => window.setTimeout(endCatalogDrag, 0)
    window.addEventListener('pointerup', clearPointerDrag)
    window.addEventListener('pointercancel', clearPointerDrag)
    return () => {
      window.removeEventListener('pointerup', clearPointerDrag)
      window.removeEventListener('pointercancel', clearPointerDrag)
    }
  })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const result = projectRepository.saveDraft(design)
      if (result.ok) { setLastSavedAt(result.value); setStorageMessage(null) }
      else setStorageMessage(result.errorKey)
    }, 900)
    return () => window.clearTimeout(timer)
  }, [design])

  return (
    <>
    <a className="skip-link" href="#designer-workspace">{t('accessibility.skipToDesigner')}</a>
    <main className="designer-shell" id="designer-workspace">
      <header className="designer-topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">FSW</span>
          <span>
            <strong>{t('app.name')}</strong>
            <small>{t('app.tagline')}</small>
          </span>
        </div>

        <nav className="top-progress" aria-label={t('app.phase')}>
          <span>{t('nav.setup')}</span>
          <i aria-hidden="true" />
          <strong>{t('nav.build')}</strong>
          <i aria-hidden="true" />
          <span>{t('nav.review')}</span>
        </nav>

        <div className="top-summary">
          <span className={`health-chip${errorCount > 0 ? ' has-errors' : ''}`}>
            {errorCount} {t('label.errors')} · {warningCount} {t('label.warnings')}
          </span>
          <strong>{formatEstimatedPrice(price.total, design.language)}</strong>
          <small className={storageMessage ? 'save-status has-error' : 'save-status'} role="status">{storageMessage ? t(storageMessage) : lastSavedAt ? `${t('storage.autosaved')} ${new Date(lastSavedAt).toLocaleTimeString(design.language === 'ro' ? 'ro-RO' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}` : t('storage.autosaveWaiting')}</small>
        </div>

        <div className="top-actions">
          <div className="history-actions" aria-label={t('label.history')}>
            <button type="button" disabled={state.past.length === 0} onClick={() => dispatch({ type: 'UNDO' })} title="Ctrl+Z">↶ {t('button.undo')}</button>
            <button type="button" disabled={state.future.length === 0} onClick={() => dispatch({ type: 'REDO' })} title="Ctrl+Y">↷ {t('button.redo')}</button>
          </div>
          <div className="workspace-actions">
            <button type="button" onClick={() => setProjectsOpen(true)}>{t('button.projects')}</button>
            <button type="button" onClick={() => setExportOpen(true)}>{t('button.export')}</button>
            <button type="button" onClick={() => setPrintOpen(true)}>{t('button.print')}</button>
          </div>
          <div className="language-switch" aria-label={t('label.language')}>
            <button type="button" aria-pressed={design.language === 'en'} onClick={() => updateLanguage('en')}>EN</button>
            <button type="button" aria-pressed={design.language === 'ro'} onClick={() => updateLanguage('ro')}>RO</button>
          </div>
        </div>
      </header>

      <nav className="mobile-panel-tabs" aria-label={t('app.phase')}>
        {(['catalog', 'inspector', 'summary'] as const).map((panel) => (
          <button
            type="button"
            key={panel}
            className={mobilePanel === panel ? 'is-active' : ''}
            onClick={() => setMobilePanel(panel)}
          >
            {t(`panel.${panel}`)}
          </button>
        ))}
      </nav>

      <div className="designer-grid">
        <aside className={`catalog-panel side-panel${mobilePanel === 'catalog' ? ' is-mobile-open' : ''}`} aria-label={t('panel.catalog')}>
          <InstallationSetup />

          <section className="frame-catalog panel-section">
            <div className="section-heading">
              <div>
                <span>{t('nav.build')}</span>
                <h2>{t('label.framePresets')}</h2>
              </div>
              <span>{framePresets.slice(0, 6).length}</span>
            </div>

            <div className="catalog-list">
              {framePresets.slice(0, 6).map((preset) => (
                <button type="button" className="catalog-card" key={preset.id} onClick={() => addFrameFromPreset(preset)}>
                  <span className={`catalog-card-visual is-${String(preset.rules.preset)}`} aria-hidden="true">
                    <i /><i /><i />
                  </span>
                  <span className="catalog-card-copy">
                    <strong>{t(`preset.${preset.id}`)}</strong>
                    <small>
                      {preset.dimensions.widthMm} × {preset.dimensions.heightMm} × {preset.dimensions.depthMm} mm
                    </small>
                    <em>{formatEstimatedPrice(preset.price, design.language)}</em>
                  </span>
                  <span className="catalog-add" aria-hidden="true">＋</span>
                </button>
              ))}
            </div>
          </section>

          <ComponentCatalogPanel
            frame={selectedFrame}
            t={t}
            onDragStart={beginCatalogDrag}
            onDragEnd={endCatalogDrag}
            onAdded={() => setMobilePanel('inspector')}
          />

          {orderedFrames.length > 0 && (
            <section className="frame-order-list panel-section">
              <div className="section-heading">
                <h2>{t('label.frames')}</h2>
                <span>{orderedFrames.length}</span>
              </div>
              {orderedFrames.map((frame, index) => (
                <button
                  type="button"
                  key={frame.id}
                  className={selectedFrame?.id === frame.id ? 'is-selected' : ''}
                  onClick={() => {
                    dispatch({ type: 'ITEM_SELECT', selectedItem: { kind: 'frame', id: frame.id } })
                    setMobilePanel('inspector')
                  }}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <span><strong>{frame.name}</strong><small>{frame.widthMm} × {frame.heightMm} × {frame.depthMm} mm</small></span>
                </button>
              ))}
            </section>
          )}
        </aside>

        <section className="canvas-column">
          <WardrobeCanvas
            onAddFrame={addDefaultFrame}
            activeCatalogItemId={activeCatalogItemId}
            getActiveCatalogItemId={() => activeCatalogItemRef.current}
            onCatalogDragEnd={endCatalogDrag}
            onInspectorRequest={() => setMobilePanel('inspector')}
          />
        </section>

        <aside className={`inspector-panel side-panel${mobilePanel === 'inspector' || mobilePanel === 'summary' ? ' is-mobile-open' : ''}`} aria-label={t('panel.inspector')}>
          <section className={`inspector-content${mobilePanel === 'summary' ? ' is-mobile-hidden' : ''}`}>
            <div className="inspector-title">
              <span>{t('label.inspector')}</span>
              <h2>{selectedComponent ? selectedComponent.name : selectedDoor ? t(`door.${selectedDoor.type}`) : selectedFrame ? selectedFrame.name : t('label.selectedFrame')}</h2>
            </div>

            {!selectedFrame ? (
              <div className="inspector-empty">
                <span aria-hidden="true">◇</span>
                <p>{t('empty.noSelection')}</p>
              </div>
            ) : (
              <>
                {selectedComponent ? (
                  <ComponentInspector frame={selectedFrame} component={selectedComponent} issues={componentIssues} t={t} />
                ) : (
                  <>
                    {design.selectedObject?.objectType !== 'door' && <DimensionEditor frame={selectedFrame} frameIssues={frameIssues} isFirst={selectedFrame.orderIndex === 0} isLast={selectedFrame.orderIndex === orderedFrames.length - 1} />}
                    <InternalPresetPanel frame={selectedFrame} t={t} />
                    <DoorConfigurator frame={selectedFrame} issues={frameIssues} t={t} />
                    <div className="component-readiness">
                      <div><span>{t('label.components')}</span><strong>{selectedFrame.components.length}</strong></div>
                      <p>{selectedFrame.components.length === 0 ? t('empty.selectedFrameNoComponents') : t('catalog.dragHint')}</p>
                    </div>
                  </>
                )}
              </>
            )}
          </section>

          <section className={`live-summary${mobilePanel === 'inspector' ? ' is-mobile-hidden' : ''}`}>
            <div className="inspector-title">
              <span>{t('nav.review')}</span>
              <h2>{t('label.summary')}</h2>
            </div>

            <div className="summary-metrics">
              <div><span>{t('summary.frameCount')}</span><strong>{orderedFrames.length}</strong></div>
              <div><span>{t('summary.componentCount')}</span><strong>{totalComponents}</strong></div>
              <div><span>{t('summary.overallWidth')}</span><strong>{formatDimensionLabel(totalWidth, 'cm')}</strong></div>
              <div><span>{t('summary.maximumHeight')}</span><strong>{formatDimensionLabel(maximumHeight, 'cm')}</strong></div>
              <div><span>{t('summary.maximumDepth')}</span><strong>{formatDimensionLabel(maximumDepth, 'cm')}</strong></div>
              <div className={remainingWidth < 0 ? 'is-error' : ''}><span>{t('summary.remainingWidth')}</span><strong>{remainingWidth} mm</strong></div>
              <div><span>{t('label.estimatedPrice')}</span><strong>{formatEstimatedPrice(price.total, design.language)}</strong></div>
            </div>

            <div className="price-breakdown">
              <div><span>{t('label.framesTotal')}</span><strong>{formatEstimatedPrice(price.frames, design.language)}</strong></div>
              <div><span>{t('label.doorsTotal')}</span><strong>{formatEstimatedPrice(price.doors, design.language)}</strong></div>
              <div><span>{t('label.componentsTotal')}</span><strong>{formatEstimatedPrice(price.components, design.language)}</strong></div>
              <div><span>{t('label.accessoriesTotal')}</span><strong>{formatEstimatedPrice(price.accessories, design.language)}</strong></div>
              <div><span>{t('label.lightingTotal')}</span><strong>{formatEstimatedPrice(price.lighting, design.language)}</strong></div>
              <div className="is-total"><span>{t('label.total')}</span><strong>{formatEstimatedPrice(price.total, design.language)}</strong></div>
            </div>

            {selectedFrame && (
              <div className="selected-summary">
                <span>{t('label.selectedFrame')}</span>
                <strong>{selectedFrame.widthMm} × {selectedFrame.heightMm} × {selectedFrame.depthMm} mm</strong>
              </div>
            )}

            <div className="validation-summary">
              <div className="section-heading">
                <h3>{t('label.issues')}</h3>
                <span>{validation.length}</span>
              </div>
              {validation.length === 0 ? <p>{t('empty.noIssues')}</p> : validation.slice(0, 6).map((issue) => (
                <p key={issue.id} className={`validation-item is-${issue.severity}`}>
                  <span aria-hidden="true" />{t(issue.messageKey)}
                </p>
              ))}
            </div>

            <PartsList t={t} />

            <small className="fictional-price-note">{t('price.fictionalNote')}</small>
          </section>
        </aside>
      </div>
    </main>
    <nav className="mobile-bottom-actions" aria-label={t('label.projectActions')}>
      <button type="button" onClick={() => setProjectsOpen(true)}>{t('button.projects')}</button>
      <button type="button" onClick={() => setExportOpen(true)}>{t('button.export')}</button>
      <button type="button" onClick={() => setPrintOpen(true)}>{t('button.print')}</button>
    </nav>
    <SavedProjectsDialog open={projectsOpen} onClose={() => setProjectsOpen(false)} onSaved={setLastSavedAt} t={t} />
    <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} onPrint={() => { setExportOpen(false); setPrintOpen(true) }} t={t} />
    <PrintSummary open={printOpen} onClose={() => setPrintOpen(false)} t={t} />
    </>
  )
}
