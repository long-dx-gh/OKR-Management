/**
 * OKR Network Map Component
 * Visualization component using D3.js for interactive OKR mapping
 */

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useResponsive } from '../../hooks/useMediaQuery'
import type { OKRNode, OKREdge, VisualizationSettings } from '../../types'

interface OKRNetworkMapProps {
  nodes: OKRNode[]
  edges: OKREdge[]
  settings: VisualizationSettings
  onNodeClick?: (node: OKRNode) => void
  onNodeHover?: (node: OKRNode | null) => void
  selectedNodeId?: string | null
  className?: string
}

export const OKRNetworkMap: React.FC<OKRNetworkMapProps> = ({
  nodes,
  edges,
  settings,
  onNodeClick,
  onNodeHover,
  selectedNodeId,
  className = '',
}) => {
  const { isMobile } = useResponsive()
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null)
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity) // Save transform state
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 })

  // Zoom control functions with smooth transitions
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomRef.current) return
    d3.select(svgRef.current)
      .transition()
      .duration(350)
      .ease(d3.easeCubicOut) // Smooth easing
      .call(zoomRef.current.scaleBy as any, 1.3)
      .on('end', () => {
        // Save transform after animation
        if (gRef.current) {
          const transform = d3.zoomTransform(svgRef.current!)
          transformRef.current = transform
        }
      })
  }

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomRef.current) return
    d3.select(svgRef.current)
      .transition()
      .duration(350)
      .ease(d3.easeCubicOut) // Smooth easing
      .call(zoomRef.current.scaleBy as any, 0.7)
      .on('end', () => {
        // Save transform after animation
        if (gRef.current) {
          const transform = d3.zoomTransform(svgRef.current!)
          transformRef.current = transform
        }
      })
  }

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomRef.current) return
    d3.select(svgRef.current)
      .transition()
      .duration(600)
      .ease(d3.easeCubicInOut) // Smooth easing for reset
      .call(zoomRef.current.transform as any, d3.zoomIdentity)
      .on('end', () => {
        // Save reset transform
        transformRef.current = d3.zoomIdentity
      })
  }

  // Update dimensions on resize
  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      const { width, height } = containerRef.current!.getBoundingClientRect()
      setDimensions({ width, height })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Zoom in: Ctrl/Cmd + Plus or Ctrl/Cmd + =
      if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '=')) {
        event.preventDefault()
        handleZoomIn()
      }
      // Zoom out: Ctrl/Cmd + Minus
      else if ((event.ctrlKey || event.metaKey) && event.key === '-') {
        event.preventDefault()
        handleZoomOut()
      }
      // Reset: Ctrl/Cmd + 0
      else if ((event.ctrlKey || event.metaKey) && event.key === '0') {
        event.preventDefault()
        handleResetZoom()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Main D3 visualization effect
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return

    const svg = d3.select(svgRef.current)
    const { width, height } = dimensions

    // Clear previous content
    svg.selectAll('*').remove()

    // Create main group with zoom capability
    const g = svg.append('g')
    gRef.current = g

    // Add smooth zoom and pan behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4]) // Min and max zoom level
      .wheelDelta((event) => {
        // Smooth wheel zoom with custom delta
        return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002)
      })
      .filter((event) => {
        // Allow zoom/pan on wheel or when not dragging a node
        // This prevents conflict between pan and node drag
        if (event.type === 'wheel') return true
        if (event.type === 'mousedown' || event.type === 'touchstart') {
          // Only allow pan when clicking on background (SVG), not on nodes
          return event.target === svgRef.current
        }
        return !event.button // Allow all other events except right-click
      })
      // Enable touch gestures for mobile
      .touchable(() => true)
      .on('zoom', (event) => {
        // Apply transform smoothly - no transitions for responsive feel
        g.attr('transform', event.transform)
        // Save transform state so it persists across re-renders
        transformRef.current = event.transform
      })

    // Apply zoom behavior to SVG
    svg.call(zoom)
    zoomRef.current = zoom

    // Restore previous transform state (if any)
    if (transformRef.current && !transformRef.current.k.toString().includes('NaN')) {
      svg.call(zoom.transform as any, transformRef.current)
    }

    // Add arrow markers for edges
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#999')

    // Create links
    const link = g
      .append('g')
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke', (d) => d.style?.stroke || '#999')
      .attr('stroke-opacity', (d) => d.style?.opacity ?? 0.6)
      .attr('stroke-width', (d) => d.style?.strokeWidth || 2)
      .attr('stroke-dasharray', (d) => d.style?.strokeDasharray || 'none')
      .attr('marker-end', 'url(#arrowhead)')
      .style('transition', 'stroke-opacity 0.3s ease') // Smooth transition

    // Create node groups with improved drag
    const node = g
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'grab')
      .call(
        d3
          .drag<any, OKRNode>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended) as any
      )

    // Get node radius based on settings and device
    const getNodeRadius = (d: OKRNode) => {
      // On mobile, make nodes slightly larger for easier touch interaction
      const sizeMultiplier = isMobile ? 1.2 : 1
      const baseRadius = settings.nodeSize === 'small' ? 20 : settings.nodeSize === 'large' ? 40 : 30
      return (d.type === 'user' ? baseRadius * 0.8 : baseRadius) * sizeMultiplier
    }

    // Add circles to nodes
    node
      .append('circle')
      .attr('r', getNodeRadius)
      .attr('fill', (d) => {
        // KR nodes luôn là màu #1f5799
        if (d.type === 'keyResult') {
          return '#1f5799' // màu xanh dương đậm
        }
        // Objectives và Users giữ nguyên logic
        if (settings.colorScheme === 'status' && d.data.status) {
          return d.style?.backgroundColor || '#6B7280'
        } else if (settings.colorScheme === 'progress' && d.data.progress !== undefined) {
          return getProgressColor(d.data.progress)
        }
        return d.style?.backgroundColor || '#6B7280'
      })
      .attr('stroke', (d) => (d.id === selectedNodeId ? '#1E40AF' : d.style?.borderColor || '#fff'))
      .attr('stroke-width', (d) => (d.id === selectedNodeId ? 4 : 2))
      .attr('class', (d) => `node-${d.type}`)
      .style('filter', (d) => (d.id === selectedNodeId ? 'drop-shadow(0 0 8px rgba(30, 64, 175, 0.6))' : 'none'))
      .style('opacity', (d) => d.style?.opacity ?? 1) // Apply filter opacity
      .style('transition', 'opacity 0.3s ease') // Smooth opacity transition

    // Add selection ring for selected node
    node
      .filter((d) => d.id === selectedNodeId)
      .append('circle')
      .attr('r', (d) => getNodeRadius(d) + 8)
      .attr('fill', 'none')
      .attr('stroke', '#1E40AF')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.6)
      .append('animate')
      .attr('attributeName', 'stroke-dashoffset')
      .attr('from', '0')
      .attr('to', '20')
      .attr('dur', '2s')
      .attr('repeatCount', 'indefinite')

    // Add progress rings for objectives/key results
    if (settings.showProgress) {
      node
        .filter((d) => d.data.progress !== undefined)
        .append('circle')
        .attr('r', (d) => getNodeRadius(d) + 4)
        .attr('fill', 'none')
        .attr('stroke', '#10B981')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', (d) => {
          const radius = getNodeRadius(d) + 4
          const circumference = 2 * Math.PI * radius
          const progress = d.data.progress || 0
          const dashLength = (circumference * progress) / 100
          return `${dashLength} ${circumference - dashLength}`
        })
        .attr('stroke-linecap', 'round')
        .attr('transform', 'rotate(-90)')

      // Add progress text
      node
        .filter((d) => d.data.progress !== undefined)
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.3em')
        .attr('fill', 'white')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text((d) => `${d.data.progress}%`)
    }

    // Add labels
    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => getNodeRadius(d) + 15)
      .attr('font-size', '12px')
      .attr('fill', '#1f2937')
      .attr('font-weight', '500')
      .style('opacity', (d) => d.style?.opacity ?? 1)
      .style('transition', 'opacity 0.3s ease')
      .text((d) => {
        const maxLength = 20
        return d.label.length > maxLength ? d.label.substring(0, maxLength) + '...' : d.label
      })

    // Add owner labels if enabled
    if (settings.showOwners) {
      node
        .filter((d) => !!d.data.owner)
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', (d) => getNodeRadius(d) + 30)
        .attr('font-size', '10px')
        .attr('fill', '#6B7280')
        .text((d) => d.data.owner?.full_name || d.data.owner?.email || '')
    }

    // Add event listeners
    node
      .on('click', (event, d) => {
        event.stopPropagation()
        onNodeClick?.(d)
      })
      .on('mouseenter', (_event, d) => {
        onNodeHover?.(d)
        // Highlight connected edges
        link.attr('stroke-opacity', (e) =>
          e.source === d.id || e.target === d.id ? 1 : 0.2
        )
      })
      .on('mouseleave', () => {
        onNodeHover?.(null)
        link.attr('stroke-opacity', 0.6)
      })

    // Position nodes based on their position property
    node.attr('transform', (d) => {
      const x = d.position?.x ?? width / 2
      const y = d.position?.y ?? height / 2
      return `translate(${x},${y})`
    })

    // Position links
    link
      .attr('x1', (d) => {
        const sourceNode = nodes.find((n) => n.id === d.source)
        return sourceNode?.position?.x ?? width / 2
      })
      .attr('y1', (d) => {
        const sourceNode = nodes.find((n) => n.id === d.source)
        return sourceNode?.position?.y ?? height / 2
      })
      .attr('x2', (d) => {
        const targetNode = nodes.find((n) => n.id === d.target)
        return targetNode?.position?.x ?? width / 2
      })
      .attr('y2', (d) => {
        const targetNode = nodes.find((n) => n.id === d.target)
        return targetNode?.position?.y ?? height / 2
      })

    // Add smooth animations only when layout changes (not on every render)
    if (settings.enableAnimations) {
      node
        .transition()
        .duration(750)
        .ease(d3.easeCubicInOut) // Smooth easing
        .attr('transform', (d) => {
          const x = d.position?.x ?? width / 2
          const y = d.position?.y ?? height / 2
          return `translate(${x},${y})`
        })

      link
        .transition()
        .duration(750)
        .ease(d3.easeCubicInOut) // Smooth easing
        .attr('x1', (d) => {
          const sourceNode = nodes.find((n) => n.id === d.source)
          return sourceNode?.position?.x ?? width / 2
        })
        .attr('y1', (d) => {
          const sourceNode = nodes.find((n) => n.id === d.source)
          return sourceNode?.position?.y ?? height / 2
        })
        .attr('x2', (d) => {
          const targetNode = nodes.find((n) => n.id === d.target)
          return targetNode?.position?.x ?? width / 2
        })
        .attr('y2', (d) => {
          const targetNode = nodes.find((n) => n.id === d.target)
          return targetNode?.position?.y ?? height / 2
        })
    }

    // Drag functions with smooth transitions and visual feedback
    function dragstarted(event: any) {
      // Raise the node being dragged
      d3.select(event.sourceEvent.target.parentNode).raise()
      
      // Change cursor to grabbing
      d3.select(event.sourceEvent.target.parentNode).attr('cursor', 'grabbing')
      
      // Add visual feedback - slightly enlarge the stroke
      d3.select(event.sourceEvent.target)
        .transition()
        .duration(100)
        .attr('stroke-width', 4)
    }

    function dragged(event: any, d: OKRNode) {
      const g = d3.select(event.sourceEvent.target.parentNode)
      
      // Smooth transform update - instant response, no lag
      g.attr('transform', `translate(${event.x},${event.y})`)

      // Update connected edges smoothly in real-time
      link
        .filter((e) => e.source === d.id)
        .attr('x1', event.x)
        .attr('y1', event.y)

      link
        .filter((e) => e.target === d.id)
        .attr('x2', event.x)
        .attr('y2', event.y)

      // Update node position data
      d.position = { x: event.x, y: event.y }
    }

    function dragended(event: any, d: OKRNode) {
      // Store final position
      d.position = { x: event.x, y: event.y }
      
      // Reset cursor
      d3.select(event.sourceEvent.target.parentNode).attr('cursor', 'grab')
      
      // Reset visual feedback
      d3.select(event.sourceEvent.target)
        .transition()
        .duration(100)
        .attr('stroke-width', (node: any) => (node.id === selectedNodeId ? 4 : 2))
    }

    // Reset zoom on double click with smooth transition
    svg.on('dblclick.zoom', null) // Disable default double-click zoom
    svg.on('dblclick', () => {
      svg
        .transition()
        .duration(600)
        .ease(d3.easeCubicInOut)
        .call(zoom.transform as any, d3.zoomIdentity)
        .on('end', () => {
          // Save reset transform
          transformRef.current = d3.zoomIdentity
        })
    })

    // Cleanup
    return () => {
      svg.on('.zoom', null)
      svg.on('dblclick', null)
    }

  }, [nodes, edges, dimensions, settings, selectedNodeId, onNodeClick, onNodeHover])

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      {/* Zoom Controls - Desktop Only */}
      {!isMobile && (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2 border border-gray-200">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-blue-50 rounded transition-colors group relative"
            title="Zoom In"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-700 group-hover:text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Phóng to (Ctrl/⌘ +)
            </span>
          </button>
          
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-blue-50 rounded transition-colors group relative"
            title="Zoom Out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-700 group-hover:text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
            <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Thu nhỏ (Ctrl/⌘ -)
            </span>
          </button>

          <div className="border-t border-gray-200 my-1"></div>

          <button
            onClick={handleResetZoom}
            className="p-2 hover:bg-green-50 rounded transition-colors group relative"
            title="Reset View"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-700 group-hover:text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
            <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Đặt lại (Ctrl/⌘ 0)
            </span>
          </button>
        </div>
      )}

      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="bg-gray-50 rounded-lg cursor-grab active:cursor-grabbing"
        style={isMobile ? { touchAction: 'none' } : undefined}
      />
    </div>
  )
}

// Helper function
function getProgressColor(progress: number): string {
  if (progress >= 75) return '#10B981'
  if (progress >= 50) return '#3B82F6'
  if (progress >= 25) return '#F59E0B'
  return '#EF4444'
}
