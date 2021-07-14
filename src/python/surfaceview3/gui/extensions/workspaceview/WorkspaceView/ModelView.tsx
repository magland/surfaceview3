import TaskStatusView from 'kachery-react/components/TaskMonitor/TaskStatusView';
import React, { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { WorkspaceModel } from '../../../pluginInterface/workspaceReducer';
import { WorkspaceViewProps } from '../../../pluginInterface/WorkspaceViewPlugin';
import ModelSurfaceTable from './ModelSurfaceTable';
import ModelVectorField3DTable from './ModelVectorField3DTable';
import useModelInfo from './useModelInfo';

export interface LocationInterface {
  pathname: string
  search: string
}

export interface HistoryInterface {
  location: LocationInterface
  push: (x: LocationInterface) => void
}



const ModelView: FunctionComponent<WorkspaceViewProps & {modelId: string}> = ({ modelId, workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, width=500, height=500 }) => {
  const model = useMemo((): WorkspaceModel | undefined => (
    workspace.models.filter(x => (x.modelId === modelId))[0]
  ), [workspace, modelId])
  const {modelInfo, task} = useModelInfo(model?.uri)
  const [selectedSurfaceNames, setSelectedSurfaceNames] = useState<string[]>([])
  const handleSurfaceClicked = useCallback((surfaceName: string) => {
    workspaceRouteDispatch({type: 'gotoModelSurfacePage', modelId, surfaceName})
  }, [workspaceRouteDispatch, modelId])
  const handleVectorField3DClicked = useCallback((vectorField3DName: string) => {
    if (selectedSurfaceNames.length === 0) {
      workspaceRouteDispatch({type: 'gotoModelVectorField3DPage', modelId, vectorField3DName})
    }
    else {
      workspaceRouteDispatch({type: 'gotoModelSyncViewPage', modelId, vectorField3DNames: [vectorField3DName], surfaceNames: selectedSurfaceNames})
    }
  }, [workspaceRouteDispatch, modelId, selectedSurfaceNames])
  if (!model) return <span>Model not found.</span>
  if (!modelInfo) {
    return <TaskStatusView task={task} label={`get model info: ${model.label} ${model.uri}`} />
  }
  return (
    <div>
      <h3>Model: {model.label} ({model.modelId})</h3>
      <hr />
      <h4>Surfaces</h4>
      <ModelSurfaceTable
        modelInfo={modelInfo}
        onSurfaceClicked={handleSurfaceClicked}
        selectedSurfaceNames={selectedSurfaceNames}
        onSelectedSurfacesChanged={setSelectedSurfaceNames}
      />
      <hr />
      <h4>3D vector fields</h4>
      <ModelVectorField3DTable
        modelInfo={modelInfo}
        onVectorField3DClicked={handleVectorField3DClicked}
      />
    </div>
  )
}

export default ModelView