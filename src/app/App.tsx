import { useState, useMemo, useCallback, memo } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { MobileHeader } from '../components/layout/MobileHeader';
import { OKRList } from '../components/okr/OKRList';
import { OKRDetail } from '../components/okr/OKRDetail';
import { MobileOKRDetail } from '../components/okr/MobileOKRDetail';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import AnalyticsDashboard from '../components/dashboard/AnalyticsDashboard';
import { ToastContainer } from '../components/shared/ToastContainer';
import { useOptimisticObjectives } from '../hooks/useOptimisticObjectives';
import { useToast } from '../hooks/useToast';
import { useResponsive } from '../hooks/useMediaQuery';

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

// Memoized Sidebar to prevent unnecessary re-renders
const MemoizedSidebar = memo(Sidebar);

export default function App() {
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'board' | 'analytics'>('list');
  const [showActivityFeed, setShowActivityFeed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { isMobile } = useResponsive();

  // Use optimistic updates hook
  const {
    objectives,
    initialLoading,
    error,
    createObjective,
    updateObjective,
    deleteObjective,
  } = useOptimisticObjectives();

  // Toast notifications for errors
  const { toasts, removeToast, success, error: showError } = useToast();

  // Derive selectedObjective from objectives array using useMemo
  const selectedObjective = useMemo(() => {
    return selectedObjectiveId 
      ? objectives.find(obj => obj.id === selectedObjectiveId) || null
      : null;
  }, [objectives, selectedObjectiveId]);

  // Auto-select first objective on initial load
  useMemo(() => {
    if (objectives.length > 0 && !selectedObjectiveId) {
      setSelectedObjectiveId(objectives[0].id);
    }
  }, [objectives, selectedObjectiveId]);

  const handleUpdateObjective = useCallback(async (updatedObjective: Objective) => {
    const { error: updateError } = await updateObjective(updatedObjective);
    if (updateError) {
      console.error('Failed to update objective:', updateError);
      showError('Không thể cập nhật objective. Vui lòng thử lại.');
    } else {
      success('Đã cập nhật objective thành công');
    }
  }, [updateObjective, success, showError]);

  const handleDeleteObjective = useCallback(async (id: string) => {
    // Update selection if deleting selected objective
    if (id === selectedObjectiveId) {
      const remaining = objectives.filter(obj => obj.id !== id);
      setSelectedObjectiveId(remaining[0]?.id || null);
    }
    
    const { error: deleteError } = await deleteObjective(id);
    if (deleteError) {
      console.error('Failed to delete objective:', deleteError);
      showError('Không thể xóa objective. Vui lòng thử lại.');
    } else {
      success('Đã xóa objective thành công');
    }
  }, [selectedObjectiveId, objectives, deleteObjective, success, showError]);

  const handleAddObjective = useCallback(async (objectiveData: Omit<Objective, 'id' | 'keyResults' | 'owner'>) => {
    const { data, error: createError } = await createObjective({
      title: objectiveData.title,
      description: objectiveData.description,
      status: objectiveData.status,
      progress: objectiveData.progress,
      due_date: objectiveData.dueDate,
    });

    if (createError) {
      console.error('Failed to create objective:', createError);
      showError('Không thể tạo objective. Vui lòng thử lại.');
      return null;
    }

    if (data) {
      // Auto-select the newly created objective
      setSelectedObjectiveId(data);
      success('Đã tạo objective mới thành công');
      return data;
    }
    
    return null;
  }, [createObjective, success, showError]);

  const handleSelectObjective = useCallback((objective: Objective) => {
    setSelectedObjectiveId(objective.id);
    // On mobile, we'll show the detail in a modal, so close the sidebar
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  // Show initial loading state only
  if (initialLoading) {
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
              onClick={() => window.location.reload()}
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
    <div className="flex h-screen bg-[#f9fafb] overflow-hidden">
      {/* Mobile Header */}
      <MobileHeader 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
      />

      {/* Sidebar */}
      <MemoizedSidebar 
        view={view} 
        setView={setView}
        showActivityFeed={showActivityFeed}
        setShowActivityFeed={setShowActivityFeed}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* V1 Feature #2: Analytics View */}
      {view === 'analytics' ? (
        <div className={`flex-1 overflow-auto ${isMobile ? 'pt-14' : ''}`}>
          <AnalyticsDashboard />
        </div>
      ) : (
        <div className={`flex flex-1 overflow-hidden ${isMobile ? 'flex-col' : ''}`}>
          <OKRList
            objectives={objectives}
            selectedObjective={selectedObjective}
            onSelectObjective={handleSelectObjective}
            onAddObjective={handleAddObjective}
            view={view}
          />
          
          {/* Desktop: Side-by-side detail panel */}
          {selectedObjective && !isMobile && (
            <OKRDetail
              key={selectedObjective.id}
              objective={selectedObjective}
              onUpdate={handleUpdateObjective}
              onDelete={handleDeleteObjective}
            />
          )}

          {/* Mobile: Full-screen modal for detail */}
          {selectedObjective && isMobile && (
            <MobileOKRDetail
              objective={selectedObjective}
              onUpdate={handleUpdateObjective}
              onDelete={handleDeleteObjective}
              onClose={() => setSelectedObjectiveId(null)}
            />
          )}

          {/* V1 Feature #1: Activity Feed Panel - Hidden on mobile */}
          {showActivityFeed && !isMobile && (
            <div className="w-80 border-l border-gray-200 bg-white overflow-hidden">
              <ActivityFeed limit={50} className="h-full" />
            </div>
          )}
        </div>
      )}
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}