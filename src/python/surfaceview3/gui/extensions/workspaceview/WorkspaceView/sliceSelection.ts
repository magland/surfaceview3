import { VectorField3DInfo } from "./useModelInfo"

export type SliceSelection = {
    plane: 'XY' | 'XZ' | 'YZ'
    sliceIndex: number | undefined
    component: number | undefined
    vectorField3DInfo?: VectorField3DInfo
}
  
export type SliceSelectionAction = {
    type: 'setPlane'
    plane: 'XY' | 'XZ' | 'YZ'
} | {
    type: 'setSliceIndex'
    sliceIndex: number | undefined
} | {
    type: 'setComponent'
    component: number | undefined
} | {
    type: 'setVectorField3DInfo'
    info: VectorField3DInfo | undefined
}
  
export const sliceSelectionReducer = (s: SliceSelection, a: SliceSelectionAction): SliceSelection => {
    if (a.type === 'setPlane') return {...s, plane: a.plane}
    else if (a.type === 'setSliceIndex') return {...s, sliceIndex: a.sliceIndex}
    else if (a.type === 'setComponent') return {...s, component: a.component}
    else if (a.type === 'setVectorField3DInfo') return {...s, vectorField3DInfo: a.info}
    else return s
}

export type SliceSelectionDispatch = (a: SliceSelectionAction) => void