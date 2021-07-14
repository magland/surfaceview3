import { Button } from '@material-ui/core';
import Hyperlink from 'labbox-react/components/Hyperlink/Hyperlink';
import NiceTable from 'labbox-react/components/NiceTable/NiceTable';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { WorkspaceModel } from '../../../pluginInterface/workspaceReducer';
import './WorkspaceView.css';

interface Props {
    models: WorkspaceModel[]
    onDeleteModels?: (modelIds: string[]) => void
    onModelClicked?: (modelId: string) => void
    onViewModels?: (modelIds: string[]) => void
}
const ModelsTable: FunctionComponent<Props> = ({ models, onDeleteModels, onModelClicked, onViewModels }) => {
    const columns = useMemo(() => ([
        {
            key: 'label',
            label: 'Model'
        }
    ]), [])

    const rows = useMemo(() => (models.map(x => {
        return {
            key: x.modelId,
            columnValues: {
                label: {
                    text: x.label,
                    element: <Hyperlink onClick={onModelClicked ? (() => {onModelClicked(x.modelId)}) : undefined}>{x.label}</Hyperlink>
                }
            }
        }
    })), [models, onModelClicked])

    const [selectedModelIds, setSelectedModelIds] = useState<string[]>([])

    const [confirmingDelete, setConfirmingDelete] = useState(false)
    const confirmOn = useCallback(() => {setConfirmingDelete(true)}, [])
    const confirmOff = useCallback(() => {setConfirmingDelete(false)}, [])
    useEffect(() => {confirmOff()}, [selectedModelIds, confirmOff])
    const handleDeleteSelectedModels = useCallback(() => {
        onDeleteModels && onDeleteModels(selectedModelIds)
        confirmOff()
    }, [onDeleteModels, selectedModelIds, confirmOff])

    const handleViewSelectedModels = useCallback(() => {
        onViewModels && onViewModels(selectedModelIds)
    }, [onViewModels, selectedModelIds])

    return (
        <div>
            {
                selectedModelIds.length > 0 && onDeleteModels && (
                    confirmingDelete ? (
                        <span>Confirm delete {selectedModelIds.length} models? <button onClick={handleDeleteSelectedModels}>Delete</button> <button onClick={confirmOff}>Cancel</button></span>
                    ) : (
                        <Button onClick={confirmOn}>Delete selected models</Button>
                    )
                )
            }
            {
                selectedModelIds.length > 0 && onViewModels && (
                    <Button onClick={handleViewSelectedModels}>View selected models</Button>
                )
            }
            <NiceTable
                rows={rows}
                columns={columns}
                deleteRowLabel={"Remove this model"}
                // onDeleteRow={onDeleteModels ? handleDeleteRow : undefined}
                selectedRowKeys={selectedModelIds}
                onSelectedRowKeysChanged={setSelectedModelIds}
                selectionMode={"multiple"}
            />
        </div>
    );



    // const columns = useMemo(() => ([
    //     {
    //         key: 'label',
    //         label: 'Model'
    //     }
    // ]), [])

    // const rows = useMemo(() => (models.map(x => {
    //     return {
    //         key: x.modelId,
    //         columnValues: {
    //             label: {
    //                 text: x.label,
    //                 element: <Hyperlink onClick={onModelSelected ? (() => {onModelSelected(x.modelId)}) : undefined}>{x.label}</Hyperlink>
    //             }
    //         }
    //     }
    // })), [models, onModelSelected])

    // const handleDeleteRow = useCallback((modelId: string) => {
    //     onDeleteModels && onDeleteModels([modelId])
    // }, [onDeleteModels])

    

    // return (
    //     <div>
    //         <NiceTable
    //             rows={rows}
    //             columns={columns}
    //             deleteRowLabel={"Remove this model"}
    //             onDeleteRow={onDeleteModels ? handleDeleteRow : undefined}
    //         />
    //     </div>
    // );
}

export default ModelsTable