import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'
import {
  createDesign,
  createId,
  recalculateFurniture,
  reflowFrameRun,
  synchronizeComponent,
  synchronizeFrameStructure,
} from '../models/factories'
import { selectionFromLegacy } from '../models/rendering'
import type {
  CameraMode,
  ContentObject,
  Design,
  Door,
  Frame,
  FurnitureComponent,
  HandleOrKnob,
  InstallationSpace,
  LanguageCode,
  PositionMm,
  PriceBreakdown,
  SelectedItem,
  ValidationResult,
  ViewMode,
  ViewSettings,
} from '../models/design'
import { getPriceBreakdown } from '../pricing/priceEngine'
import { projectRepository } from '../storage/projectRepository'
import { validateDesign } from '../validation/validationEngine'

export interface AppState {
  design: Design
  validation: ValidationResult[]
  price: PriceBreakdown
  past: Design[]
  future: Design[]
  startupErrorKey: string | null
}

type FrameDimensionPatch = Partial<Pick<Frame, 'widthMm' | 'heightMm' | 'depthMm'>>

export type AppAction =
  | { type: 'DESIGN_CREATE' }
  | { type: 'DESIGN_LOAD'; design: Design }
  | { type: 'DESIGN_RENAME'; name: string }
  | { type: 'INSTALLATION_UPDATE'; patch: Partial<InstallationSpace> }
  | { type: 'FRAME_ADD'; frame: Frame }
  | { type: 'FRAME_UPDATE_DIMENSIONS'; frameId: string; patch: FrameDimensionPatch }
  | { type: 'FRAME_MOVE'; frameId: string; positionMm: PositionMm }
  | { type: 'FRAME_FOCUS'; frameId: string | null }
  | { type: 'FRAME_RENAME'; frameId: string; name: string }
  | { type: 'FRAME_DELETE'; frameId: string }
  | { type: 'FRAME_DUPLICATE'; frameId: string }
  | { type: 'FRAME_REORDER'; frameId: string; orderIndex: number }
  | { type: 'ITEM_SELECT'; selectedItem: SelectedItem }
  | { type: 'COMPONENT_ADD'; frameId: string; component: FurnitureComponent }
  | { type: 'COMPONENT_UPDATE'; frameId: string; componentId: string; patch: Partial<FurnitureComponent> }
  | { type: 'COMPONENT_MOVE'; frameId: string; componentId: string; positionMm: PositionMm }
  | { type: 'COMPONENT_RESIZE'; frameId: string; componentId: string; sizeMm: FurnitureComponent['sizeMm'] }
  | { type: 'COMPONENT_DELETE'; frameId: string; componentId: string }
  | { type: 'COMPONENT_DUPLICATE'; frameId: string; componentId: string }
  | { type: 'COMPONENTS_REPLACE'; frameId: string; components: FurnitureComponent[] }
  | { type: 'DOOR_UPSERT'; frameId: string; door: Door }
  | { type: 'DOOR_REPLACE'; frameId: string; door: Door | null }
  | { type: 'DOOR_TOGGLE_OPEN'; frameId: string; doorId: string; isOpen?: boolean }
  | { type: 'HARDWARE_ADD'; frameId: string; hardware: HandleOrKnob; doorId?: string }
  | { type: 'CONTENT_ADD'; frameId: string; content: ContentObject }
  | { type: 'CONTENT_UPDATE'; frameId: string; contentId: string; patch: Partial<ContentObject> }
  | { type: 'CONTENT_DELETE'; frameId: string; contentId: string }
  | { type: 'FRAME_SHOW_DOORS'; frameId: string; showDoors: boolean }
  | { type: 'MATERIAL_CHANGE'; target: 'frame' | 'component' | 'door'; targetId: string; materialId: string }
  | { type: 'FINISH_CHANGE'; frameId: string; finishId: string }
  | { type: 'CAMERA_MODE_CHANGE'; mode: CameraMode }
  | { type: 'CAMERA_UPDATE'; patch: Partial<Design['camera']> }
  | { type: 'VIEW_MODE_CHANGE'; viewMode: ViewMode }
  | { type: 'VIEW_SETTINGS_UPDATE'; patch: Partial<ViewSettings> }
  | { type: 'VALIDATION_RUN' }
  | { type: 'PRICE_CALCULATE' }
  | { type: 'LANGUAGE_UPDATE'; language: LanguageCode }
  | { type: 'UNDO' }
  | { type: 'REDO' }

const selectionFor = (design: Design, item: SelectedItem) => {
  if (!item) return null
  const frameId = item.kind === 'frame'
    ? item.id
    : design.furniture.frames.find((frame) =>
      frame.components.some((component) => component.id === item.id) ||
      frame.doors.some((door) => door.id === item.id),
    )?.id ?? null
  return selectionFromLegacy(item, frameId)
}

const frameValidationState = (frame: Frame, validation: ValidationResult[]): Frame['validationState'] => {
  const targetIds = new Set([frame.id, ...frame.components.map((item) => item.id), ...frame.doors.map((item) => item.id)])
  const issues = validation.filter((issue) => targetIds.has(issue.targetId))
  if (issues.some((issue) => issue.severity === 'error')) return 'error'
  if (issues.some((issue) => issue.severity === 'warning')) return 'warning'
  return 'valid'
}

const deriveState = (
  design: Design,
  past: Design[] = [],
  future: Design[] = [],
  startupErrorKey: string | null = null,
): AppState => {
  const withMetrics = { ...design, furniture: recalculateFurniture(design.furniture) }
  const validation = validateDesign(withMetrics)
  const price = getPriceBreakdown(withMetrics)
  const frames = withMetrics.furniture.frames.map((frame) => ({
    ...frame,
    validationState: frameValidationState(frame, validation),
  }))
  const enriched: Design = {
    ...withMetrics,
    furniture: recalculateFurniture({ ...withMetrics.furniture, frames }),
    validationResults: validation,
    priceSummary: price,
  }
  return { design: enriched, validation, price, past, future, startupErrorKey }
}

const commit = (state: AppState, design: Design): AppState =>
  deriveState(design, [...state.past.slice(-39), state.design], [])

const touch = (design: Design): Design => ({ ...design, updatedAt: new Date().toISOString() })

const updateFrame = (design: Design, frameId: string, updater: (frame: Frame) => Frame): Design => ({
  ...design,
  furniture: {
    ...design.furniture,
    frames: design.furniture.frames.map((frame) => frame.id === frameId ? updater(frame) : frame),
  },
})

const mergeComponent = (component: FurnitureComponent, patch: Partial<FurnitureComponent>): FurnitureComponent => {
  const positionMm = patch.positionMm ?? {
    x: patch.xMm ?? component.positionMm.x,
    y: patch.yMm ?? component.positionMm.y,
    z: patch.zMm ?? component.positionMm.z,
  }
  const sizeMm = patch.sizeMm ?? {
    width: patch.widthMm ?? component.sizeMm.width,
    height: patch.heightMm ?? component.sizeMm.height,
    depth: patch.depthMm ?? component.sizeMm.depth,
  }
  return synchronizeComponent({
    ...component,
    ...patch,
    positionMm,
    sizeMm,
    options: { ...component.options, ...patch.options },
  })
}

const cameraFlags = (mode: CameraMode) => ({
  perspective: mode === 'perspective',
  orthographic: mode !== 'perspective',
  front: mode === 'front',
  isometric: mode === 'isometric',
  top: mode === 'top',
})

export function designReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'DESIGN_CREATE':
      return deriveState(createDesign(state.design.language))

    case 'DESIGN_LOAD':
      return deriveState({ ...action.design, selectedObject: null })

    case 'DESIGN_RENAME':
      return commit(state, touch({ ...state.design, name: action.name.trim() || state.design.name }))

    case 'INSTALLATION_UPDATE':
      return commit(state, touch({
        ...state.design,
        installationSpace: { ...state.design.installationSpace, ...action.patch },
      }))

    case 'FRAME_ADD': {
      const ordered = [...state.design.furniture.frames].sort((a, b) => a.orderIndex - b.orderIndex)
      const previous = ordered[ordered.length - 1]
      const frame = {
        ...action.frame,
        xMm: previous ? previous.xMm + previous.widthMm : state.design.installationSpace.leftClearanceMm,
        orderIndex: ordered.length,
      }
      const design = {
        ...state.design,
        furniture: { ...state.design.furniture, frames: [...ordered, frame] },
        selectedObject: selectionFor(state.design, { kind: 'frame', id: frame.id }),
      }
      return commit(state, touch(design))
    }

    case 'FRAME_UPDATE_DIMENSIONS': {
      const updated = updateFrame(state.design, action.frameId, (frame) => synchronizeFrameStructure({ ...frame, ...action.patch }))
      const frames = reflowFrameRun(updated.furniture.frames, state.design.installationSpace.leftClearanceMm)
      return commit(state, touch({ ...updated, furniture: { ...updated.furniture, frames } }))
    }

    case 'FRAME_MOVE':
      return commit(state, touch(updateFrame(state.design, action.frameId, (frame) => ({
        ...frame,
        xMm: action.positionMm.x,
        yMm: action.positionMm.y,
        zMm: action.positionMm.z,
      }))))

    case 'FRAME_FOCUS':
      return deriveState({
        ...state.design,
        selectedObject: action.frameId ? selectionFor(state.design, { kind: 'frame', id: action.frameId }) : state.design.selectedObject,
        camera: { ...state.design.camera, focusedFrameId: action.frameId, autoFitEnabled: true },
        viewMode: action.frameId ? 'focusedFrame' : 'fullFurniture',
      }, state.past, state.future)

    case 'FRAME_RENAME':
      return commit(state, touch(updateFrame(state.design, action.frameId, (frame) => ({
        ...frame,
        name: action.name.trim() || frame.name,
      }))))

    case 'FRAME_DELETE': {
      const frames = reflowFrameRun(state.design.furniture.frames.filter((frame) => frame.id !== action.frameId), state.design.installationSpace.leftClearanceMm)
      return commit(state, touch({
        ...state.design,
        furniture: { ...state.design.furniture, frames },
        selectedObject: state.design.selectedObject?.frameId === action.frameId ? null : state.design.selectedObject,
      }))
    }

    case 'FRAME_DUPLICATE': {
      const source = state.design.furniture.frames.find((frame) => frame.id === action.frameId)
      if (!source) return state
      const duplicateId = createId('frame')
      const duplicate: Frame = {
        ...source,
        id: duplicateId,
        name: `${source.name} copy`,
        xMm: source.xMm + source.widthMm,
        orderIndex: state.design.furniture.frames.length,
        components: source.components.map((component) => synchronizeComponent({ ...component, id: createId('component') })),
        doors: source.doors.map((door) => ({ ...door, id: createId('door'), frameId: duplicateId })),
        contents: source.contents.map((content) => ({ ...content, id: createId('content') })),
        panels: source.panels.map((panel) => ({ ...panel, id: createId('panel') })),
      }
      return commit(state, touch({
        ...state.design,
        furniture: { ...state.design.furniture, frames: [...state.design.furniture.frames, duplicate] },
        selectedObject: selectionFor(state.design, { kind: 'frame', id: duplicate.id }),
      }))
    }

    case 'FRAME_REORDER': {
      const ordered = [...state.design.furniture.frames].sort((a, b) => a.orderIndex - b.orderIndex)
      const currentIndex = ordered.findIndex((frame) => frame.id === action.frameId)
      if (currentIndex < 0) return state
      const [moved] = ordered.splice(currentIndex, 1)
      if (!moved) return state
      ordered.splice(Math.max(0, Math.min(action.orderIndex, ordered.length)), 0, moved)
      const frames = reflowFrameRun(
        ordered.map((frame, orderIndex) => ({ ...frame, orderIndex })),
        state.design.installationSpace.leftClearanceMm,
      )
      return commit(state, touch({ ...state.design, furniture: { ...state.design.furniture, frames } }))
    }

    case 'ITEM_SELECT':
      return { ...state, design: { ...state.design, selectedObject: selectionFor(state.design, action.selectedItem) } }

    case 'COMPONENT_ADD':
      return commit(state, touch(updateFrame(state.design, action.frameId, (frame) => ({
        ...frame,
        components: [...frame.components, synchronizeComponent(action.component)],
        showDoors: frame.doors.length > 0 ? false : frame.showDoors,
      }))))

    case 'COMPONENT_UPDATE':
      return commit(state, touch(updateFrame(state.design, action.frameId, (frame) => ({
        ...frame,
        components: frame.components.map((component) =>
          component.id === action.componentId ? mergeComponent(component, action.patch) : component),
      }))))

    case 'COMPONENT_MOVE':
      return designReducer(state, { type: 'COMPONENT_UPDATE', frameId: action.frameId, componentId: action.componentId, patch: { positionMm: action.positionMm } })

    case 'COMPONENT_RESIZE':
      return designReducer(state, { type: 'COMPONENT_UPDATE', frameId: action.frameId, componentId: action.componentId, patch: { sizeMm: action.sizeMm } })

    case 'COMPONENT_DELETE':
      return commit(state, touch({
        ...updateFrame(state.design, action.frameId, (frame) => ({
          ...frame,
          components: frame.components.filter((component) => component.id !== action.componentId),
        })),
        selectedObject: state.design.selectedObject?.objectId === action.componentId
          ? selectionFor(state.design, { kind: 'frame', id: action.frameId })
          : state.design.selectedObject,
      }))

    case 'COMPONENT_DUPLICATE': {
      const frame = state.design.furniture.frames.find((candidate) => candidate.id === action.frameId)
      const source = frame?.components.find((component) => component.id === action.componentId)
      if (!frame || !source) return state
      const y = Math.min(frame.heightMm - source.sizeMm.height - frame.boardThicknessMm, source.positionMm.y + 50)
      const duplicate = mergeComponent(source, { id: createId('component'), name: `${source.name} copy`, positionMm: { ...source.positionMm, y } })
      return commit(state, touch({
        ...updateFrame(state.design, action.frameId, (candidate) => ({ ...candidate, components: [...candidate.components, duplicate] })),
        selectedObject: selectionFor(state.design, { kind: 'component', id: duplicate.id }),
      }))
    }

    case 'COMPONENTS_REPLACE':
      return commit(state, touch({
        ...updateFrame(state.design, action.frameId, (frame) => ({ ...frame, components: action.components.map(synchronizeComponent) })),
        selectedObject: selectionFor(state.design, { kind: 'frame', id: action.frameId }),
      }))

    case 'DOOR_UPSERT':
      return commit(state, touch(updateFrame(state.design, action.frameId, (frame) => {
        const door = { ...action.door, frameId: frame.id }
        const exists = frame.doors.some((candidate) => candidate.id === door.id)
        return { ...frame, doors: exists ? frame.doors.map((candidate) => candidate.id === door.id ? door : candidate) : [...frame.doors, door] }
      })))

    case 'DOOR_REPLACE':
      return commit(state, touch({
        ...updateFrame(state.design, action.frameId, (frame) => ({ ...frame, doors: action.door ? [{ ...action.door, frameId: frame.id }] : [] })),
        selectedObject: action.door
          ? selectionFor(state.design, { kind: 'door', id: action.door.id })
          : selectionFor(state.design, { kind: 'frame', id: action.frameId }),
      }))

    case 'DOOR_TOGGLE_OPEN':
      return commit(state, touch(updateFrame(state.design, action.frameId, (frame) => ({
        ...frame,
        doors: frame.doors.map((door) => door.id === action.doorId
          ? { ...door, isOpen: action.isOpen ?? !door.isOpen, openAngleDeg: (action.isOpen ?? !door.isOpen) ? 90 : 0 }
          : door),
      }))))

    case 'HARDWARE_ADD': {
      let design = {
        ...state.design,
        furniture: { ...state.design.furniture, accessories: [...state.design.furniture.accessories, action.hardware] },
      }
      if (action.doorId) {
        design = updateFrame(design, action.frameId, (frame) => ({
          ...frame,
          doors: frame.doors.map((door) => door.id === action.doorId
            ? {
              ...door,
              handleId: action.hardware.type === 'knob' ? door.handleId : action.hardware.id,
              knobId: action.hardware.type === 'knob' ? action.hardware.id : door.knobId,
            }
            : door),
        }))
      }
      return commit(state, touch(design))
    }

    case 'CONTENT_ADD':
      return commit(state, touch(updateFrame(state.design, action.frameId, (frame) => ({ ...frame, contents: [...frame.contents, action.content] }))))

    case 'CONTENT_UPDATE':
      return commit(state, touch(updateFrame(state.design, action.frameId, (frame) => ({
        ...frame,
        contents: frame.contents.map((content) => content.id === action.contentId ? { ...content, ...action.patch } : content),
      }))))

    case 'CONTENT_DELETE':
      return commit(state, touch(updateFrame(state.design, action.frameId, (frame) => ({
        ...frame,
        contents: frame.contents.filter((content) => content.id !== action.contentId),
      }))))

    case 'FRAME_SHOW_DOORS':
      return commit(state, touch(updateFrame(state.design, action.frameId, (frame) => ({ ...frame, showDoors: action.showDoors }))))

    case 'MATERIAL_CHANGE': {
      let design = state.design
      if (action.target === 'frame') {
        design = updateFrame(design, action.targetId, (frame) => ({ ...frame, materialId: action.materialId }))
      } else {
        design = {
          ...design,
          furniture: {
            ...design.furniture,
            frames: design.furniture.frames.map((frame) => ({
              ...frame,
              components: action.target === 'component'
                ? frame.components.map((component) => component.id === action.targetId ? { ...component, materialId: action.materialId } : component)
                : frame.components,
              doors: action.target === 'door'
                ? frame.doors.map((door) => door.id === action.targetId ? { ...door, materialId: action.materialId } : door)
                : frame.doors,
            })),
          },
        }
      }
      return commit(state, touch(design))
    }

    case 'FINISH_CHANGE':
      return commit(state, touch(updateFrame(state.design, action.frameId, (frame) => ({ ...frame, finishId: action.finishId }))))

    case 'CAMERA_MODE_CHANGE':
      return deriveState({
        ...state.design,
        camera: { ...state.design.camera, mode: action.mode, ...cameraFlags(action.mode) },
      }, state.past, state.future)

    case 'CAMERA_UPDATE':
      return deriveState({ ...state.design, camera: { ...state.design.camera, ...action.patch } }, state.past, state.future)

    case 'VIEW_MODE_CHANGE':
      return deriveState({ ...state.design, viewMode: action.viewMode }, state.past, state.future)

    case 'VIEW_SETTINGS_UPDATE':
      return deriveState({
        ...state.design,
        camera: { ...state.design.camera, zoom: action.patch.zoomPercent ?? state.design.camera.zoom },
        renderSettings: {
          ...state.design.renderSettings,
          ...(action.patch.showMeasurements === undefined ? {} : { showMeasurements: action.patch.showMeasurements }),
          ...(action.patch.showDoors === undefined ? {} : { showDoors: action.patch.showDoors }),
          ...(action.patch.showIssues === undefined ? {} : { showIssues: action.patch.showIssues }),
        },
      }, state.past, state.future)

    case 'VALIDATION_RUN':
    case 'PRICE_CALCULATE':
      return deriveState(state.design, state.past, state.future, state.startupErrorKey)

    case 'LANGUAGE_UPDATE':
      return deriveState(touch({ ...state.design, language: action.language }), state.past, state.future)

    case 'UNDO': {
      const previous = state.past[state.past.length - 1]
      if (!previous) return state
      return deriveState(previous, state.past.slice(0, -1), [state.design, ...state.future].slice(0, 40))
    }

    case 'REDO': {
      const next = state.future[0]
      if (!next) return state
      return deriveState(next, [...state.past.slice(-39), state.design], state.future.slice(1))
    }
  }
}

interface DesignContextValue {
  state: AppState
  dispatch: Dispatch<AppAction>
}

const DesignContext = createContext<DesignContextValue | null>(null)

export function DesignProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(designReducer, undefined, () => {
    const draft = projectRepository.loadDraft()
    return deriveState(draft.ok && draft.value ? draft.value.design : createDesign(), [], [], draft.ok ? null : draft.errorKey)
  })
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>
}

export function useDesign(): DesignContextValue {
  const context = useContext(DesignContext)
  if (!context) throw new Error('useDesign must be used within DesignProvider')
  return context
}
