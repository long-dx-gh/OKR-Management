/**
 * Visualization Control Panel
 * Panel để điều khiển search, layout và settings cho OKR visualization
 */

import React, { useState } from 'react'
import { Layout, Settings, Download, RefreshCw, Filter, X } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import type { OKRVisualizationFilters, VisualizationLayout, ObjectiveStatus } from '../lib/types'

interface VisualizationControlPanelProps {
  onFilterChange: (filters: OKRVisualizationFilters) => void
  onLayoutChange: (layout: VisualizationLayout) => void
  onSettingChange: (key: string, value: any) => void
  onRefresh: () => void
  onExport?: () => void
  isRealtime: boolean
  settings: {
    layout: VisualizationLayout
    showProgress: boolean
    showOwners: boolean
    showDates: boolean
    enableAnimations: boolean
    nodeSize: 'small' | 'medium' | 'large'
    colorScheme: 'status' | 'owner' | 'progress'
  }
}

export const VisualizationControlPanel: React.FC<VisualizationControlPanelProps> = ({
  onFilterChange,
  onLayoutChange,
  onSettingChange,
  onRefresh,
  onExport,
  isRealtime,
  settings,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [minProgress, setMinProgress] = useState<number>(0)
  const [maxProgress, setMaxProgress] = useState<number>(100)

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    const filters: OKRVisualizationFilters = {
      status: value !== 'all' ? [value as ObjectiveStatus] : undefined,
      progress_min: minProgress,
      progress_max: maxProgress,
    }
    onFilterChange(filters)
  }

  const handleProgressChange = (min: number, max: number) => {
    setMinProgress(min)
    setMaxProgress(max)
    const filters: OKRVisualizationFilters = {
      status: statusFilter !== 'all' ? [statusFilter as ObjectiveStatus] : undefined,
      progress_min: min,
      progress_max: max,
    }
    onFilterChange(filters)
  }

  const clearFilters = () => {
    setStatusFilter('all')
    setMinProgress(0)
    setMaxProgress(100)
    onFilterChange({
      status: undefined,
      progress_min: 0,
      progress_max: 100,
    })
  }

  const hasActiveFilters = statusFilter !== 'all' || minProgress > 0 || maxProgress < 100

  return (
    <div className="bg-white border-b border-gray-200 p-4 space-y-4">
      {/* Top Row: Filters and Actions */}
      <div className="flex items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-1">
          {/* Status Filter */}
          <div className="w-48">
            <Label className="text-xs text-gray-500 mb-1">Trạng thái</Label>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="on-track">On Track</SelectItem>
                <SelectItem value="at-risk">At Risk</SelectItem>
                <SelectItem value="off-track">Off Track</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Progress Range Filter */}
          <div className="flex items-center gap-2">
            <div className="w-32">
              <Label className="text-xs text-gray-500 mb-1">Tiến độ từ (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={minProgress}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(100, Number(e.target.value)))
                  handleProgressChange(val, maxProgress)
                }}
                className="h-9"
              />
            </div>

            <div className="w-32">
              <Label className="text-xs text-gray-500 mb-1">đến (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={maxProgress}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(100, Number(e.target.value)))
                  handleProgressChange(minProgress, val)
                }}
                className="h-9"
              />
            </div>

            {/* Visual Progress Range Bar */}
            <div className="flex-1 max-w-xs mt-5">
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-blue-500 transition-all duration-200"
                  style={{
                    left: `${minProgress}%`,
                    width: `${maxProgress - minProgress}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-5">
              <X className="h-4 w-4 mr-1" />
              Xóa
            </Button>
          )}

          {/* Active Filters Indicator */}
          {hasActiveFilters && (
            <Badge variant="secondary" className="mt-5">
              <Filter className="h-3 w-3 mr-1" />
              {(statusFilter !== 'all' ? 1 : 0) + (minProgress > 0 || maxProgress < 100 ? 1 : 0)} bộ lọc
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Realtime Indicator */}
          <Badge variant={isRealtime ? 'default' : 'secondary'} className="gap-1">
            <div className={`w-2 h-2 rounded-full ${isRealtime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {isRealtime ? 'Real-time' : 'Offline'}
          </Badge>

          {/* Layout Selector */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Layout className="h-4 w-4 mr-2" />
                Layout
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Kiểu hiển thị</Label>
                  <Select value={settings.layout} onValueChange={onLayoutChange}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hierarchy">Phân cấp</SelectItem>
                      <SelectItem value="force">Lực hướng</SelectItem>
                      <SelectItem value="circular">Vòng tròn</SelectItem>
                      <SelectItem value="grid">Lưới</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Settings */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Cài đặt
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h4 className="font-medium">Cài đặt hiển thị</h4>
                <Separator />

                {/* Display Options */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-progress">Hiện tiến độ</Label>
                    <Switch
                      id="show-progress"
                      checked={settings.showProgress}
                      onCheckedChange={(checked) => onSettingChange('showProgress', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-owners">Hiện người sở hữu</Label>
                    <Switch
                      id="show-owners"
                      checked={settings.showOwners}
                      onCheckedChange={(checked) => onSettingChange('showOwners', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-dates">Hiện ngày hết hạn</Label>
                    <Switch
                      id="show-dates"
                      checked={settings.showDates}
                      onCheckedChange={(checked) => onSettingChange('showDates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="enable-animations">Bật animations</Label>
                    <Switch
                      id="enable-animations"
                      checked={settings.enableAnimations}
                      onCheckedChange={(checked) => onSettingChange('enableAnimations', checked)}
                    />
                  </div>
                </div>

                <Separator />

                {/* Node Size */}
                <div>
                  <Label className="text-sm font-medium">Kích thước node</Label>
                  <Select
                    value={settings.nodeSize}
                    onValueChange={(value: 'small' | 'medium' | 'large') => onSettingChange('nodeSize', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Nhỏ</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="large">Lớn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Color Scheme */}
                <div>
                  <Label className="text-sm font-medium">Màu sắc</Label>
                  <Select
                    value={settings.colorScheme}
                    onValueChange={(value: 'status' | 'owner' | 'progress') => onSettingChange('colorScheme', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="status">Theo trạng thái</SelectItem>
                      <SelectItem value="progress">Theo tiến độ</SelectItem>
                      <SelectItem value="owner">Theo người sở hữu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Refresh Button */}
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* Export Button */}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Xuất
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
