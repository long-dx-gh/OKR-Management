/**
 * ActivityFeed Component
 * Display recent activities and team updates
 * V1 Feature #1: Team Collaboration Suite
 */

import { useState, useEffect } from 'react'
import { Activity, Loader2, Target, CheckCircle2, MessageCircle, Edit, Trash2 } from 'lucide-react'
import { ActivityWithUser } from '../lib/types'
import { fetchActivities, subscribeToActivities } from '../lib/comment-service'

interface ActivityFeedProps {
  limit?: number
  className?: string
}

export default function ActivityFeed({ limit = 50, className = '' }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load activities
  useEffect(() => {
    loadActivities()
  }, [limit])

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToActivities((payload) => {
      if (payload.eventType === 'INSERT') {
        setActivities((prev) => [payload.new, ...prev].slice(0, limit))
      }
    })

    return unsubscribe
  }, [limit])

  async function loadActivities() {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchActivities(limit)
      setActivities(data)
    } catch (err: any) {
      console.error('Failed to load activities:', err)
      setError(err.message || 'Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  // Get icon for activity
  const getActivityIcon = (action: string, entity_type: string) => {
    if (action === 'created') {
      if (entity_type === 'objective') return <Target className="w-4 h-4 text-blue-500" />
      if (entity_type === 'key_result') return <CheckCircle2 className="w-4 h-4 text-green-500" />
      if (entity_type === 'comment') return <MessageCircle className="w-4 h-4 text-purple-500" />
    }
    if (action === 'updated') return <Edit className="w-4 h-4 text-orange-500" />
    if (action === 'deleted') return <Trash2 className="w-4 h-4 text-red-500" />
    if (action === 'commented') return <MessageCircle className="w-4 h-4 text-purple-500" />
    if (action === 'completed') return <CheckCircle2 className="w-4 h-4 text-green-600" />

    return <Activity className="w-4 h-4 text-gray-500" />
  }

  // Get action text
  const getActionText = (activity: ActivityWithUser) => {
    const entityName = activity.entity_title || 'an item'

    const actions: Record<string, string> = {
      created: `created ${activity.entity_type} "${entityName}"`,
      updated: `updated ${activity.entity_type} "${entityName}"`,
      deleted: `deleted ${activity.entity_type} "${entityName}"`,
      commented: `commented on ${activity.entity_type} "${entityName}"`,
      completed: `completed ${activity.entity_type} "${entityName}"`,
    }

    return actions[activity.action] || `${activity.action} ${activity.entity_type} "${entityName}"`
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-gray-700" />
          <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border-b border-red-100">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Activities List */}
      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            <span className="ml-2 text-xs text-gray-500">Loading activities...</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Activity className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0 mt-0.5">
                  {activity.user?.avatar_url ? (
                    <img
                      src={activity.user.avatar_url}
                      alt={activity.user.full_name || activity.user.email}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-indigo-600">
                        {activity.user?.full_name?.[0] || activity.user?.email?.[0] || '?'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    {getActivityIcon(activity.action, activity.entity_type)}
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">
                          {activity.user?.full_name || activity.user?.email || 'Someone'}
                        </span>{' '}
                        {getActionText(activity)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatTime(activity.created_at)}
                      </p>

                      {/* Metadata (if any) */}
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-1 text-xs text-gray-600">
                          {activity.metadata.progress !== undefined && (
                            <span className="inline-flex items-center gap-1">
                              Progress: {activity.metadata.progress}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
