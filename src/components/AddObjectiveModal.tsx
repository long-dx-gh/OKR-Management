import { useState } from 'react';
import { X } from 'lucide-react';
import { Objective } from '../App';
import { createObjective } from '../lib/okr-service';

interface AddObjectiveModalProps {
  onClose: () => void;
  onAdd: (objective: Objective) => void;
}

export function AddObjectiveModal({ onClose, onAdd }: AddObjectiveModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'on-track' | 'at-risk' | 'off-track'>('on-track');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !dueDate) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: createError } = await createObjective({
        title: title.trim(),
        description: description.trim(),
        status,
        progress: 0,
        due_date: dueDate,
      });

      if (createError) throw createError;

      if (data) {
        // Convert to Objective format for parent component
        const newObjective: Objective = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          owner: 'Me', // Current user
          status: data.status,
          progress: data.progress,
          dueDate: data.due_date || '',
          keyResults: []
        };

        onAdd(newObjective);
        onClose();
      }
    } catch (err) {
      console.error('Error creating objective:', err);
      setError(err instanceof Error ? err.message : 'Failed to create objective');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-gray-900">Thêm Objective mới</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Tiêu đề Objective *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ví dụ: Tăng trưởng doanh thu công ty"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Mô tả *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
              placeholder="Mô tả chi tiết về mục tiêu này..."
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Ngày hết hạn *
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Trạng thái
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStatus('on-track')}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                  status === 'on-track'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Đúng tiến độ
              </button>
              <button
                type="button"
                onClick={() => setStatus('at-risk')}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                  status === 'at-risk'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Có rủi ro
              </button>
              <button
                type="button"
                onClick={() => setStatus('off-track')}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                  status === 'off-track'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Lệch tiến độ
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang tạo...</span>
                </>
              ) : (
                'Tạo Objective'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}