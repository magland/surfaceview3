import { useChannel, usePureCalculationTask } from "kachery-react"
import { AffineTransformation3D } from "./SlicesView/mainLayer"

type SurfaceInfo = {
    uri: string
    numVertices: number
    numFaces: number
}

type VectorField3DInfo = {
    uri: string
    nx: number
    ny: number
    nz: number
    dim: number
    affineTransformation: AffineTransformation3D
    valueRange: {min: number, max: number}
}

export type ModelInfo = {
    surfaces: {[key: string]: SurfaceInfo}
    vectorfield3ds: {[key: string]: VectorField3DInfo}
}

const useModelInfo = (modelUri: string | undefined) => {
    const {channelName} = useChannel()
    const {returnValue: modelInfo, task} = usePureCalculationTask<ModelInfo>(modelUri ? 'get_model_info.9' : '', {model_uri: modelUri}, {channelName})
    return {modelInfo, task}
}

export default useModelInfo