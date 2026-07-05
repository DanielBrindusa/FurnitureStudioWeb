import type { Design } from '../models/design'
import { calculateDesignPrice } from '../pricing/priceEngine'
import { parseProjectJson, serializeProject } from '../export/jsonProject'

const INDEX_KEY = 'furniture-studio:index:v1'
const DRAFT_KEY = 'furniture-studio:draft:v1'
const projectKey = (id: string) => `furniture-studio:project:${id}`

export interface SavedProjectSummary {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  widthMm: number
  heightMm: number
  depthMm: number
  estimatedPrice: number
  frameCount: number
}

export type RepositoryResult<T> = { ok: true; value: T } | { ok: false; errorKey: string }

function getStorage(): RepositoryResult<Storage> {
  try {
    const storage = window.localStorage
    const probe = 'furniture-studio:probe'
    storage.setItem(probe, '1')
    storage.removeItem(probe)
    return { ok: true, value: storage }
  } catch {
    return { ok: false, errorKey: 'storage.unavailable' }
  }
}

function summaryFor(design: Design): SavedProjectSummary {
  return {
    id: design.id,
    name: design.name,
    createdAt: design.createdAt,
    updatedAt: design.updatedAt,
    widthMm: design.furniture.totalWidthMm,
    heightMm: design.furniture.maxHeightMm,
    depthMm: design.furniture.maxDepthMm,
    estimatedPrice: calculateDesignPrice(design),
    frameCount: design.furniture.frames.length,
  }
}

function readIndex(storage: Storage): SavedProjectSummary[] {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(INDEX_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((item): item is SavedProjectSummary => Boolean(item) && typeof item === 'object' && typeof (item as SavedProjectSummary).id === 'string') : []
  } catch {
    return []
  }
}

function writeIndex(storage: Storage, summaries: SavedProjectSummary[]) {
  storage.setItem(INDEX_KEY, JSON.stringify(summaries))
}

function storageFailure(error: unknown): RepositoryResult<never> {
  return { ok: false, errorKey: error instanceof DOMException && error.name === 'QuotaExceededError' ? 'storage.quota' : 'storage.writeFailed' }
}

export const projectRepository = {
  list(): RepositoryResult<SavedProjectSummary[]> {
    const result = getStorage()
    if (!result.ok) return result
    return { ok: true, value: readIndex(result.value).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) }
  },

  save(design: Design): RepositoryResult<SavedProjectSummary> {
    const result = getStorage()
    if (!result.ok) return result
    try {
      const summary = summaryFor(design)
      result.value.setItem(projectKey(design.id), serializeProject(design))
      const index = readIndex(result.value).filter((item) => item.id !== design.id)
      writeIndex(result.value, [summary, ...index])
      return { ok: true, value: summary }
    } catch (error) {
      return storageFailure(error)
    }
  },

  load(id: string): RepositoryResult<Design> {
    const result = getStorage()
    if (!result.ok) return result
    const raw = result.value.getItem(projectKey(id))
    if (!raw) return { ok: false, errorKey: 'storage.notFound' }
    const parsed = parseProjectJson(raw)
    return parsed.ok ? { ok: true, value: parsed.design } : { ok: false, errorKey: 'storage.corrupted' }
  },

  remove(id: string): RepositoryResult<true> {
    const result = getStorage()
    if (!result.ok) return result
    try {
      result.value.removeItem(projectKey(id))
      writeIndex(result.value, readIndex(result.value).filter((item) => item.id !== id))
      return { ok: true, value: true }
    } catch (error) {
      return storageFailure(error)
    }
  },

  saveDraft(design: Design): RepositoryResult<string> {
    const result = getStorage()
    if (!result.ok) return result
    try {
      const savedAt = new Date().toISOString()
      result.value.setItem(DRAFT_KEY, JSON.stringify({ savedAt, project: serializeProject(design) }))
      return { ok: true, value: savedAt }
    } catch (error) {
      return storageFailure(error)
    }
  },

  loadDraft(): RepositoryResult<{ design: Design; savedAt: string } | null> {
    const result = getStorage()
    if (!result.ok) return result
    const raw = result.value.getItem(DRAFT_KEY)
    if (!raw) return { ok: true, value: null }
    try {
      const wrapper = JSON.parse(raw) as { savedAt?: unknown; project?: unknown }
      if (typeof wrapper.savedAt !== 'string' || typeof wrapper.project !== 'string') return { ok: false, errorKey: 'storage.corruptedDraft' }
      const parsed = parseProjectJson(wrapper.project)
      return parsed.ok ? { ok: true, value: { design: parsed.design, savedAt: wrapper.savedAt } } : { ok: false, errorKey: 'storage.corruptedDraft' }
    } catch {
      return { ok: false, errorKey: 'storage.corruptedDraft' }
    }
  },

  clearDraft(): RepositoryResult<true> {
    const result = getStorage()
    if (!result.ok) return result
    try { result.value.removeItem(DRAFT_KEY); return { ok: true, value: true } } catch (error) { return storageFailure(error) }
  },
}
