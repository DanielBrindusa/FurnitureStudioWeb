import { useEffect, useState } from 'react'
import { formatEstimatedPrice } from '../pricing/priceEngine'
import { projectRepository, type SavedProjectSummary } from '../storage/projectRepository'
import { useDesign } from '../state/designState'

const newId = () => `design-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`

export function SavedProjectsDialog({ open, onClose, onSaved, t }: { open: boolean; onClose: () => void; onSaved: (date: string) => void; t: (key: string) => string }) {
  const { state, dispatch } = useDesign()
  const [projects, setProjects] = useState<SavedProjectSummary[]>([])
  const [name, setName] = useState(state.design.name)
  const [message, setMessage] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  const refresh = () => {
    const result = projectRepository.list()
    if (result.ok) setProjects(result.value)
    else setMessage(result.errorKey)
  }

  useEffect(() => {
    if (open) { setName(state.design.name); setMessage(null); refresh() }
  }, [open, state.design.name])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open, onClose])

  if (!open) return null

  const saveCurrent = () => {
    const now = new Date().toISOString()
    const next = { ...state.design, name: name.trim() || state.design.name, updatedAt: now }
    const result = projectRepository.save(next)
    if (!result.ok) { setMessage(result.errorKey); return }
    if (next.name !== state.design.name) dispatch({ type: 'DESIGN_RENAME', name: next.name })
    onSaved(now)
    setMessage('storage.savedNamed')
    refresh()
  }

  const loadProject = (id: string) => {
    const result = projectRepository.load(id)
    if (!result.ok) { setMessage(result.errorKey); return }
    dispatch({ type: 'DESIGN_LOAD', design: result.value })
    onClose()
  }

  const duplicateProject = (id: string) => {
    const result = projectRepository.load(id)
    if (!result.ok) { setMessage(result.errorKey); return }
    const now = new Date().toISOString()
    const copy = { ...result.value, id: newId(), name: `${result.value.name} ${t('storage.copySuffix')}`, createdAt: now, updatedAt: now, selectedItem: null }
    const saved = projectRepository.save(copy)
    setMessage(saved.ok ? 'storage.duplicated' : saved.errorKey)
    refresh()
  }

  const commitRename = (id: string) => {
    const result = projectRepository.load(id)
    if (!result.ok) { setMessage(result.errorKey); return }
    const updated = { ...result.value, name: renameValue.trim() || result.value.name, updatedAt: new Date().toISOString() }
    const saved = projectRepository.save(updated)
    setMessage(saved.ok ? 'storage.renamed' : saved.errorKey)
    setRenamingId(null)
    refresh()
  }

  const deleteProject = (id: string) => {
    const result = projectRepository.remove(id)
    setMessage(result.ok ? 'storage.deleted' : result.errorKey)
    setPendingDelete(null)
    refresh()
  }

  return (
    <div className="app-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="app-modal saved-projects-dialog" role="dialog" aria-modal="true" aria-labelledby="saved-projects-title">
        <header><div><span>{t('nav.projects')}</span><h2 id="saved-projects-title">{t('storage.savedDesigns')}</h2></div><button type="button" onClick={onClose} aria-label={t('button.close')}>×</button></header>
        <div className="save-current-row">
          <label><span>{t('label.designName')}</span><input value={name} onChange={(event) => setName(event.target.value)} /></label>
          <button type="button" className="primary-button" onClick={saveCurrent}>{t('button.saveDesign')}</button>
        </div>
        {message && <p className="modal-message" role="status">{t(message)}</p>}
        <div className="saved-project-list">
          {projects.length === 0 ? <div className="modal-empty"><span aria-hidden="true">◇</span><p>{t('storage.noSavedDesigns')}</p></div> : projects.map((project) => (
            <article key={project.id} className={project.id === state.design.id ? 'is-current' : ''}>
              <div className="saved-project-copy">
                {renamingId === project.id ? <input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} aria-label={t('button.rename')} /> : <strong>{project.name}</strong>}
                <small>{project.frameCount} {t('label.frames').toLowerCase()} · {project.widthMm} × {project.heightMm} × {project.depthMm} mm</small>
                <em>{new Date(project.updatedAt).toLocaleString(state.design.language === 'ro' ? 'ro-RO' : 'en-GB')} · {formatEstimatedPrice(project.estimatedPrice, state.design.language)}</em>
              </div>
              <div className="saved-project-actions">
                {renamingId === project.id ? <button type="button" onClick={() => commitRename(project.id)}>{t('button.confirm')}</button> : <button type="button" onClick={() => loadProject(project.id)}>{t('button.load')}</button>}
                <button type="button" onClick={() => duplicateProject(project.id)}>{t('button.duplicate')}</button>
                <button type="button" onClick={() => { setRenamingId(project.id); setRenameValue(project.name) }}>{t('button.rename')}</button>
                {pendingDelete === project.id ? <button type="button" className="danger-button" onClick={() => deleteProject(project.id)}>{t('button.confirmDelete')}</button> : <button type="button" onClick={() => setPendingDelete(project.id)}>{t('button.delete')}</button>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
