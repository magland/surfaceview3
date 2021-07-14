import Hyperlink from 'labbox-react/components/Hyperlink/Hyperlink'
import NiceTable from 'labbox-react/components/NiceTable/NiceTable'
import React, { FunctionComponent, useMemo } from 'react'
import { ModelInfo } from './useModelInfo'

type Props = {
    modelInfo: ModelInfo
    onSurfaceClicked?: (surfaceName: string) => void
    selectedSurfaceNames?: string[]
    onSelectedSurfacesChanged?: (surfaceNames: string[]) => void
}

const ModelSurfaceTable: FunctionComponent<Props> = ({modelInfo, onSurfaceClicked, selectedSurfaceNames, onSelectedSurfacesChanged}) => {
    const surfaceNames = useMemo(() => {
        const ret = Object.keys(modelInfo.surfaces).sort()
        ret.sort()
        return ret
    }, [modelInfo.surfaces])

    const columns = useMemo(() => ([
        {
            key: 'surfaceName',
            label: 'Surface'
        },
        {
            key: 'numVertices',
            label: 'Num. vertices'
        },
        {
            key: 'numFaces',
            label: 'Num. faces'
        }
    ]), [])

    const rows = useMemo(() => (
        surfaceNames.map(surfaceName => {
            const t = modelInfo.surfaces[surfaceName]
            return {
                key: surfaceName,
                columnValues: {
                    surfaceName: {
                        text: surfaceName,
                        element: <Hyperlink onClick={onSurfaceClicked && (() => {onSurfaceClicked(surfaceName)})}>{surfaceName}</Hyperlink>
                    },
                    numVertices: t.numVertices,
                    numFaces: t.numFaces
                }
            }
        })
    ), [surfaceNames, onSurfaceClicked, modelInfo.surfaces])

    return (
        <NiceTable
            columns={columns}
            rows={rows}
            selectedRowKeys={selectedSurfaceNames}
            onSelectedRowKeysChanged={onSelectedSurfacesChanged}
            selectionMode={onSelectedSurfacesChanged ? 'multiple' : 'none'}
        />
    )
}

export default ModelSurfaceTable