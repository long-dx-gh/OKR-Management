/**
 * Visualization Control Panel
 * Panel để điều khiển search, layout và settings cho OKR visualization
 */

import React, { useState } from 'react'
import { Download, RefreshCw, Filter, X } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import type { OKRVisualizationFilters, VisualizationLayout, ObjectiveStatus } from '../lib/types'

interface VisualizationControlPanelProps {
  onFilterChange: (filters: OKRVisualizationFilters) => void
  onLayoutChange?: (layout: VisualizationLayout) => void
  onSettingChange?: (key: string, value: any) => void
  onRefresh: () => void
  onExport?: () => void
  isRealtime: boolean
  settings?: {
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
  onRefresh,
  onExport,
  isRealtime,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [minProgress, setMinProgress] = useState<number>(0)
  const [maxProgress, setMaxProgress] = useState<number>(100)
  const [timeFilter, setTimeFilter] = useState<string>('all')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')

  // Helper function to get date range based on time filter
  const getDateRange = (filter: string): { start: string; end: string } | undefined => {
    const now = new Date()
    let start: Date
    let end: Date = now

    switch (filter) {
      case 'this-week': {
        const day = now.getDay()
        const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Monday
        start = new Date(now.setDate(diff))
        start.setHours(0, 0, 0, 0)
        break
      }
      case 'this-month': {
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      }
      case 'this-quarter': {
        const quarter = Math.floor(now.getMonth() / 3)
        start = new Date(now.getFullYear(), quarter * 3, 1)
        break
      }
      case 'this-year': {
        start = new Date(now.getFullYear(), 0, 1)
        break
      }
      case 'custom': {
        if (customStartDate && customEndDate) {
          return {
            start: customStartDate,
            end: customEndDate,
          }
        }
        return undefined
      }
      case 'all':
      default:
        return undefined
    }

    return {
      start: start!.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    }
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    const filters: OKRVisualizationFilters = {
      status: value !== 'all' ? [value as ObjectiveStatus] : undefined,
      progress_min: minProgress,
      progress_max: maxProgress,
      date_range: getDateRange(timeFilter),
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
      date_range: getDateRange(timeFilter),
    }
    onFilterChange(filters)
  }

  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value)
    const filters: OKRVisualizationFilters = {
      status: statusFilter !== 'all' ? [statusFilter as ObjectiveStatus] : undefined,
      progress_min: minProgress,
      progress_max: maxProgress,
      date_range: getDateRange(value),
    }
    onFilterChange(filters)
  }

  const handleCustomDateChange = (start: string, end: string) => {
    setCustomStartDate(start)
    setCustomEndDate(end)
    if (timeFilter === 'custom' && start && end) {
      const filters: OKRVisualizationFilters = {
        status: statusFilter !== 'all' ? [statusFilter as ObjectiveStatus] : undefined,
        progress_min: minProgress,
        progress_max: maxProgress,
        date_range: { start, end },
      }
      onFilterChange(filters)
    }
  }

  const clearFilters = () => {
    setStatusFilter('all')
    setMinProgress(0)
    setMaxProgress(100)
    setTimeFilter('all')
    setCustomStartDate('')
    setCustomEndDate('')
    onFilterChange({
      status: undefined,
      progress_min: 0,
      progress_max: 100,
      date_range: undefined,
    })
  }

  const hasActiveFilters = 
    statusFilter !== 'all' || 
    minProgress > 0 || 
    maxProgress < 100 || 
    timeFilter !== 'all'

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

          {/* Time Filter */}
          <div className="w-48">
            <Label className="text-xs text-gray-500 mb-1">Thời gian</Label>
            <Select value={timeFilter} onValueChange={handleTimeFilterChange}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="this-week">Tuần này</SelectItem>
                <SelectItem value="this-month">Tháng này</SelectItem>
                <SelectItem value="this-quarter">Quý này</SelectItem>
                <SelectItem value="this-year">Năm này</SelectItem>
                <SelectItem value="custom">Tùy chỉnh</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range - Only shown when "Tùy chỉnh" is selected */}
          {timeFilter === 'custom' && (
            <div className="flex items-center gap-2">
              <div className="w-40">
                <Label className="text-xs text-gray-500 mb-1">Từ ngày</Label>
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => handleCustomDateChange(e.target.value, customEndDate)}
                  className="h-9"
                />
              </div>
              <div className="w-40">
                <Label className="text-xs text-gray-500 mb-1">Đến ngày</Label>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => handleCustomDateChange(customStartDate, e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          )}

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
              {
                (statusFilter !== 'all' ? 1 : 0) + 
                (minProgress > 0 || maxProgress < 100 ? 1 : 0) + 
                (timeFilter !== 'all' ? 1 : 0)
              } bộ lọc
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
