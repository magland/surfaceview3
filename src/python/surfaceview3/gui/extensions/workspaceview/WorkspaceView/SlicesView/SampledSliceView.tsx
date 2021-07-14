import CanvasWidget from 'labbox-react/components/CanvasWidget';
import { useLayer, useLayers } from 'labbox-react/components/CanvasWidget/CanvasWidgetLayer';
import React, { FunctionComponent } from 'react';
import { createMainLayer, MainLayerProps, SampledSlice } from './mainLayer';

type Props = {
    width: number
    height: number
    sampledSlice: SampledSlice | undefined
    valueRange: {min: number, max: number}
}

const SampledSliceView: FunctionComponent<Props> = ({width, height, sampledSlice, valueRange}) => {
    const mainLayerProps: MainLayerProps = {
        width: Math.floor(width),
        height: Math.floor(height),
        sampledSlice: sampledSlice,
        valueRange: valueRange,
    }
    const mainLayer = useLayer(createMainLayer, mainLayerProps)
    const layers = useLayers([mainLayer])

    // console.log('--- sampled slice view', sampledSlice?.slice)
    // console.log(JSON.stringify(sampledSlice?.slice))

    return (
        <CanvasWidget
            layers={layers}
            width={Math.floor(width)}
            height={Math.floor(height)}
        />
    )
}

export default SampledSliceView