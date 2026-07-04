import { useMemo, type CSSProperties } from 'react'
import { boardMaterials, getMaterial } from '../data/catalog'
import { translate } from '../i18n'
import { createComponent, createDoor, createFrame } from '../models/factories'
import type { Frame, FurnitureComponentType, LanguageCode } from '../models/design'
import { formatEstimatedPrice } from '../pricing/priceEngine'
import { useDesign } from '../state/designState'
import { formatDimensionLabel, parseIntegerMm } from '../utils/dimensions'
import './app.css'

interface DimensionInputProps {
  label: string
  value: number
  onChange: (value: number) => void
}

function DimensionInput({ label, value, onChange }: DimensionInputProps) {
  return (
    <label className="dimension-field">
      <span>{label}</span>
      <span className="input-with-unit">
        <input
          type="number"
          inputMode="numeric"
          step="1"
          value={value}
          onChange={(event) => {
            const parsed = parseIntegerMm(event.target.value)
            if (parsed !== null) onChange(parsed)
          }}
        />
        <span aria-hidden="true">mm</span>
      </span>
    </label>
  )
}

function PreviewFrame({ frame, selected, onSelect, label }: {
  frame: Frame
  selected: boolean
  onSelect: () => void
  label: string
}) {
  const material = getMaterial(frame.materialId)
  const style = {
    '--frame-color': material?.color ?? '#f3f0e8',
    flexGrow: Math.max(frame.widthMm, 10),
    height: `${Math.max(12, Math.min(100, (frame.heightMm / 2800) * 100))}%`,
  } as CSSProperties

  return (
    <button
      type="button"
      className={`preview-frame${selected ? ' is-selected' : ''}`}
      style={style}
      onClick={onSelect}
      aria-label={label}
    >
      <span className="preview-frame-label">{frame.widthMm} × {frame.heightMm}</span>
      <span className="preview-frame-interior" aria-hidden="true">
        {frame.components.map((component) => {
          const markerStyle = {
            left: `${Math.max(0, (component.xMm / Math.max(frame.widthMm, 1)) * 100)}%`,
            bottom: `${Math.max(0, (component.yMm / Math.max(frame.heightMm, 1)) * 100)}%`,
            width: `${Math.min(100, (component.widthMm / Math.max(frame.widthMm, 1)) * 100)}%`,
            height: `${Math.max(1.5, Math.min(100, (component.heightMm / Math.max(frame.heightMm, 1)) * 100))}%`,
          }
          return <span key={component.id} className={`component-marker is-${component.type}`} style={markerStyle} />
        })}
      </span>
      {frame.showDoors && frame.doors.length > 0 && <span className="door-overlay" aria-hidden="true" />}
    </button>
  )
}

export function App() {
  const { state, dispatch } = useDesign()
  const { design, validation, price } = state
  const t = (key: string) => translate(design.language, key)
  const orderedFrames = useMemo(
    () => [...design.frames].sort((a, b) => a.orderIndex - b.orderIndex),
    [design.frames],
  )
  const selectedFrame = design.selectedItem?.kind === 'frame'
    ? design.frames.find((frame) => frame.id === design.selectedItem?.id) ?? null
    : null
  const totalWidth = design.frames.reduce((total, frame) => total + frame.widthMm, 0)
  const componentCount = design.frames.reduce((total, frame) => total + frame.components.length, 0)
  const errorCount = validation.filter((issue) => issue.severity === 'error').length
  const warningCount = validation.filter((issue) => issue.severity === 'warning').length

  const addFrame = () => {
    dispatch({ type: 'FRAME_ADD', frame: createFrame({ orderIndex: design.frames.length }) })
  }

  const addComponent = (type: FurnitureComponentType) => {
    if (!selectedFrame) return
    const sameTypeCount = selectedFrame.components.filter((component) => component.type === type).length
    const yMm = type === 'clothes-rail'
      ? Math.max(900, selectedFrame.heightMm - 450)
      : type === 'shelf'
        ? 450 + sameTypeCount * 350
        : 100 + sameTypeCount * 240

    dispatch({
      type: 'COMPONENT_ADD',
      frameId: selectedFrame.id,
      component: createComponent(type, selectedFrame, { yMm }),
    })
  }

  const updateLanguage = (language: LanguageCode) => {
    dispatch({ type: 'LANGUAGE_UPDATE', language })
  }

  return (
    <main className="workspace-shell">
      <header className="workspace-topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">FSW</span>
          <span>
            <strong>{t('app.name')}</strong>
            <small>{t('app.tagline')}</small>
          </span>
        </div>

        <div className="topbar-status">
          <span className={`health-chip${errorCount > 0 ? ' has-errors' : ''}`}>
            {errorCount} {t('label.errors')} · {warningCount} {t('label.warnings')}
          </span>
          <strong>{formatEstimatedPrice(price.total, design.language)}</strong>
        </div>

        <div className="topbar-actions">
          <div className="language-switch" aria-label={t('label.language')}>
            <button type="button" aria-pressed={design.language === 'en'} onClick={() => updateLanguage('en')}>EN</button>
            <button type="button" aria-pressed={design.language === 'ro'} onClick={() => updateLanguage('ro')}>RO</button>
          </div>
          <button type="button" className="secondary-button" onClick={() => dispatch({ type: 'DESIGN_CREATE' })}>
            {t('button.newDesign')}
          </button>
        </div>
      </header>

      <div className="workspace-grid">
        <aside className="left-panel panel" aria-label={t('nav.build')}>
          <nav className="phase-nav" aria-label={t('app.phase')}>
            {['projects', 'setup', 'build', 'outfit', 'finish', 'review'].map((phase) => (
              <button key={phase} type="button" className={phase === 'build' ? 'is-active' : ''}>
                <span aria-hidden="true">{String(['projects', 'setup', 'build', 'outfit', 'finish', 'review'].indexOf(phase) + 1).padStart(2, '0')}</span>
                {t(`nav.${phase}`)}
              </button>
            ))}
          </nav>

          <section className="panel-section">
            <div className="section-heading">
              <h2>{t('label.installationSpace')}</h2>
              <span>mm</span>
            </div>
            <div className="dimension-form compact">
              {([
                ['widthMm', 'label.width'],
                ['heightMm', 'label.height'],
                ['depthMm', 'label.depth'],
                ['leftClearanceMm', 'label.leftClearance'],
                ['rightClearanceMm', 'label.rightClearance'],
                ['topClearanceMm', 'label.topClearance'],
              ] as const).map(([property, labelKey]) => (
                <DimensionInput
                  key={property}
                  label={t(labelKey)}
                  value={design.installationSpace[property]}
                  onChange={(value) => dispatch({ type: 'INSTALLATION_UPDATE', patch: { [property]: value } })}
                />
              ))}
            </div>
          </section>

          <section className="panel-section frame-list-section">
            <div className="section-heading">
              <h2>{t('label.frames')}</h2>
              <span>{design.frames.length}</span>
            </div>
            <button type="button" className="primary-button fluid" onClick={addFrame}>{t('button.addFrame')}</button>
            <div className="frame-list">
              {orderedFrames.map((frame) => (
                <button
                  type="button"
                  key={frame.id}
                  className={selectedFrame?.id === frame.id ? 'is-selected' : ''}
                  onClick={() => dispatch({ type: 'ITEM_SELECT', selectedItem: { kind: 'frame', id: frame.id } })}
                >
                  <span>{t('label.frame')} {frame.orderIndex + 1}</span>
                  <small>{frame.widthMm} × {frame.heightMm} × {frame.depthMm} mm</small>
                </button>
              ))}
            </div>
          </section>
        </aside>

        <section className="preview-panel" aria-label={t('label.preview')}>
          <div className="preview-toolbar">
            <div>
              <span>{t('label.preview')}</span>
              <strong>{formatDimensionLabel(totalWidth, 'cm')}</strong>
            </div>
            <span className="phase-pill">{t('app.phase')}</span>
          </div>

          <div className="preview-stage">
            {orderedFrames.length === 0 ? (
              <div className="empty-preview">
                <span className="empty-preview-mark" aria-hidden="true">+</span>
                <h1>{t('empty.noFrames')}</h1>
                <p>{t('empty.noFramesHint')}</p>
                <button type="button" className="primary-button" onClick={addFrame}>{t('button.addFrame')}</button>
              </div>
            ) : (
              <div className="frames-elevation">
                {orderedFrames.map((frame) => (
                  <PreviewFrame
                    key={frame.id}
                    frame={frame}
                    selected={selectedFrame?.id === frame.id}
                    onSelect={() => dispatch({ type: 'ITEM_SELECT', selectedItem: { kind: 'frame', id: frame.id } })}
                    label={`${t('button.selectFrame')}: ${t('label.frame')} ${frame.orderIndex + 1}`}
                  />
                ))}
              </div>
            )}
            <div className="floor-line" aria-hidden="true" />
          </div>
        </section>

        <aside className="right-panel panel" aria-label={t('label.inspector')}>
          <div className="section-heading inspector-heading">
            <div>
              <span>{t('label.inspector')}</span>
              <h2>{selectedFrame ? `${t('label.frame')} ${selectedFrame.orderIndex + 1}` : t('label.selectedFrame')}</h2>
            </div>
            {selectedFrame && <span className="selection-dot" aria-hidden="true" />}
          </div>

          {!selectedFrame ? (
            <div className="empty-inspector"><p>{t('empty.noSelection')}</p></div>
          ) : (
            <>
              <section className="panel-section">
                <div className="dimension-form">
                  <DimensionInput
                    label={t('label.width')}
                    value={selectedFrame.widthMm}
                    onChange={(widthMm) => dispatch({ type: 'FRAME_UPDATE_DIMENSIONS', frameId: selectedFrame.id, patch: { widthMm } })}
                  />
                  <DimensionInput
                    label={t('label.height')}
                    value={selectedFrame.heightMm}
                    onChange={(heightMm) => dispatch({ type: 'FRAME_UPDATE_DIMENSIONS', frameId: selectedFrame.id, patch: { heightMm } })}
                  />
                  <DimensionInput
                    label={t('label.depth')}
                    value={selectedFrame.depthMm}
                    onChange={(depthMm) => dispatch({ type: 'FRAME_UPDATE_DIMENSIONS', frameId: selectedFrame.id, patch: { depthMm } })}
                  />
                </div>

                <label className="select-field">
                  <span>{t('label.material')}</span>
                  <select
                    value={selectedFrame.materialId}
                    onChange={(event) => dispatch({ type: 'MATERIAL_CHANGE', target: 'frame', targetId: selectedFrame.id, materialId: event.target.value })}
                  >
                    {boardMaterials.map((material) => (
                      <option key={material.id} value={material.id}>{t(`material.${material.id}`)}</option>
                    ))}
                  </select>
                </label>
              </section>

              <section className="panel-section">
                <div className="section-heading">
                  <h3>{t('label.components')}</h3>
                  <span>{selectedFrame.components.length}</span>
                </div>
                <div className="action-grid">
                  <button type="button" onClick={() => addComponent('shelf')}>{t('button.addShelf')}</button>
                  <button type="button" onClick={() => addComponent('drawer')}>{t('button.addDrawer')}</button>
                  <button type="button" onClick={() => addComponent('clothes-rail')}>{t('button.addRail')}</button>
                  <button
                    type="button"
                    disabled={selectedFrame.doors.length > 0}
                    onClick={() => dispatch({ type: 'DOOR_UPSERT', frameId: selectedFrame.id, door: createDoor('hinged', selectedFrame) })}
                  >
                    {t('button.addHingedDoor')}
                  </button>
                </div>
              </section>

              <div className="inspector-actions">
                <button type="button" className="secondary-button" onClick={() => dispatch({ type: 'FRAME_DUPLICATE', frameId: selectedFrame.id })}>
                  {t('button.duplicate')}
                </button>
                <button type="button" className="danger-button" onClick={() => dispatch({ type: 'FRAME_DELETE', frameId: selectedFrame.id })}>
                  {t('button.delete')}
                </button>
              </div>
            </>
          )}
        </aside>

        <section className="summary-panel panel" aria-label={t('label.summary')}>
          <div className="summary-block design-summary">
            <span>{t('label.summary')}</span>
            <div><strong>{design.frames.length}</strong><small>{t('summary.frameCount')}</small></div>
            <div><strong>{componentCount}</strong><small>{t('summary.componentCount')}</small></div>
            <div><strong>{formatDimensionLabel(totalWidth, 'cm')}</strong><small>{t('summary.overallWidth')}</small></div>
            <div><strong>{formatDimensionLabel(design.installationSpace.widthMm, 'cm')}</strong><small>{t('summary.availableWidth')}</small></div>
          </div>

          <div className="summary-block issue-summary">
            <span>{t('label.designHealth')}</span>
            <div className="issue-list">
              {validation.length === 0 ? <p>{t('empty.noIssues')}</p> : validation.slice(0, 4).map((issue) => (
                <p key={issue.id} className={`issue is-${issue.severity}`}>
                  <span aria-hidden="true" />{t(issue.messageKey)}
                </p>
              ))}
            </div>
          </div>

          <div className="summary-block price-summary">
            <span>{t('label.estimatedPrice')}</span>
            <dl>
              {([
                ['frames', 'label.framesTotal'],
                ['doors', 'label.doorsTotal'],
                ['components', 'label.componentsTotal'],
                ['accessories', 'label.accessoriesTotal'],
                ['lighting', 'label.lightingTotal'],
              ] as const).map(([key, labelKey]) => (
                <div key={key}><dt>{t(labelKey)}</dt><dd>{formatEstimatedPrice(price[key], design.language)}</dd></div>
              ))}
              <div className="price-total"><dt>{t('label.total')}</dt><dd>{formatEstimatedPrice(price.total, design.language)}</dd></div>
            </dl>
            <small>{t('price.fictionalNote')}</small>
          </div>
        </section>
      </div>
    </main>
  )
}
