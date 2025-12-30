/**
 * Database Types
 * TypeScript types cho Supabase database schema
 */

export type UserRole = 'admin' | 'member' | 'viewer'
export type ObjectiveStatus = 'on-track' | 'at-risk' | 'off-track'

// Profile (User) type
export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

// Objective type - map với DB schema
export interface DbObjective {
  id: string
  title: string
  description: string | null
  owner_id: string | null
  status: ObjectiveStatus
  progress: number
  due_date: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// Key Result type - map với DB schema
export interface DbKeyResult {
  id: string
  objective_id: string
  title: string
  progress: number
  target: number
  unit: string
  owner_id: string | null
  due_date: string | null
  created_at: string
  updated_at: string
}

// Team Member type
export interface TeamMember {
  id: string
  user_id: string
  role: UserRole
  invited_by: string | null
  created_at: string
}

// ============================================
// Frontend Types (với populated data)
// ============================================

// Objective với owner info và key results
export interface ObjectiveWithDetails extends DbObjective {
  owner?: Profile
  created_by_user?: Profile
  key_results?: KeyResultWithOwner[]
}

// Key Result với owner info
export interface KeyResultWithOwner extends DbKeyResult {
  owner?: Profile
}

// ============================================
// Form Input Types
// ============================================

export interface CreateObjectiveInput {
  title: string
  description?: string
  owner_id?: string
  status?: ObjectiveStatus
  progress?: number
  due_date?: string
}

export interface UpdateObjectiveInput extends Partial<CreateObjectiveInput> {
  id: string
}

export interface CreateKeyResultInput {
  objective_id: string
  title: string
  target: number
  unit?: string
  owner_id?: string
  due_date?: string
}

export interface UpdateKeyResultInput extends Partial<Omit<CreateKeyResultInput, 'objective_id'>> {
  id: string
  progress?: number
}

// ============================================
// Auth Types
// ============================================

export interface SignUpData {
  email: string
  password: string
  full_name?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  email: string
  profile?: Profile
}

// ============================================
// V1 Feature #1: Comments & Activity Feed Types
// ============================================

// Comment type - map with DB schema
export interface DbComment {
  id: string
  objective_id: string | null
  key_result_id: string | null
  user_id: string
  content: string
  parent_id: string | null  // For threaded replies
  created_at: string
  updated_at: string
}

// Comment with user info and reactions
export interface CommentWithDetails extends DbComment {
  user?: Profile
  reactions?: CommentReaction[]
  replies?: CommentWithDetails[]  // Nested replies
  reply_count?: number
}

// Comment Reaction type
export interface CommentReaction {
  id: string
  comment_id: string
  user_id: string
  emoji: string
  created_at: string
  user?: Profile
}

// Activity type - map with DB schema
export interface DbActivity {
  id: string
  user_id: string
  action: string  // 'created', 'updated', 'commented', 'completed'
  entity_type: string  // 'objective', 'key_result', 'comment'
  entity_id: string
  entity_title: string | null
  metadata: Record<string, any> | null
  created_at: string
}

// Activity with user info
export interface ActivityWithUser extends DbActivity {
  user?: Profile
}

// ============================================
// Comment Input Types
// ============================================

export interface CreateCommentInput {
  objective_id?: string
  key_result_id?: string
  content: string
  parent_id?: string  // For replies
}

export interface UpdateCommentInput {
  id: string
  content: string
}

export interface AddReactionInput {
  comment_id: string
  emoji: string
}
