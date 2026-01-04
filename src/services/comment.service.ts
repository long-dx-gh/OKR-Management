/**
 * Comment Service
 * Service layer for comments, reactions, and activity feed
 * V1 Feature #1: Team Collaboration Suite
 */

import { supabase } from './supabase'
import type {
  CommentWithDetails,
  CreateCommentInput,
  UpdateCommentInput,
  AddReactionInput,
  ActivityWithUser,
  CommentReaction,
} from '../types'

/**
 * Fetch comments for an objective or key result
 */
export async function fetchComments(params: {
  objective_id?: string
  key_result_id?: string
}): Promise<CommentWithDetails[]> {
  try {
    console.log('📥 Fetching comments...', params)

    let query = supabase
      .from('comments')
      .select(`
        *,
        user:profiles!comments_user_id_fkey (
          id,
          email,
          full_name,
          avatar_url
        ),
        reactions:comment_reactions (
          id,
          comment_id,
          user_id,
          emoji,
          created_at,
          user:profiles!comment_reactions_user_id_fkey (
            id,
            email,
            full_name,
            avatar_url
          )
        )
      `)
      .is('parent_id', null) // Only top-level comments
      .order('created_at', { ascending: false })

    // Filter by objective or key result
    if (params.objective_id) {
      query = query.eq('objective_id', params.objective_id)
    }
    if (params.key_result_id) {
      query = query.eq('key_result_id', params.key_result_id)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Error fetching comments:', error)
      throw error
    }

    // Fetch replies for each comment
    const commentsWithReplies = await Promise.all(
      (data || []).map(async (comment) => {
        const replies = await fetchReplies(comment.id)
        return {
          ...comment,
          replies,
          reply_count: replies.length,
        }
      })
    )

    console.log('✅ Comments fetched:', commentsWithReplies.length)
    return commentsWithReplies
  } catch (error) {
    console.error('❌ fetchComments error:', error)
    throw error
  }
}

/**
 * Fetch replies for a comment (recursive for nested replies)
 */
export async function fetchReplies(parent_id: string): Promise<CommentWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:profiles!comments_user_id_fkey (
          id,
          email,
          full_name,
          avatar_url
        ),
        reactions:comment_reactions (
          id,
          comment_id,
          user_id,
          emoji,
          created_at,
          user:profiles!comment_reactions_user_id_fkey (
            id,
            email,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('parent_id', parent_id)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Recursively fetch replies for nested comments
    const repliesWithNested = await Promise.all(
      (data || []).map(async (reply) => {
        const nestedReplies = await fetchReplies(reply.id)
        return {
          ...reply,
          replies: nestedReplies,
          reply_count: nestedReplies.length,
        }
      })
    )

    return repliesWithNested
  } catch (error) {
    console.error('❌ fetchReplies error:', error)
    return []
  }
}

/**
 * Create a new comment
 */
export async function createComment(input: CreateCommentInput): Promise<CommentWithDetails> {
  try {
    console.log('📝 Creating comment...', input)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('comments')
      .insert({
        objective_id: input.objective_id || null,
        key_result_id: input.key_result_id || null,
        user_id: user.id,
        content: input.content,
        parent_id: input.parent_id || null,
      })
      .select(`
        *,
        user:profiles!comments_user_id_fkey (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('❌ Error creating comment:', error)
      throw error
    }

    console.log('✅ Comment created:', data.id)
    return { ...data, reactions: [], replies: [], reply_count: 0 }
  } catch (error) {
    console.error('❌ createComment error:', error)
    throw error
  }
}

/**
 * Update a comment
 */
export async function updateComment(input: UpdateCommentInput): Promise<CommentWithDetails> {
  try {
    console.log('✏️ Updating comment...', input)

    const { data, error } = await supabase
      .from('comments')
      .update({
        content: input.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.id)
      .select(`
        *,
        user:profiles!comments_user_id_fkey (
          id,
          email,
          full_name,
          avatar_url
        ),
        reactions:comment_reactions (
          id,
          comment_id,
          user_id,
          emoji,
          created_at
        )
      `)
      .single()

    if (error) {
      console.error('❌ Error updating comment:', error)
      throw error
    }

    console.log('✅ Comment updated:', data.id)
    return data
  } catch (error) {
    console.error('❌ updateComment error:', error)
    throw error
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(id: string): Promise<void> {
  try {
    console.log('🗑️ Deleting comment...', id)

    // Delete reactions first (cascade should handle this, but being explicit)
    await supabase.from('comment_reactions').delete().eq('comment_id', id)

    // Delete replies recursively
    const { data: replies } = await supabase
      .from('comments')
      .select('id')
      .eq('parent_id', id)

    if (replies && replies.length > 0) {
      await Promise.all(replies.map((reply) => deleteComment(reply.id)))
    }

    // Delete the comment
    const { error } = await supabase.from('comments').delete().eq('id', id)

    if (error) {
      console.error('❌ Error deleting comment:', error)
      throw error
    }

    console.log('✅ Comment deleted:', id)
  } catch (error) {
    console.error('❌ deleteComment error:', error)
    throw error
  }
}

/**
 * Add a reaction to a comment
 */
export async function addReaction(input: AddReactionInput): Promise<CommentReaction> {
  try {
    console.log('👍 Adding reaction...', input)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Check if user already reacted with this emoji
    const { data: existing } = await supabase
      .from('comment_reactions')
      .select(`
        *,
        user:profiles!comment_reactions_user_id_fkey (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('comment_id', input.comment_id)
      .eq('user_id', user.id)
      .eq('emoji', input.emoji)
      .single()

    if (existing) {
      console.log('⚠️ Reaction already exists')
      return existing
    }

    const { data, error } = await supabase
      .from('comment_reactions')
      .insert({
        comment_id: input.comment_id,
        user_id: user.id,
        emoji: input.emoji,
      })
      .select(`
        *,
        user:profiles!comment_reactions_user_id_fkey (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('❌ Error adding reaction:', error)
      throw error
    }

    console.log('✅ Reaction added:', data.id)
    return data
  } catch (error) {
    console.error('❌ addReaction error:', error)
    throw error
  }
}

/**
 * Remove a reaction from a comment
 */
export async function removeReaction(comment_id: string, emoji: string): Promise<void> {
  try {
    console.log('👎 Removing reaction...', { comment_id, emoji })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('comment_reactions')
      .delete()
      .eq('comment_id', comment_id)
      .eq('user_id', user.id)
      .eq('emoji', emoji)

    if (error) {
      console.error('❌ Error removing reaction:', error)
      throw error
    }

    console.log('✅ Reaction removed')
  } catch (error) {
    console.error('❌ removeReaction error:', error)
    throw error
  }
}

/**
 * Fetch activity feed
 */
export async function fetchActivities(limit = 50): Promise<ActivityWithUser[]> {
  try {
    console.log('📊 Fetching activities...')

    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        user:profiles!activities_user_id_fkey (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('❌ Error fetching activities:', error)
      throw error
    }

    console.log('✅ Activities fetched:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('❌ fetchActivities error:', error)
    throw error
  }
}

/**
 * Subscribe to real-time comment updates
 */
export function subscribeToComments(
  params: { objective_id?: string; key_result_id?: string },
  callback: (payload: any) => void
) {
  console.log('🔔 Subscribing to comments...', params)

  const channel = supabase
    .channel('comments-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: params.objective_id
          ? `objective_id=eq.${params.objective_id}`
          : params.key_result_id
          ? `key_result_id=eq.${params.key_result_id}`
          : undefined,
      },
      (payload) => {
        console.log('🔔 Comment change:', payload)
        callback(payload)
      }
    )
    .subscribe()

  return () => {
    console.log('🔕 Unsubscribing from comments')
    channel.unsubscribe()
  }
}

/**
 * Subscribe to real-time activity updates
 */
export function subscribeToActivities(callback: (payload: any) => void) {
  console.log('🔔 Subscribing to activities...')

  const channel = supabase
    .channel('activities-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'activities',
      },
      (payload) => {
        console.log('🔔 New activity:', payload)
        callback(payload)
      }
    )
    .subscribe()

  return () => {
    console.log('🔕 Unsubscribing from activities')
    channel.unsubscribe()
  }
}
