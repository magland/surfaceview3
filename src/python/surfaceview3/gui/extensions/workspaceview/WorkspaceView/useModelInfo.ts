import useSelectedChannel from "python/surfaceview3/gui/pages/Home/useSelectedChannel"
import { usePureCalculationTask } from "../../../labbox"

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
    valueRange: {min: number, max: number}
}

export type ModelInfo = {
    surfaces: {[key: string]: SurfaceInfo}
    vectorfield3ds: {[key: string]: VectorField3DInfo}
}

const useModelInfo = (modelUri: string | undefined) => {
    const {selectedChannel: channelName} = useSelectedChannel()
    const {returnValue: modelInfo, task} = usePureCalculationTask<ModelInfo>(modelUri ? 'get_model_info.8' : '', {model_uri: modelUri}, {channelName})
    return {modelInfo, task}
}

export default useModelInfo