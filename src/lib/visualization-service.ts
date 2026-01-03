/**
 * OKR Visualization Service
 * Service để transform data từ database sang format cho visualization
 * Sử dụng Adapter Pattern để tích hợp với DB hiện tại mà không ảnh hưởng code cũ
 */

import { supabase } from './supabase'
import { fetchObjectives } from './okr-service'
import type {
  OKRNode,
  OKREdge,
  OKRVisualizationData,
  OKRVisualizationFilters,
  ObjectiveWithDetails,
  OKRRealtimeUpdate,
  OKRUpdateEventType,
  VisualizationLayout,
} from './types'

// ============================================
// ADAPTER: Transform DB Data to Visualization Format
// ============================================

/**
 * Transform objectives data sang nodes và edges cho visualization
 */
export function transformToVisualizationData(
  objectives: ObjectiveWithDetails[]
): OKRVisualizationData {
  const nodes: OKRNode[] = []
  const edges: OKREdge[] = []

  objectives.forEach((objective) => {
    // Tạo node cho objective
    const objectiveNode: OKRNode = {
      id: `obj-${objective.id}`,
      type: 'objective',
      label: objective.title,
      data: {
        title: objective.title,
        progress: objective.progress,
        status: objective.status,
        owner: objective.owner,
        due_date: objective.due_date,
        description: objective.description,
      },
      position: { x: 0, y: 0 }, // Will be calculated by layout algorithm
      style: {
        backgroundColor: getStatusColor(objective.status),
        borderColor: getStatusBorderColor(objective.status),
      },
    }
    nodes.push(objectiveNode)

    // Tạo nodes và edges cho key results
    if (objective.key_results) {
      objective.key_results.forEach((kr) => {
        // Calculate progress percentage from current value / target
        const safeProgress = kr.progress || 0
        const safeTarget = kr.target || 1
        const progressPercentage = Math.max(0, Math.min((safeProgress / safeTarget) * 100, 100))
        
        const krNode: OKRNode = {
          id: `kr-${kr.id}`,
          type: 'keyResult',
          label: kr.title,
          data: {
            title: kr.title,
            progress: Math.round(progressPercentage), // Store calculated percentage
            target: kr.target,
            unit: kr.unit,
            owner: kr.owner,
            due_date: kr.due_date,
          },
          position: { x: 0, y: 0 },
          style: {
            backgroundColor: getProgressColor(progressPercentage),
          },
        }
        nodes.push(krNode)

        // Tạo edge từ objective đến key result
        const edge: OKREdge = {
          id: `edge-${objective.id}-${kr.id}`,
          source: `obj-${objective.id}`,
          target: `kr-${kr.id}`,
          type: 'smoothstep',
          animated: progressPercentage < 100,
          style: {
            stroke: getProgressColor(progressPercentage),
            strokeWidth: 2,
          },
        }
        edges.push(edge)
      })
    }

    // Tạo owner node nếu có
    if (objective.owner) {
      const ownerNodeId = `user-${objective.owner.id}`
      
      // Check if owner node already exists
      if (!nodes.find((n) => n.id === ownerNodeId)) {
        const ownerNode: OKRNode = {
          id: ownerNodeId,
          type: 'user',
          label: objective.owner.full_name || objective.owner.email,
          data: {
            title: objective.owner.full_name || objective.owner.email,
          },
          position: { x: 0, y: 0 },
          style: {
            backgroundColor: '#8B5CF6',
            color: '#FFFFFF',
          },
        }
        nodes.push(ownerNode)
      }

      // Link owner to objective
      const ownerEdge: OKREdge = {
        id: `edge-${objective.owner.id}-${objective.id}`,
        source: ownerNodeId,
        target: `obj-${objective.id}`,
        type: 'default',
        label: 'owns',
        style: {
          stroke: '#8B5CF6',
          strokeDasharray: '5,5',
        },
      }
      edges.push(ownerEdge)
    }
  })

  return {
    nodes,
    edges,
    metadata: {
      total_nodes: nodes.length,
      total_edges: edges.length,
      last_updated: new Date().toISOString(),
    },
  }
}

/**
 * Apply filters to visualization data
 */
/**
 * Check if a node matches the given filters
 */
function nodeMatchesFilters(node: OKRNode, filters: OKRVisualizationFilters): boolean {
  // Filter by status (for objectives only)
  if (filters.status && filters.status.length > 0) {
    if (node.type === 'objective' && node.data.status) {
      if (!filters.status.includes(node.data.status)) {
        return false
      }
    }
  }

  // Filter by owner
  if (filters.owner_ids && filters.owner_ids.length > 0) {
    if (node.data.owner) {
      if (!filters.owner_ids.includes(node.data.owner.id)) {
        return false
      }
    } else {
      return false // Node không có owner không khớp filter
    }
  }

  // Filter by progress (for nodes with progress)
  if (filters.progress_min !== undefined || filters.progress_max !== undefined) {
    if (node.data.progress !== undefined) {
      const progress = node.data.progress
      const min = filters.progress_min ?? 0
      const max = filters.progress_max ?? 100
      if (progress < min || progress > max) {
        return false
      }
    }
  }

  // Filter by search query
  if (filters.search_query) {
    const query = filters.search_query.toLowerCase()
    const matchesTitle = node.label.toLowerCase().includes(query)
    const matchesDescription = node.data.description?.toLowerCase().includes(query)
    if (!matchesTitle && !matchesDescription) {
      return false
    }
  }

  return true
}

export function applyFilters(
  data: OKRVisualizationData,
  filters: OKRVisualizationFilters
): OKRVisualizationData {
  // Kiểm tra xem có filters nào được áp dụng không
  const hasFilters = !!(
    filters.status?.length ||
    filters.owner_ids?.length ||
    filters.progress_min !== undefined ||
    filters.progress_max !== undefined ||
    filters.search_query
  )

  if (!hasFilters) {
    // Không có filter, trả về tất cả nodes
    return data
  }

  // Mark nodes as filtered or visible
  const processedNodes = data.nodes.map((node) => {
    const matches = nodeMatchesFilters(node, filters)
    
    return {
      ...node,
      // Add metadata to indicate if node is filtered
      data: {
        ...node.data,
        _filtered: !matches, // true nếu node bị filter out
      },
      style: {
        ...node.style,
        // Mờ đi nodes không khớp filter
        opacity: matches ? 1 : 0.15,
      },
    }
  })

  // Get IDs of visible nodes
  const visibleNodeIds = new Set(
    processedNodes.filter((n) => !n.data._filtered).map((n) => n.id)
  )

  // Mờ đi edges nếu source hoặc target bị filter
  const processedEdges = data.edges.map((edge) => {
    const sourceVisible = visibleNodeIds.has(edge.source)
    const targetVisible = visibleNodeIds.has(edge.target)
    const isVisible = sourceVisible && targetVisible

    return {
      ...edge,
      style: {
        ...edge.style,
        opacity: isVisible ? 0.6 : 0.1,
        strokeDasharray: isVisible ? edge.style?.strokeDasharray : '5,5',
      },
    }
  })

  return {
    nodes: processedNodes,
    edges: processedEdges,
    metadata: {
      ...data.metadata,
      total_nodes: processedNodes.length,
      total_edges: processedEdges.length,
      last_updated: new Date().toISOString(),
    },
  }
}

// ============================================
// LAYOUT ALGORITHMS
// ============================================

/**
 * Calculate node positions based on layout algorithm
 */
export function calculateLayout(
  data: OKRVisualizationData,
  layout: VisualizationLayout,
  width: number = 1200,
  height: number = 800
): OKRVisualizationData {
  const nodes = [...data.nodes]

  switch (layout) {
    case 'hierarchy':
      return applyHierarchyLayout(nodes, data.edges, width, height)
    case 'force':
      return applyForceLayout(nodes, data.edges, width, height)
    case 'circular':
      return applyCircularLayout(nodes, data.edges, width, height)
    case 'grid':
      return applyGridLayout(nodes, data.edges, width, height)
    default:
      return data
  }
}

function applyHierarchyLayout(
  nodes: OKRNode[],
  edges: OKREdge[],
  width: number,
  height: number
): OKRVisualizationData {
  // Separate nodes by type
  const userNodes = nodes.filter((n) => n.type === 'user')
  const objectiveNodes = nodes.filter((n) => n.type === 'objective')
  const krNodes = nodes.filter((n) => n.type === 'keyResult')

  const levelHeight = height / 4
  const userSpacing = width / (userNodes.length + 1)
  const objSpacing = width / (objectiveNodes.length + 1)

  // Position users at top
  userNodes.forEach((node, i) => {
    node.position = {
      x: userSpacing * (i + 1),
      y: levelHeight * 0.5,
    }
  })

  // Position objectives in middle
  objectiveNodes.forEach((node, i) => {
    node.position = {
      x: objSpacing * (i + 1),
      y: levelHeight * 1.5,
    }
  })

  // Position key results at bottom, grouped by objective
  const krByObjective = new Map<string, OKRNode[]>()
  edges.forEach((edge) => {
    if (edge.source.startsWith('obj-') && edge.target.startsWith('kr-')) {
      const kr = krNodes.find((n) => n.id === edge.target)
      if (kr) {
        if (!krByObjective.has(edge.source)) {
          krByObjective.set(edge.source, [])
        }
        krByObjective.get(edge.source)!.push(kr)
      }
    }
  })

  krByObjective.forEach((krs, objId) => {
    const obj = objectiveNodes.find((n) => n.id === objId)
    if (obj) {
      const krSpacing = 150
      const startX = obj.position!.x - (krs.length * krSpacing) / 2
      krs.forEach((kr, i) => {
        kr.position = {
          x: startX + krSpacing * i,
          y: levelHeight * 2.8,
        }
      })
    }
  })

  return {
    nodes: [...userNodes, ...objectiveNodes, ...krNodes],
    edges,
    metadata: {
      total_nodes: nodes.length,
      total_edges: edges.length,
      last_updated: new Date().toISOString(),
    },
  }
}

function applyForceLayout(
  nodes: OKRNode[],
  edges: OKREdge[],
  width: number,
  height: number
): OKRVisualizationData {
  // Simple force-directed layout simulation
  const centerX = width / 2
  const centerY = height / 2

  nodes.forEach((node, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI
    const radius = Math.min(width, height) / 3
    node.position = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    }
  })

  return { nodes, edges, metadata: { total_nodes: nodes.length, total_edges: edges.length, last_updated: new Date().toISOString() } }
}

function applyCircularLayout(
  nodes: OKRNode[],
  edges: OKREdge[],
  width: number,
  height: number
): OKRVisualizationData {
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 2.5

  nodes.forEach((node, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI
    node.position = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    }
  })

  return {
    nodes,
    edges,
    metadata: { total_nodes: nodes.length, total_edges: edges.length, last_updated: new Date().toISOString() },
  }
}

function applyGridLayout(
  nodes: OKRNode[],
  edges: OKREdge[],
  width: number,
  height: number
): OKRVisualizationData {
  const cols = Math.ceil(Math.sqrt(nodes.length))
  const rows = Math.ceil(nodes.length / cols)
  const cellWidth = width / cols
  const cellHeight = height / rows

  nodes.forEach((node, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    node.position = {
      x: cellWidth * col + cellWidth / 2,
      y: cellHeight * row + cellHeight / 2,
    }
  })

  return {
    nodes,
    edges,
    metadata: { total_nodes: nodes.length, total_edges: edges.length, last_updated: new Date().toISOString() },
  }
}

// ============================================
// COLOR HELPERS
// ============================================

function getStatusColor(status: string): string {
  switch (status) {
    case 'on-track':
      return '#10B981'
    case 'at-risk':
      return '#F59E0B'
    case 'off-track':
      return '#EF4444'
    default:
      return '#6B7280'
  }
}

function getStatusBorderColor(status: string): string {
  switch (status) {
    case 'on-track':
      return '#059669'
    case 'at-risk':
      return '#D97706'
    case 'off-track':
      return '#DC2626'
    default:
      return '#4B5563'
  }
}

function getProgressColor(progress: number): string {
  if (progress >= 75) return '#10B981'
  if (progress >= 50) return '#3B82F6'
  if (progress >= 25) return '#F59E0B'
  return '#EF4444'
}

// ============================================
// REAL-TIME UPDATES
// ============================================

/**
 * Subscribe to real-time OKR updates
 */
export function subscribeToOKRUpdates(
  callback: (update: OKRRealtimeUpdate) => void
) {
  const channel = supabase
    .channel('okr-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'objectives',
      },
      (payload) => {
        const eventType: OKRUpdateEventType = `objective:${payload.eventType}` as any
        callback({
          type: eventType,
          payload: {
            id: (payload.new as any)?.id || (payload.old as any)?.id,
            data: payload.new,
            timestamp: new Date().toISOString(),
          },
        })
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'key_results',
      },
      (payload) => {
        const eventType: OKRUpdateEventType = `keyresult:${payload.eventType}` as any
        callback({
          type: eventType,
          payload: {
            id: (payload.new as any)?.id || (payload.old as any)?.id,
            data: payload.new,
            timestamp: new Date().toISOString(),
          },
        })
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// ============================================
// MAIN API
// ============================================

/**
 * Fetch và transform OKR data for visualization
 */
export async function fetchVisualizationData(
  filters?: OKRVisualizationFilters
): Promise<OKRVisualizationData | null> {
  try {
    const { data: objectives, error } = await fetchObjectives()

    if (error || !objectives) {
      console.error('Error fetching objectives:', error)
      return null
    }

    let vizData = transformToVisualizationData(objectives)

    if (filters) {
      vizData = applyFilters(vizData, filters)
    }

    return vizData
  } catch (error) {
    console.error('Error in fetchVisualizationData:', error)
    return null
  }
}

/**
 * Apply real-time update to existing visualization data
 */
export function applyRealtimeUpdate(
  currentData: OKRVisualizationData,
  update: OKRRealtimeUpdate
): OKRVisualizationData {
  const { type, payload } = update
  const nodes = [...currentData.nodes]
  const edges = [...currentData.edges]

  if (type.startsWith('objective:')) {
    if (type === 'objective:deleted') {
      // Remove objective node and related edges
      const nodeId = `obj-${payload.id}`
      const nodeIndex = nodes.findIndex((n) => n.id === nodeId)
      if (nodeIndex > -1) {
        nodes.splice(nodeIndex, 1)
      }
      // Remove related edges
      const relatedEdges = edges.filter(
        (e) => e.source === nodeId || e.target === nodeId
      )
      relatedEdges.forEach((edge) => {
        const edgeIndex = edges.indexOf(edge)
        if (edgeIndex > -1) edges.splice(edgeIndex, 1)
      })
    } else if (type === 'objective:updated') {
      // Update objective node
      const nodeId = `obj-${payload.id}`
      const node = nodes.find((n) => n.id === nodeId)
      if (node && payload.data) {
        node.data = { ...node.data, ...payload.data }
        node.label = payload.data.title || node.label
        if (payload.data.status) {
          node.style = {
            ...node.style,
            backgroundColor: getStatusColor(payload.data.status),
            borderColor: getStatusBorderColor(payload.data.status),
          }
        }
      }
    }
  }

  return {
    nodes,
    edges,
    metadata: {
      ...currentData.metadata,
      last_updated: payload.timestamp,
    },
  }
}
