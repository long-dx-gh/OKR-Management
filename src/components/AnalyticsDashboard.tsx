/**
 * AnalyticsDashboard Component  
 * Main analytics and insights dashboard
 * V1 Feature #2: Analytics & Insights Dashboard
 */

import { useState, useEffect } from 'react'
import { TrendingUp, Target, Users, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react'
import type { OKRStatistics, ProgressOverTime, TeamPerformance, TopPerformer, TeamVelocity } from '../lib/types'
import {
  fetchDashboardSummary,
  calculateHealthScore,
  getHealthStatus,
} from '../lib/analytics-service'
import SimpleBarChart from './SimpleBarChart'
import SimpleLineChart from './SimpleLineChart'
import SimplePieChart from './SimplePieChart'

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<OKRStatistics | null>(null)
  const [progressTrend, setProgressTrend] = useState<ProgressOverTime[]>([])
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([])
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([])
  const [velocity, setVelocity] = useState<TeamVelocity[]>([])

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      setLoading(true)
      setError(null)

      const summary = await fetchDashboardSummary()

      if (!summary) {
        throw new Error('Failed to load dashboard data')
      }

      setStats(summary.statistics)
      setProgressTrend(summary.progressTrend)
      setTeamPerformance(summary.teamPerformance)
      setTopPerformers(summary.topPerformers)
      setVelocity(summary.velocity)
    } catch (err: any) {
      console.error('Failed to load dashboard:', err)
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Analytics</h3>
            <p className="text-red-600 mb-4">{error || 'Failed to load data'}</p>
            <button
              onClick={loadDashboard}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const healthScore = calculateHealthScore(stats)
  const healthStatus = getHealthStatus(healthScore)

  // Prepare chart data
  const statusChartData = [
    { label: 'On Track', value: stats.on_track_count, color: '#22c55e' }, // green-500
    { label: 'At Risk', value: stats.at_risk_count, color: '#eab308' }, // yellow-500
    { label: 'Off Track', value: stats.off_track_count, color: '#ef4444' }, // red-500
  ]

  const progressChartData = progressTrend.length > 0 
    ? progressTrend.map((p) => ({
        label: new Date(p.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
        value: Math.round(p.avg_progress),
      }))
    : [] // Empty array - chart will show "No data available"

  const velocityChartData = velocity.slice(0, 8).reverse().map((v) => ({
    label: new Date(v.week).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
    value: v.completed_count,
  }))

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Insights</h1>
          <p className="text-gray-600">Track OKR performance and team metrics</p>
        </div>

        {/* Health Score Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 mb-1">Overall Health Score</p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold">{healthScore}</span>
                <span className="text-2xl opacity-75">/100</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-lg">{healthStatus.icon}</span>
                <span className="text-indigo-100">{healthStatus.label}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 mb-2">
                <p className="text-sm opacity-90">Avg Progress</p>
                <p className="text-2xl font-bold">{Math.round(stats.avg_progress)}%</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                <p className="text-sm opacity-90">Completed</p>
                <p className="text-2xl font-bold">{stats.completed_count}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Objectives */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Objectives</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total_objectives}</p>
            <p className="text-xs text-gray-500 mt-2">
              {stats.total_key_results} Key Results
            </p>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Active Users</p>
            <p className="text-3xl font-bold text-gray-900">{stats.active_users}</p>
            <p className="text-xs text-gray-500 mt-2">Team members</p>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-gray-900">{stats.completed_count}</p>
            <p className="text-xs text-gray-500 mt-2">
              {Math.round((stats.completed_count / stats.total_objectives) * 100)}% of total
            </p>
          </div>

          {/* Overdue */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Overdue</p>
            <p className="text-3xl font-bold text-gray-900">{stats.overdue_count}</p>
            <p className="text-xs text-gray-500 mt-2">Needs attention</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Status Distribution
            </h3>
            <SimplePieChart data={statusChartData} size={220} />
          </div>

          {/* Progress Trend */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Trend (30 days)</h3>
            <SimpleLineChart data={progressChartData} height={220} color="#6366f1" />
          </div>
        </div>

        {/* Velocity Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Velocity (Completed per Week)</h3>
          {velocityChartData.length > 0 ? (
            <SimpleBarChart data={velocityChartData} height={200} />
          ) : (
            <div className="flex items-center justify-center h-52 text-gray-400">
              No velocity data yet
            </div>
          )}
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Performers</h3>
          <div className="space-y-3">
            {topPerformers.length > 0 ? (
              topPerformers.map((performer, index) => (
                <div
                  key={performer.user_id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {performer.full_name || performer.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {performer.objectives_count} objectives • {performer.on_track_count} on track
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600">
                      {Math.round(performer.avg_progress)}%
                    </p>
                    <p className="text-xs text-gray-500">Avg Progress</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-8">No performers data yet</p>
            )}
          </div>
        </div>

        {/* Team Performance Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-sm font-medium text-gray-600 pb-3">Member</th>
                  <th className="text-center text-sm font-medium text-gray-600 pb-3">Objectives</th>
                  <th className="text-center text-sm font-medium text-gray-600 pb-3">Avg Progress</th>
                  <th className="text-center text-sm font-medium text-gray-600 pb-3">On Track</th>
                  <th className="text-center text-sm font-medium text-gray-600 pb-3">Comments</th>
                </tr>
              </thead>
              <tbody>
                {teamPerformance.slice(0, 10).map((member) => (
                  <tr key={member.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3">
                      <p className="font-medium text-gray-900">{member.full_name || member.email}</p>
                    </td>
                    <td className="text-center text-gray-700">{member.owned_objectives}</td>
                    <td className="text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                        {Math.round(member.avg_progress || 0)}%
                      </span>
                    </td>
                    <td className="text-center text-green-600 font-medium">{member.on_track}</td>
                    <td className="text-center text-gray-500">{member.total_comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {teamPerformance.length === 0 && (
              <p className="text-center text-gray-400 py-8">No team data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
