import { boardMaterials } from '../data/catalog'
import { translate } from '../i18n'
import type { Frame, ValidationResult } from '../models/design'
import { useDesign } from '../state/designState'
import { clampDimensionMm, parseIntegerMm } from '../utils/dimensions'

const WIDTH_PRESETS = [500, 750, 1000, 1200, 1500, 2000, 2070]
const HEIGHT_PRESETS = [2010, 2360, 2500, 2700, 2800]
const DEPTH_PRESETS = [350, 450, 580, 600]
const FINISHES = ['matte', 'satin', 'wood-light', 'wood-medium', 'wood-dark']

type DimensionProperty = 'widthMm' | 'heightMm' | 'depthMm'

function PrecisionDimensionControl({
  frame,
  property,
  label,
  presets,
  min,
  max,
  hint,
}: {
  frame: Frame
  property: DimensionProperty
  label: string
  presets: number[]
  min: number
  max: number
  hint: string
}) {
  const { dispatch } = useDesign()
  const current = frame[property]

  const update = (candidate: unknown) => {
    const value = clampDimensionMm(candidate, min, max)
    if (value !== null) {
      dispatch({ type: 'FRAME_UPDATE_DIMENSIONS', frameId: frame.id, patch: { [property]: value } })
    }
  }

  const nudge = (deltaMm: number) => update(current + deltaMm)

  return (
    <div className="precision-control">
      <div className="precision-control-heading">
        <label htmlFor={`${frame.id}-${property}`}>{label}</label>
        <small>{hint}</small>
      </div>
      <div className="precision-input-row">
        <button type="button" onClick={() => nudge(-1)} aria-label={`${label} -1 mm`}>−1</button>
        <input
          id={`${frame.id}-${property}`}
          type="number"
          step="1"
          min={min}
          max={max}
          value={current}
          onChange={(event) => {
            const value = parseIntegerMm(event.target.value)
            if (value !== null) update(value)
          }}
        />
        <span>mm</span>
        <button type="button" onClick={() => nudge(1)} aria-label={`${label} +1 mm`}>+1</button>
      </div>
      <div className="nudge-row">
        <button type="button" onClick={() => nudge(-10)}>−10 mm</button>
        <button type="button" onClick={() => nudge(10)}>+10 mm</button>
        <button type="button" onClick={() => nudge(-10)}>−1 cm</button>
        <button type="button" onClick={() => nudge(10)}>+1 cm</button>
      </div>
      <div className="dimension-preset-row">
        {presets.map((preset) => (
          <button
            type="button"
            key={preset}
            className={current === preset ? 'is-active' : ''}
            onClick={() => update(preset)}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  )
}

export function DimensionEditor({
  frame,
  frameIssues,
  isFirst,
  isLast,
}: {
  frame: Frame
  frameIssues: ValidationResult[]
  isFirst: boolean
  isLast: boolean
}) {
  const { state, dispatch } = useDesign()
  const t = (key: string) => translate(state.design.language, key)

  return (
    <div className="dimension-editor">
      <label className="text-field">
        <span>{t('label.frameName')}</span>
        <input
          type="text"
          value={frame.name}
          onChange={(event) => dispatch({ type: 'FRAME_RENAME', frameId: frame.id, name: event.target.value })}
        />
      </label>

      <PrecisionDimensionControl frame={frame} property="widthMm" label={t('label.width')} presets={WIDTH_PRESETS} min={10} max={2070} hint={t('hint.frameWidthRange')} />
      <PrecisionDimensionControl frame={frame} property="heightMm" label={t('label.height')} presets={HEIGHT_PRESETS} min={10} max={2800} hint={t('hint.frameHeightRange')} />
      <PrecisionDimensionControl frame={frame} property="depthMm" label={t('label.depth')} presets={DEPTH_PRESETS} min={1} max={2000} hint={t('hint.frameDepthRange')} />

      <div className="select-grid">
        <label className="select-field">
          <span>{t('label.material')}</span>
          <select
            value={frame.materialId}
            onChange={(event) => dispatch({ type: 'MATERIAL_CHANGE', target: 'frame', targetId: frame.id, materialId: event.target.value })}
          >
            {boardMaterials.map((material) => (
              <option key={material.id} value={material.id}>{t(`material.${material.id}`)}</option>
            ))}
          </select>
        </label>

        <label className="select-field">
          <span>{t('label.finish')}</span>
          <select value={frame.finishId} onChange={(event) => dispatch({ type: 'FINISH_CHANGE', frameId: frame.id, finishId: event.target.value })}>
            {FINISHES.map((finish) => <option key={finish} value={finish}>{t(`finish.${finish}`)}</option>)}
          </select>
        </label>
      </div>

      {frameIssues.length > 0 && (
        <div className="frame-issues">
          {frameIssues.map((issue) => (
            <p key={issue.id} className={`is-${issue.severity}`}>{t(issue.messageKey)}</p>
          ))}
        </div>
      )}

      <div className="frame-management-actions">
        <button type="button" disabled={isFirst} onClick={() => dispatch({ type: 'FRAME_REORDER', frameId: frame.id, orderIndex: frame.orderIndex - 1 })}>← {t('button.moveLeft')}</button>
        <button type="button" disabled={isLast} onClick={() => dispatch({ type: 'FRAME_REORDER', frameId: frame.id, orderIndex: frame.orderIndex + 1 })}>{t('button.moveRight')} →</button>
        <button type="button" onClick={() => dispatch({ type: 'FRAME_DUPLICATE', frameId: frame.id })}>{t('button.duplicate')}</button>
        <button type="button" className="danger-button" onClick={() => dispatch({ type: 'FRAME_DELETE', frameId: frame.id })}>{t('button.delete')}</button>
      </div>
    </div>
  )
}
