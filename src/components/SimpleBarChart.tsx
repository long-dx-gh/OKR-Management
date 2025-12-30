/**
 * SimpleBarChart Component
 * Lightweight bar chart using pure SVG
 * V1 Feature #2: Analytics Dashboard
 */

interface DataPoint {
  label: string
  value: number
  color?: string
}

interface SimpleBarChartProps {
  data: DataPoint[]
  height?: number
  showValues?: boolean
  maxValue?: number
}

export default function SimpleBarChart({
  data,
  height = 200,
  showValues = true,
  maxValue,
}: SimpleBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-lg"
        style={{ height }}
      >
        <p className="text-sm text-gray-400">No data available</p>
      </div>
    )
  }

  const max = maxValue || Math.max(...data.map((d) => d.value), 1)
  const barWidth = `${90 / data.length}%`
  const gap = `${10 / (data.length + 1)}%`

  return (
    <div className="w-full">
      {/* Chart */}
      <div className="relative" style={{ height }}>
        <svg className="w-full h-full">
          {data.map((item, index) => {
            const barHeight = (item.value / max) * (height - 30)
            const x = `${(100 / data.length) * index + parseFloat(gap)}%`
            const y = height - barHeight - 20

            return (
              <g key={index}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  className={`${
                    item.color || 'fill-indigo-500'
                  } hover:opacity-80 transition-opacity`}
                  rx="4"
                />

                {/* Value Label */}
                {showValues && item.value > 0 && (
                  <text
                    x={`calc(${x} + ${barWidth} / 2)`}
                    y={y - 5}
                    textAnchor="middle"
                    className="text-xs fill-gray-600 font-medium"
                  >
                    {item.value}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Labels */}
      <div className="flex justify-around mt-2">
        {data.map((item, index) => (
          <div key={index} className="text-xs text-gray-600 text-center truncate">
            {item.label}
          </div>
        ))}
      </div>
    </div>
  )
}
