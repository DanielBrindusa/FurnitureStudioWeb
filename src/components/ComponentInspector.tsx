import { materials } from '../data/catalog'
import type { Frame, FurnitureComponent, ValidationResult } from '../models/design'
import { calculateComponentPrice, formatEstimatedPrice } from '../pricing/priceEngine'
import { useDesign } from '../state/designState'

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, Math.round(value)))

export function ComponentInspector({
  frame,
  component,
  issues,
  t,
}: {
  frame: Frame
  component: FurnitureComponent
  issues: ValidationResult[]
  t: (key: string) => string
}) {
  const { state, dispatch } = useDesign()
  const update = (patch: Partial<FurnitureComponent>) => dispatch({
    type: 'COMPONENT_UPDATE',
    frameId: frame.id,
    componentId: component.id,
    patch,
  })
  const move = (delta: number) => update({
    yMm: clamp(component.yMm + delta, 18, Math.max(18, frame.heightMm - component.heightMm - 18)),
  })

  const dimensionField = (key: 'yMm' | 'widthMm' | 'heightMm' | 'depthMm', label: string, max: number) => (
    <label className="compact-number-field">
      <span>{label}</span>
      <span><input
        key={`${component.id}-${key}-${component[key]}`}
        type="number"
        inputMode="numeric"
        defaultValue={component[key]}
        onBlur={(event) => update({ [key]: clamp(Number(event.target.value), 1, max) })}
      /><i>mm</i></span>
    </label>
  )

  return (
    <div className="component-inspector">
      <div className="component-kind-chip"><span aria-hidden="true">◆</span>{t(`component.${component.type}`)}</div>
      <label className="text-field">
        <span>{t('label.componentName')}</span>
        <input value={component.name} onChange={(event) => update({ name: event.target.value })} />
      </label>

      <div className="component-position-actions">
        <button type="button" onClick={() => move(10)}>↑ {t('button.moveUp')} 1 cm</button>
        <button type="button" onClick={() => move(-10)}>↓ {t('button.moveDown')} 1 cm</button>
      </div>

      <details className="advanced-controls" open>
        <summary>{t('label.positionAndSize')}</summary>
        <div className="component-dimension-grid">
          {dimensionField('yMm', t('label.yPosition'), frame.heightMm)}
          {dimensionField('widthMm', t('label.width'), frame.widthMm - 36)}
          {dimensionField('heightMm', t('label.height'), frame.heightMm - 36)}
          {dimensionField('depthMm', t('label.depth'), frame.depthMm)}
        </div>
        <label className="select-field">
          <span>{t('label.material')}</span>
          <select value={component.materialId} onChange={(event) => dispatch({ type: 'MATERIAL_CHANGE', target: 'component', targetId: component.id, materialId: event.target.value })}>
            {materials.map((material) => <option key={material.id} value={material.id}>{t(`material.${material.id}`)}</option>)}
          </select>
        </label>
      </details>

      {issues.length > 0 && (
        <div className="component-compatibility" role="status">
          <strong>{t('label.compatibility')}</strong>
          {issues.map((issue) => <p key={issue.id} className={`is-${issue.severity}`}>{t(issue.messageKey)}</p>)}
        </div>
      )}

      <div className="component-price-line"><span>{t('label.estimatedPrice')}</span><strong>{formatEstimatedPrice(calculateComponentPrice(component), state.design.language)}</strong></div>
      <div className="component-management-actions">
        <button type="button" onClick={() => dispatch({ type: 'COMPONENT_DUPLICATE', frameId: frame.id, componentId: component.id })}>{t('button.duplicate')}</button>
        <button type="button" className="danger-button" onClick={() => dispatch({ type: 'COMPONENT_DELETE', frameId: frame.id, componentId: component.id })}>{t('button.delete')}</button>
      </div>
    </div>
  )
}
