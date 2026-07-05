import { describe, expect, it } from 'vitest'
import { createComponent, createContentObject, createDesign, createDoor, createFrame, createHandleOrKnob } from '../models/factories'
import type { AppState } from './designState'
import { designReducer } from './designState'

const stateFor = (): AppState => {
  const design = createDesign()
  return { design, validation: [], price: design.priceSummary, past: [], future: [], startupErrorKey: null }
}

describe('3D-ready design reducer commands', () => {
  it('adds, moves, resizes, reorders and focuses frames', () => {
    let state = stateFor()
    const first = createFrame({ id: 'frame-a', orderIndex: 0, widthMm: 800 })
    const second = createFrame({ id: 'frame-b', orderIndex: 1, widthMm: 900 })
    state = designReducer(state, { type: 'FRAME_ADD', frame: first })
    state = designReducer(state, { type: 'FRAME_ADD', frame: second })
    state = designReducer(state, { type: 'FRAME_MOVE', frameId: first.id, positionMm: { x: 45, y: 10, z: 15 } })
    state = designReducer(state, { type: 'FRAME_UPDATE_DIMENSIONS', frameId: first.id, patch: { widthMm: 810, heightMm: 2500 } })
    state = designReducer(state, { type: 'FRAME_REORDER', frameId: second.id, orderIndex: 0 })
    state = designReducer(state, { type: 'FRAME_FOCUS', frameId: first.id })
    expect(state.design.furniture.frames[0]?.id).toBe(second.id)
    const resized = state.design.furniture.frames.find((frame) => frame.id === first.id)
    expect(resized?.heightMm).toBe(2500)
    expect(resized?.panels.find((panel) => panel.type === 'right-side')?.position.x).toBe(792)
    expect(state.design.furniture.totalWidthMm).toBe(1710)
    expect(state.design.viewMode).toBe('focusedFrame')
    expect(state.design.camera.focusedFrameId).toBe(first.id)
  })

  it('supports component, door, hardware, content and camera commands with undo', () => {
    let state = stateFor()
    const frame = createFrame({ id: 'frame-main', orderIndex: 0 })
    state = designReducer(state, { type: 'FRAME_ADD', frame })
    const component = createComponent('adjustable-shelf', frame, { id: 'shelf-main' })
    state = designReducer(state, { type: 'COMPONENT_ADD', frameId: frame.id, component })
    state = designReducer(state, { type: 'COMPONENT_MOVE', frameId: frame.id, componentId: component.id, positionMm: { x: 30, y: 555, z: 20 } })
    state = designReducer(state, { type: 'COMPONENT_RESIZE', frameId: frame.id, componentId: component.id, sizeMm: { width: 800, height: 24, depth: 500 } })
    const door = createDoor('hinged', frame, { id: 'door-main' })
    state = designReducer(state, { type: 'DOOR_UPSERT', frameId: frame.id, door })
    state = designReducer(state, { type: 'DOOR_TOGGLE_OPEN', frameId: frame.id, doorId: door.id, isOpen: true })
    state = designReducer(state, { type: 'HARDWARE_ADD', frameId: frame.id, doorId: door.id, hardware: createHandleOrKnob('bar-pull', { id: 'handle-main' }) })
    state = designReducer(state, { type: 'CONTENT_ADD', frameId: frame.id, content: createContentObject('shirt', { id: 'shirt-main' }) })
    state = designReducer(state, { type: 'CAMERA_MODE_CHANGE', mode: 'isometric' })

    const updatedFrame = state.design.furniture.frames[0]!
    const updatedComponent = updatedFrame.components[0]!
    expect(updatedComponent.positionMm).toEqual({ x: 30, y: 555, z: 20 })
    expect(updatedComponent.sizeMm).toEqual({ width: 800, height: 24, depth: 500 })
    expect(updatedComponent.yMm).toBe(555)
    expect(updatedFrame.doors[0]?.isOpen).toBe(true)
    expect(updatedFrame.doors[0]?.handleId).toBe('handle-main')
    expect(updatedFrame.contents[0]?.id).toBe('shirt-main')
    expect(state.design.camera.mode).toBe('isometric')

    const undone = designReducer(state, { type: 'UNDO' })
    expect(undone.design.camera.mode).not.toBe('isometric')
  })
})
