/**
 * Settings Menu Component
 * Dropdown menu cho user settings và logout
 */

import { useState, useRef, useEffect } from 'react'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, profile, signOut } = useAuth()

  // Close menu khi click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = async () => {
    try {
      await signOut()
      // Redirect sẽ được xử lý bởi AuthContext và ProtectedRoute
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const displayName = profile?.full_name || user?.email || 'User'
  const userEmail = user?.email || ''

  return (
    <div className="relative" ref={menuRef}>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 rounded-lg transition-all border border-purple-100"
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
            {displayName.charAt(0).toUpperCase()}
          </div>
          
          {/* User Info */}
          <div className="text-left">
            <div className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
              {displayName}
            </div>
            <div className="text-xs text-gray-500 truncate max-w-[120px]">
              {userEmail}
            </div>
          </div>
        </div>

        {/* Dropdown Icon */}
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="text-sm font-semibold text-gray-900">
              {displayName}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {userEmail}
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {/* View Profile */}
            <button
              onClick={() => {
                setIsOpen(false)
                // TODO: Navigate to profile page
                console.log('View profile')
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Xem thông tin</span>
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                setIsOpen(false)
                handleLogout()
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
