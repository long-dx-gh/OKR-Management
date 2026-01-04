import { Target, LayoutList, LayoutGrid, Users, HelpCircle, Activity, BarChart3, Network } from 'lucide-react';
import { SettingsMenu } from './SettingsMenu';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '../../hooks/useMediaQuery';

interface SidebarProps {
  view: 'list' | 'board' | 'analytics';
  setView: (view: 'list' | 'board' | 'analytics') => void;
  showActivityFeed: boolean;
  setShowActivityFeed: (show: boolean) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ view, setView, showActivityFeed, setShowActivityFeed, isOpen = true, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  const handleNavigation = (action: () => void) => {
    action();
    if (isMobile && onClose) {
      onClose();
    }
  };
  
  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : ''}
        ${isMobile ? 'top-14' : ''}
      `}>
      {/* Logo */}
      <div className="hidden lg:flex h-16 items-center px-6 border-b border-gray-200">
        <Target className="w-6 h-6 text-purple-600 mr-3" />
        <span className="text-gray-900">OKR Management</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <button 
          onClick={() => handleNavigation(() => setView('list'))}
          className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors touch-manipulation ${
            view === 'list' 
              ? 'bg-purple-50 text-purple-700' 
              : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
          }`}
        >
          <LayoutList className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="text-sm font-medium">Danh sách</span>
        </button>

        <button 
          onClick={() => handleNavigation(() => setView('board'))}
          className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors touch-manipulation ${
            view === 'board' 
              ? 'bg-purple-50 text-purple-700' 
              : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
          }`}
        >
          <LayoutGrid className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="text-sm font-medium">Bảng Kanban</span>
        </button>

        <button 
          onClick={() => handleNavigation(() => navigate('/visualization'))}
          className="w-full flex items-center px-3 py-2.5 rounded-lg transition-colors text-gray-700 hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
        >
          <Network className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="text-sm font-medium">Visualization</span>
        </button>

        <button 
          onClick={() => handleNavigation(() => setShowActivityFeed(!showActivityFeed))}
          className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors touch-manipulation ${
            showActivityFeed 
              ? 'bg-purple-50 text-purple-700' 
              : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
          }`}
        >
          <Activity className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="text-sm font-medium">Hoạt động</span>
        </button>
        
        <button 
          onClick={() => handleNavigation(() => setView('analytics'))}
          className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors touch-manipulation ${
            view === 'analytics' 
              ? 'bg-purple-50 text-purple-700' 
              : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
          }`}
        >
          <BarChart3 className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="text-sm font-medium">Thống kê</span>
        </button>

        <div className="pt-4 pb-2">
          <div className="px-3 text-xs text-gray-500 uppercase tracking-wider mb-2">
            Workspace
          </div>
          
          <button className="w-full flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors touch-manipulation">
            <Users className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="text-sm font-medium">Nhóm của tôi</span>
          </button>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-200 space-y-2">
        {/* Help Button */}
        <button className="w-full flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors touch-manipulation">
          <HelpCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="text-sm font-medium">Trợ giúp</span>
        </button>

        {/* Settings Menu with User Info & Logout */}
        <SettingsMenu />
      </div>
    </div>
    </>
  );
}
