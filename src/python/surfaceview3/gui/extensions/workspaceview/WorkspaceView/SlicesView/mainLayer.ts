import { CanvasPainter } from "labbox-react/components/CanvasWidget/CanvasPainter"
import { CanvasWidgetLayer, ClickEvent, DiscreteMouseEventHandler } from "labbox-react/components/CanvasWidget/CanvasWidgetLayer"

// import { inv, matrix, Matrix, multiply } from 'mathjs'
export type Point3 = [number, number, number]
export type Vector3 = [number, number, number]
export type Vector4 = [number, number, number, number]
export type AffineTransformation3D = [Vector4, Vector4, Vector4]

export const identityAffineTransformation3D: AffineTransformation3D = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0]
]

export type Slice = {
    transformation: AffineTransformation3D // includes thickness
    nx: number
    ny: number
}

export type SliceInfo = {
    plane: 'XY' | 'XZ' | 'YZ'
    sliceIndex: number
    minValue: number
    maxValue: number
}

export type SampledSlice = {
    slice: Slice
    data: number[][]
}

export type MainLayerProps = {
    width: number
    height: number
    sampledSlice: SampledSlice | undefined
    valueRange: {min: number, max: number}
}

type LayerState = {

}
const initialLayerState = {}

const handleClick: DiscreteMouseEventHandler = (event: ClickEvent, layer: CanvasWidgetLayer<MainLayerProps, LayerState>) => {
    // if (event.mouseButton)
}

export const createMainLayer = () => {
    const onPaint = (painter: CanvasPainter, props: MainLayerProps, state: LayerState) => {
        const { sampledSlice, valueRange, width, height } = props
        if (!sampledSlice) return

        const n1 = sampledSlice.slice.nx
        const n2 = sampledSlice.slice.ny

        const pixelSize = Math.min(width / n1, height/n2)

        painter.wipe()
        if (!sampledSlice) return
        if (sampledSlice.data.length !== n1) return
        if (sampledSlice.data[0].length !== n2) return
        const imageData = painter.createImageData(width, height)
        for (let i1 = 0; i1 < width; i1 ++) {
            const x0 = Math.round(i1 / pixelSize)
            if ((0 <= x0) && (x0 < n1)) {
                for (let i2 = 0; i2 < height; i2 ++) {
                    const y0 = Math.round(i2 / pixelSize)
                    if ((0 <= y0) && (y0 < n2)) {
                        
                        const v = sampledSlice.data[x0][y0]
                        const v2 = (v - valueRange.min) / (valueRange.max - valueRange.min)
                        const ii = 4 * (i1 + width * i2)
                        const rgba = valToRgba(v2)
                        imageData.data[ii + 0] = rgba[0]
                        imageData.data[ii + 1] = rgba[1]
                        imageData.data[ii + 2] = rgba[2]
                        imageData.data[ii + 3] = rgba[3]
                    }
                }
            }
        }
        painter.putImageData(imageData, 0, 0)
    }
    const onPropsChange = (layer: CanvasWidgetLayer<MainLayerProps, LayerState>, props: MainLayerProps) => {
        layer.scheduleRepaint()
    }
    return new CanvasWidgetLayer<MainLayerProps, LayerState>(
        onPaint,
        onPropsChange,
        initialLayerState,
        {
            discreteMouseEventHandlers: [handleClick],
            dragHandlers: []
        }
    )
}

const valToRgba = (v: number) => {
    if (v <= 0) v = 0
    if (v >= 1) v = 1
    const x = Math.floor(v * 255.999)
    return [x, x, x, 255]
}

// const valToColor = (v: number) => {
//     if (v <= 0) return 'black'
//     if (v >= 1) return 'white'
//     const x = Math.floor(v * 255)
//     return `rgb(${x}, ${x}, ${x})`
// }