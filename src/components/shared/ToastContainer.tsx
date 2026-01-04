/**
 * Toast notification container component
 * Displays toast messages at the bottom-right of the screen
 */

import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Toast } from '../../hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border animate-slide-up ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-200'
              : toast.type === 'error'
              ? 'bg-red-50 border-red-200'
              : 'bg-blue-50 border-blue-200'
          }`}
        >
          {toast.type === 'success' && (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          {toast.type === 'info' && (
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          )}
          
          <p
            className={`flex-1 text-sm ${
              toast.type === 'success'
                ? 'text-green-800'
                : toast.type === 'error'
                ? 'text-red-800'
                : 'text-blue-800'
            }`}
          >
            {toast.message}
          </p>

          <button
            onClick={() => onRemove(toast.id)}
            className={`flex-shrink-0 p-1 rounded hover:bg-opacity-50 transition-colors ${
              toast.type === 'success'
                ? 'hover:bg-green-200'
                : toast.type === 'error'
                ? 'hover:bg-red-200'
                : 'hover:bg-blue-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
