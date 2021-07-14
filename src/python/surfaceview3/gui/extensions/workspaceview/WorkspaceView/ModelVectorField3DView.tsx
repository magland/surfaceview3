import { KacheryNode } from 'kachery-js';
import { channelName } from 'kachery-js/types/kacheryTypes';
import { useFetchCache, useKacheryNode } from 'kachery-react';
import TaskStatusView from 'kachery-react/components/TaskMonitor/TaskStatusView';
import initiateTask from 'kachery-react/initiateTask';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { WorkspaceModel } from '../../../pluginInterface/workspaceReducer';
import { WorkspaceViewProps } from '../../../pluginInterface/WorkspaceViewPlugin';
import ComponentSelector from './ComponentSelector';
import PlaneSelector from './PlaneSelector';
import RealImagSelector from './RealImagSelector';
import { SliceSelection, SliceSelectionDispatch } from './sliceSelection';
import { AffineTransformation3D, identityAffineTransformation3D } from './SlicesView/mainLayer';
import SlicesView, { SliceDataQuery } from './SlicesView/SlicesView';
import useModelInfo from './useModelInfo';

type Props = WorkspaceViewProps & {
  modelId: string
  vectorField3DName: string
  sliceSelection: SliceSelection
  sliceSelectionDispatch: SliceSelectionDispatch
}

export interface LocationInterface {
  pathname: string
  search: string
}

export interface HistoryInterface {
  location: LocationInterface
  push: (x: LocationInterface) => void
}

export type VectorField3DData = {
  dim: number
  xgrid: number[]
  ygrid: number[]
  zgrid: number[]
  // values: number[][][][][] // real/imag x component x nx x ny x nz
}

const getSliceData = async (args: {kacheryNode: KacheryNode | undefined, vectorField3DUri: string | undefined, plane: 'XY' | 'XZ' | 'YZ', sliceIndex: number}): Promise<{values: number[][][][]} | undefined> => {
  const { kacheryNode, vectorField3DUri, plane, sliceIndex } = args
  if (!kacheryNode) return undefined
  if (!vectorField3DUri) return undefined
  return new Promise((resolve, reject) => {
    const task = initiateTask<{values: number[][][][]}>({
      kacheryNode,
      channelName: channelName('ccm'),
      functionId: 'get_vector_field_3d_slice_data.3',
      kwargs: {
        vector_field_3d_uri: vectorField3DUri,
        plane,
        slice_index: sliceIndex
      },
      functionType: 'pure-calculation',
      onStatusChanged: () => {
        check()
      }
    })
    if (!task) {
      reject('Unable to create get_vector_field_3d_slice_data task')
      return
    }
    const check = () => {
      if (task.status === 'finished') {
        const result = task.result
        if (result) resolve(result)
        else reject(new Error('No result even though status is finished'))
      }
      else if (task.status === 'error') {
        reject(task.errorMessage)
      }
    }
    check()
  })
}

const ModelVectorField3DView: FunctionComponent<Props> = ({ modelId, vectorField3DName, workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, width=500, height=500, sliceSelection, sliceSelectionDispatch }) => {
  const model = useMemo((): WorkspaceModel | undefined => (
    workspace.models.filter(x => (x.modelId === modelId))[0]
  ), [workspace, modelId])
  const {modelInfo, task: modelInfoTask} = useModelInfo(model?.uri)
  const vfInfo = modelInfo?.vectorfield3ds[vectorField3DName]
  const uri = vfInfo?.uri
  const kacheryNode = useKacheryNode()

  const componentChoices = useMemo(() => (
    vfInfo ? [...Array(vfInfo.dim).keys()] : undefined
  ), [vfInfo])

  const [realImagIndex, setRealImagIndex] = useState<number>(0)

  const currentPlane = sliceSelection.plane
  const currentComponent = sliceSelection.component
  const currentSliceIndex = sliceSelection.sliceIndex
  const setCurrentSliceIndex = useCallback((sliceIndex: number | undefined) => {
      sliceSelectionDispatch({type: 'setSliceIndex', sliceIndex})
    }, [sliceSelectionDispatch])
  const setCurrentComponent = useCallback((component: number | undefined) => {
    sliceSelectionDispatch({type: 'setComponent', component})
  }, [sliceSelectionDispatch])
  const setCurrentPlane = useCallback((plane: 'XY' | 'XZ' | 'YZ') => {
    sliceSelectionDispatch({type: 'setPlane', plane})
  }, [sliceSelectionDispatch])
  useEffect(() => {
    sliceSelectionDispatch({type: 'setVectorField3DInfo', info: vfInfo})
  }, [vfInfo, sliceSelectionDispatch])

  const fetch = useMemo(() => (async (query: SliceDataQuery) => {
    switch(query.type) {
      case 'getSliceData': {
        const d = await getSliceData({kacheryNode, vectorField3DUri: uri, plane: currentPlane, sliceIndex: query.sliceIndex})
        if (!d) return undefined
        if (currentComponent === undefined) return
        const nx = d.values[0][0].length
        const ny = d.values[0][0][0].length
        const ret: number[][] = []
        for (let ix = 0; ix < nx; ix++) {
          const A: number[] = []
          if (realImagIndex <= 1) {
            for (let iy = 0; iy < ny; iy++) {
              A.push(d.values[realImagIndex][currentComponent][ix][iy])
            }
          }
          else if (realImagIndex === 2) { // abs
            for (let iy = 0; iy < ny; iy++) {
              const re = d.values[0][currentComponent][ix][iy]
              const im = d.values[1][currentComponent][ix][iy]
              const abs = Math.sqrt(re * re + im * im)
              A.push(abs)
            }
          }
          ret.push(A)
        }
        return ret
      }
    }
    return undefined
  }), [kacheryNode, uri, currentPlane, currentComponent, realImagIndex])
  const sliceData = useFetchCache<SliceDataQuery>(fetch)

  const {nx, ny, numSlices, affineTransformation} = useMemo(() => {
    if (!vfInfo) return {nx: 0, ny: 0, numSlices: 0, affineTransformation: identityAffineTransformation3D}
    if (currentPlane === 'XY') {
      const affineTransformation = vfInfo.affineTransformation
      return {nx: vfInfo.nx, ny: vfInfo.ny, numSlices: vfInfo.nz, affineTransformation}
    }
    else if (currentPlane === 'XZ') {
      const affineTransformation = vfInfo.affineTransformation.map(row => ([row[0], row[2], row[1], row[3]])) as any as AffineTransformation3D
      return {nx: vfInfo.nx, ny: vfInfo.nz, numSlices: vfInfo.ny, affineTransformation}
    }
    else if (currentPlane === 'YZ') {
      const affineTransformation = vfInfo.affineTransformation.map(row => ([row[1], row[2], row[0], row[3]])) as any as AffineTransformation3D
      return {nx: vfInfo.ny, ny: vfInfo.nz, numSlices: vfInfo.nx, affineTransformation}
    }
    else throw Error('Unexpected plane.')
  }, [vfInfo, currentPlane])
  useEffect(() => {
    sliceSelectionDispatch({type: 'setSliceIndex', sliceIndex: undefined})
  }, [numSlices, sliceSelectionDispatch])

  // const realImagIndex = 0 // 0 for real, 1 for imag, 2 for abs
  if (!model) return <span>Model not found.</span>
  if (!vfInfo) return <span>Vector field info not found.</span>
  if (!modelInfo) {
    return <TaskStatusView task={modelInfoTask} label="get model info" />
  }
  return (
    <div>
      <h3>{vectorField3DName}</h3>
      <SlicesView
        numSlices={numSlices}
        nx={nx}
        ny={ny}
        affineTransformation={affineTransformation}
        width={300}
        height={300}
        valueRange={vfInfo.valueRange}
        sliceData={sliceData}
        currentSliceIndex={currentSliceIndex}
        onCurrentSliceChanged={setCurrentSliceIndex}
      />
      {
        componentChoices && (
          <ComponentSelector
            components={componentChoices}
            currentComponent={currentComponent}
            onCurrentComponentChanged={setCurrentComponent}
          />
        )
      }
      {
        <RealImagSelector
          realImagIndex={realImagIndex}
          onRealImagIndexChanged={setRealImagIndex}
        />
      }
      <PlaneSelector
        plane={currentPlane}
        onPlaneChanged={setCurrentPlane}
      />
    </div>
  )
}

export default ModelVectorField3DView