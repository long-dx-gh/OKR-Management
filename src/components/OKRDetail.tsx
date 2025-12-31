import { useState, useCallback } from 'react';
import { Calendar, User, Trash2, Plus, MoreVertical, Edit2, Check, X } from 'lucide-react';
import { Objective, KeyResult } from '../App';
import { KeyResultItem } from './KeyResultItem';
import { AddKeyResultModal } from './AddKeyResultModal';
import CommentSection from './CommentSection';
import { deleteObjective, updateObjective } from '../lib/okr-service';

interface OKRDetailProps {
  objective: Objective;
  onUpdate: (objective: Objective) => void;
  onDelete: (id: string) => void;
}

export function OKRDetail({ objective, onUpdate, onDelete }: OKRDetailProps) {
  const [isAddKRModalOpen, setIsAddKRModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedTitle, setEditedTitle] = useState(objective.title);
  const [editedDescription, setEditedDescription] = useState(objective.description);
  
  const statusConfig = {
    'on-track': { color: 'bg-green-500', label: 'Đúng tiến độ', bgColor: 'bg-green-50', textColor: 'text-green-700' },
    'at-risk': { color: 'bg-yellow-500', label: 'Có rủi ro', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
    'off-track': { color: 'bg-red-500', label: 'Lệch tiến độ', bgColor: 'bg-red-50', textColor: 'text-red-700' }
  };

  const status = statusConfig[objective.status];
  
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };
  
  const calculateProgress = (keyResults: KeyResult[]) => {
    if (!keyResults || keyResults.length === 0) return 0;
    
    const totalProgress = keyResults.reduce((sum, kr) => {
      const target = kr.target || 1;
      const progress = kr.progress || 0;
      const krProgress = (progress / target) * 100;
      return sum + Math.min(Math.max(krProgress, 0), 100);
    }, 0);
    
    return Math.round(totalProgress / keyResults.length);
  };

  const updateKeyResult = useCallback(async (updatedKR: KeyResult) => {
    const updatedKeyResults = objective.keyResults.map(kr =>
      kr.id === updatedKR.id ? updatedKR : kr
    );
    
    const avgProgress = calculateProgress(updatedKeyResults);

    // Update local state first for instant feedback
    onUpdate({
      ...objective,
      keyResults: updatedKeyResults,
      progress: avgProgress
    });

    // Update in database
    try {
      await updateObjective({
        id: objective.id,
        progress: avgProgress
      });
    } catch (err) {
      console.error('Error updating objective progress:', err);
    }
  }, [objective, onUpdate]);

  const deleteKeyResult = useCallback(async (id: string) => {
    const updatedKeyResults = objective.keyResults.filter(kr => kr.id !== id);
    const avgProgress = calculateProgress(updatedKeyResults);

    // Update local state first
    onUpdate({
      ...objective,
      keyResults: updatedKeyResults,
      progress: avgProgress
    });

    // Update objective progress in database
    try {
      await updateObjective({
        id: objective.id,
        progress: avgProgress
      });
    } catch (err) {
      console.error('Error updating objective progress:', err);
    }
  }, [objective, onUpdate]);

  const addKeyResult = useCallback(async (keyResult: KeyResult) => {
    const updatedKeyResults = [...objective.keyResults, keyResult];
    const avgProgress = calculateProgress(updatedKeyResults);

    // Update local state first
    onUpdate({
      ...objective,
      keyResults: updatedKeyResults,
      progress: avgProgress
    });

    // Update objective progress in database
    try {
      await updateObjective({
        id: objective.id,
        progress: avgProgress
      });
    } catch (err) {
      console.error('Error updating objective progress:', err);
    }
    
    setIsAddKRModalOpen(false);
  }, [objective, onUpdate]);

  const changeStatus = useCallback(async (newStatus: 'on-track' | 'at-risk' | 'off-track') => {
    setShowMenu(false);

    try {
      const { error } = await updateObjective({
        id: objective.id,
        status: newStatus
      });

      if (error) throw error;

      // Update local state
      onUpdate({
        ...objective,
        status: newStatus
      });
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Không thể cập nhật trạng thái. Vui lòng thử lại.');
    }
  }, [objective, onUpdate]);
  
  const handleDelete = useCallback(async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa Objective này?')) {
      return;
    }

    setShowMenu(false);

    try {
      const { error } = await deleteObjective(objective.id);
      
      if (error) throw error;
      
      // Call parent's onDelete to update UI
      onDelete(objective.id);
    } catch (err) {
      console.error('Error deleting objective:', err);
      alert('Không thể xóa objective. Vui lòng thử lại.');
    }
  }, [objective.id, onDelete]);
  
  const handleSaveTitle = useCallback(async () => {
    if (!editedTitle.trim()) {
      alert('Tên Objective không được để trống');
      return;
    }

    try {
      const { error } = await updateObjective({
        id: objective.id,
        title: editedTitle.trim()
      });

      if (error) throw error;

      // Update local state
      onUpdate({
        ...objective,
        title: editedTitle.trim()
      });
      setIsEditingTitle(false);
    } catch (err) {
      console.error('Error updating title:', err);
      alert('Không thể cập nhật tên. Vui lòng thử lại.');
    }
  }, [objective, editedTitle, onUpdate]);

  const handleCancelEditTitle = useCallback(() => {
    setEditedTitle(objective.title);
    setIsEditingTitle(false);
  }, [objective.title]);

  const handleSaveDescription = useCallback(async () => {
    try {
      const { error } = await updateObjective({
        id: objective.id,
        description: editedDescription.trim()
      });

      if (error) throw error;

      // Update local state
      onUpdate({
        ...objective,
        description: editedDescription.trim()
      });
      setIsEditingDescription(false);
    } catch (err) {
      console.error('Error updating description:', err);
      alert('Không thể cập nhật mô tả. Vui lòng thử lại.');
    }
  }, [objective, editedDescription, onUpdate]);

  const handleCancelEditDescription = useCallback(() => {
    setEditedDescription(objective.description);
    setIsEditingDescription(false);
  }, [objective.description]);
  
  const safeProgress = Math.max(0, Math.min(objective.progress || 0, 100));
  
  return (
    <div className="flex-1 bg-white overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${status.color} text-white`}>
                  {status.label}
                </span>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                  {showMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          changeStatus('on-track');
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Đúng tiến độ
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          changeStatus('at-risk');
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        Có rủi ro
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          changeStatus('off-track');
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        Lệch tiến độ
                      </button>
                      <div className="border-t border-gray-200 my-1" />
                      <button
                        onClick={handleDelete}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Title with Edit */}
              <div className="mb-3">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle()}
                      className="flex-1 text-2xl font-bold text-gray-900 border-2 border-purple-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveTitle}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      title="Lưu"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancelEditTitle}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      title="Hủy"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 group">
                    <h1 className="text-2xl font-bold text-gray-900 flex-1">{objective.title}</h1>
                    <button
                      onClick={() => {
                        setEditedTitle(objective.title);
                        setIsEditingTitle(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                      title="Chỉnh sửa tên"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Description with Edit */}
              <div>
                {isEditingDescription ? (
                  <div className="flex items-start gap-2">
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      rows={3}
                      className="flex-1 text-gray-600 border-2 border-purple-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={handleSaveDescription}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        title="Lưu"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleCancelEditDescription}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        title="Hủy"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 group">
                    <p className="text-gray-600 flex-1">{objective.description}</p>
                    <button
                      onClick={() => {
                        setEditedDescription(objective.description);
                        setIsEditingDescription(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                      title="Chỉnh sửa mô tả"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{objective.owner}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(objective.dueDate)}</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className={`p-6 rounded-lg ${status.bgColor} mb-8`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-900">Tổng tiến độ</span>
            <span className={`${status.textColor}`}>{safeProgress}%</span>
          </div>
          <div className="w-full bg-white rounded-full h-3 overflow-hidden">
            <div
              className={`h-full ${status.color} transition-all duration-300`}
              style={{ width: `${safeProgress}%` }}
            />
          </div>
        </div>

        {/* Key Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900">Key Results</h2>
            <button
              onClick={() => setIsAddKRModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Key Result</span>
            </button>
          </div>

          <div className="space-y-4">
            {objective.keyResults.map((kr) => (
              <KeyResultItem
                key={kr.id}
                keyResult={kr}
                onUpdate={updateKeyResult}
                onDelete={deleteKeyResult}
              />
            ))}
            {objective.keyResults.length === 0 && (
              <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <p>Chưa có Key Result nào</p>
                <button
                  onClick={() => setIsAddKRModalOpen(true)}
                  className="mt-3 text-purple-600 hover:text-purple-700"
                >
                  Thêm Key Result đầu tiên
                </button>
              </div>
            )}
          </div>
        </div>

        {/* V1 Feature #1: Comments Section */}
        <div className="mt-8">
          <CommentSection objective_id={objective.id} />
        </div>
      </div>

      {isAddKRModalOpen && (
        <AddKeyResultModal
          objectiveId={objective.id}
          onClose={() => setIsAddKRModalOpen(false)}
          onAdd={addKeyResult}
        />
      )}
    </div>
  );
}