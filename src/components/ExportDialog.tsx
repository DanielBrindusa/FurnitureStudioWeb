import { useEffect, useState, type ChangeEvent } from 'react'
import { downloadTextFile } from '../export/download'
import { parseProjectJson, safeFileName, serializeProject, PROJECT_FILE_EXTENSION } from '../export/jsonProject'
import { derivePartsList, partsListToCsv } from '../export/partsList'
import type { Design } from '../models/design'
import { useDesign } from '../state/designState'

export function ExportDialog({ open, onClose, onPrint, t }: { open: boolean; onClose: () => void; onPrint: () => void; t: (key: string) => string }) {
  const { state, dispatch } = useDesign()
  const [candidate, setCandidate] = useState<Design | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open, onClose])
  if (!open) return null

  const exportJson = () => {
    const ok = downloadTextFile(serializeProject(state.design), `${safeFileName(state.design.name)}${PROJECT_FILE_EXTENSION}`, 'application/json')
    setMessage(ok ? 'export.jsonReady' : 'export.failed')
  }
  const exportCsv = () => {
    const rows = derivePartsList(state.design, state.validation)
    if (rows.length === 0) { setMessage('export.noParts'); return }
    const ok = downloadTextFile(partsListToCsv(rows), `${safeFileName(state.design.name)}-parts.csv`, 'text/csv')
    setMessage(ok ? 'export.csvReady' : 'export.failed')
  }
  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const result = parseProjectJson(await file.text())
      if (!result.ok) { setMessage(result.errorKey); setCandidate(null); return }
      setCandidate(result.design)
      setMessage(null)
    } catch {
      setMessage('import.readFailed')
    }
  }

  return (
    <div className="app-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="app-modal export-dialog" role="dialog" aria-modal="true" aria-labelledby="export-title">
        <header><div><span>{t('nav.review')}</span><h2 id="export-title">{t('export.dataAndDocuments')}</h2></div><button type="button" onClick={onClose} aria-label={t('button.close')}>×</button></header>
        {message && <p className="modal-message" role="status">{t(message)}</p>}
        <div className="export-action-grid">
          <button type="button" onClick={exportJson}><strong>{t('button.exportJson')}</strong><small>{t('export.jsonHint')}</small></button>
          <label
            className="file-action"
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                event.currentTarget.querySelector('input')?.click()
              }
            }}
          >
            <input type="file" accept="application/json,.json,.furniture-studio.json" onChange={importFile} />
            <strong>{t('button.importJson')}</strong><small>{t('import.jsonHint')}</small>
          </label>
          <button type="button" onClick={exportCsv}><strong>{t('button.exportCsv')}</strong><small>{t('export.csvHint')}</small></button>
          <button type="button" onClick={onPrint}><strong>{t('button.print')}</strong><small>{t('export.printHint')}</small></button>
        </div>
        {candidate && (
          <div className="import-preview" role="status">
            <div><span>{t('import.preview')}</span><strong>{candidate.name}</strong><small>{candidate.frames.length} {t('label.frames').toLowerCase()} · {candidate.frames.reduce((sum, frame) => sum + frame.widthMm, 0)} mm</small></div>
            <p>{t('import.replaceWarning')}</p>
            <div><button type="button" className="primary-button" onClick={() => { dispatch({ type: 'DESIGN_LOAD', design: candidate }); setCandidate(null); onClose() }}>{t('button.replaceCurrent')}</button><button type="button" onClick={() => setCandidate(null)}>{t('button.cancel')}</button></div>
          </div>
        )}
        <div className="reset-design-row">
          <div><strong>{t('storage.resetDesign')}</strong><small>{t('storage.resetHint')}</small></div>
          {confirmReset ? <span><button type="button" className="danger-button" onClick={() => { dispatch({ type: 'DESIGN_CREATE' }); setConfirmReset(false); onClose() }}>{t('button.confirmReset')}</button><button type="button" onClick={() => setConfirmReset(false)}>{t('button.cancel')}</button></span> : <button type="button" onClick={() => setConfirmReset(true)}>{t('button.reset')}</button>}
        </div>
      </section>
    </div>
  )
}
