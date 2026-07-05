import { describe, expect, it } from 'vitest'
import { createComponent, createDesign, createFrame } from '../models/factories'
import { parseProjectJson, serializeProject } from './jsonProject'
import { derivePartsList, partsListToCsv } from './partsList'

describe('project JSON import', () => {
  it('round-trips a valid versioned design', () => {
    const design = createDesign()
    design.furniture.frames = [createFrame({ orderIndex: 0 })]
    const result = parseProjectJson(serializeProject(design))
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.design.furniture.frames).toHaveLength(1)
  })

  it('rejects corrupted and unsupported files', () => {
    expect(parseProjectJson('{broken').ok).toBe(false)
    expect(parseProjectJson(JSON.stringify({ schemaVersion: 99, app: 'FurnitureStudioWeb', design: {} }))).toEqual({ ok: false, errorKey: 'import.unsupportedVersion' })
  })

  it('migrates a schema-1 project into the 3D-ready design model', () => {
    const legacy = {
      schemaVersion: 1,
      app: 'FurnitureStudioWeb',
      exportedAt: '2026-01-01T00:00:00.000Z',
      design: {
        id: 'legacy-design', name: 'Legacy wardrobe', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z', language: 'en',
        installationSpace: { widthMm: 3000, heightMm: 2600, depthMm: 650, leftClearanceMm: 20, rightClearanceMm: 20, topClearanceMm: 30 },
        frames: [{
          id: 'legacy-frame', name: 'Legacy frame', widthMm: 1000, heightMm: 2400, depthMm: 580, materialId: 'studio-white', finishId: 'matte', orderIndex: 0,
          showDoors: true, backPanelEnabled: true, plinthEnabled: true,
          components: [{ id: 'legacy-shelf', type: 'shelf', name: 'Shelf', widthMm: 964, heightMm: 24, depthMm: 540, xMm: 18, yMm: 400, materialId: 'studio-white', options: {} }],
          doors: [],
        }],
        selectedItem: { kind: 'frame', id: 'legacy-frame' },
        viewSettings: { showMeasurements: true, showDoors: true, showIssues: true, zoomPercent: 120 },
      },
    }
    const result = parseProjectJson(JSON.stringify(legacy))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.migratedFromVersion).toBe(1)
    expect(result.design.version).toBe(2)
    expect(result.design.furniture.frames[0]?.components[0]?.positionMm).toEqual({ x: 18, y: 400, z: 18 })
    expect(result.design.camera.zoom).toBe(120)
  })
})

describe('parts list export', () => {
  it('derives frame and component rows with spreadsheet-safe CSV', () => {
    const design = createDesign()
    const frame = createFrame({ orderIndex: 0, name: '=Formula frame' })
    frame.components = [createComponent('shelf', frame, { name: 'Shelf, wide' })]
    design.furniture.frames = [frame]
    const rows = derivePartsList(design)
    const csv = partsListToCsv(rows)
    expect(rows.map((row) => row.category)).toEqual(['frames', 'shelves'])
    expect(csv).toContain("'=Formula frame")
    expect(csv).toContain('"Shelf, wide"')
    expect(csv).toContain('WS-SHELF-STD')
  })
})
