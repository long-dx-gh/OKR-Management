/**
 * Custom Hooks cho OKR Visualization
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  fetchVisualizationData,
  subscribeToOKRUpdates,
  applyRealtimeUpdate,
  calculateLayout,
  applyFilters,
} from '../services/visualization.service'
import type {
  OKRVisualizationData,
  OKRVisualizationFilters,
  OKRRealtimeUpdate,
  VisualizationLayout,
} from '../types'

/**
 * Hook để fetch và manage visualization data với real-time updates
 */
export function useOKRVisualization(
  filters?: OKRVisualizationFilters,
  layout: VisualizationLayout = 'hierarchy'
) {
  const [data, setData] = useState<OKRVisualizationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isRealtime, setIsRealtime] = useState(false)
  const layoutRef = useRef<VisualizationLayout>(layout)

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const vizData = await fetchVisualizationData(filters)
      
      if (vizData) {
        // Apply layout
        const layoutData = calculateLayout(vizData, layoutRef.current)
        setData(layoutData)
      } else {
        setData(null)
      }
    } catch (err) {
      setError(err as Error)
      console.error('Error loading visualization data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  // Handle real-time updates
  const handleRealtimeUpdate = useCallback(
    (update: OKRRealtimeUpdate) => {
      setData((currentData) => {
        if (!currentData) return currentData
        const updatedData = applyRealtimeUpdate(currentData, update)
        // Reapply layout after update
        return calculateLayout(updatedData, layoutRef.current)
      })
    },
    []
  )

  // Update layout
  const updateLayout = useCallback((newLayout: VisualizationLayout) => {
    layoutRef.current = newLayout
    setData((currentData) => {
      if (!currentData) return currentData
      return calculateLayout(currentData, newLayout)
    })
  }, [])

  // Apply filters without reloading
  const updateFilters = useCallback(
    (newFilters: OKRVisualizationFilters) => {
      setData((currentData) => {
        if (!currentData) return currentData
        const filteredData = applyFilters(currentData, newFilters)
        return calculateLayout(filteredData, layoutRef.current)
      })
    },
    []
  )

  // Initial load
  useEffect(() => {
    loadData()
  }, [loadData])

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToOKRUpdates(handleRealtimeUpdate)
    setIsRealtime(true)

    return () => {
      unsubscribe()
      setIsRealtime(false)
    }
  }, [handleRealtimeUpdate])

  return {
    data,
    isLoading,
    error,
    isRealtime,
    reload: loadData,
    updateLayout,
    updateFilters,
  }
}

/**
 * Hook để manage visualization settings
 */
export function useVisualizationSettings() {
  const [settings, setSettings] = useState({
    layout: 'hierarchy' as VisualizationLayout,
    showProgress: true,
    showOwners: true,
    showDates: true,
    enableAnimations: true,
    nodeSize: 'medium' as 'small' | 'medium' | 'large',
    colorScheme: 'status' as 'status' | 'owner' | 'progress',
  })

  const updateSetting = useCallback(
    <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const resetSettings = useCallback(() => {
    setSettings({
      layout: 'hierarchy',
      showProgress: true,
      showOwners: true,
      showDates: true,
      enableAnimations: true,
      nodeSize: 'medium',
      colorScheme: 'status',
    })
  }, [])

  return {
    settings,
    updateSetting,
    resetSettings,
  }
}

/**
 * Hook để handle node selection và interaction
 */
export function useNodeSelection() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)

  const selectNode = useCallback((nodeId: string | null) => {
    // Force update even if same node is selected again
    setSelectedNodeId(null) // Clear first
    setTimeout(() => {
      setSelectedNodeId(nodeId) // Then set new value
    }, 0)
  }, [])

  const hoverNode = useCallback((nodeId: string | null) => {
    setHoveredNodeId(nodeId)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedNodeId(null)
    setHoveredNodeId(null)
  }, [])

  return {
    selectedNodeId,
    hoveredNodeId,
    selectNode,
    hoverNode,
    clearSelection,
  }
}

/**
 * Hook để debounce search input
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
