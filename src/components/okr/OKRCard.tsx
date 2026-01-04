import { Target, Calendar } from 'lucide-react';
import { Objective } from '../../app/App';

interface OKRCardProps {
  objective: Objective;
  isSelected: boolean;
  onClick: () => void;
}

export function OKRCard({ objective, isSelected, onClick }: OKRCardProps) {
  const statusConfig = {
    'on-track': { color: 'bg-green-500', label: 'Đúng tiến độ', textColor: 'text-green-700' },
    'at-risk': { color: 'bg-yellow-500', label: 'Có rủi ro', textColor: 'text-yellow-700' },
    'off-track': { color: 'bg-red-500', label: 'Lệch tiến độ', textColor: 'text-red-700' }
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

  const safeProgress = Math.max(0, Math.min(objective.progress || 0, 100));

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all touch-manipulation ${
        isSelected
          ? 'border-purple-500 bg-purple-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm active:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-lg ${isSelected ? 'bg-purple-100' : 'bg-gray-100'}`}>
          <Target className={`w-5 h-5 ${isSelected ? 'text-purple-600' : 'text-gray-600'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base font-semibold text-gray-900 line-clamp-2 flex-1">
              {objective.title}
            </h3>
            {safeProgress >= 100 && (
              <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0">
                ✓ Hoàn thành
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 line-clamp-2">
            {objective.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color} text-white`}>
          {status.label}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(objective.dueDate)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">Tiến độ</span>
          <span className={`font-semibold ${status.textColor}`}>{safeProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${status.color} transition-all duration-300`}
            style={{ width: `${safeProgress}%` }}
          />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
        <span>{objective.owner}</span>
        <span className="font-medium">{objective.keyResults?.length || 0} Key Results</span>
      </div>
    </button>
  );
}