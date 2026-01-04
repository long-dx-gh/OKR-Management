/**
 * Mobile Header Component
 * Header cho mobile với hamburger menu và navigation
 */

import { Menu, X, Target } from 'lucide-react';

interface MobileHeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

export function MobileHeader({ onMenuToggle, isMenuOpen }: MobileHeaderProps) {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-40 flex items-center px-4">
      {/* Menu Button */}
      <button
        onClick={onMenuToggle}
        className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
      >
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Logo */}
      <div className="flex items-center ml-3">
        <Target className="w-5 h-5 text-purple-600 mr-2" />
        <span className="font-semibold text-gray-900">OKR Management</span>
      </div>
    </div>
  );
}
