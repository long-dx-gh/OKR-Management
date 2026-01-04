/**
 * CommentSection Component
 * Display and manage comments for objectives/key results
 * V1 Feature #1: Team Collaboration Suite
 */

import { useState, useEffect } from 'react'
import { MessageSquare, Loader2 } from 'lucide-react'
import { CommentWithDetails, CreateCommentInput } from '../../types'
import { fetchComments, createComment, subscribeToComments } from '../../services/comment.service'
import CommentItem from './CommentItem'
import CommentForm from './CommentForm'

interface CommentSectionProps {
  objective_id?: string
  key_result_id?: string
  className?: string
}

export default function CommentSection({
  objective_id,
  key_result_id,
  className = '',
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Load comments
  useEffect(() => {
    loadComments()
  }, [objective_id, key_result_id])

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToComments(
      { objective_id, key_result_id },
      () => {
        // Reload comments when changes detected
        loadComments()
      }
    )

    return unsubscribe
  }, [objective_id, key_result_id])

  async function loadComments() {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchComments({ objective_id, key_result_id })
      setComments(data)
    } catch (err: any) {
      console.error('Failed to load comments:', err)
      setError(err.message || 'Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitComment(content: string) {
    if (!content.trim()) return

    try {
      setSubmitting(true)
      setError(null)

      const input: CreateCommentInput = {
        content: content.trim(),
        objective_id,
        key_result_id,
      }

      const newComment = await createComment(input)
      setComments((prev) => [newComment, ...prev])
    } catch (err: any) {
      console.error('Failed to create comment:', err)
      setError(err.message || 'Failed to create comment')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReply(parent_id: string, content: string) {
    if (!content.trim()) return

    try {
      const input: CreateCommentInput = {
        content: content.trim(),
        objective_id,
        key_result_id,
        parent_id,
      }

      await createComment(input)
      // Real-time subscription will update the UI
      await loadComments()
    } catch (err: any) {
      console.error('Failed to reply:', err)
      setError(err.message || 'Failed to reply')
    }
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">
              Comments {comments.length > 0 && `(${comments.length})`}
            </h3>
          </div>
        </div>
      </div>

      {/* Comment Form */}
      <div className="px-6 py-4 border-b border-gray-200">
        <CommentForm
          onSubmit={handleSubmitComment}
          submitting={submitting}
          placeholder="Add a comment..."
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-100">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Comments List */}
      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            <span className="ml-2 text-sm text-gray-500">Loading comments...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No comments yet</p>
            <p className="text-xs text-gray-400 mt-1">Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onDelete={loadComments}
            />
          ))
        )}
      </div>
    </div>
  )
}
