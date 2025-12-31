import { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, Search, Target, ArrowUp, ArrowDown } from 'lucide-react';
import { Objective } from '../App';
import { OKRCard } from './OKRCard';
import { AddObjectiveModal } from './AddObjectiveModal';
import { KanbanBoard } from './KanbanBoard';

type SortField = 'dueDate' | 'progress' | 'title';
type SortDirection = 'asc' | 'desc';

interface OKRListProps {
  objectives: Objective[];
  selectedObjective: Objective | null;
  onSelectObjective: (objective: Objective) => void;
  onAddObjective: (objective: Objective) => void;
  view: 'list' | 'board';
}

export function OKRList({ objectives, selectedObjective, onSelectObjective, onAddObjective, view }: OKRListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'on-track' | 'at-risk' | 'off-track'>('all');
  const [sortField, setSortField] = useState<SortField>(() => {
    return (localStorage.getItem('okr-sort-field') as SortField) || 'dueDate';
  });
  const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
    return (localStorage.getItem('okr-sort-direction') as SortDirection) || 'asc';
  });

  // Persist sort preferences to localStorage
  useEffect(() => {
    localStorage.setItem('okr-sort-field', sortField);
    localStorage.setItem('okr-sort-direction', sortDirection);
  }, [sortField, sortDirection]);

  const filteredObjectives = useMemo(() => {
    let result = objectives.filter(obj => {
      const matchesSearch = obj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           obj.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || obj.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    // Apply sorting
    result.sort((a, b) => {
      let compareValue = 0;

      if (sortField === 'dueDate') {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        compareValue = dateA - dateB;
      } else if (sortField === 'progress') {
        compareValue = (a.progress || 0) - (b.progress || 0);
      } else if (sortField === 'title') {
        compareValue = a.title.localeCompare(b.title);
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

    return result;
  }, [objectives, searchQuery, filterStatus, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddObjective = useCallback((objective: Objective) => {
    onAddObjective(objective);
    setIsModalOpen(false);
  }, [onAddObjective]);

  if (view === 'board') {
    return <KanbanBoard objectives={filteredObjectives} onSelectObjective={onSelectObjective} />;
  }

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900">Objectives</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Thêm mới</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm objectives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              filterStatus === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterStatus('on-track')}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              filterStatus === 'on-track'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Đúng tiến độ
          </button>
          <button
            onClick={() => setFilterStatus('at-risk')}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              filterStatus === 'at-risk'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Rủi ro
          </button>
          <button
            onClick={() => setFilterStatus('off-track')}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              filterStatus === 'off-track'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Lệch tiến độ
          </button>
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
          <span className="text-xs text-gray-500 self-center">Sắp xếp:</span>
          <button
            onClick={() => handleSort('dueDate')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors ${
              sortField === 'dueDate'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>Hạn</span>
            {sortField === 'dueDate' && (
              sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
            )}
          </button>
          <button
            onClick={() => handleSort('progress')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors ${
              sortField === 'progress'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>Tiến độ</span>
            {sortField === 'progress' && (
              sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
            )}
          </button>
          <button
            onClick={() => handleSort('title')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors ${
              sortField === 'title'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>Tên</span>
            {sortField === 'title' && (
              sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredObjectives.map((objective) => (
          <OKRCard
            key={objective.id}
            objective={objective}
            isSelected={selectedObjective?.id === objective.id}
            onClick={() => onSelectObjective(objective)}
          />
        ))}
        {filteredObjectives.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Không tìm thấy objective nào</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <AddObjectiveModal
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddObjective}
        />
      )}
    </div>
  );
}