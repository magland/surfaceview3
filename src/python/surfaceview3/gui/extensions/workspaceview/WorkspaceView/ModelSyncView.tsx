import { Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import { WorkspaceViewProps } from 'python/surfaceview3/gui/pluginInterface/WorkspaceViewPlugin'
import React, { useEffect, useReducer } from 'react'
import { FunctionComponent } from "react"
import ModelSurfaceView from './ModelSurfaceView'
import ModelVectorField3DView from './ModelVectorField3DView'
import { sliceSelectionReducer } from './sliceSelection'

type Props = WorkspaceViewProps & {
    modelId: string
    vectorField3DNames: string[]
    surfaceNames: string[]
}

const ModelSyncView: FunctionComponent<Props> = (props) => {
    const {modelId, vectorField3DNames, surfaceNames, width, height} = props

    const [sliceSelection, sliceSelectionDispatch] = useReducer(sliceSelectionReducer, {plane: 'XY', sliceIndex: undefined, component: 0})
    useEffect(() => {
        if ((sliceSelection.sliceIndex === undefined) && (sliceSelection.vectorField3DInfo)) {
            if (sliceSelection.plane === 'XY') {
                sliceSelectionDispatch({
                    type: 'setSliceIndex',
                    sliceIndex: Math.floor(sliceSelection.vectorField3DInfo.nz / 2)
                })
            }
            else if (sliceSelection.plane === 'XZ') {
                sliceSelectionDispatch({
                    type: 'setSliceIndex',
                    sliceIndex: Math.floor(sliceSelection.vectorField3DInfo.ny / 2)
                })
            }
            else if (sliceSelection.plane === 'YZ') {
                sliceSelectionDispatch({
                    type: 'setSliceIndex',
                    sliceIndex: Math.floor(sliceSelection.vectorField3DInfo.nx / 2)
                })
            }
        }
    }, [sliceSelection])

    const numViews = vectorField3DNames.length + surfaceNames.length
    if (![1, 2].includes(numViews)) {
        return <div>Right now, only 1 or 2 synchronized views are supported</div>
    }
    const W = (width - 50) / numViews
    const H = height
    return (
        <Table>
            <TableBody>
                <TableRow>
                    {
                        surfaceNames.map(surfaceName => (
                            <TableCell style={{verticalAlign: 'top'}}>
                                <ModelSurfaceView
                                    modelId={modelId}
                                    surfaceName={surfaceName}
                                    width={W}
                                    height={H}
                                    workspace={props.workspace}
                                    workspaceDispatch={props.workspaceDispatch}
                                    workspaceRoute={props.workspaceRoute}
                                    workspaceRouteDispatch={props.workspaceRouteDispatch}
                                    sliceSelection={sliceSelection}
                                />
                            </TableCell>
                        ))
                    }
                    {
                        vectorField3DNames.map(vectorField3DName => (
                            <TableCell style={{verticalAlign: 'top'}}>
                                <ModelVectorField3DView
                                    modelId={modelId}
                                    vectorField3DName={vectorField3DName}
                                    width={W}
                                    height={H}
                                    workspace={props.workspace}
                                    workspaceDispatch={props.workspaceDispatch}
                                    workspaceRoute={props.workspaceRoute}
                                    workspaceRouteDispatch={props.workspaceRouteDispatch}
                                    sliceSelection={sliceSelection}
                                    sliceSelectionDispatch={sliceSelectionDispatch}
                                />
                            </TableCell>
                        ))
                    }
                </TableRow>
            </TableBody>
        </Table>
    )
}

export default ModelSyncView