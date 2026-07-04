import { describe, expect, it } from 'vitest'
import { createComponent, createDesign, createFrame } from '../models/factories'
import { parseProjectJson, serializeProject } from './jsonProject'
import { derivePartsList, partsListToCsv } from './partsList'

describe('project JSON import', () => {
  it('round-trips a valid versioned design', () => {
    const design = createDesign()
    design.frames = [createFrame({ orderIndex: 0 })]
    const result = parseProjectJson(serializeProject(design))
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.design.frames).toHaveLength(1)
  })

  it('rejects corrupted and unsupported files', () => {
    expect(parseProjectJson('{broken').ok).toBe(false)
    expect(parseProjectJson(JSON.stringify({ schemaVersion: 99, app: 'FurnitureStudioWeb', design: {} }))).toEqual({ ok: false, errorKey: 'import.unsupportedVersion' })
  })
})

describe('parts list export', () => {
  it('derives frame and component rows with spreadsheet-safe CSV', () => {
    const design = createDesign()
    const frame = createFrame({ orderIndex: 0, name: '=Formula frame' })
    frame.components = [createComponent('shelf', frame, { name: 'Shelf, wide' })]
    design.frames = [frame]
    const rows = derivePartsList(design)
    const csv = partsListToCsv(rows)
    expect(rows.map((row) => row.category)).toEqual(['frames', 'shelves'])
    expect(csv).toContain("'=Formula frame")
    expect(csv).toContain('"Shelf, wide"')
    expect(csv).toContain('WS-SHELF-STD')
  })
})
