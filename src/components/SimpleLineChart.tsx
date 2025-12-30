/**
 * SimpleLineChart Component
 * Lightweight line chart using pure SVG
 * V1 Feature #2: Analytics Dashboard
 */

interface DataPoint {
  label: string
  value: number
}

interface SimpleLineChartProps {
  data: DataPoint[]
  height?: number
  color?: string
  showDots?: boolean
  showGrid?: boolean
}

export default function SimpleLineChart({
  data,
  height = 200,
  color = 'stroke-indigo-500',
  showDots = true,
  showGrid = true,
}: SimpleLineChartProps) {
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

  const padding = 20
  const width = 100 // percentage
  const chartHeight = height - padding * 2
  const chartWidth = width - padding * 2

  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const minValue = Math.min(...data.map((d) => d.value), 0)
  const range = maxValue - minValue || 1

  // Generate path points
  const points = data.map((point, index) => {
    const x = padding + (chartWidth / (data.length - 1 || 1)) * index
    const y = padding + chartHeight - ((point.value - minValue) / range) * chartHeight
    return { x, y, value: point.value }
  })

  // Create SVG path
  const pathD = points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`
      return `L ${point.x} ${point.y}`
    })
    .join(' ')

  // Create area path (fill under line)
  const areaD = `${pathD} L ${points[points.length - 1].x} ${
    height - padding
  } L ${padding} ${height - padding} Z`

  return (
    <div className="w-full">
      {/* Chart */}
      <div className="relative" style={{ height }}>
        <svg className="w-full h-full" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
          {/* Grid Lines */}
          {showGrid && (
            <g className="opacity-20">
              {[0, 25, 50, 75, 100].map((percent) => {
                const y = padding + (chartHeight * percent) / 100
                return (
                  <line
                    key={percent}
                    x1={padding}
                    y1={y}
                    x2={width - padding}
                    y2={y}
                    className="stroke-gray-300"
                    strokeWidth="0.5"
                  />
                )
              })}
            </g>
          )}

          {/* Area Fill */}
          <path
            d={areaD}
            className={`${color.replace('stroke-', 'fill-')} opacity-10`}
          />

          {/* Line */}
          <path
            d={pathD}
            className={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots */}
          {showDots &&
            points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="3"
                  className={`${color.replace('stroke-', 'fill-')} stroke-white`}
                  strokeWidth="2"
                />
                {/* Hover area */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="8"
                  className="fill-transparent hover:fill-indigo-100 transition-colors cursor-pointer"
                >
                  <title>{`${data[index].label}: ${point.value}`}</title>
                </circle>
              </g>
            ))}
        </svg>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-2 px-5">
        {data.length <= 7
          ? data.map((item, index) => (
              <div key={index} className="text-xs text-gray-600 text-center">
                {item.label}
              </div>
            ))
          : // Show only first, middle, and last labels for many data points
            [
              <div key="first" className="text-xs text-gray-600">
                {data[0].label}
              </div>,
              <div key="middle" className="text-xs text-gray-600">
                {data[Math.floor(data.length / 2)].label}
              </div>,
              <div key="last" className="text-xs text-gray-600">
                {data[data.length - 1].label}
              </div>,
            ]}
      </div>
    </div>
  )
}
