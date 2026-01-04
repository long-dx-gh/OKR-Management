/**
 * CommentItem Component
 * Display a single comment with reactions and replies
 * V1 Feature #1: Team Collaboration Suite
 */

import { useState } from 'react'
import { MoreHorizontal, Reply, Edit2, Trash2 } from 'lucide-react'
import { CommentWithDetails } from '../../types'
import {
  updateComment,
  deleteComment,
  addReaction,
  removeReaction,
} from '../../services/comment.service'
import CommentForm from './CommentForm'
import { supabase } from '../../services/supabase'

interface CommentItemProps {
  comment: CommentWithDetails
  onReply?: (parent_id: string, content: string) => Promise<void>
  onDelete?: () => void
  level?: number // Nesting level for indentation
}

export default function CommentItem({
  comment,
  onReply,
  onDelete,
  level = 0,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [submitting, setSubmitting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Get current user
  useState(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null)
    })
  })

  const isOwner = currentUserId === comment.user_id
  const maxNestingLevel = 3 // Limit reply nesting

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

  // Handle edit
  async function handleEdit() {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false)
      return
    }

    try {
      setSubmitting(true)
      await updateComment({ id: comment.id, content: editContent.trim() })
      setIsEditing(false)
      comment.content = editContent.trim() // Optimistic update
    } catch (error) {
      console.error('Failed to update comment:', error)
      alert('Failed to update comment')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle delete
  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await deleteComment(comment.id)
      onDelete?.()
    } catch (error) {
      console.error('Failed to delete comment:', error)
      alert('Failed to delete comment')
    }
  }

  // Handle reaction
  async function handleReaction(emoji: string) {
    try {
      // Check if user already reacted
      const userReaction = comment.reactions?.find(
        (r) => r.user_id === currentUserId && r.emoji === emoji
      )

      if (userReaction) {
        await removeReaction(comment.id, emoji)
        comment.reactions = comment.reactions?.filter((r) => r.id !== userReaction.id)
      } else {
        const newReaction = await addReaction({ comment_id: comment.id, emoji })
        comment.reactions = [...(comment.reactions || []), newReaction]
      }
    } catch (error) {
      console.error('Failed to toggle reaction:', error)
    }
  }

  // Handle reply
  async function handleReplySubmit(content: string) {
    if (!onReply || !content.trim()) return

    try {
      setSubmitting(true)
      await onReply(comment.id, content)
      setIsReplying(false)
    } catch (error) {
      console.error('Failed to reply:', error)
      alert('Failed to reply')
    } finally {
      setSubmitting(false)
    }
  }

  // Group reactions by emoji
  const groupedReactions = comment.reactions?.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = []
    }
    acc[reaction.emoji].push(reaction)
    return acc
  }, {} as Record<string, typeof comment.reactions>)

  return (
    <div className={`px-6 py-4 ${level > 0 ? 'ml-8 border-l-2 border-gray-200' : ''}`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.user?.avatar_url ? (
            <img
              src={comment.user.avatar_url}
              alt={comment.user.full_name || comment.user.email}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-sm font-medium text-indigo-600">
                {comment.user?.full_name?.[0] || comment.user?.email?.[0] || '?'}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* User & Time */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {comment.user?.full_name || comment.user?.email || 'Unknown'}
            </span>
            <span className="text-xs text-gray-500">{formatTime(comment.created_at)}</span>
            {comment.updated_at !== comment.created_at && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>

          {/* Comment Text */}
          {isEditing ? (
            <div className="mb-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                disabled={submitting}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleEdit}
                  disabled={submitting}
                  className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditContent(comment.content)
                  }}
                  disabled={submitting}
                  className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{comment.content}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Reactions */}
            <div className="flex items-center gap-1">
              {['👍', '❤️', '🎉', '👏'].map((emoji) => {
                const count = groupedReactions?.[emoji]?.length || 0
                const hasReacted = groupedReactions?.[emoji]?.some(
                  (r) => r.user_id === currentUserId
                )
                return (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className={`px-2 py-1 text-xs rounded-full transition-colors ${
                      hasReacted
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {emoji} {count > 0 && count}
                  </button>
                )
              })}
            </div>

            {/* Reply */}
            {level < maxNestingLevel && onReply && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600"
              >
                <Reply className="w-3 h-3" />
                Reply
              </button>
            )}

            {/* Menu (Edit/Delete) */}
            {isOwner && (
              <div className="relative ml-auto">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={() => {
                        setIsEditing(true)
                        setShowMenu(false)
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDelete()
                        setShowMenu(false)
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-3">
              <CommentForm
                onSubmit={handleReplySubmit}
                submitting={submitting}
                placeholder="Write a reply..."
                onCancel={() => setIsReplying(false)}
              />
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onDelete={onDelete}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
