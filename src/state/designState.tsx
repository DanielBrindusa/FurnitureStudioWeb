import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'
import { createDesign } from '../models/factories'
import type {
  Design,
  Door,
  Frame,
  FurnitureComponent,
  InstallationSpace,
  LanguageCode,
  PriceBreakdown,
  SelectedItem,
  ValidationResult,
  ViewSettings,
} from '../models/design'
import { getPriceBreakdown } from '../pricing/priceEngine'
import { validateDesign } from '../validation/validationEngine'

export interface AppState {
  design: Design
  validation: ValidationResult[]
  price: PriceBreakdown
}

type FrameDimensionPatch = Partial<Pick<Frame, 'widthMm' | 'heightMm' | 'depthMm'>>

export type AppAction =
  | { type: 'DESIGN_CREATE' }
  | { type: 'INSTALLATION_UPDATE'; patch: Partial<InstallationSpace> }
  | { type: 'FRAME_ADD'; frame: Frame }
  | { type: 'FRAME_UPDATE_DIMENSIONS'; frameId: string; patch: FrameDimensionPatch }
  | { type: 'FRAME_RENAME'; frameId: string; name: string }
  | { type: 'FRAME_DELETE'; frameId: string }
  | { type: 'FRAME_DUPLICATE'; frameId: string }
  | { type: 'FRAME_REORDER'; frameId: string; orderIndex: number }
  | { type: 'ITEM_SELECT'; selectedItem: SelectedItem }
  | { type: 'COMPONENT_ADD'; frameId: string; component: FurnitureComponent }
  | { type: 'COMPONENT_UPDATE'; frameId: string; componentId: string; patch: Partial<FurnitureComponent> }
  | { type: 'COMPONENT_DELETE'; frameId: string; componentId: string }
  | { type: 'DOOR_UPSERT'; frameId: string; door: Door }
  | { type: 'MATERIAL_CHANGE'; target: 'frame' | 'component' | 'door'; targetId: string; materialId: string }
  | { type: 'FINISH_CHANGE'; frameId: string; finishId: string }
  | { type: 'VIEW_SETTINGS_UPDATE'; patch: Partial<ViewSettings> }
  | { type: 'VALIDATION_RUN' }
  | { type: 'PRICE_CALCULATE' }
  | { type: 'LANGUAGE_UPDATE'; language: LanguageCode }

const createId = (prefix: string): string =>
  `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`

const deriveState = (design: Design): AppState => ({
  design,
  validation: validateDesign(design),
  price: getPriceBreakdown(design),
})

const touch = (design: Design): Design => ({
  ...design,
  updatedAt: new Date().toISOString(),
})

const updateFrame = (design: Design, frameId: string, updater: (frame: Frame) => Frame): Design => ({
  ...design,
  frames: design.frames.map((frame) => frame.id === frameId ? updater(frame) : frame),
})

export function designReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'DESIGN_CREATE':
      return deriveState(createDesign(state.design.language))

    case 'INSTALLATION_UPDATE':
      return deriveState(touch({
        ...state.design,
        installationSpace: { ...state.design.installationSpace, ...action.patch },
      }))

    case 'FRAME_ADD':
      return deriveState(touch({
        ...state.design,
        frames: [...state.design.frames, action.frame],
        selectedItem: { kind: 'frame', id: action.frame.id },
      }))

    case 'FRAME_UPDATE_DIMENSIONS':
      return deriveState(touch(updateFrame(state.design, action.frameId, (frame) => ({
        ...frame,
        ...action.patch,
        doors: frame.doors.map((door) => ({
          ...door,
          widthMm: action.patch.widthMm ?? door.widthMm,
          heightMm: action.patch.heightMm ?? door.heightMm,
        })),
      }))))

    case 'FRAME_RENAME':
      return deriveState(touch(updateFrame(state.design, action.frameId, (frame) => ({
        ...frame,
        name: action.name.trim() || frame.name,
      }))))

    case 'FRAME_DELETE': {
      const frames = state.design.frames
        .filter((frame) => frame.id !== action.frameId)
        .map((frame, orderIndex) => ({ ...frame, orderIndex }))
      return deriveState(touch({
        ...state.design,
        frames,
        selectedItem: state.design.selectedItem?.id === action.frameId ? null : state.design.selectedItem,
      }))
    }

    case 'FRAME_DUPLICATE': {
      const source = state.design.frames.find((frame) => frame.id === action.frameId)
      if (!source) return state

      const duplicate: Frame = {
        ...source,
        id: createId('frame'),
        name: `${source.name} copy`,
        orderIndex: state.design.frames.length,
        components: source.components.map((component) => ({ ...component, id: createId('component') })),
        doors: source.doors.map((door) => ({ ...door, id: createId('door') })),
      }

      return deriveState(touch({
        ...state.design,
        frames: [...state.design.frames, duplicate],
        selectedItem: { kind: 'frame', id: duplicate.id },
      }))
    }

    case 'FRAME_REORDER': {
      const ordered = [...state.design.frames].sort((a, b) => a.orderIndex - b.orderIndex)
      const currentIndex = ordered.findIndex((frame) => frame.id === action.frameId)
      if (currentIndex < 0) return state

      const [moved] = ordered.splice(currentIndex, 1)
      if (!moved) return state
      ordered.splice(Math.max(0, Math.min(action.orderIndex, ordered.length)), 0, moved)

      return deriveState(touch({
        ...state.design,
        frames: ordered.map((frame, orderIndex) => ({ ...frame, orderIndex })),
      }))
    }

    case 'ITEM_SELECT':
      return { ...state, design: { ...state.design, selectedItem: action.selectedItem } }

    case 'COMPONENT_ADD':
      return deriveState(touch(updateFrame(state.design, action.frameId, (frame) => ({
        ...frame,
        components: [...frame.components, action.component],
      }))))

    case 'COMPONENT_UPDATE':
      return deriveState(touch(updateFrame(state.design, action.frameId, (frame) => ({
        ...frame,
        components: frame.components.map((component) =>
          component.id === action.componentId
            ? { ...component, ...action.patch, options: { ...component.options, ...action.patch.options } }
            : component,
        ),
      }))))

    case 'COMPONENT_DELETE':
      return deriveState(touch(updateFrame(state.design, action.frameId, (frame) => ({
        ...frame,
        components: frame.components.filter((component) => component.id !== action.componentId),
      }))))

    case 'DOOR_UPSERT':
      return deriveState(touch(updateFrame(state.design, action.frameId, (frame) => {
        const exists = frame.doors.some((door) => door.id === action.door.id)
        return {
          ...frame,
          doors: exists
            ? frame.doors.map((door) => door.id === action.door.id ? action.door : door)
            : [...frame.doors, action.door],
        }
      })))

    case 'MATERIAL_CHANGE': {
      let design = state.design

      if (action.target === 'frame') {
        design = updateFrame(design, action.targetId, (frame) => ({ ...frame, materialId: action.materialId }))
      } else {
        design = {
          ...design,
          frames: design.frames.map((frame) => ({
            ...frame,
            components: action.target === 'component'
              ? frame.components.map((component) => component.id === action.targetId
                ? { ...component, materialId: action.materialId }
                : component)
              : frame.components,
            doors: action.target === 'door'
              ? frame.doors.map((door) => door.id === action.targetId
                ? { ...door, materialId: action.materialId }
                : door)
              : frame.doors,
          })),
        }
      }

      return deriveState(touch(design))
    }

    case 'FINISH_CHANGE':
      return deriveState(touch(updateFrame(state.design, action.frameId, (frame) => ({
        ...frame,
        finishId: action.finishId,
      }))))

    case 'VIEW_SETTINGS_UPDATE':
      return deriveState(touch({
        ...state.design,
        viewSettings: { ...state.design.viewSettings, ...action.patch },
      }))

    case 'VALIDATION_RUN':
      return { ...state, validation: validateDesign(state.design) }

    case 'PRICE_CALCULATE':
      return { ...state, price: getPriceBreakdown(state.design) }

    case 'LANGUAGE_UPDATE':
      return deriveState(touch({ ...state.design, language: action.language }))

    default:
      return state
  }
}

interface DesignContextValue {
  state: AppState
  dispatch: Dispatch<AppAction>
}

const DesignContext = createContext<DesignContextValue | null>(null)

export function DesignProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(designReducer, undefined, () => deriveState(createDesign()))
  const value = useMemo(() => ({ state, dispatch }), [state])

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>
}

export function useDesign(): DesignContextValue {
  const context = useContext(DesignContext)
  if (!context) throw new Error('useDesign must be used within DesignProvider')
  return context
}
