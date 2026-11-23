import { AlertTriangle, X } from 'lucide-react'

export default function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">
            Are you sure?
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            This will permanently delete{' '}
            <span className="font-medium text-slate-700">
              "{title || 'this task'}"
            </span>
            . This action cannot be undone.
          </p>
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-medium text-white transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
