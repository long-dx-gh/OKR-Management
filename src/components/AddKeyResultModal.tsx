import { useState } from 'react';
import { X } from 'lucide-react';
import { KeyResult } from '../App';
import { createKeyResult } from '../lib/okr-service';

interface AddKeyResultModalProps {
  objectiveId: string;
  onClose: () => void;
  onAdd: (keyResult: KeyResult) => void;
}

export function AddKeyResultModal({ objectiveId, onClose, onAdd }: AddKeyResultModalProps) {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !target || !unit.trim() || !dueDate) {
      return;
    }

    const targetNumber = parseFloat(target);
    if (isNaN(targetNumber) || targetNumber <= 0) {
      setError('Target phải là số dương');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: createError } = await createKeyResult({
        objective_id: objectiveId,
        title: title.trim(),
        target: targetNumber,
        unit: unit.trim(),
        due_date: dueDate,
      });

      if (createError) throw createError;

      if (data) {
        // Convert to KeyResult format
        const newKeyResult: KeyResult = {
          id: data.id,
          title: data.title,
          progress: data.progress,
          target: data.target,
          unit: data.unit,
          owner: 'Me', // Current user
          dueDate: data.due_date || '',
        };

        onAdd(newKeyResult);
        onClose();
      }
    } catch (err) {
      console.error('Error creating key result:', err);
      setError(err instanceof Error ? err.message : 'Failed to create key result');
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
          <h2 className="text-gray-900">Thêm Key Result mới</h2>
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
              Tiêu đề Key Result *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ví dụ: Đạt 10 tỷ doanh thu trong Q1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Mục tiêu *
              </label>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="100"
                step="0.1"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Đơn vị *
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="%, tỷ VNĐ, khách hàng..."
                required
              />
            </div>
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Mẹo:</strong> Key Result nên có thể đo lường được cụ thể. Ví dụ: "Tăng doanh thu lên 10 tỷ" thay vì "Tăng doanh thu".
            </p>
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
                'Tạo Key Result'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}