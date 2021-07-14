import Slider from '@material-ui/core/Slider';
import React, { FunctionComponent, useCallback } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

function valuetext(value: number) {
  return `Slice ${value}`;
}

type Props = {
  width: number
  numSlices: number
  currentSlice: number
  onCurrentSliceChanged: (x: number) => void
}

const SliceSlider: FunctionComponent<Props> = ({ width, numSlices, currentSlice, onCurrentSliceChanged }) => {

  const [internalValue, setInternalValue] = useState(currentSlice)

  useEffect(() => {
    let canceled = false
    setTimeout(() => {
      if (canceled) return
      onCurrentSliceChanged(internalValue)
    }, 300)
    return () => {
      canceled = true
    }
  }, [internalValue, onCurrentSliceChanged])

  useEffect(() => {
    setInternalValue(currentSlice)
  }, [currentSlice])

  const handleChange = useCallback(
    (event: React.ChangeEvent<{}>, value: number | number[]) => {
      setInternalValue(value as any as number)
    },
    []
  )

  return (
    <div style={{ width }}>
      <Slider
        value={internalValue}
        onChange={handleChange}
        getAriaValueText={valuetext}
        valueLabelDisplay="auto"
        step={1}
        marks
        min={0}
        max={numSlices - 1}
      />
    </div>
  );
}

export default SliceSlider