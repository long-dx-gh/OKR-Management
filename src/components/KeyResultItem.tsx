import { useState, useEffect } from 'react';
import { Calendar, User, Trash2, Edit2, Check, X } from 'lucide-react';
import { KeyResult } from '../App';
import { updateKeyResultAndRecalculateObjective, deleteKeyResult } from '../lib/okr-service';

interface KeyResultItemProps {
  keyResult: KeyResult;
  onUpdate: (keyResult: KeyResult) => void;
  onDelete: (id: string) => void;
}

export function KeyResultItem({ keyResult, onUpdate, onDelete }: KeyResultItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editedProgress, setEditedProgress] = useState(keyResult.progress.toString());
  const [editedTitle, setEditedTitle] = useState(keyResult.title);
  const [editedTarget, setEditedTarget] = useState(keyResult.target.toString());
  const [progressChanged, setProgressChanged] = useState(false);

  const safeProgress = keyResult.progress || 0;
  const safeTarget = keyResult.target || 1;
  const progressPercentage = Math.max(0, Math.min((safeProgress / safeTarget) * 100, 100));

  // Detect progress changes and trigger animation
  useEffect(() => {
    setProgressChanged(true);
    const timer = setTimeout(() => setProgressChanged(false), 600);
    return () => clearTimeout(timer);
  }, [keyResult.progress]);
  
  const getProgressColor = () => {
    if (progressPercentage >= 70) return 'bg-green-500';
    if (progressPercentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  const handleSaveProgress = async () => {
    const newProgress = parseFloat(editedProgress);
    if (isNaN(newProgress) || newProgress < 0) {
      return;
    }

    try {
      const { error } = await updateKeyResultAndRecalculateObjective({
        id: keyResult.id,
        progress: newProgress
      });

      if (error) throw error;

      // Update local state
      onUpdate({
        ...keyResult,
        progress: newProgress
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating key result:', err);
      alert('Không thể cập nhật progress. Vui lòng thử lại.');
    }
  };

  const handleCancelEdit = () => {
    setEditedProgress(keyResult.progress.toString());
    setIsEditing(false);
  };

  const handleEditInfo = () => {
    setEditedTitle(keyResult.title);
    setEditedTarget(keyResult.target.toString());
    setIsEditingInfo(true);
  };

  const handleSaveInfo = async () => {
    const newTarget = parseFloat(editedTarget);
    
    // Validation
    if (!editedTitle.trim()) {
      alert('Tiêu đề không được để trống');
      return;
    }
    if (isNaN(newTarget) || newTarget <= 0) {
      alert('Target phải là số dương');
      return;
    }

    try {
      const { error } = await updateKeyResultAndRecalculateObjective({
        id: keyResult.id,
        title: editedTitle.trim(),
        target: newTarget
      });

      if (error) throw error;

      // Update local state
      onUpdate({
        ...keyResult,
        title: editedTitle.trim(),
        target: newTarget
      });
      setIsEditingInfo(false);
    } catch (err) {
      console.error('Error updating key result:', err);
      alert('Không thể cập nhật thông tin. Vui lòng thử lại.');
    }
  };

  const handleCancelEditInfo = () => {
    setEditedTitle(keyResult.title);
    setEditedTarget(keyResult.target.toString());
    setIsEditingInfo(false);
  };
  
  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa Key Result này?')) {
      return;
    }

    try {
      const { error } = await deleteKeyResult(keyResult.id);

      if (error) throw error;

      // Update parent
      onDelete(keyResult.id);
    } catch (err) {
      console.error('Error deleting key result:', err);
      alert('Không thể xóa key result. Vui lòng thử lại.');
    }
  };

  return (
    <div className="p-5 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {isEditingInfo ? (
            <div className="mb-3">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                placeholder="Tiêu đề Key Result"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Target:</span>
                <input
                  type="number"
                  value={editedTarget}
                  onChange={(e) => setEditedTarget(e.target.value)}
                  className="w-32 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  step="0.1"
                  min="0"
                />
                <span className="text-gray-600">{keyResult.unit}</span>
                <button
                  onClick={handleSaveInfo}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="Lưu thay đổi"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEditInfo}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Hủy"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="group">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-gray-900">{keyResult.title}</h3>
                <button
                  onClick={handleEditInfo}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-all"
                  title="Sửa thông tin"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>{keyResult.owner}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(keyResult.dueDate)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        {!isEditingInfo && (
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Xóa Key Result"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <input
                  type="number"
                  value={editedProgress}
                  onChange={(e) => setEditedProgress(e.target.value)}
                  className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  step="0.1"
                  min="0"
                  autoFocus
                />
                <span className="text-gray-600">/ {keyResult.target} {keyResult.unit}</span>
                <button
                  onClick={handleSaveProgress}
                  className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <span className="text-gray-900">
                  {keyResult.progress} / {keyResult.target} {keyResult.unit}
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
          <span className={`${
            progressPercentage >= 70 ? 'text-green-700' :
            progressPercentage >= 40 ? 'text-yellow-700' :
            'text-red-700'
          } transition-colors duration-300 ${progressChanged ? 'font-bold scale-110' : ''}`}>
            {progressPercentage.toFixed(0)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-500 ease-out ${
              progressChanged ? 'shadow-lg' : ''
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}