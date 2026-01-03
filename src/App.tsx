import { useState, useMemo, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { OKRList } from './components/OKRList';
import { OKRDetail } from './components/OKRDetail';
import ActivityFeed from './components/ActivityFeed';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import {
  fetchObjectives,
  subscribeToObjectives,
} from './lib/okr-service';
import type { ObjectiveWithDetails } from './lib/types';

export interface KeyResult {
  id: string;
  title: string;
  progress: number;
  target: number;
  unit: string;
  owner: string;
  dueDate: string;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  owner: string;
  status: 'on-track' | 'at-risk' | 'off-track';
  progress: number;
  dueDate: string;
  keyResults: KeyResult[];
}

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

export default function App() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'board' | 'analytics'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActivityFeed, setShowActivityFeed] = useState(false);

  // Define loadObjectives with useCallback
  const loadObjectives = useCallback(async () => {
    try {
      console.log('🔍 [DEBUG] Starting to load objectives...')
      setLoading(true);
      setError(null);
      
      console.log('📡 [DEBUG] Calling fetchObjectives...')
      const { data, error: fetchError } = await fetchObjectives();
      
      console.log('📊 [DEBUG] Response received:', { 
        hasData: !!data, 
        dataLength: data?.length,
        hasError: !!fetchError,
        errorMessage: fetchError?.message,
        errorCode: (fetchError as any)?.code,
        errorDetails: (fetchError as any)?.details
      })
      
      if (fetchError) {
        console.error('❌ [DEBUG] Fetch error details:', fetchError)
        throw fetchError
      }
      
      if (data) {
        console.log('✅ [DEBUG] Converting data...', data.length, 'objectives')
        const converted = data.map(convertToObjective);
        console.log('✅ [DEBUG] Converted successfully:', converted)
        setObjectives(converted);
        
        // Auto-select first objective if none selected
        setSelectedObjectiveId(prev => {
          if (!prev && converted.length > 0) {
            console.log('🎯 [DEBUG] Auto-selecting first objective:', converted[0].id)
            return converted[0].id;
          }
          return prev;
        });
      }
      
      console.log('✅ [DEBUG] Load objectives completed successfully')
    } catch (err) {
      console.error('💥 [DEBUG] Error in loadObjectives:', err);
      console.error('💥 [DEBUG] Error type:', typeof err);
      console.error('💥 [DEBUG] Error stack:', (err as Error).stack);
      setError(err instanceof Error ? err.message : 'Failed to load objectives');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load objectives from Supabase on mount
  useEffect(() => {
    loadObjectives();
  }, [loadObjectives]);

  // Subscribe to realtime updates for Objectives
  useEffect(() => {
    console.log('🔴 [REALTIME] Setting up objectives subscription...');
    
    const subscription = subscribeToObjectives((payload) => {
      console.log('🔴 [REALTIME] Objective changed:', payload);
      
      const eventType = payload.eventType;
      
      if (eventType === 'INSERT') {
        // New objective created - reload to get full details with relations
        console.log('🔴 [REALTIME] New objective inserted, reloading...');
        loadObjectives();
      } else if (eventType === 'UPDATE') {
        // Objective updated - fetch updated data with relations
        console.log('🔴 [REALTIME] Objective updated, reloading...');
        loadObjectives();
      } else if (eventType === 'DELETE') {
        // Objective deleted - remove from state
        const deletedId = payload.old?.id;
        console.log('🔴 [REALTIME] Objective deleted:', deletedId);
        if (deletedId) {
          setObjectives(prev => {
            const filtered = prev.filter(obj => obj.id !== deletedId);
            // Update selection if needed
            setSelectedObjectiveId(prevId => {
              if (prevId === deletedId) {
                return filtered[0]?.id || null;
              }
              return prevId;
            });
            return filtered;
          });
        }
      }
    });

    return () => {
      console.log('🔴 [REALTIME] Cleaning up objectives subscription');
      subscription.unsubscribe();
    };
  }, [loadObjectives]); // ← Add loadObjectives as dependency

  // Derive selectedObjective from objectives array using useMemo
  const selectedObjective = useMemo(() => {
    return selectedObjectiveId 
      ? objectives.find(obj => obj.id === selectedObjectiveId) || null
      : null;
  }, [objectives, selectedObjectiveId]);

  const updateObjective = useCallback((updatedObjective: Objective) => {
    setObjectives(prev => 
      prev.map(obj => 
        obj.id === updatedObjective.id ? updatedObjective : obj
      )
    );
  }, []);

  const deleteObjective = useCallback((id: string) => {
    // First update the selection if needed
    if (id === selectedObjectiveId) {
      setObjectives(prev => {
        const filtered = prev.filter(obj => obj.id !== id);
        setSelectedObjectiveId(filtered[0]?.id || null);
        return filtered;
      });
    } else {
      setObjectives(prev => prev.filter(obj => obj.id !== id));
    }
  }, [selectedObjectiveId]);

  const addObjective = useCallback((objective: Objective) => {
    setObjectives(prev => [...prev, objective]);
    setSelectedObjectiveId(objective.id);
  }, []);

  const handleSelectObjective = useCallback((objective: Objective) => {
    setSelectedObjectiveId(objective.id);
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-[#f9fafb] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading OKRs...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-screen bg-[#f9fafb] items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading OKRs</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadObjectives}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f9fafb]">
      <Sidebar 
        view={view} 
        setView={setView}
        showActivityFeed={showActivityFeed}
        setShowActivityFeed={setShowActivityFeed}
      />
      {/* V1 Feature #2: Analytics View */}
      {view === 'analytics' ? (
        <AnalyticsDashboard />
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <OKRList
            objectives={objectives}
            selectedObjective={selectedObjective}
            onSelectObjective={handleSelectObjective}
            onAddObjective={addObjective}
            view={view}
          />
          
          {selectedObjective && (
            <OKRDetail
              key={selectedObjective.id}
              objective={selectedObjective}
              onUpdate={updateObjective}
              onDelete={deleteObjective}
            />
          )}

          {/* V1 Feature #1: Activity Feed Panel */}
          {showActivityFeed && (
            <div className="w-80 border-l border-gray-200 bg-white overflow-hidden">
              <ActivityFeed limit={50} className="h-full" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}