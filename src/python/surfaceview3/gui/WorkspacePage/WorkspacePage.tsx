import useRoute from 'labbox-react/MainWindow/useRoute'
import useWorkspace from 'labbox-react/workspace/useWorkspace'
import React, { FunctionComponent } from 'react'
import WorkspaceView from '../extensions/workspaceview/WorkspaceView'
import workspaceReducer, { initialWorkspaceState, WorkspaceAction, WorkspaceState } from '../pluginInterface/workspaceReducer'
import useWorkspaceRoute from './useWorkspaceRoute'
import WorkspaceNavigationComponent from './WorkspaceNavigationComponent'
type Props = {
    width: number
    height: number
}

const useSurfaceViewWorkspace = (workspaceUri: string, workspaceActionFunctionId: string) => {
    return useWorkspace<WorkspaceState, WorkspaceAction>({
        workspaceUri,
        workspaceReducer,
        initialWorkspaceState,
        actionField: true,
        actionFunctionId: workspaceActionFunctionId
    })
}

const workspaceNavigationHeight = 30
const horizontalPadding = 10
const paddingTop = 5
const divStyle: React.CSSProperties = {
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
    paddingTop: paddingTop
}


const WorkspacePage: FunctionComponent<Props> = ({width, height}) => {
    const {workspaceUri} = useRoute()
    if (!workspaceUri) throw Error('Unexpected: workspaceUri is undefined')
    
    // const {feedId} = parseWorkspaceUri(workspaceUri)
    const {workspace, workspaceDispatch} = useSurfaceViewWorkspace(workspaceUri, 'surfaceview3_workspace_action.1')
    const {workspaceRoute, workspaceRouteDispatch} = useWorkspaceRoute()

    return (
        <div className="WorkspacePage" style={divStyle}>
            <WorkspaceNavigationComponent
                workspace={workspace}
                workspaceRoute={workspaceRoute}
                workspaceRouteDispatch={workspaceRouteDispatch}
                height={workspaceNavigationHeight}
            />
            <WorkspaceView
                workspace={workspace}
                workspaceDispatch={workspaceDispatch}
                workspaceRoute={workspaceRoute}
                workspaceRouteDispatch={workspaceRouteDispatch}
                width={width - horizontalPadding * 2}
                height={height - workspaceNavigationHeight - paddingTop}
            />
        </div>
    )
}

export default WorkspacePage