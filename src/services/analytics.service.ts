/**
 * Analytics Service
 * Service layer for analytics and insights
 * V1 Feature #2: Analytics & Insights Dashboard
 */

import { supabase } from './supabase'
import type {
  OKRStatistics,
  ProgressOverTime,
  TeamPerformance,
  StatusDistribution,
  CompletionRate,
  ProgressTrend,
  TeamVelocity,
  UserEngagement,
  TopPerformer,
  DashboardSummary,
} from '../types'

/**
 * Fetch overall OKR statistics
 */
export async function fetchOKRStatistics(): Promise<OKRStatistics | null> {
  try {
    console.log('📊 Fetching OKR statistics...')

    const { data, error } = await supabase
      .from('okr_statistics')
      .select('*')
      .single()

    if (error) {
      console.error('❌ Error fetching statistics:', error)
      throw error
    }

    console.log('✅ Statistics fetched:', data)
    return data
  } catch (error) {
    console.error('❌ fetchOKRStatistics error:', error)
    return null
  }
}

/**
 * Fetch progress over time (last 30 days)
 */
export async function fetchProgressOverTime(): Promise<ProgressOverTime[]> {
  try {
    console.log('📈 Fetching progress over time...')

    const { data, error } = await supabase
      .from('progress_over_time')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      console.error('❌ Error fetching progress:', error)
      throw error
    }

    console.log('✅ Progress trend fetched:', data?.length || 0, 'data points')
    return data || []
  } catch (error) {
    console.error('❌ fetchProgressOverTime error:', error)
    return []
  }
}

/**
 * Fetch team performance metrics
 */
export async function fetchTeamPerformance(): Promise<TeamPerformance[]> {
  try {
    console.log('👥 Fetching team performance...')

    const { data, error } = await supabase
      .from('team_performance')
      .select('*')
      .order('avg_progress', { ascending: false, nullsFirst: false })

    if (error) {
      console.error('❌ Error fetching team performance:', error)
      throw error
    }

    console.log('✅ Team performance fetched:', data?.length || 0, 'members')
    return data || []
  } catch (error) {
    console.error('❌ fetchTeamPerformance error:', error)
    return []
  }
}

/**
 * Fetch status distribution by week
 */
export async function fetchStatusDistribution(): Promise<StatusDistribution[]> {
  try {
    console.log('📊 Fetching status distribution...')

    const { data, error } = await supabase
      .from('status_distribution')
      .select('*')
      .order('week', { ascending: false })
      .limit(12) // Last 12 weeks

    if (error) {
      console.error('❌ Error fetching status distribution:', error)
      throw error
    }

    console.log('✅ Status distribution fetched:', data?.length || 0, 'weeks')
    return data || []
  } catch (error) {
    console.error('❌ fetchStatusDistribution error:', error)
    return []
  }
}

/**
 * Fetch completion rate by month
 */
export async function fetchCompletionRate(): Promise<CompletionRate[]> {
  try {
    console.log('📈 Fetching completion rate...')

    const { data, error } = await supabase
      .from('completion_rate')
      .select('*')
      .order('month', { ascending: false })
      .limit(12) // Last 12 months

    if (error) {
      console.error('❌ Error fetching completion rate:', error)
      throw error
    }

    console.log('✅ Completion rate fetched:', data?.length || 0, 'months')
    return data || []
  } catch (error) {
    console.error('❌ fetchCompletionRate error:', error)
    return []
  }
}

/**
 * Get progress trend for specific objective
 */
export async function getObjectiveProgressTrend(
  objectiveId: string
): Promise<ProgressTrend[]> {
  try {
    console.log('📊 Fetching objective progress trend...', objectiveId)

    const { data, error } = await supabase.rpc('get_objective_progress_trend', {
      objective_uuid: objectiveId,
    })

    if (error) {
      console.error('❌ Error fetching progress trend:', error)
      throw error
    }

    console.log('✅ Progress trend fetched:', data?.length || 0, 'data points')
    return data || []
  } catch (error) {
    console.error('❌ getObjectiveProgressTrend error:', error)
    return []
  }
}

/**
 * Get team velocity (objectives completed per week)
 */
export async function getTeamVelocity(weeks: number = 12): Promise<TeamVelocity[]> {
  try {
    console.log('🚀 Fetching team velocity...')

    const { data, error } = await supabase.rpc('get_team_velocity', {
      weeks,
    })

    if (error) {
      console.error('❌ Error fetching team velocity:', error)
      throw error
    }

    console.log('✅ Team velocity fetched:', data?.length || 0, 'weeks')
    return data || []
  } catch (error) {
    console.error('❌ getTeamVelocity error:', error)
    return []
  }
}

/**
 * Get user engagement score
 */
export async function getUserEngagement(userId: string): Promise<UserEngagement | null> {
  try {
    console.log('📊 Fetching user engagement...', userId)

    const { data, error } = await supabase.rpc('get_user_engagement', {
      user_uuid: userId,
    })

    if (error) {
      console.error('❌ Error fetching user engagement:', error)
      throw error
    }

    console.log('✅ User engagement fetched:', data?.[0])
    return data?.[0] || null
  } catch (error) {
    console.error('❌ getUserEngagement error:', error)
    return null
  }
}

/**
 * Get top performers
 */
export async function getTopPerformers(limit: number = 10): Promise<TopPerformer[]> {
  try {
    console.log('🏆 Fetching top performers...')

    const { data, error } = await supabase.rpc('get_top_performers', {
      limit_count: limit,
    })

    if (error) {
      console.error('❌ Error fetching top performers:', error)
      throw error
    }

    console.log('✅ Top performers fetched:', data?.length || 0, 'members')
    return data || []
  } catch (error) {
    console.error('❌ getTopPerformers error:', error)
    return []
  }
}

/**
 * Fetch complete dashboard summary
 * This is a convenience function that fetches all dashboard data at once
 */
export async function fetchDashboardSummary(): Promise<DashboardSummary | null> {
  try {
    console.log('📊 Fetching complete dashboard summary...')

    const [statistics, progressTrend, teamPerformance, topPerformers, velocity] =
      await Promise.all([
        fetchOKRStatistics(),
        fetchProgressOverTime(),
        fetchTeamPerformance(),
        getTopPerformers(5),
        getTeamVelocity(8),
      ])

    if (!statistics) {
      throw new Error('Failed to fetch statistics')
    }

    const summary: DashboardSummary = {
      statistics,
      progressTrend,
      teamPerformance,
      topPerformers,
      velocity,
    }

    console.log('✅ Dashboard summary fetched successfully')
    return summary
  } catch (error) {
    console.error('❌ fetchDashboardSummary error:', error)
    return null
  }
}

/**
 * Calculate health score (0-100) based on multiple factors
 */
export function calculateHealthScore(stats: OKRStatistics): number {
  if (!stats || stats.total_objectives === 0) return 0

  const progressWeight = 0.4
  const statusWeight = 0.3
  const completionWeight = 0.2
  const timelinessWeight = 0.1

  const progressScore = stats.avg_progress
  const statusScore =
    ((stats.on_track_count * 100 +
      stats.at_risk_count * 50 +
      stats.off_track_count * 0) /
      stats.total_objectives) *
    1

  const completionScore =
    (stats.completed_count / stats.total_objectives) * 100

  const timelinessScore =
    ((stats.total_objectives - stats.overdue_count) / stats.total_objectives) *
    100

  const healthScore =
    progressScore * progressWeight +
    statusScore * statusWeight +
    completionScore * completionWeight +
    timelinessScore * timelinessWeight

  return Math.round(Math.min(Math.max(healthScore, 0), 100))
}

/**
 * Get health status based on score
 */
export function getHealthStatus(
  score: number
): { label: string; color: string; icon: string } {
  if (score >= 80)
    return { label: 'Excellent', color: 'text-green-600', icon: '🎉' }
  if (score >= 60) return { label: 'Good', color: 'text-blue-600', icon: '👍' }
  if (score >= 40)
    return { label: 'Fair', color: 'text-yellow-600', icon: '⚠️' }
  return { label: 'Needs Attention', color: 'text-red-600', icon: '🚨' }
}
