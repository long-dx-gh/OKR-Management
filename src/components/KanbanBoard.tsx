import { Target } from 'lucide-react';
import { Objective } from '../App';

interface KanbanBoardProps {
  objectives: Objective[];
  onSelectObjective: (objective: Objective) => void;
}

export function KanbanBoard({ objectives, onSelectObjective }: KanbanBoardProps) {
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
    <div className="flex-1 bg-[#f9fafb] overflow-x-auto">
      <div className="p-6 min-w-[900px]">
        <h2 className="text-gray-900 mb-6">Bảng Kanban</h2>
        
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
                          <h4 className="text-gray-900 mb-1 line-clamp-2">
                            {objective.title}
                          </h4>
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
  );
}