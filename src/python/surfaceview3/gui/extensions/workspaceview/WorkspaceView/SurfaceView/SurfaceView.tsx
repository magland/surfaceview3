import Splitter from 'labbox-react/components/Splitter/Splitter';
import React, { useState } from 'react'
import { FunctionComponent } from "react"
import { Slice } from '../SlicesView/mainLayer';
import Controls, { SurfaceViewOptions } from './Controls';
import SurfaceWidget from './SurfaceWidget';

export type SurfaceData = {
    vertices: [number, number, number][]
    ifaces: number[]
    faces: number[]
}

type Props = {
    surfaceData: SurfaceData
    currentSlice?: Slice
    width: number
    height: number
}

const SurfaceView: FunctionComponent<Props> = ({surfaceData, currentSlice, width, height}) => {
    const [options, setOptions] = useState<SurfaceViewOptions>({showWireframe: true, showMesh: true})
    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={200}
        >
            <Controls options={options} setOptions={setOptions} />
            <SurfaceWidget surfaceData={surfaceData} width={0} height={0} options={options} currentSlice={currentSlice} />
        </Splitter>
    )
}

export default SurfaceView