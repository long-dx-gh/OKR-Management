/**
 * SimplePieChart Component
 * Lightweight pie/donut chart using pure SVG
 * V1 Feature #2: Analytics Dashboard
 */

interface DataPoint {
  label: string
  value: number
  color: string
}

interface SimplePieChartProps {
  data: DataPoint[]
  size?: number
  donut?: boolean
  showLegend?: boolean
}

export default function SimplePieChart({
  data,
  size = 200,
  donut = true,
  showLegend = true,
}: SimplePieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-lg"
        style={{ width: size, height: size }}
      >
        <p className="text-sm text-gray-400">No data</p>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-lg"
        style={{ width: size, height: size }}
      >
        <p className="text-sm text-gray-400">No data</p>
      </div>
    )
  }

  const center = size / 2
  const radius = size / 2 - 10
  const innerRadius = donut ? radius * 0.6 : 0

  // Calculate pie slices
  let currentAngle = -90 // Start from top
  const slices = data.map((item) => {
    const percentage = (item.value / total) * 100
    const angle = (item.value / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle

    currentAngle = endAngle

    // Calculate path
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = center + radius * Math.cos(startRad)
    const y1 = center + radius * Math.sin(startRad)
    const x2 = center + radius * Math.cos(endRad)
    const y2 = center + radius * Math.sin(endRad)

    const largeArcFlag = angle > 180 ? 1 : 0

    let path: string
    if (donut) {
      const innerX1 = center + innerRadius * Math.cos(startRad)
      const innerY1 = center + innerRadius * Math.sin(startRad)
      const innerX2 = center + innerRadius * Math.cos(endRad)
      const innerY2 = center + innerRadius * Math.sin(endRad)

      path = `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        L ${innerX2} ${innerY2}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}
        Z
      `
    } else {
      path = `
        M ${center} ${center}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        Z
      `
    }

    return {
      ...item,
      path,
      percentage: percentage.toFixed(1),
    }
  })

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Chart */}
      <svg width={size} height={size} className="transform hover:scale-105 transition-transform">
        {slices.map((slice, index) => (
          <g key={index}>
            <path
              d={slice.path}
              className={`${slice.color} hover:opacity-80 transition-opacity cursor-pointer`}
              stroke="white"
              strokeWidth="2"
            >
              <title>
                {slice.label}: {slice.value} ({slice.percentage}%)
              </title>
            </path>
          </g>
        ))}

        {/* Center text (for donut) */}
        {donut && (
          <g>
            <text
              x={center}
              y={center - 5}
              textAnchor="middle"
              className="text-2xl font-bold fill-gray-900"
            >
              {total}
            </text>
            <text
              x={center}
              y={center + 15}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              Total
            </text>
          </g>
        )}
      </svg>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-3 justify-center max-w-md">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm ${slice.color}`} />
              <span className="text-xs text-gray-700">
                {slice.label} ({slice.percentage}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
