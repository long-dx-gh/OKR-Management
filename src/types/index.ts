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
  parent_id: string | null // Reference to parent objective for hierarchy
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
  parent?: DbObjective // Parent objective data (if exists)
  children?: ObjectiveWithDetails[] // Child objectives (for tree view)
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
  parent_id?: string // Reference to parent objective
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

// ============================================
// V1 Feature #2: Analytics & Insights Types
// ============================================

// Overall OKR Statistics
export interface OKRStatistics {
  total_objectives: number
  total_key_results: number
  active_users: number
  avg_progress: number
  on_track_count: number
  at_risk_count: number
  off_track_count: number
  completed_count: number
  overdue_count: number
}

// Progress Over Time
export interface ProgressOverTime {
  date: string
  objectives_updated: number
  avg_progress: number
}

// Team Performance
export interface TeamPerformance {
  user_id: string
  full_name: string | null
  email: string
  owned_objectives: number
  avg_progress: number
  on_track: number
  at_risk: number
  off_track: number
  owned_key_results: number
  total_comments: number
  total_activities: number
}

// Status Distribution
export interface StatusDistribution {
  week: string
  status: ObjectiveStatus
  count: number
}

// Completion Rate
export interface CompletionRate {
  month: string
  total_objectives: number
  completed_objectives: number
  completion_percentage: number
}

// Objective Progress Trend
export interface ProgressTrend {
  date: string
  progress: number
}

// Team Velocity
export interface TeamVelocity {
  week: string
  completed_count: number
  created_count: number
  velocity_score: number
}

// User Engagement
export interface UserEngagement {
  user_id: string
  engagement_score: number
  activities_count: number
  comments_count: number
  objectives_created: number
  last_activity: string
}

// Top Performer
export interface TopPerformer {
  user_id: string
  full_name: string | null
  email: string
  avg_progress: number
  objectives_count: number
  on_track_count: number
}

// Chart Data Point (for recharts)
export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: string | number
}

// Dashboard Summary
export interface DashboardSummary {
  statistics: OKRStatistics
  progressTrend: ProgressOverTime[]
  teamPerformance: TeamPerformance[]
  topPerformers: TopPerformer[]
  velocity: TeamVelocity[]
}

// ============================================
// V2 Feature: OKR Visualization & Mapping Types
// ============================================

// Node type cho visualization
export interface OKRNode {
  id: string
  type: 'objective' | 'keyResult' | 'user'
  label: string
  data: {
    title?: string
    progress?: number
    status?: ObjectiveStatus
    owner?: Profile
    due_date?: string | null
    description?: string | null
    target?: number
    unit?: string
  }
  position?: { x: number; y: number }
  style?: Record<string, any>
}

// Edge/Link type cho visualization
export interface OKREdge {
  id: string
  source: string
  target: string
  type?: 'default' | 'smoothstep' | 'step' | 'straight'
  animated?: boolean
  label?: string
  style?: Record<string, any>
}

// Visualization Data Structure
export interface OKRVisualizationData {
  nodes: OKRNode[]
  edges: OKREdge[]
  metadata: {
    total_nodes: number
    total_edges: number
    last_updated: string
  }
}

// Filter options for visualization
export interface OKRVisualizationFilters {
  status?: ObjectiveStatus[]
  owner_ids?: string[]
  progress_min?: number
  progress_max?: number
  date_range?: {
    start: string
    end: string
  }
  search_query?: string
}

// Real-time update event types
export type OKRUpdateEventType = 
  | 'objective:created'
  | 'objective:updated'
  | 'objective:deleted'
  | 'keyresult:created'
  | 'keyresult:updated'
  | 'keyresult:deleted'
  | 'progress:updated'

// Real-time update payload
export interface OKRRealtimeUpdate {
  type: OKRUpdateEventType
  payload: {
    id: string
    data?: any
    timestamp: string
  }
}

// Visualization Layout Options
export type VisualizationLayout = 'hierarchy' | 'force' | 'circular' | 'grid'

// Visualization Settings
export interface VisualizationSettings {
  layout: VisualizationLayout
  showProgress: boolean
  showOwners: boolean
  showDates: boolean
  enableAnimations: boolean
  nodeSize: 'small' | 'medium' | 'large'
  colorScheme: 'status' | 'owner' | 'progress'
}

// ============================================
// Dashboard Summary
// ============================================
