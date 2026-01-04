/**
 * Visualization Control Panel
 * Panel để điều khiển search, layout và settings cho OKR visualization
 */

import React, { useState } from 'react'
import { Download, RefreshCw, Filter, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { BottomSheet } from '../ui/bottom-sheet'
import { RangeSlider } from '../ui/range-slider'
import { useResponsive } from '../../hooks/useMediaQuery'
import type { OKRVisualizationFilters, VisualizationLayout, ObjectiveStatus } from '../../types'

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
  const { isMobile } = useResponsive()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [minProgress, setMinProgress] = useState<number>(0)
  const [maxProgress, setMaxProgress] = useState<number>(100)
  const [timeFilter, setTimeFilter] = useState<string>('all')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

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

  const applyFilters = () => {
    const filters: OKRVisualizationFilters = {
      status: statusFilter !== 'all' ? [statusFilter as ObjectiveStatus] : undefined,
      progress_min: minProgress,
      progress_max: maxProgress,
      date_range: getDateRange(timeFilter),
    }
    onFilterChange(filters)
  }

  // Mobile Version - Bottom Sheet
  if (isMobile) {
    return (
      <>
        {/* Mobile Control Bar - Minimal */}
        <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
          {/* Filter Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsBottomSheetOpen(true)}
            className="flex-1 h-11 justify-start relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Bộ lọc & Tùy chỉnh
            {hasActiveFilters && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {
                  (statusFilter !== 'all' ? 1 : 0) + 
                  (minProgress > 0 || maxProgress < 100 ? 1 : 0) + 
                  (timeFilter !== 'all' ? 1 : 0)
                }
              </Badge>
            )}
          </Button>
        </div>

        {/* Bottom Sheet with Filters */}
        <BottomSheet
          open={isBottomSheetOpen}
          onOpenChange={setIsBottomSheetOpen}
          title="Bộ lọc & Tùy chỉnh"
          onApply={applyFilters}
        >
          <div className="space-y-6">
            {/* Status Filter */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Trạng thái</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11">
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

            {/* Progress Range Slider */}
            <div>
              <RangeSlider
                label="Tiến độ"
                value={[minProgress, maxProgress]}
                onChange={([min, max]) => {
                  setMinProgress(min)
                  setMaxProgress(max)
                }}
                min={0}
                max={100}
                step={5}
                unit="%"
                showValues
              />
            </div>

            {/* Time Filter */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Thời gian</Label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="h-11">
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

            {/* Custom Date Range */}
            {timeFilter === 'custom' && (
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Từ ngày</Label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Đến ngày</Label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                onClick={clearFilters} 
                className="w-full h-11"
              >
                <X className="h-4 w-4 mr-2" />
                Xóa tất cả bộ lọc
              </Button>
            )}
          </div>
        </BottomSheet>
      </>
    )
  }

  // Desktop Version - Compact Toolbar (Ribbon)
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      {/* Single Row: All Filters and Actions */}
      <div className="flex items-center gap-3">
        {/* Status Filter - Compact */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-gray-600 whitespace-nowrap">Trạng thái:</Label>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-8 w-32 text-xs">
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

        <div className="h-4 w-px bg-gray-300" /> {/* Divider */}

        {/* Progress Range - Compact */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-gray-600 whitespace-nowrap">Tiến độ:</Label>
          <Input
            type="number"
            min="0"
            max="100"
            value={minProgress}
            onChange={(e) => {
              const val = Math.max(0, Math.min(100, Number(e.target.value)))
              handleProgressChange(val, maxProgress)
            }}
            className="h-8 w-16 text-xs"
            placeholder="0"
          />
          <span className="text-xs text-gray-400">-</span>
          <Input
            type="number"
            min="0"
            max="100"
            value={maxProgress}
            onChange={(e) => {
              const val = Math.max(0, Math.min(100, Number(e.target.value)))
              handleProgressChange(minProgress, val)
            }}
            className="h-8 w-16 text-xs"
            placeholder="100"
          />
          <span className="text-xs text-gray-400">%</span>
        </div>

        <div className="h-4 w-px bg-gray-300" /> {/* Divider */}

        {/* Time Filter - Compact */}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-gray-600 whitespace-nowrap">Thời gian:</Label>
          <Select value={timeFilter} onValueChange={handleTimeFilterChange}>
            <SelectTrigger className="h-8 w-36 text-xs">
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

        {/* Custom Date Range - Inline */}
        {timeFilter === 'custom' && (
          <>
            <Input
              type="date"
              value={customStartDate}
              onChange={(e) => handleCustomDateChange(e.target.value, customEndDate)}
              className="h-8 w-36 text-xs"
            />
            <span className="text-xs text-gray-400">→</span>
            <Input
              type="date"
              value={customEndDate}
              onChange={(e) => handleCustomDateChange(customStartDate, e.target.value)}
              className="h-8 w-36 text-xs"
            />
          </>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs px-2">
              <X className="h-3 w-3 mr-1" />
              Xóa
            </Button>
            <Badge variant="secondary" className="text-xs h-6 px-2">
              {
                (statusFilter !== 'all' ? 1 : 0) + 
                (minProgress > 0 || maxProgress < 100 ? 1 : 0) + 
                (timeFilter !== 'all' ? 1 : 0)
              }
            </Badge>
          </>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions - Right Side */}
        <div className="flex items-center gap-2">
          {/* Realtime Indicator */}
          <Badge variant={isRealtime ? 'default' : 'secondary'} className="text-xs h-6 gap-1 px-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isRealtime ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            {isRealtime ? 'Live' : 'Offline'}
          </Badge>

          {/* Refresh Button */}
          <Button variant="outline" size="sm" onClick={onRefresh} className="h-8 w-8 p-0">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>

          {/* Export Button */}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport} className="h-8 text-xs px-2">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Xuất
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
