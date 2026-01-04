/**
 * Mobile OKR Detail Modal
 * Full-screen modal for viewing OKR details on mobile
 */

import { X } from 'lucide-react';
import { Objective } from '../../app/App';
import { OKRDetail } from './OKRDetail';

interface MobileOKRDetailProps {
  objective: Objective;
  onUpdate: (objective: Objective) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function MobileOKRDetail({ objective, onUpdate, onDelete, onClose }: MobileOKRDetailProps) {
  return (
    <div className="fixed inset-0 z-50 bg-white overflow-auto">
      {/* Mobile Header - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-10 flex items-center px-4 safe-top">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation"
          aria-label="Đóng"
        >
          <X className="w-6 h-6" />
        </button>
        <h1 className="ml-2 text-lg font-semibold text-gray-900 truncate flex-1">
          Chi tiết Objective
        </h1>
      </div>

      {/* Content - With top padding for fixed header */}
      <div className="pt-14">
        <OKRDetail
          objective={objective}
          onUpdate={onUpdate}
          onDelete={(id) => {
            onDelete(id);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
