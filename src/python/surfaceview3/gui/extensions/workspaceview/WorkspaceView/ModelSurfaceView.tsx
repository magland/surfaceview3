import { usePureCalculationTask } from 'kachery-react';
import TaskStatusView from 'kachery-react/components/TaskMonitor/TaskStatusView';
import useSelectedChannel from 'python/surfaceview3/gui/pages/Home/useSelectedChannel';
import React, { FunctionComponent, useMemo } from 'react';
import { WorkspaceModel } from '../../../pluginInterface/workspaceReducer';
import { WorkspaceViewProps } from '../../../pluginInterface/WorkspaceViewPlugin';
import SurfaceView, { SurfaceData } from './SurfaceView/SurfaceView';
import useModelInfo from './useModelInfo';

export interface LocationInterface {
  pathname: string
  search: string
}

export interface HistoryInterface {
  location: LocationInterface
  push: (x: LocationInterface) => void
}



const ModelSurfaceView: FunctionComponent<WorkspaceViewProps & {modelId: string, surfaceName: string}> = ({ modelId, surfaceName, workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, width=500, height=500 }) => {
  const model = useMemo((): WorkspaceModel | undefined => (
    workspace.models.filter(x => (x.modelId === modelId))[0]
  ), [workspace, modelId])
  const {modelInfo, task: modelInfoTask} = useModelInfo(model?.uri)
  const surfaceUri = modelInfo?.surfaces[surfaceName].uri
  const {selectedChannel: channelName} = useSelectedChannel()
  const {returnValue: surfaceData, task: surfaceDataTask} = usePureCalculationTask<SurfaceData>(surfaceUri ? 'get_surface_data.6' : '', {surface_uri: surfaceUri}, {channelName})
  if (!model) return <span>Model not found.</span>
  if (!modelInfo) {
    return <TaskStatusView task={modelInfoTask} label="get model info" />
  }
  if (!surfaceData) {
    return <TaskStatusView task={surfaceDataTask} label="get surface data" />
  }
  return (
    <div>
      <h3>Surface: {model.label} ({model.modelId}) {surfaceName}</h3>
      <SurfaceView
        surfaceData={surfaceData}
      />
    </div>
  )
}

export default ModelSurfaceView