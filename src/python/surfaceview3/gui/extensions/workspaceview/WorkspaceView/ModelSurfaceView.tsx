import { useChannel, usePureCalculationTask } from 'kachery-react';
import TaskStatusView from 'kachery-react/components/TaskMonitor/TaskStatusView';
import React, { FunctionComponent, useMemo } from 'react';
import { WorkspaceModel } from '../../../pluginInterface/workspaceReducer';
import { WorkspaceViewProps } from '../../../pluginInterface/WorkspaceViewPlugin';
import { SliceSelection } from './sliceSelection';
import { AffineTransformation3D, Slice } from './SlicesView/mainLayer';
import SurfaceView, { SurfaceData } from './SurfaceView/SurfaceView';
import useModelInfo from './useModelInfo';

type Props = WorkspaceViewProps & {
  modelId: string
  surfaceName: string
  sliceSelection: SliceSelection
}


export interface LocationInterface {
  pathname: string
  search: string
}

export interface HistoryInterface {
  location: LocationInterface
  push: (x: LocationInterface) => void
}



const ModelSurfaceView: FunctionComponent<Props> = ({ modelId, surfaceName, workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, width=500, height=500, sliceSelection }) => {
  const model = useMemo((): WorkspaceModel | undefined => (
    workspace.models.filter(x => (x.modelId === modelId))[0]
  ), [workspace, modelId])
  const {modelInfo, task: modelInfoTask} = useModelInfo(model?.uri)
  const surfaceUri = modelInfo?.surfaces[surfaceName].uri
  const {channelName} = useChannel()
  const {returnValue: surfaceData, task: surfaceDataTask} = usePureCalculationTask<SurfaceData>(surfaceUri ? 'get_surface_data.6' : '', {surface_uri: surfaceUri}, {channelName})
  const currentSlice: Slice | undefined = useMemo(() => {
    const info = sliceSelection.vectorField3DInfo
    if (!info) return undefined
    const sliceIndex = sliceSelection.sliceIndex
    if (!sliceIndex) return undefined
    
    const A = info.affineTransformation
    if (sliceSelection.plane === 'XY') {
      const sliceAffineTransformation = [
        [A[0][0], A[0][1], A[0][2], A[0][3] + sliceIndex * A[0][2]],
        [A[1][0], A[1][1], A[1][2], A[1][3] + sliceIndex * A[1][2]],
        [A[2][0], A[2][1], A[2][2], A[2][3] + sliceIndex * A[2][2]]
      ] as any as AffineTransformation3D
      return {
        nx: info.nx,
        ny: info.ny,
        transformation: sliceAffineTransformation
      }
    }
    else if (sliceSelection.plane === 'XZ') {
      const sliceAffineTransformation = [
        [A[0][0], A[0][2], A[0][1], A[0][3] + sliceIndex * A[0][1]],
        [A[1][0], A[1][2], A[1][1], A[1][3] + sliceIndex * A[1][1]],
        [A[2][0], A[2][2], A[2][1], A[2][3] + sliceIndex * A[2][1]]
      ] as any as AffineTransformation3D
      return {
        nx: info.nx,
        ny: info.nz,
        transformation: sliceAffineTransformation
      }
    }
    else if (sliceSelection.plane === 'YZ') {
      const sliceAffineTransformation = [
        [A[0][1], A[0][2], A[0][0], A[0][3] + sliceIndex * A[0][0]],
        [A[1][1], A[1][2], A[1][0], A[1][3] + sliceIndex * A[1][0]],
        [A[2][1], A[2][2], A[2][0], A[2][3] + sliceIndex * A[2][0]]
      ] as any as AffineTransformation3D
      return {
        nx: info.nx,
        ny: info.nz,
        transformation: sliceAffineTransformation
      }
    }
    else return undefined
  }, [sliceSelection])
  if (!model) return <span>Model not found.</span>
  if (!modelInfo) {
    return <TaskStatusView task={modelInfoTask} label="get model info" />
  }
  if (!surfaceData) {
    return <TaskStatusView task={surfaceDataTask} label="get surface data" />
  }
  return (
    <div style={{width, height}}>
      <h3>{surfaceName}</h3>
      <SurfaceView
        surfaceData={surfaceData}
        currentSlice={currentSlice}
        width={width}
        height={height - 40}
      />
    </div>
  )
}

export default ModelSurfaceView