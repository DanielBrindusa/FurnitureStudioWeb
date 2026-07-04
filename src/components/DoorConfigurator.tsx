import { boardMaterials, doorCatalog, handleCatalog, materials } from '../data/catalog'
import { createDoor } from '../models/factories'
import type { Door, DoorType, Frame, ValidationResult } from '../models/design'
import { calculateDoorPrice, formatEstimatedPrice } from '../pricing/priceEngine'
import { useDesign } from '../state/designState'

const FINISHES = ['matte', 'satin', 'wood-light', 'wood-medium', 'wood-dark', 'mirror', 'glass']

export function DoorConfigurator({ frame, issues, t }: { frame: Frame; issues: ValidationResult[]; t: (key: string) => string }) {
  const { state, dispatch } = useDesign()
  const door = frame.doors[0] ?? null
  const update = (patch: Partial<Door>) => {
    if (door) dispatch({ type: 'DOOR_UPSERT', frameId: frame.id, door: { ...door, ...patch } })
  }
  const selectType = (type: DoorType) => {
    if (type === 'open') {
      dispatch({ type: 'DOOR_REPLACE', frameId: frame.id, door: null })
      return
    }
    dispatch({
      type: 'DOOR_REPLACE',
      frameId: frame.id,
      door: createDoor(type, frame, {
        materialId: type === 'mirror' ? 'reflective-silver' : type === 'glass-look' ? 'clear-veil-glass' : frame.materialId,
        finishId: type === 'mirror' ? 'mirror' : type === 'glass-look' ? 'glass' : frame.finishId,
      }),
    })
  }
  const compatibleHandles = handleCatalog.filter((handle) => {
    const types = handle.rules.doorTypes
    return !door || (Array.isArray(types) && types.includes(door.type))
  })
  const doorIssues = door ? issues.filter((issue) => issue.targetId === door.id) : []

  return (
    <section className="door-configurator inspector-block">
      <div className="mini-heading"><strong>{t('door.configuration')}</strong><span>{t('nav.finish')}</span></div>
      <label className="select-field">
        <span>{t('label.doorType')}</span>
        <select value={door?.type ?? 'open'} onChange={(event) => selectType(event.target.value as DoorType)}>
          {doorCatalog.map((item) => <option key={item.id} value={item.type}>{t(`door.${item.type}`)}</option>)}
        </select>
      </label>

      {door && (
        <>
          <div className="select-grid">
            <label className="select-field"><span>{t('label.material')}</span><select value={door.materialId} onChange={(event) => update({ materialId: event.target.value })}>
              {(door.mirror || door.glass ? materials : boardMaterials).map((material) => <option key={material.id} value={material.id}>{t(`material.${material.id}`)}</option>)}
            </select></label>
            <label className="select-field"><span>{t('label.finish')}</span><select value={door.finishId} onChange={(event) => update({ finishId: event.target.value })}>
              {FINISHES.map((finish) => <option key={finish} value={finish}>{t(`finish.${finish}`)}</option>)}
            </select></label>
          </div>
          <div className="door-option-grid">
            <label><input type="checkbox" checked={door.mirror} onChange={(event) => update({ mirror: event.target.checked, materialId: event.target.checked ? 'reflective-silver' : frame.materialId })} />{t('door.mirrorToggle')}</label>
            <label><input type="checkbox" checked={door.glass} onChange={(event) => update({ glass: event.target.checked, materialId: event.target.checked ? 'clear-veil-glass' : frame.materialId })} />{t('door.glassToggle')}</label>
            <label><input type="checkbox" checked={door.softClose} onChange={(event) => update({ softClose: event.target.checked })} />{t('door.softClose')}</label>
          </div>
          <div className="select-grid">
            <label className="select-field"><span>{t('label.handle')}</span><select value={door.handleId ?? ''} onChange={(event) => update({ handleId: event.target.value || null })}>
              <option value="">{t('door.noHandle')}</option>
              {compatibleHandles.map((handle) => <option key={handle.id} value={handle.id}>{t(`handle.${handle.id}`)}</option>)}
            </select></label>
            <label className="select-field"><span>{t('label.handlePosition')}</span><select value={door.handlePosition} onChange={(event) => update({ handlePosition: event.target.value as Door['handlePosition'] })}>
              {(['left', 'right', 'center'] as const).map((position) => <option key={position} value={position}>{t(`door.handlePosition.${position}`)}</option>)}
            </select></label>
          </div>
          <div className="door-preview-toggle">
            <button type="button" className={frame.showDoors ? 'is-active' : ''} onClick={() => dispatch({ type: 'FRAME_SHOW_DOORS', frameId: frame.id, showDoors: true })}>{t('door.showDoors')}</button>
            <button type="button" className={!frame.showDoors ? 'is-active' : ''} onClick={() => dispatch({ type: 'FRAME_SHOW_DOORS', frameId: frame.id, showDoors: false })}>{t('door.showInternals')}</button>
          </div>
          <div className="component-price-line"><span>{t('label.doorsTotal')}</span><strong>{formatEstimatedPrice(calculateDoorPrice(door, frame), state.design.language)}</strong></div>
        </>
      )}

      {doorIssues.length > 0 && <div className="component-compatibility">{doorIssues.map((issue) => <p key={issue.id} className={`is-${issue.severity}`}>{t(issue.messageKey)}</p>)}</div>}
    </section>
  )
}
