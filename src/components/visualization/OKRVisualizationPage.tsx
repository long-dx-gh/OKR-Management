/**
 * OKR Visualization Page
 * Main page component cho tính năng visualization OKR mapping
 */

import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Maximize2, Minimize2, Info, RefreshCw, Wifi, WifiOff, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { OKRNetworkMap } from './OKRNetworkMap'
import { VisualizationControlPanel } from './VisualizationControlPanel'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { Alert, AlertDescription } from '../ui/alert'
import { BottomSheet } from '../ui/bottom-sheet'
import { useOKRVisualization, useVisualizationSettings, useNodeSelection } from '../../hooks/useVisualization'
import { useResponsive } from '../../hooks/useMediaQuery'
import type { OKRNode, OKRVisualizationFilters } from '../../types'

export const OKRVisualizationPage: React.FC = () => {
  const navigate = useNavigate()
  const { isMobile } = useResponsive()
  const { settings, updateSetting } = useVisualizationSettings()
  const { data, isLoading, error, isRealtime, reload, updateLayout, updateFilters } = useOKRVisualization(
    undefined,
    settings.layout
  )
  const { selectedNodeId, selectNode, hoverNode, clearSelection } = useNodeSelection()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showLegendSheet, setShowLegendSheet] = useState(false) // State for mobile legend bottom sheet
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false) // State for desktop sidebar collapse
  const containerRef = useRef<HTMLDivElement>(null)

  // Get selected node details
  const selectedNode = selectedNodeId && data?.nodes.find((n) => n.id === selectedNodeId)

  // Fullscreen handling
  const handleFullscreen = async () => {
    if (!containerRef.current) return

    try {
      if (!isFullscreen) {
        // Enter fullscreen
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen()
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen()
        } else if ((containerRef.current as any).mozRequestFullScreen) {
          await (containerRef.current as any).mozRequestFullScreen()
        }
        setIsFullscreen(true)
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen()
        }
        setIsFullscreen(false)
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement
      )
      setIsFullscreen(isCurrentlyFullscreen)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
    }
  }, [])

  const handleFilterChange = (filters: OKRVisualizationFilters) => {
    updateFilters(filters)
  }

  const handleLayoutChange = (layout: 'hierarchy' | 'force' | 'circular' | 'grid') => {
    updateSetting('layout', layout)
    updateLayout(layout)
  }

  const handleNodeClick = (node: OKRNode) => {
    selectNode(node.id)
    
    // 🎯 Desktop: Tự động mở Sidebar khi click node (nếu đang collapsed)
    if (!isMobile && sidebarCollapsed) {
      setSidebarCollapsed(false)
    }
    
    // Optional: Navigate to detail page
    // if (node.type === 'objective') {
    //   navigate(`/okr/${node.id.replace('obj-', '')}`)
    // }
  }

  const handleExport = () => {
    if (!data) return

    // Export as JSON
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `okr-visualization-${new Date().toISOString()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div ref={containerRef} className={`h-screen flex flex-col bg-gray-50 ${isMobile ? 'okr-visualization-page' : ''}`}>
      {/* Header */}
      <div className={`bg-white border-b border-gray-200 ${isMobile ? 'px-3 py-2' : 'px-4 py-2.5'}`}>
        {isMobile ? (
          /* Mobile Header - Compact */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="h-9 w-9 p-0 flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base font-bold text-gray-900 truncate">OKR Visualization</h1>
              </div>
            </div>
            {data && (
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-6">
                  {data.metadata.total_nodes}N
                </Badge>
                <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-6">
                  {data.metadata.total_edges}C
                </Badge>
              </div>
            )}
          </div>
        ) : (
          /* Desktop Header - Compact Single Line */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="h-8 px-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Quay lại
              </Button>
              <div className="h-5 w-px bg-gray-300" /> {/* Divider */}
              <h1 className="text-lg font-semibold text-gray-900">OKR Visualization</h1>
              {data && (
                <>
                  <Badge variant="secondary" className="text-xs h-6">
                    {data.metadata.total_nodes} Nodes
                  </Badge>
                  <Badge variant="secondary" className="text-xs h-6">
                    {data.metadata.total_edges} Connections
                  </Badge>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFullscreen}
                className="h-8"
                title={isFullscreen ? 'Thoát toàn màn hình' : 'Mở toàn màn hình'}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <VisualizationControlPanel
        onFilterChange={handleFilterChange}
        onLayoutChange={handleLayoutChange}
        onSettingChange={(key: any, value: any) => updateSetting(key, value)}
        onRefresh={reload}
        onExport={handleExport}
        isRealtime={isRealtime}
        settings={settings}
      />

      {/* Main Content */}
      <div className={`flex-1 flex overflow-hidden ${isMobile ? 'flex-col' : ''}`}>
        {/* Desktop Dynamic Sidebar - Legend or Node Details */}
        {!isLoading && !error && data && data.nodes.length > 0 && !isMobile && (
          <div 
            className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex-shrink-0 ${
              sidebarCollapsed ? 'w-12' : 'w-80'
            }`}
          >
            {sidebarCollapsed ? (
              /* Collapsed State - Show Button Only */
              <div className="h-full flex flex-col items-center justify-center">
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                  title="Mở sidebar"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                </button>
              </div>
            ) : (
              /* Expanded State - Show Legend or Node Details */
              <div className="h-full flex flex-col">
                {!selectedNode ? (
                  /* Trạng thái 1: Hiển thị Legend (Chú thích) */
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900">Chú Thích</h3>
                      <button
                        onClick={() => setSidebarCollapsed(true)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Thu gọn"
                      >
                        <ChevronLeft className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                      {/* User */}
                      <div>
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-4 h-4 rounded-full bg-purple-500 flex-shrink-0" />
                          <span className="font-medium">User / Owner</span>
                        </div>
                      </div>
                      
                      {/* Objectives */}
                      <div className="pt-2 border-t border-gray-200">
                        <div className="text-xs font-semibold text-gray-700 mb-2">Objectives:</div>
                        <div className="space-y-1.5 ml-1">
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                            <span>On-track</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0" />
                            <span>At-risk</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                            <span>Off-track</span>
                          </div>
                        </div>
                      </div>

                      {/* Key Results */}
                      <div className="pt-2 border-t border-gray-200">
                        <div className="text-xs font-semibold text-gray-700 mb-2">Key Results:</div>
                        <div className="flex items-center gap-2 text-xs ml-1">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#1f5799' }} />
                          <span>Key Results</span>
                        </div>
                      </div>

                      {/* Tips */}
                      <div className="pt-2 border-t border-gray-200">
                        <div className="bg-blue-50 rounded-lg p-2.5">
                          <div className="flex items-start gap-2">
                            <span className="text-base flex-shrink-0">💡</span>
                            <div className="text-xs text-gray-700">
                              <div className="font-semibold mb-1">Tương tác:</div>
                              <ul className="space-y-0.5">
                                <li>• Kéo để di chuyển node</li>
                                <li>• Cuộn để zoom</li>
                                <li>• Click để chọn</li>
                                <li>• Hover để xem chi tiết</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Trạng thái 2: Hiển thị Chi tiết Node */
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900">Chi tiết Node</h3>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={clearSelection}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Đóng chi tiết"
                        >
                          <span className="text-gray-500 text-lg">✕</span>
                        </button>
                        <button
                          onClick={() => setSidebarCollapsed(true)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Thu gọn"
                        >
                          <ChevronLeft className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-4">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={selectedNode.type === 'objective' ? 'default' : 'secondary'}>
                              {selectedNode.type === 'objective' ? 'Objective' : selectedNode.type === 'keyResult' ? 'Key Result' : 'User'}
                            </Badge>
                            {selectedNode.data.status && (
                              <Badge
                                variant={
                                  selectedNode.data.status === 'on-track'
                                    ? 'default'
                                    : selectedNode.data.status === 'at-risk'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                              >
                                {selectedNode.data.status}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-base mt-2">{selectedNode.label}</CardTitle>
                          {selectedNode.data.description && (
                            <CardDescription>{selectedNode.data.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {selectedNode.data.progress !== undefined && (
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">Tiến độ</span>
                                <span className="font-semibold">{selectedNode.data.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full transition-all"
                                  style={{ width: `${selectedNode.data.progress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {selectedNode.data.target && (
                            <div className="text-sm">
                              <span className="text-gray-600">Target:</span>
                              <span className="ml-2 font-semibold">
                                {selectedNode.data.target} {selectedNode.data.unit || ''}
                              </span>
                            </div>
                          )}

                          {selectedNode.data.owner && (
                            <div className="text-sm">
                              <span className="text-gray-600">Owner:</span>
                              <span className="ml-2">{selectedNode.data.owner.full_name || selectedNode.data.owner.email}</span>
                            </div>
                          )}

                          {selectedNode.data.due_date && (
                            <div className="text-sm">
                              <span className="text-gray-600">Due Date:</span>
                              <span className="ml-2">{new Date(selectedNode.data.due_date).toLocaleDateString('vi-VN')}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Visualization Area */}
        <div 
          className={`flex-1 relative ${isMobile ? 'h-full okr-visualization-canvas' : ''}`} 
          style={
            isMobile 
              ? { height: 'calc(100vh - 140px)' } 
              : undefined
          }
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center space-y-4">
                <Skeleton className="h-64 w-64 mx-auto rounded-full" />
                <p className="text-sm text-gray-500">Đang tải dữ liệu visualization...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <Alert variant="destructive" className="max-w-md">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Không thể tải dữ liệu visualization. Vui lòng thử lại.
                  <Button variant="outline" size="sm" onClick={reload} className="mt-2">
                    Thử lại
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {!isLoading && !error && data && data.nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center space-y-4 max-w-md">
                <Info className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900">Chưa có dữ liệu</h3>
                <p className="text-sm text-gray-500">
                  Tạo Objectives và Key Results để xem visualization của bạn
                </p>
                <Button onClick={() => navigate('/')}>
                  Tạo OKR đầu tiên
                </Button>
              </div>
            </div>
          )}

          {!isLoading && !error && data && data.nodes.length > 0 && (
            <OKRNetworkMap
              nodes={data.nodes}
              edges={data.edges}
              settings={settings}
              onNodeClick={handleNodeClick}
              onNodeHover={(node) => hoverNode(node?.id || null)}
              selectedNodeId={selectedNodeId}
              className="h-full"
            />
          )}

          {/* Mobile Floating Action Buttons */}
          {!isLoading && !error && data && data.nodes.length > 0 && isMobile && (
            <>
              {/* Legend Button - Bottom Left */}
              <button
                onClick={() => setShowLegendSheet(true)}
                className="fab-button absolute bottom-4 left-4 z-10 h-12 w-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
                title="Chú thích"
              >
                <Info className="h-5 w-5 text-gray-700" />
              </button>

              {/* Realtime & Refresh Buttons - Top Right */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                {/* Realtime Indicator */}
                <button
                  className={`fab-button h-11 w-11 rounded-full shadow-lg border flex items-center justify-center transition-all ${
                    isRealtime 
                      ? 'bg-green-500 border-green-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}
                  title={isRealtime ? 'Real-time' : 'Offline'}
                >
                  {isRealtime ? (
                    <div className="relative">
                      <Wifi className="h-5 w-5" />
                      <div className="absolute -top-1 -right-1 h-2 w-2 bg-white rounded-full animate-pulse" />
                    </div>
                  ) : (
                    <WifiOff className="h-5 w-5" />
                  )}
                </button>

                {/* Refresh Button */}
                <button
                  onClick={reload}
                  className="fab-button h-11 w-11 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
                  title="Làm mới"
                >
                  <RefreshCw className="h-5 w-5 text-gray-700" />
                </button>
              </div>

              {/* Legend Bottom Sheet */}
              <BottomSheet
                open={showLegendSheet}
                onOpenChange={setShowLegendSheet}
                title="Chú thích"
              >
                <div className="space-y-4">
                  {/* User */}
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex-shrink-0" />
                    <span className="text-sm font-medium">User / Owner</span>
                  </div>
                  
                  {/* Objectives */}
                  <div className="pt-3 border-t">
                    <div className="font-semibold text-gray-900 mb-3">Objectives:</div>
                    <div className="space-y-2 ml-2">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex-shrink-0" />
                        <span className="text-sm">On-track</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-yellow-500 flex-shrink-0" />
                        <span className="text-sm">At-risk</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-red-500 flex-shrink-0" />
                        <span className="text-sm">Off-track</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Results */}
                  <div className="pt-3 border-t">
                    <div className="font-semibold text-gray-900 mb-3">Key Results:</div>
                    <div className="flex items-center gap-3 ml-2">
                      <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: '#1f5799' }} />
                      <span className="text-sm">Key Results</span>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="pt-3 border-t bg-blue-50 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-xl flex-shrink-0">💡</span>
                      <div className="text-sm text-gray-700">
                        <strong className="block mb-1">Mẹo sử dụng:</strong>
                        <ul className="space-y-1 text-xs">
                          <li>• Chạm để chọn node</li>
                          <li>• Kéo để di chuyển nodes</li>
                          <li>• 2 ngón tay để zoom</li>
                          <li>• 1 ngón tay để pan</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </BottomSheet>
            </>
          )}
        </div>

        {/* Mobile Modal - Node Details */}
        {selectedNode && isMobile && (
          <div className="fixed inset-0 z-50 bg-white overflow-auto">
            {/* Mobile Header */}
            <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-10 flex items-center px-3 safe-top">
              <Button variant="ghost" size="sm" onClick={clearSelection} className="p-2 -ml-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="ml-2 text-lg font-semibold text-gray-900 truncate flex-1">
                Chi tiết Node
              </h1>
            </div>

            {/* Content */}
            <div className="pt-14 p-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={selectedNode.type === 'objective' ? 'default' : 'secondary'}>
                      {selectedNode.type === 'objective' ? 'Objective' : selectedNode.type === 'keyResult' ? 'Key Result' : 'User'}
                    </Badge>
                    {selectedNode.data.status && (
                      <Badge
                        variant={
                          selectedNode.data.status === 'on-track'
                            ? 'default'
                            : selectedNode.data.status === 'at-risk'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {selectedNode.data.status}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base mt-2">{selectedNode.label}</CardTitle>
                  {selectedNode.data.description && (
                    <CardDescription>{selectedNode.data.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedNode.data.progress !== undefined && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Tiến độ</span>
                        <span className="font-semibold">{selectedNode.data.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${selectedNode.data.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {selectedNode.data.target && (
                    <div className="text-sm">
                      <span className="text-gray-600">Target:</span>
                      <span className="ml-2 font-semibold">
                        {selectedNode.data.target} {selectedNode.data.unit || ''}
                      </span>
                    </div>
                  )}

                  {selectedNode.data.owner && (
                    <div className="text-sm">
                      <span className="text-gray-600">Owner:</span>
                      <span className="ml-2">{selectedNode.data.owner.full_name || selectedNode.data.owner.email}</span>
                    </div>
                  )}

                  {selectedNode.data.due_date && (
                    <div className="text-sm">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="ml-2">{new Date(selectedNode.data.due_date).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
