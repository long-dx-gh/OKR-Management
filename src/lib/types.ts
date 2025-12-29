/**
 * Database Types
 * TypeScript types cho Supabase database schema
 */

export type UserRole = 'admin' | 'member' | 'viewer';
export type ObjectiveStatus = 'on-track' | 'at-risk' | 'off-track';

// Profile (User) type
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Objective type
export interface DbObjective {
  id: string;
  title: string;
  description: string | null;
  owner_id: string | null;
  status: ObjectiveStatus;
  progress: number;
  due_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Key Result type
export interface DbKeyResult {
  id: string;
  objective_id: string;
  title: string;
  progress: number;
  target: number;
  unit: string;
  owner_id: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

// Team Member type
export interface TeamMember {
  id: string;
  user_id: string;
  role: UserRole;
  invited_by: string | null;
  created_at: string;
}

// Objective with details
export interface ObjectiveWithDetails extends DbObjective {
  owner?: Profile;
  created_by_user?: Profile;
  key_results?: KeyResultWithOwner[];
}

// Key Result with owner
export interface KeyResultWithOwner extends DbKeyResult {
  owner?: Profile;
}

// Form Input Types
export interface CreateObjectiveInput {
  title: string;
  description?: string;
  owner_id?: string;
  status?: ObjectiveStatus;
  progress?: number;
  due_date?: string;
}

export interface UpdateObjectiveInput extends Partial<CreateObjectiveInput> {
  id: string;
}

export interface CreateKeyResultInput {
  objective_id: string;
  title: string;
  target: number;
  unit?: string;
  owner_id?: string;
  due_date?: string;
}

export interface UpdateKeyResultInput extends Partial<Omit<CreateKeyResultInput, 'objective_id'>> {
  id: string;
  progress?: number;
}

// Auth Types
export interface SignUpData {
  email: string;
  password: string;
  full_name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile?: Profile;
}
