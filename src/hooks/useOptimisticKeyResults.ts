/**
 * Custom hook for managing key results with optimistic UI updates
 * Provides instant feedback for key result mutations
 */

import { useState, useCallback } from 'react';
import { KeyResult } from '../app/App';
import {
  createKeyResult as createKeyResultService,
  updateKeyResult as updateKeyResultService,
  deleteKeyResult as deleteKeyResultService,
} from '../services/okr.service';
import type { CreateKeyResultInput, UpdateKeyResultInput } from '../types';

// Temporary ID generator for optimistic updates
const generateTempId = () => `temp_kr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

interface UseOptimisticKeyResultsOptions {
  objectiveId: string;
  keyResults: KeyResult[];
  onUpdate: (keyResults: KeyResult[]) => void;
}

export function useOptimisticKeyResults({
  objectiveId,
  keyResults,
  onUpdate,
}: UseOptimisticKeyResultsOptions) {
  const [pendingMutations, setPendingMutations] = useState<Set<string>>(new Set());

  // ✨ Optimistic create key result
  const createKeyResult = useCallback(
    async (input: Omit<CreateKeyResultInput, 'objective_id'>) => {
      const tempId = generateTempId();
      const optimisticKeyResult: KeyResult = {
        id: tempId,
        title: input.title,
        progress: 0,
        target: input.target,
        unit: input.unit || 'số',
        owner: 'Me',
        dueDate: input.due_date || '',
      };

      // Add optimistic item immediately
      const newKeyResults = [...keyResults, optimisticKeyResult];
      onUpdate(newKeyResults);
      setPendingMutations(prev => new Set(prev).add(tempId));

      try {
        // Call server
        const { data, error } = await createKeyResultService({
          ...input,
          objective_id: objectiveId,
        });

        if (error) throw error;

        if (data) {
          // Replace optimistic item with real data
          const finalKeyResults = newKeyResults.map(kr =>
            kr.id === tempId
              ? {
                  id: data.id,
                  title: data.title,
                  progress: data.progress,
                  target: data.target,
                  unit: data.unit,
                  owner: 'Me',
                  dueDate: data.due_date || '',
                }
              : kr
          );
          onUpdate(finalKeyResults);
          setPendingMutations(prev => {
            const next = new Set(prev);
            next.delete(tempId);
            return next;
          });

          return { data: data.id, error: null, tempId };
        }
      } catch (err) {
        console.error('❌ [OPTIMISTIC KR] Error creating key result:', err);

        // Rollback: Remove optimistic item
        onUpdate(keyResults.filter(kr => kr.id !== tempId));
        setPendingMutations(prev => {
          const next = new Set(prev);
          next.delete(tempId);
          return next;
        });

        return {
          data: null,
          error: err instanceof Error ? err : new Error('Failed to create key result'),
          tempId,
        };
      }

      return { data: null, error: new Error('Unknown error'), tempId };
    },
    [objectiveId, keyResults, onUpdate]
  );

  // ✨ Optimistic update key result
  const updateKeyResult = useCallback(
    async (id: string, updates: Partial<UpdateKeyResultInput>) => {
      const originalKeyResult = keyResults.find(kr => kr.id === id);

      if (!originalKeyResult) {
        console.warn('[OPTIMISTIC KR] Cannot update: key result not found');
        return { error: new Error('Key result not found') };
      }

      // Apply optimistic update immediately
      const updatedKeyResults = keyResults.map(kr =>
        kr.id === id ? { ...kr, ...updates } : kr
      );
      onUpdate(updatedKeyResults);
      setPendingMutations(prev => new Set(prev).add(id));

      try {
        const { error } = await updateKeyResultService({
          id,
          ...updates,
        });

        if (error) throw error;

        // Success - remove from pending
        setPendingMutations(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });

        return { error: null };
      } catch (err) {
        console.error('❌ [OPTIMISTIC KR] Error updating key result:', err);

        // Rollback to original
        const rolledBackKeyResults = keyResults.map(kr =>
          kr.id === id ? originalKeyResult : kr
        );
        onUpdate(rolledBackKeyResults);
        setPendingMutations(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });

        return { error: err instanceof Error ? err : new Error('Failed to update key result') };
      }
    },
    [keyResults, onUpdate]
  );

  // ✨ Optimistic delete key result
  const deleteKeyResult = useCallback(
    async (id: string) => {
      const originalKeyResult = keyResults.find(kr => kr.id === id);

      if (!originalKeyResult) {
        console.warn('[OPTIMISTIC KR] Cannot delete: key result not found');
        return { error: new Error('Key result not found') };
      }

      // Remove optimistically
      const filteredKeyResults = keyResults.filter(kr => kr.id !== id);
      onUpdate(filteredKeyResults);
      setPendingMutations(prev => new Set(prev).add(id));

      try {
        const { error } = await deleteKeyResultService(id);

        if (error) throw error;

        // Success - remove from pending
        setPendingMutations(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });

        return { error: null };
      } catch (err) {
        console.error('❌ [OPTIMISTIC KR] Error deleting key result:', err);

        // Rollback: restore the key result
        onUpdate([...keyResults, originalKeyResult]);
        setPendingMutations(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });

        return { error: err instanceof Error ? err : new Error('Failed to delete key result') };
      }
    },
    [keyResults, onUpdate]
  );

  return {
    createKeyResult,
    updateKeyResult,
    deleteKeyResult,
    isPending: (id: string) => pendingMutations.has(id),
  };
}
