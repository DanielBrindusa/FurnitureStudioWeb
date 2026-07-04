import { useEffect, useState } from 'react'
import { installationPresets } from '../data/installationPresets'
import { translate } from '../i18n'
import type { InstallationSpace } from '../models/design'
import { useDesign } from '../state/designState'
import { cmToMm } from '../utils/dimensions'

const mmToEditableCm = (valueMm: number): string => {
  const sign = valueMm < 0 ? '-' : ''
  const absolute = Math.abs(valueMm)
  const whole = Math.floor(absolute / 10)
  const remainder = absolute % 10
  return `${sign}${whole}${remainder === 0 ? '' : `.${remainder}`}`
}

function CentimetreInput({
  label,
  valueMm,
  onChange,
}: {
  label: string
  valueMm: number
  onChange: (valueMm: number) => void
}) {
  const [draft, setDraft] = useState(() => mmToEditableCm(valueMm))

  useEffect(() => setDraft(mmToEditableCm(valueMm)), [valueMm])

  const commit = () => {
    const next = cmToMm(draft)
    if (next !== null) onChange(next)
    else setDraft(mmToEditableCm(valueMm))
  }

  return (
    <label className="dimension-field cm-field">
      <span>{label}</span>
      <span className="input-with-unit">
        <input
          type="text"
          inputMode="decimal"
          value={draft}
          onChange={(event) => {
            const nextDraft = event.target.value
            setDraft(nextDraft)
            const next = cmToMm(nextDraft)
            if (next !== null) onChange(next)
          }}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur()
          }}
        />
        <span aria-hidden="true">cm</span>
      </span>
    </label>
  )
}

export function InstallationSetup() {
  const { state, dispatch } = useDesign()
  const { design } = state
  const t = (key: string) => translate(design.language, key)
  const update = (property: keyof InstallationSpace, valueMm: number) => {
    dispatch({ type: 'INSTALLATION_UPDATE', patch: { [property]: valueMm } })
  }
  const hasInvalidBoundary = ['widthMm', 'heightMm', 'depthMm'].some(
    (property) => design.installationSpace[property as keyof InstallationSpace] <= 0,
  )

  return (
    <section className="installation-setup panel-section">
      <div className="section-heading">
        <div>
          <span>{t('nav.setup')}</span>
          <h2>{t('label.installationSpace')}</h2>
        </div>
        <span>cm</span>
      </div>

      <div className="preset-scroll" aria-label={t('label.installationPresets')}>
        {installationPresets.map((preset) => (
          <button
            type="button"
            key={preset.id}
            onClick={() => dispatch({ type: 'INSTALLATION_UPDATE', patch: preset.values })}
          >
            {t(preset.nameKey)}
          </button>
        ))}
      </div>

      <p className="field-hint">{t('installation.cmHint')}</p>

      <div className="dimension-form compact">
        <CentimetreInput label={t('label.width')} valueMm={design.installationSpace.widthMm} onChange={(value) => update('widthMm', value)} />
        <CentimetreInput label={t('label.height')} valueMm={design.installationSpace.heightMm} onChange={(value) => update('heightMm', value)} />
        <CentimetreInput label={t('label.depth')} valueMm={design.installationSpace.depthMm} onChange={(value) => update('depthMm', value)} />
        <CentimetreInput label={t('label.leftClearance')} valueMm={design.installationSpace.leftClearanceMm} onChange={(value) => update('leftClearanceMm', value)} />
        <CentimetreInput label={t('label.rightClearance')} valueMm={design.installationSpace.rightClearanceMm} onChange={(value) => update('rightClearanceMm', value)} />
        <CentimetreInput label={t('label.topClearance')} valueMm={design.installationSpace.topClearanceMm} onChange={(value) => update('topClearanceMm', value)} />
      </div>

      {hasInvalidBoundary && <p className="field-error">{t('empty.noInstallation')}</p>}
    </section>
  )
}
