/**
 * OKR Service
 * Các functions để thao tác với Objectives và Key Results trong Supabase
 */

import { supabase } from './supabase'
import type {
  DbObjective,
  DbKeyResult,
  ObjectiveWithDetails,
  KeyResultWithOwner,
  CreateObjectiveInput,
  UpdateObjectiveInput,
  CreateKeyResultInput,
  UpdateKeyResultInput,
  Profile,
} from '../types'

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Ensure user profile exists in database
 * This fixes the foreign key constraint issue when creating objectives
 */
async function ensureProfileExists(user: any): Promise<void> {
  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    // If profile doesn't exist, create it
    if (!existingProfile) {
      console.log('📝 Creating profile for user:', user.email)
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email,
          avatar_url: user.user_metadata?.avatar_url || null,
        })

      if (insertError) {
        console.error('❌ Error creating profile:', insertError)
        throw insertError
      }
      
      console.log('✅ Profile created successfully')
    }
  } catch (error) {
    console.error('❌ Error ensuring profile exists:', error)
    throw error
  }
}

// ============================================
// OBJECTIVES CRUD
// ============================================

/**
 * Lấy tất cả objectives với details (owner, key results)
 */
export async function fetchObjectives(): Promise<{
  data: ObjectiveWithDetails[] | null
  error: Error | null
}> {
  try {
    console.log('🔧 [OKR-SERVICE] fetchObjectives called')
    console.log('🔧 [OKR-SERVICE] Supabase client:', !!supabase)
    
    // Ensure current user has profile
    const { data: userData } = await supabase.auth.getUser()
    if (userData.user) {
      await ensureProfileExists(userData.user)
    }
    
    const { data, error } = await supabase
      .from('objectives')
      .select(`
        *,
        owner:profiles!objectives_owner_id_fkey(id, email, full_name, avatar_url),
        created_by_user:profiles!objectives_created_by_fkey(id, email, full_name, avatar_url),
        key_results(
          *,
          owner:profiles(id, email, full_name, avatar_url)
        )
      `)
      .order('created_at', { ascending: false })

    console.log('🔧 [OKR-SERVICE] Supabase response:', { 
      hasData: !!data, 
      dataCount: data?.length,
      hasError: !!error,
      errorCode: (error as any)?.code,
      errorMessage: error?.message,
      errorDetails: (error as any)?.details,
      errorHint: (error as any)?.hint
    })

    if (error) {
      console.error('🔧 [OKR-SERVICE] Supabase error object:', error)
      throw error
    }

    // Map data với correct types
    const objectives: ObjectiveWithDetails[] = (data || []).map((obj: any) => ({
      ...obj,
      owner: obj.owner || undefined,
      created_by_user: obj.created_by_user || undefined,
      key_results: (obj.key_results || []).map((kr: any) => ({
        ...kr,
        owner: kr.owner || undefined,
      })),
    }))

    console.log('✅ [OKR-SERVICE] Successfully fetched', objectives.length, 'objectives')
    return { data: objectives, error: null }
  } catch (error) {
    console.error('❌ [OKR-SERVICE] Error fetching objectives:', error)
    console.error('❌ [OKR-SERVICE] Error details:', {
      message: (error as Error).message,
      name: (error as Error).name,
      stack: (error as Error).stack
    })
    return { data: null, error: error as Error }
  }
}

/**
 * Lấy một objective theo ID
 */
export async function fetchObjectiveById(
  id: string
): Promise<{ data: ObjectiveWithDetails | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('objectives')
      .select(`
        *,
        owner:profiles!objectives_owner_id_fkey(id, email, full_name, avatar_url),
        created_by_user:profiles!objectives_created_by_fkey(id, email, full_name, avatar_url),
        key_results(
          *,
          owner:profiles(id, email, full_name, avatar_url)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    const objective: ObjectiveWithDetails = {
      ...data,
      owner: data.owner || undefined,
      created_by_user: data.created_by_user || undefined,
      key_results: (data.key_results || []).map((kr: any) => ({
        ...kr,
        owner: kr.owner || undefined,
      })),
    }

    return { data: objective, error: null }
  } catch (error) {
    console.error('Error fetching objective:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Tạo objective mới
 */
export async function createObjective(
  input: CreateObjectiveInput
): Promise<{ data: DbObjective | null; error: Error | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('User not authenticated')

    // IMPORTANT: Ensure user profile exists before creating objective
    await ensureProfileExists(userData.user)

    const { data, error } = await supabase
      .from('objectives')
      .insert({
        title: input.title,
        description: input.description || null,
        owner_id: input.owner_id || userData.user.id,
        status: input.status || 'on-track',
        progress: input.progress || 0,
        due_date: input.due_date || null,
        created_by: userData.user.id,
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating objective:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Cập nhật objective
 */
export async function updateObjective(
  input: UpdateObjectiveInput
): Promise<{ data: DbObjective | null; error: Error | null }> {
  try {
    const { id, ...updates } = input

    const { data, error } = await supabase
      .from('objectives')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating objective:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Xóa objective
 */
export async function deleteObjective(
  id: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.from('objectives').delete().eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting objective:', error)
    return { error: error as Error }
  }
}

// ============================================
// KEY RESULTS CRUD
// ============================================

/**
 * Lấy tất cả key results của một objective
 */
export async function fetchKeyResults(
  objectiveId: string
): Promise<{ data: KeyResultWithOwner[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('key_results')
      .select(`
        *,
        owner:profiles(id, email, full_name, avatar_url)
      `)
      .eq('objective_id', objectiveId)
      .order('created_at', { ascending: true })

    if (error) throw error

    const keyResults: KeyResultWithOwner[] = (data || []).map((kr: any) => ({
      ...kr,
      owner: kr.owner || undefined,
    }))

    return { data: keyResults, error: null }
  } catch (error) {
    console.error('Error fetching key results:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Tạo key result mới
 */
export async function createKeyResult(
  input: CreateKeyResultInput
): Promise<{ data: DbKeyResult | null; error: Error | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('key_results')
      .insert({
        objective_id: input.objective_id,
        title: input.title,
        target: input.target,
        progress: 0,
        unit: input.unit || 'số',
        owner_id: input.owner_id || userData.user?.id || null,
        due_date: input.due_date || null,
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating key result:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Cập nhật key result
 */
export async function updateKeyResult(
  input: UpdateKeyResultInput
): Promise<{ data: DbKeyResult | null; error: Error | null }> {
  try {
    const { id, ...updates } = input

    const { data, error } = await supabase
      .from('key_results')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating key result:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Cập nhật key result và tự động recalculate objective progress
 */
export async function updateKeyResultAndRecalculateObjective(
  input: UpdateKeyResultInput
): Promise<{ data: DbKeyResult | null; error: Error | null }> {
  try {
    const { id, ...updates } = input

    // 1. Cập nhật key result
    const { data: updatedKR, error: krError } = await supabase
      .from('key_results')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (krError) throw krError

    // 2. Lấy objective_id từ key result vừa update
    const objectiveId = updatedKR.objective_id

    // 3. Lấy tất cả key results của objective này
    const { data: allKeyResults, error: fetchError } = await supabase
      .from('key_results')
      .select('*')
      .eq('objective_id', objectiveId)

    if (fetchError) throw fetchError

    // 4. Tính toán progress mới
    const newProgress = calculateObjectiveProgress(allKeyResults || [])

    // 5. Cập nhật objective progress
    const { error: objError } = await supabase
      .from('objectives')
      .update({ progress: newProgress })
      .eq('id', objectiveId)

    if (objError) throw objError

    console.log(`✅ Updated objective ${objectiveId} progress to ${newProgress}%`)

    return { data: updatedKR, error: null }
  } catch (error) {
    console.error('Error updating key result and recalculating:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Xóa key result
 */
export async function deleteKeyResult(
  id: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.from('key_results').delete().eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting key result:', error)
    return { error: error as Error }
  }
}

// ============================================
// TEAM MANAGEMENT
// ============================================

/**
 * Lấy danh sách team members
 */
export async function fetchTeamMembers(): Promise<{
  data: Profile[] | null
  error: Error | null
}> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching team members:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Mời team member qua email (sử dụng Supabase Magic Link)
 */
export async function inviteTeamMember(
  email: string
): Promise<{ error: Error | null }> {
  try {
    // Gửi magic link invitation
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/signup`,
      },
    })

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error inviting team member:', error)
    return { error: error as Error }
  }
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

/**
 * Subscribe to objectives changes (realtime)
 */
export function subscribeToObjectives(
  callback: (payload: any) => void
) {
  console.log('🔴 [REALTIME] Creating objectives subscription...');
  
  const subscription = supabase
    .channel('objectives-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'objectives',
      },
      (payload) => {
        console.log('🔴 [REALTIME] Objectives event received:', payload);
        callback(payload);
      }
    )
    .subscribe((status) => {
      console.log('🔴 [REALTIME] Objectives subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ [REALTIME] Successfully subscribed to objectives');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ [REALTIME] Error subscribing to objectives');
      } else if (status === 'TIMED_OUT') {
        console.error('⏱️ [REALTIME] Subscription timed out');
      }
    });

  return subscription;
}

/**
 * Subscribe to key results changes (realtime)
 */
export function subscribeToKeyResults(
  objectiveId: string,
  callback: (payload: any) => void
) {
  console.log('🔴 [REALTIME] Creating key results subscription for:', objectiveId);
  
  const subscription = supabase
    .channel(`key-results-${objectiveId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'key_results',
        filter: `objective_id=eq.${objectiveId}`,
      },
      (payload) => {
        console.log('🔴 [REALTIME] Key Results event received:', payload);
        callback(payload);
      }
    )
    .subscribe((status) => {
      console.log('🔴 [REALTIME] Key Results subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log(`✅ [REALTIME] Successfully subscribed to key_results for objective: ${objectiveId}`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ [REALTIME] Error subscribing to key_results');
      } else if (status === 'TIMED_OUT') {
        console.error('⏱️ [REALTIME] Subscription timed out');
      }
    });

  return subscription
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Tính toán progress của objective dựa trên key results
 */
export function calculateObjectiveProgress(
  keyResults: DbKeyResult[]
): number {
  if (keyResults.length === 0) return 0

  const totalProgress = keyResults.reduce((sum, kr) => {
    const krProgress = (kr.progress / kr.target) * 100
    return sum + Math.min(krProgress, 100)
  }, 0)

  return Math.round(totalProgress / keyResults.length)
}

/**
 * Determine objective status based on progress and due date
 */
export function determineObjectiveStatus(
  progress: number,
  dueDate: string | null
): 'on-track' | 'at-risk' | 'off-track' {
  if (!dueDate) return progress >= 70 ? 'on-track' : progress >= 40 ? 'at-risk' : 'off-track'

  const today = new Date()
  const due = new Date(dueDate)
  const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  // Off track: < 40% progress or overdue
  if (progress < 40 || daysUntilDue < 0) return 'off-track'

  // At risk: 40-69% progress or less than 7 days remaining
  if (progress < 70 || daysUntilDue < 7) return 'at-risk'

  // On track: >= 70% progress
  return 'on-track'
}
