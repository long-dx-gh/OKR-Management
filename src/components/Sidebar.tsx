import { Target, LayoutList, LayoutGrid, Users, HelpCircle, Activity, BarChart3, Network } from 'lucide-react';
import { SettingsMenu } from './SettingsMenu';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  view: 'list' | 'board' | 'analytics';
  setView: (view: 'list' | 'board' | 'analytics') => void;
  showActivityFeed: boolean;
  setShowActivityFeed: (show: boolean) => void;
}

export function Sidebar({ view, setView, showActivityFeed, setShowActivityFeed }: SidebarProps) {
  const navigate = useNavigate();
  
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Target className="w-6 h-6 text-purple-600 mr-3" />
        <span className="text-gray-900">OKR Management</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <button 
          onClick={() => setView('list')}
          className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
            view === 'list' 
              ? 'bg-purple-50 text-purple-700' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <LayoutList className="w-5 h-5 mr-3" />
          <span>Danh sách</span>
        </button>

        <button 
          onClick={() => setView('board')}
          className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
            view === 'board' 
              ? 'bg-purple-50 text-purple-700' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <LayoutGrid className="w-5 h-5 mr-3" />
          <span>Bảng Kanban</span>
        </button>

        <button 
          onClick={() => navigate('/visualization')}
          className="w-full flex items-center px-3 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
        >
          <Network className="w-5 h-5 mr-3" />
          <span>Visualization</span>
        </button>

        <button 
          onClick={() => setShowActivityFeed(!showActivityFeed)}
          className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
            showActivityFeed 
              ? 'bg-purple-50 text-purple-700' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Activity className="w-5 h-5 mr-3" />
          <span>Hoạt động</span>
        </button>
        
        <button 
          onClick={() => setView('analytics')}
          className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
            view === 'analytics' 
              ? 'bg-purple-50 text-purple-700' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <BarChart3 className="w-5 h-5 mr-3" />
          <span>Thống kê</span>
        </button>

        <div className="pt-4 pb-2">
          <div className="px-3 text-xs text-gray-500 uppercase tracking-wider mb-2">
            Workspace
          </div>
          
          <button className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
            <Users className="w-5 h-5 mr-3" />
            <span>Nhóm của tôi</span>
          </button>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-200 space-y-2">
        {/* Help Button */}
        <button className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
          <HelpCircle className="w-5 h-5 mr-3" />
          <span>Trợ giúp</span>
        </button>

        {/* Settings Menu with User Info & Logout */}
        <SettingsMenu />
      </div>
    </div>
  );
}
