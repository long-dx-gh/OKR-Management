/**
 * Range Slider Component
 * A dual-thumb slider for selecting a range of values
 */

import React, { useEffect, useRef } from 'react'

interface RangeSliderProps {
  min?: number
  max?: number
  step?: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  label?: string
  showValues?: boolean
  unit?: string
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  label,
  showValues = true,
  unit = '%',
}) => {
  const [minVal, maxVal] = value
  const minValRef = useRef<number>(minVal)
  const maxValRef = useRef<number>(maxVal)
  const range = useRef<HTMLDivElement>(null)

  // Convert to percentage
  const getPercent = (value: number) =>
    Math.round(((value - min) / (max - min)) * 100)

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal)
    const maxPercent = getPercent(maxValRef.current)

    if (range.current) {
      range.current.style.left = `${minPercent}%`
      range.current.style.width = `${maxPercent - minPercent}%`
    }
  }, [minVal, max, min])

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current)
    const maxPercent = getPercent(maxVal)

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`
    }
  }, [maxVal, max, min])

  return (
    <div className="w-full">
      {label && (
        <label className="text-xs font-medium text-gray-700 mb-2 block">
          {label}
        </label>
      )}
      
      {showValues && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={minVal}
              onChange={(e) => {
                const val = Math.min(Number(e.target.value), maxVal - step)
                onChange([val, maxVal])
              }}
              min={min}
              max={max}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-xs text-gray-500">{unit}</span>
          </div>
          <span className="text-xs text-gray-400">-</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={maxVal}
              onChange={(e) => {
                const val = Math.max(Number(e.target.value), minVal + step)
                onChange([minVal, val])
              }}
              min={min}
              max={max}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-xs text-gray-500">{unit}</span>
          </div>
        </div>
      )}

      <div className="relative">
        {/* Track */}
        <div className="relative h-2 rounded-full bg-gray-200">
          {/* Range highlight */}
          <div
            ref={range}
            className="absolute h-full rounded-full bg-blue-500"
          />
        </div>

        {/* Min Thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={(e) => {
            const val = Math.min(Number(e.target.value), maxVal - step)
            onChange([val, maxVal])
            minValRef.current = val
          }}
          className="absolute w-full h-2 top-0 appearance-none pointer-events-none bg-transparent z-10
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-blue-500
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-blue-500
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:transition-all
            [&::-moz-range-thumb]:hover:scale-110"
          style={{ zIndex: minVal > max - 100 / 2 ? 5 : 3 }}
        />

        {/* Max Thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={(e) => {
            const val = Math.max(Number(e.target.value), minVal + step)
            onChange([minVal, val])
            maxValRef.current = val
          }}
          className="absolute w-full h-2 top-0 appearance-none pointer-events-none bg-transparent z-[4]
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-blue-500
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-blue-500
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:transition-all
            [&::-moz-range-thumb]:hover:scale-110"
        />
      </div>
    </div>
  )
}
