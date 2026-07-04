import { useState } from 'react'
import { buildInternalPreset, internalPresetIds, type InternalPresetId } from '../data/internalPresets'
import type { Frame } from '../models/design'
import { useDesign } from '../state/designState'

export function InternalPresetPanel({ frame, t }: { frame: Frame; t: (key: string) => string }) {
  const { dispatch } = useDesign()
  const [pending, setPending] = useState<InternalPresetId | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const apply = (presetId: InternalPresetId) => {
    const result = buildInternalPreset(presetId, frame)
    if (!result.fits) {
      setMessage(result.messageKey)
      setPending(null)
      return
    }
    dispatch({ type: 'COMPONENTS_REPLACE', frameId: frame.id, components: result.components })
    setMessage(result.messageKey)
    setPending(null)
  }

  const choose = (presetId: InternalPresetId) => {
    if (frame.components.length > 0) {
      setPending(presetId)
      setMessage(null)
    } else {
      apply(presetId)
    }
  }

  return (
    <section className="internal-presets inspector-block">
      <div className="mini-heading"><strong>{t('preset.internalLayouts')}</strong><span>{t('preset.adaptive')}</span></div>
      <div className="internal-preset-grid">
        {internalPresetIds.map((presetId) => (
          <button key={presetId} type="button" onClick={() => choose(presetId)}>{t(`preset.internal.${presetId}`)}</button>
        ))}
      </div>
      {pending && (
        <div className="inline-confirm" role="alert">
          <p>{t('preset.replaceConfirmation')}</p>
          <div>
            <button type="button" className="primary-button" onClick={() => apply(pending)}>{t('button.replace')}</button>
            <button type="button" onClick={() => setPending(null)}>{t('button.cancel')}</button>
          </div>
        </div>
      )}
      {message && <p className={message === 'preset.doesNotFit' ? 'inline-message is-error' : 'inline-message'}>{t(message)}</p>}
    </section>
  )
}
