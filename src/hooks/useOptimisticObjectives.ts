/**
 * Custom hook for managing objectives with optimistic UI updates
 * Provides instant feedback without waiting for server response
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Objective } from '../App';
import {
  fetchObjectives,
  createObjective as createObjectiveService,
  updateObjective as updateObjectiveService,
  deleteObjective as deleteObjectiveService,
  subscribeToObjectives,
} from '../lib/okr-service';
import type { ObjectiveWithDetails, CreateObjectiveInput } from '../lib/types';

// Temporary ID generator for optimistic updates
const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper function: Convert ObjectiveWithDetails to Objective
function convertToObjective(obj: ObjectiveWithDetails): Objective {
  return {
    id: obj.id,
    title: obj.title,
    description: obj.description || '',
    owner: obj.owner?.full_name || obj.owner?.email || 'Unknown',
    status: obj.status,
    progress: obj.progress,
    dueDate: obj.due_date || '',
    keyResults: (obj.key_results || []).map(kr => ({
      id: kr.id,
      title: kr.title,
      progress: kr.progress,
      target: kr.target,
      unit: kr.unit,
      owner: kr.owner?.full_name || kr.owner?.email || 'Unknown',
      dueDate: kr.due_date || '',
    })),
  };
}

interface OptimisticState {
  objectives: Objective[];
  initialLoading: boolean;
  error: string | null;
  pendingMutations: Set<string>; // Track which items are being created/updated
}

export function useOptimisticObjectives() {
  const [state, setState] = useState<OptimisticState>({
    objectives: [],
    initialLoading: true,
    error: null,
    pendingMutations: new Set(),
  });

  // Track if we've done initial load
  const hasInitialLoadRef = useRef(false);
  const subscriptionRef = useRef<any>(null);

  // Load objectives without global loading state after initial load
  const loadObjectives = useCallback(async (silent = false) => {
    try {
      console.log('🔍 [OPTIMISTIC] Loading objectives...', { silent });
      
      if (!silent && !hasInitialLoadRef.current) {
        setState(prev => ({ ...prev, initialLoading: true, error: null }));
      }
      
      const { data, error: fetchError } = await fetchObjectives();
      
      if (fetchError) throw fetchError;
      
      if (data) {
        const converted = data.map(convertToObjective);
        setState(prev => ({
          ...prev,
          objectives: converted,
          initialLoading: false,
          error: null,
        }));
        hasInitialLoadRef.current = true;
      }
    } catch (err) {
      console.error('💥 [OPTIMISTIC] Error loading objectives:', err);
      setState(prev => ({
        ...prev,
        initialLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load objectives',
      }));
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadObjectives(false);
  }, [loadObjectives]);

  // Realtime subscription with intelligent updates
  useEffect(() => {
    console.log('🔴 [OPTIMISTIC] Setting up realtime subscription...');
    
    subscriptionRef.current = subscribeToObjectives((payload) => {
      console.log('🔴 [OPTIMISTIC] Realtime event:', payload.eventType, payload);
      
      const eventType = payload.eventType;
      
      if (eventType === 'INSERT' || eventType === 'UPDATE') {
        // Silent refresh in background - don't show loading state
        loadObjectives(true);
      } else if (eventType === 'DELETE') {
        const deletedId = payload.old?.id;
        if (deletedId) {
          setState(prev => ({
            ...prev,
            objectives: prev.objectives.filter(obj => obj.id !== deletedId),
          }));
        }
      }
    });

    return () => {
      console.log('🔴 [OPTIMISTIC] Cleaning up subscription');
      subscriptionRef.current?.unsubscribe();
    };
  }, [loadObjectives]);

  // ✨ Optimistic create objective
  const createObjectiveOptimistic = useCallback(async (input: CreateObjectiveInput) => {
    const tempId = generateTempId();
    const optimisticObjective: Objective = {
      id: tempId,
      title: input.title,
      description: input.description || '',
      owner: 'Me',
      status: input.status || 'on-track',
      progress: input.progress || 0,
      dueDate: input.due_date || '',
      keyResults: [],
    };

    // Add optimistic item immediately
    setState(prev => ({
      ...prev,
      objectives: [optimisticObjective, ...prev.objectives],
      pendingMutations: new Set(prev.pendingMutations).add(tempId),
    }));

    try {
      // Call server
      const { data, error } = await createObjectiveService(input);

      if (error) throw error;

      if (data) {
        // Replace optimistic item with real data
        setState(prev => ({
          ...prev,
          objectives: prev.objectives.map(obj =>
            obj.id === tempId
              ? {
                  id: data.id,
                  title: data.title,
                  description: data.description || '',
                  owner: 'Me',
                  status: data.status,
                  progress: data.progress,
                  dueDate: data.due_date || '',
                  keyResults: [],
                }
              : obj
          ),
          pendingMutations: new Set([...prev.pendingMutations].filter(id => id !== tempId)),
        }));

        return { data: data.id, error: null, tempId };
      }
    } catch (err) {
      console.error('❌ [OPTIMISTIC] Error creating objective:', err);
      
      // Rollback: Remove optimistic item
      setState(prev => ({
        ...prev,
        objectives: prev.objectives.filter(obj => obj.id !== tempId),
        pendingMutations: new Set([...prev.pendingMutations].filter(id => id !== tempId)),
      }));

      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to create objective'),
        tempId,
      };
    }

    return { data: null, error: new Error('Unknown error'), tempId };
  }, []);

  // ✨ Optimistic update objective
  const updateObjectiveOptimistic = useCallback(async (updatedObjective: Objective) => {
    const originalObjective = state.objectives.find(obj => obj.id === updatedObjective.id);
    
    if (!originalObjective) {
      console.warn('[OPTIMISTIC] Cannot update: objective not found');
      return { error: new Error('Objective not found') };
    }

    // Apply optimistic update immediately
    setState(prev => ({
      ...prev,
      objectives: prev.objectives.map(obj =>
        obj.id === updatedObjective.id ? updatedObjective : obj
      ),
      pendingMutations: new Set(prev.pendingMutations).add(updatedObjective.id),
    }));

    try {
      const { error } = await updateObjectiveService({
        id: updatedObjective.id,
        title: updatedObjective.title,
        description: updatedObjective.description,
        status: updatedObjective.status,
        progress: updatedObjective.progress,
        due_date: updatedObjective.dueDate,
      });

      if (error) throw error;

      // Success - remove from pending
      setState(prev => ({
        ...prev,
        pendingMutations: new Set([...prev.pendingMutations].filter(id => id !== updatedObjective.id)),
      }));

      return { error: null };
    } catch (err) {
      console.error('❌ [OPTIMISTIC] Error updating objective:', err);
      
      // Rollback to original
      setState(prev => ({
        ...prev,
        objectives: prev.objectives.map(obj =>
          obj.id === updatedObjective.id ? originalObjective : obj
        ),
        pendingMutations: new Set([...prev.pendingMutations].filter(id => id !== updatedObjective.id)),
      }));

      return { error: err instanceof Error ? err : new Error('Failed to update objective') };
    }
  }, [state.objectives]);

  // ✨ Optimistic delete objective
  const deleteObjectiveOptimistic = useCallback(async (id: string) => {
    const originalObjective = state.objectives.find(obj => obj.id === id);
    
    if (!originalObjective) {
      console.warn('[OPTIMISTIC] Cannot delete: objective not found');
      return { error: new Error('Objective not found') };
    }

    // Remove optimistically
    setState(prev => ({
      ...prev,
      objectives: prev.objectives.filter(obj => obj.id !== id),
      pendingMutations: new Set(prev.pendingMutations).add(id),
    }));

    try {
      const { error } = await deleteObjectiveService(id);

      if (error) throw error;

      // Success - remove from pending
      setState(prev => ({
        ...prev,
        pendingMutations: new Set([...prev.pendingMutations].filter(mutId => mutId !== id)),
      }));

      return { error: null };
    } catch (err) {
      console.error('❌ [OPTIMISTIC] Error deleting objective:', err);
      
      // Rollback: restore the objective
      setState(prev => ({
        ...prev,
        objectives: [...prev.objectives, originalObjective],
        pendingMutations: new Set([...prev.pendingMutations].filter(mutId => mutId !== id)),
      }));

      return { error: err instanceof Error ? err : new Error('Failed to delete objective') };
    }
  }, [state.objectives]);

  return {
    objectives: state.objectives,
    initialLoading: state.initialLoading,
    error: state.error,
    pendingMutations: state.pendingMutations,
    createObjective: createObjectiveOptimistic,
    updateObjective: updateObjectiveOptimistic,
    deleteObjective: deleteObjectiveOptimistic,
    refetch: () => loadObjectives(false),
  };
}
