import React, { FunctionComponent, useCallback } from 'react'
import { WorkspaceRoute, WorkspaceRouteDispatch } from '../pluginInterface'
import { WorkspaceState } from '../pluginInterface/workspaceReducer'
import './WorkspaceNavigationComponent.css'

type Props = {
    workspace: WorkspaceState
    workspaceRoute: WorkspaceRoute
    workspaceRouteDispatch: WorkspaceRouteDispatch
    height: number
}

const WorkspaceNavigationComponent: FunctionComponent<Props> = (props) => {
    const {height} = props
    return (
        <div style={{height}}>
            <WorkspacePart {...props} />
            <ModelPart {...props} />
        </div>
    )
}

const WorkspacePart: FunctionComponent<Props> = ({workspaceRoute, workspaceRouteDispatch}) => {
    const {workspaceUri} = workspaceRoute
    const handleClick = useCallback(() => {
        workspaceRouteDispatch({
            type: 'gotoMainPage'
        })
    }, [workspaceRouteDispatch])
    return (
        workspaceUri ? (
            <Part label={shorten(workspaceUri, 20)} title="Go to workspace home" onClick={handleClick} />
        ) : <span />
    )
}

const ModelPart: FunctionComponent<Props> = ({workspace, workspaceRoute, workspaceRouteDispatch}) => {
    const handleClick = useCallback(() => {
        if ((workspaceRoute.page !== 'model') && (workspaceRoute.page !== 'modelSurface') && (workspaceRoute.page !== 'modelVectorField3D')) throw Error('Unexpected')
        workspaceRouteDispatch({
            type: 'gotoModelPage',
            modelId: workspaceRoute.modelId
        })
    }, [workspaceRouteDispatch, workspaceRoute])
    if ((workspaceRoute.page === 'model') || (workspaceRoute.page === 'modelSurface') || (workspaceRoute.page === 'modelVectorField3D')) {
        const mid = workspaceRoute.modelId
        const model = workspace.models.filter(r => (r.modelId === mid))[0]
        if (model) {
            return <Part label={model.label} title="Go to model" onClick={handleClick} />
        }
        else return <Part label="Unknown model" title="" onClick={handleClick} />
    }
    else return <span />
}

const Part: FunctionComponent<{label: string, title: string, onClick: () => void}> = ({label, title, onClick}) => {
    return (
        <span
            className="WorkspaceNavigationPart"
            title={title}
            onClick={onClick}
        >
            {label}
        </span>
    )
}

const shorten = (x: string, maxLength: number) => {
    if (x.length <= maxLength) return x
    else return `${x.slice(0, maxLength - 3)}...`
}

export default WorkspaceNavigationComponent