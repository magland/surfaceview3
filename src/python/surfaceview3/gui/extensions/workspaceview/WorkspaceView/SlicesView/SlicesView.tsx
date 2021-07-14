import { FetchCache } from 'kachery-react/useFetchCache'
import React, { FunctionComponent, useMemo, useState } from 'react'
import BrightnessSlider from './BrightnessSlider'
import { AffineTransformation3D, SampledSlice } from './mainLayer'
import SampledSliceView from './SampledSliceView'
import SliceSlider from './SliceSlider'

export type SliceDataQuery = {
    type: 'getSliceData'
    sliceIndex: number
}

type Props = {
    nx: number
    ny: number
    numSlices: number
    affineTransformation: AffineTransformation3D
    width: number
    height: number
    sliceData: FetchCache<SliceDataQuery>
    valueRange: {min: number, max: number}
    currentSliceIndex: number | undefined
    onCurrentSliceChanged: (index: number) => void
}

const SlicesView: FunctionComponent<Props> = ({nx, ny, numSlices, affineTransformation, width, height, sliceData, valueRange, currentSliceIndex, onCurrentSliceChanged}) => {
    const [brightness, setBrightness] = useState<number>(50)

    const defaultSliceIndex = numSlices ? Math.floor(numSlices / 2) : 0

    const valueRangeAdjusted = useMemo(() => {
        const factor = Math.exp((brightness - 50) / 50 * 4) * 30
        return {
            min: valueRange.min / factor,
            max: valueRange.max / factor
        }
    }, [valueRange, brightness])


    const sliceIndex = currentSliceIndex ?? defaultSliceIndex
    const d: number[][] | undefined = sliceData.get({
        type: 'getSliceData',
        sliceIndex
    })
    const A = affineTransformation
    const sliceAffineTransformation = [
        [A[0][0], A[0][1], A[0][2], A[0][3] + sliceIndex * A[0][2]],
        [A[1][0], A[1][1], A[1][2], A[1][3] + sliceIndex * A[1][2]],
        [A[2][0], A[2][1], A[2][2], A[2][3] + sliceIndex * A[2][2]]
    ] as any as AffineTransformation3D
    const currentSliceData: SampledSlice | undefined = d ? {
        data: d,
        slice: {
            nx,
            ny,
            transformation: sliceAffineTransformation
        } 
    } : undefined

    return (
        <div style={{margin: 30}}>
            <SampledSliceView
                width={width}
                height={300}
                sampledSlice={currentSliceData}
                valueRange={valueRangeAdjusted}
            />
            <SliceSlider
                width={width}
                numSlices={numSlices}
                currentSlice={currentSliceIndex ?? defaultSliceIndex}
                onCurrentSliceChanged={onCurrentSliceChanged}
            />
            <BrightnessSlider
                width={width}
                brightness={brightness}
                onBrightnessChanged={setBrightness}
            />
            <div>
                <pre>
                    {numSlices} slices ({nx} x {ny})<br />
                    Current slice index: {currentSliceIndex || defaultSliceIndex}<br />
                </pre>
            </div>
        </div>
    )
}

export default SlicesView