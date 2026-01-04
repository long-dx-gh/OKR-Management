/**
 * OKR Visualization Page
 * Main page component cho tính năng visualization OKR mapping
 */

import React, { useState } from 'react'
import { ArrowLeft, Maximize2, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { OKRNetworkMap } from './OKRNetworkMap'
import { VisualizationControlPanel } from './VisualizationControlPanel'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { Alert, AlertDescription } from './ui/alert'
import { useOKRVisualization, useVisualizationSettings, useNodeSelection } from '../hooks/useVisualization'
import type { OKRNode, OKRVisualizationFilters } from '../lib/types'

export const OKRVisualizationPage: React.FC = () => {
  const navigate = useNavigate()
  const { settings, updateSetting } = useVisualizationSettings()
  const { data, isLoading, error, isRealtime, reload, updateLayout, updateFilters } = useOKRVisualization(
    undefined,
    settings.layout
  )
  const { selectedNodeId, selectNode, hoverNode, clearSelection } = useNodeSelection()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showLegend, setShowLegend] = useState(true) // State for legend visibility

  // Get selected node details
  const selectedNode = selectedNodeId && data?.nodes.find((n) => n.id === selectedNodeId)

  const handleFilterChange = (filters: OKRVisualizationFilters) => {
    updateFilters(filters)
  }

  const handleLayoutChange = (layout: 'hierarchy' | 'force' | 'circular' | 'grid') => {
    updateSetting('layout', layout)
    updateLayout(layout)
  }

  const handleNodeClick = (node: OKRNode) => {
    selectNode(node.id)
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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">OKR Visualization</h1>
              <p className="text-sm text-gray-500">Trực quan hóa mối quan hệ giữa các Objectives và Key Results</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <Badge variant="outline">{data.metadata.total_nodes} Nodes</Badge>
                <Badge variant="outline">{data.metadata.total_edges} Connections</Badge>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
      <div className="flex-1 flex overflow-hidden">
        {/* Visualization Area */}
        <div className="flex-1 relative">
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

          {/* Legend - Collapsible */}
          {!isLoading && !error && data && data.nodes.length > 0 && (
            <div className="absolute bottom-4 left-4 z-10">
              {showLegend ? (
                <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs border border-gray-200 animate-in fade-in slide-in-from-left-2 duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold">Chú thích</h4>
                    <button
                      onClick={() => setShowLegend(false)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Ẩn chú thích"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    {/* User */}
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-purple-500" />
                      <span>User / Owner</span>
                    </div>
                    
                    {/* Objectives */}
                    <div className="pt-2 border-t">
                      <div className="font-medium text-gray-700 mb-1">Objectives:</div>
                      <div className="flex items-center gap-2 ml-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span>On-track</span>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span>At-risk</span>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span>Off-track</span>
                      </div>
                    </div>

                    {/* Key Results */}
                    <div className="pt-2 border-t">
                      <div className="font-medium text-gray-700 mb-1">Key Results:</div>
                      <div className="flex items-center gap-2 ml-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#1f5799' }} />
                        <span>Key Results</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                    💡 <strong>Tips:</strong> Kéo thả để di chuyển nodes, cuộn để zoom, double-click để reset
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowLegend(true)}
                  className="bg-white rounded-lg shadow-lg p-3 border border-gray-200 hover:bg-gray-50 transition-colors group"
                  title="Hiện chú thích"
                >
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                      Chú thích
                    </span>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Side Panel - Node Details */}
        {selectedNode && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Chi tiết Node</h3>
                <Button variant="ghost" size="sm" onClick={clearSelection} title="Đóng">
                  ✕
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
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
