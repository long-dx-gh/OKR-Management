import { Target } from 'lucide-react';
import { Objective } from '../../app/App';

interface KanbanBoardProps {
  objectives: Objective[];
  onSelectObjective: (objective: Objective) => void;
  filterCompletion: 'all' | 'completed' | 'incomplete';
  setFilterCompletion: (value: 'all' | 'completed' | 'incomplete') => void;
}

export function KanbanBoard({ objectives, onSelectObjective, filterCompletion, setFilterCompletion }: KanbanBoardProps) {
  const columns = [
    { id: 'on-track', title: 'Đúng tiến độ', color: 'border-green-500', bgColor: 'bg-green-50' },
    { id: 'at-risk', title: 'Có rủi ro', color: 'border-yellow-500', bgColor: 'bg-yellow-50' },
    { id: 'off-track', title: 'Lệch tiến độ', color: 'border-red-500', bgColor: 'bg-red-50' }
  ];

  const getObjectivesByStatus = (status: string) => {
    return objectives.filter(obj => obj.status === status);
  };
  
  const safeProgress = (progress: number) => Math.max(0, Math.min(progress || 0, 100));

  return (
    <div className="flex-1 bg-[#f9fafb] overflow-x-auto flex flex-col">
      {/* Header with Title */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">Bảng Kanban</h2>
      </div>

      {/* Clean Minimal Filter Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3.5">
        <div className="flex items-center justify-between">
          {/* Left: Filter label with count */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Lọc theo tiến độ</span>
            {filterCompletion !== 'all' && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                Đang lọc
              </span>
            )}
          </div>
          
          {/* Right: Compact Segmented Control */}
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilterCompletion('all')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                filterCompletion === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterCompletion('completed')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                filterCompletion === 'completed'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Chỉ hiển thị OKR đã hoàn thành 100%"
            >
              <span className="text-xs">✓</span>
              <span>100%</span>
            </button>
            <button
              onClick={() => setFilterCompletion('incomplete')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                filterCompletion === 'incomplete'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Chỉ hiển thị OKR chưa hoàn thành"
            >
              <span className="text-xs">○</span>
              <span>&lt;100%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 min-w-[900px]">
        
        <div className="grid grid-cols-3 gap-6">
          {columns.map((column) => {
            const columnObjectives = getObjectivesByStatus(column.id);
            
            return (
              <div key={column.id} className="flex flex-col">
                <div className={`${column.bgColor} border-t-4 ${column.color} rounded-t-lg px-4 py-3 mb-4`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-gray-900">{column.title}</h3>
                    <span className="text-sm text-gray-600 bg-white px-2 py-0.5 rounded-full">
                      {columnObjectives.length}
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  {columnObjectives.map((objective) => (
                    <button
                      key={objective.id}
                      onClick={() => onSelectObjective(objective)}
                      className="w-full text-left p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Target className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-gray-900 line-clamp-2 flex-1">
                              {objective.title}
                            </h4>
                            {safeProgress(objective.progress) >= 100 && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full whitespace-nowrap">
                                ✓ Hoàn thành
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {objective.description}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Tiến độ</span>
                          <span className="text-gray-900">{safeProgress(objective.progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              column.id === 'on-track' ? 'bg-green-500' :
                              column.id === 'at-risk' ? 'bg-yellow-500' :
                              'bg-red-500'
                            } transition-all duration-300`}
                            style={{ width: `${safeProgress(objective.progress)}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                        <span>{objective.owner}</span>
                        <span>{objective.keyResults?.length || 0} KRs</span>
                      </div>
                    </button>
                  ))}

                  {columnObjectives.length === 0 && (
                    <div className="p-8 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-400">
                      <p className="text-sm">Không có objective</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </div>
  );
}