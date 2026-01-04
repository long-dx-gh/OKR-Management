/**
 * CommentForm Component
 * Form for creating/editing comments
 * V1 Feature #1: Team Collaboration Suite
 */

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void> | void
  submitting: boolean
  placeholder?: string
  initialValue?: string
  onCancel?: () => void
  autoFocus?: boolean
}

export default function CommentForm({
  onSubmit,
  submitting,
  placeholder = 'Add a comment...',
  initialValue = '',
  onCancel,
  autoFocus = false,
}: CommentFormProps) {
  const [content, setContent] = useState(initialValue)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [content])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || submitting) return

    await onSubmit(content)
    setContent('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    // Submit on Cmd/Ctrl + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={submitting}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-500"
        rows={1}
        style={{ minHeight: '40px', maxHeight: '200px' }}
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Press Cmd/Ctrl + Enter to submit
        </span>

        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={!content.trim() || submitting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </form>
  )
}
