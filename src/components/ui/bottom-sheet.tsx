/**
 * Bottom Sheet Component
 * A mobile-first drawer component that slides up from the bottom
 */

import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from './button'

interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  children: React.ReactNode
  onApply?: () => void
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onOpenChange,
  title,
  children,
  onApply,
}) => {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (open) {
      setIsAnimating(true)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open && !isAnimating) return null

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleApply = () => {
    if (onApply) {
      onApply()
    }
    onOpenChange(false)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
        onTransitionEnd={() => {
          if (!open) setIsAnimating(false)
        }}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out max-h-[85vh] flex flex-col ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {children}
        </div>

        {/* Footer with Apply Button */}
        {onApply && (
          <div className="border-t border-gray-200 p-4 bg-white">
            <Button
              onClick={handleApply}
              className="w-full h-12 text-base font-medium"
            >
              Áp dụng
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
