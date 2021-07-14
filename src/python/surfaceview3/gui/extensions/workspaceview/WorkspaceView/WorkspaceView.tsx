import React, { FunctionComponent } from 'react';
import { WorkspaceViewProps } from '../../../pluginInterface/WorkspaceViewPlugin';
import ModelsView from './ModelsView';
import ModelSyncView from './ModelSyncView';
import ModelView from './ModelView';

export interface LocationInterface {
  pathname: string
  search: string
}

export interface HistoryInterface {
  location: LocationInterface
  push: (x: LocationInterface) => void
}

const WorkspaceView: FunctionComponent<WorkspaceViewProps> = ({ workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, width=500, height=500 }) => {
  if (workspaceRoute.page === 'model') {
    return (
      <ModelView
        {...{modelId: workspaceRoute.modelId, workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, width, height}}
      />
    )
  }
  else if (workspaceRoute.page === 'modelSurface') {
    return (
      <ModelSyncView
        {...{modelId: workspaceRoute.modelId, vectorField3DNames: [], surfaceNames: [workspaceRoute.surfaceName], workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, width, height}}
      />
    )
  }
  else if (workspaceRoute.page === 'modelVectorField3D') {
    return (
      <ModelSyncView
        {...{modelId: workspaceRoute.modelId, vectorField3DNames: [workspaceRoute.vectorField3DName], surfaceNames: [], workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, width, height}}
      />
    )
  }
  else if (workspaceRoute.page === 'modelSyncView') {
    return (
      <ModelSyncView
        {...{modelId: workspaceRoute.modelId, vectorField3DNames: workspaceRoute.vectorField3DNames, surfaceNames: workspaceRoute.surfaceNames, workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, width, height}}
      />
    )
  }
  else {
    return (
      <ModelsView
        {...{workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, width, height}}
      />
    )
  }
}

export default WorkspaceView

// jinjaroot synctool exclude