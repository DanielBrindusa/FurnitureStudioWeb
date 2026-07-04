import { useMemo, useState } from 'react'
import { DimensionEditor } from '../components/DimensionEditor'
import { InstallationSetup } from '../components/InstallationSetup'
import { WardrobeCanvas } from '../components/canvas/WardrobeCanvas'
import { framePresets } from '../data/catalog'
import { buildFrameFromPreset } from '../data/framePresetFactory'
import { translate } from '../i18n'
import type { CatalogItem, LanguageCode } from '../models/design'
import { formatEstimatedPrice } from '../pricing/priceEngine'
import { useDesign } from '../state/designState'
import { formatDimensionLabel } from '../utils/dimensions'
import './app.css'

type MobilePanel = 'catalog' | 'inspector' | 'summary'

export function App() {
  const { state, dispatch } = useDesign()
  const { design, validation, price } = state
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('catalog')
  const t = (key: string) => translate(design.language, key)
  const orderedFrames = useMemo(
    () => [...design.frames].sort((a, b) => a.orderIndex - b.orderIndex),
    [design.frames],
  )
  const selectedFrame = design.selectedItem?.kind === 'frame'
    ? orderedFrames.find((frame) => frame.id === design.selectedItem?.id) ?? null
    : null
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
    ? validation.filter((issue) => issue.targetId === selectedFrame.id || selectedFrame.components.some((component) => component.id === issue.targetId))
    : []

  const addFrameFromPreset = (preset: CatalogItem) => {
    const frame = buildFrameFromPreset(preset, design.frames.length)
    dispatch({ type: 'FRAME_ADD', frame })
    setMobilePanel('inspector')
  }

  const addDefaultFrame = () => {
    const customPreset = framePresets.find((preset) => preset.id === 'frame-custom')
    if (customPreset) addFrameFromPreset(customPreset)
  }

  const updateLanguage = (language: LanguageCode) => dispatch({ type: 'LANGUAGE_UPDATE', language })

  return (
    <main className="designer-shell">
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
        </div>

        <div className="top-actions">
          <div className="placeholder-actions" aria-label={t('save.savedLocally')}>
            <button type="button" disabled title={t('save.notImplemented')}>{t('button.save')}</button>
            <button type="button" disabled title={t('save.notImplemented')}>{t('button.load')}</button>
            <button type="button" disabled title={t('save.notImplemented')}>{t('button.exportJson')}</button>
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
          <WardrobeCanvas onAddFrame={addDefaultFrame} />
        </section>

        <aside className={`inspector-panel side-panel${mobilePanel === 'inspector' || mobilePanel === 'summary' ? ' is-mobile-open' : ''}`} aria-label={t('panel.inspector')}>
          <section className={`inspector-content${mobilePanel === 'summary' ? ' is-mobile-hidden' : ''}`}>
            <div className="inspector-title">
              <span>{t('label.inspector')}</span>
              <h2>{selectedFrame ? selectedFrame.name : t('label.selectedFrame')}</h2>
            </div>

            {!selectedFrame ? (
              <div className="inspector-empty">
                <span aria-hidden="true">◇</span>
                <p>{t('empty.noSelection')}</p>
              </div>
            ) : (
              <>
                <DimensionEditor
                  frame={selectedFrame}
                  frameIssues={frameIssues}
                  isFirst={selectedFrame.orderIndex === 0}
                  isLast={selectedFrame.orderIndex === orderedFrames.length - 1}
                />
                <div className="component-readiness">
                  <div><span>{t('label.components')}</span><strong>{selectedFrame.components.length}</strong></div>
                  <p>{selectedFrame.components.length === 0 ? t('empty.selectedFrameNoComponents') : t('empty.noComponents')}</p>
                </div>
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
              <div><span>{t('summary.overallWidth')}</span><strong>{formatDimensionLabel(totalWidth, 'cm')}</strong></div>
              <div><span>{t('summary.maximumHeight')}</span><strong>{formatDimensionLabel(maximumHeight, 'cm')}</strong></div>
              <div><span>{t('summary.maximumDepth')}</span><strong>{formatDimensionLabel(maximumDepth, 'cm')}</strong></div>
              <div className={remainingWidth < 0 ? 'is-error' : ''}><span>{t('summary.remainingWidth')}</span><strong>{remainingWidth} mm</strong></div>
              <div><span>{t('label.estimatedPrice')}</span><strong>{formatEstimatedPrice(price.total, design.language)}</strong></div>
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

            <small className="fictional-price-note">{t('price.fictionalNote')}</small>
          </section>
        </aside>
      </div>
    </main>
  )
}
