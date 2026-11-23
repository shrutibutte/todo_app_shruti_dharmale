import { useState, useEffect } from 'react'
import {
  X,
  Calendar,
  CheckCircle2,
  Clock,
  Paperclip,
  Trash2,
  Pencil,
  Plus,
  Download,
  Flame,
  CheckSquare,
  Square,
  FileText,
} from 'lucide-react'
import { format, formatDistanceToNow, isPast, isToday } from 'date-fns'
import toast from 'react-hot-toast'
import useTodoStore from '../../store/todoStore'
import { getAttachmentUrl } from '../../api/todos'
import {
  CATEGORY_STYLES,
  PRIORITY_STYLES,
  STATUS_CONFIG,
  CATEGORIES,
} from '../../lib/constants'
import { cn } from '../../lib/utils'

export default function TaskDetailModal({
  isOpen,
  onClose,
  todo: initialTodo,
  onEdit,
  onDelete,
}) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const { todos, toggleSubtask, updateTodoStatus, editTodo } = useTodoStore()

  // Always bind to live todo from store to ensure updates display instantly
  const liveTodo =
    todos.find((t) => t._id === initialTodo?._id) || initialTodo
  const todo = liveTodo

  const [localSubtasks, setLocalSubtasks] = useState(todo?.subtasks || [])

  // Keep local checklist in sync whenever todo changes
  useEffect(() => {
    if (todo?.subtasks) {
      setLocalSubtasks(todo.subtasks)
    }
  }, [todo?._id, todo?.subtasks])

  if (!isOpen || !todo) return null

  const isCompleted = todo.status === 'completed'
  const dueDate = todo.dueDate ? new Date(todo.dueDate) : null
  const isOverdue =
    dueDate && isPast(dueDate) && !isToday(dueDate) && !isCompleted
  const subtasks = localSubtasks
  const completedSubtasks = subtasks.filter((st) => st.completed).length
  const progressPercent =
    subtasks.length > 0
      ? Math.round((completedSubtasks / subtasks.length) * 100)
      : 0

  const handleToggleSubtask = async (index) => {
    const updated = localSubtasks.map((st, i) =>
      i === index ? { ...st, completed: !st.completed } : st
    )
    setLocalSubtasks(updated)
    try {
      await editTodo(todo._id, { subtasks: updated })
    } catch {
      toast.error('Failed to update subtask')
      setLocalSubtasks(todo?.subtasks || [])
    }
  }

  const handleAddSubtask = async (e) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return

    const newSt = { title: newSubtaskTitle.trim(), completed: false }
    const updated = [...localSubtasks, newSt]
    setLocalSubtasks(updated)
    setNewSubtaskTitle('')
    try {
      await editTodo(todo._id, { subtasks: updated })
      toast.success('Subtask added')
    } catch {
      toast.error('Failed to add subtask')
      setLocalSubtasks(todo?.subtasks || [])
    }
  }

  const handleDeleteSubtask = async (index) => {
    const updated = localSubtasks.filter((_, idx) => idx !== index)
    setLocalSubtasks(updated)
    try {
      await editTodo(todo._id, { subtasks: updated })
      toast.success('Subtask removed')
    } catch {
      toast.error('Failed to remove subtask')
      setLocalSubtasks(todo?.subtasks || [])
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTodoStatus(todo._id, newStatus)
      toast.success(`Moved to ${STATUS_CONFIG[newStatus]?.label || newStatus}`)
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Failed to update status'
      toast.error(msg)
    }
  }

  const handleCategoryChange = async (newCategory) => {
    try {
      await editTodo(todo._id, { category: newCategory })
      toast.success(`Category updated to ${newCategory}`)
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Failed to update category'
      toast.error(msg)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center flex-wrap gap-2">
              {/* Category dropdown */}
              <select
                value={todo.category || 'Other'}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className={cn(
                  'text-xs px-2.5 py-0.5 rounded-full border font-medium cursor-pointer focus:outline-none transition-colors',
                  CATEGORY_STYLES[todo.category] || CATEGORY_STYLES.Other
                )}
                title="Change Category"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Priority */}
              <span
                className={cn(
                  'text-xs px-2.5 py-0.5 rounded-full border capitalize flex items-center gap-1',
                  PRIORITY_STYLES[todo.priority] || PRIORITY_STYLES.medium
                )}
              >
                {todo.priority === 'urgent' && (
                  <Flame className="w-3 h-3 text-red-600" />
                )}
                {todo.priority}
              </span>

              {/* Status dropdown */}
              <select
                value={todo.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-xs px-2.5 py-0.5 rounded-full border border-slate-200 bg-slate-50 font-medium text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="pending">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <h2
              className={cn(
                'text-xl font-bold text-slate-800 break-words',
                isCompleted && 'line-through text-slate-400'
              )}
            >
              {todo.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Description
            </h3>
            {todo.description ? (
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                {todo.description}
              </p>
            ) : (
              <p className="text-sm text-slate-400 italic">No description provided.</p>
            )}
          </div>

          {/* Due date & Reminder */}
          {dueDate && (
            <div
              className={cn(
                'rounded-xl p-3.5 border flex items-center justify-between transition-colors',
                isOverdue
                  ? 'bg-red-50/70 border-red-200 text-red-900 ring-1 ring-red-200'
                  : 'bg-slate-50 border-slate-100'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Calendar
                  className={cn(
                    'w-5 h-5 shrink-0',
                    isOverdue ? 'text-red-600 animate-pulse' : 'text-indigo-600'
                  )}
                />
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {format(dueDate, 'PPP p')}
                  </p>
                  <p
                    className={cn(
                      'text-xs',
                      isOverdue ? 'text-red-600 font-bold' : 'text-slate-400 font-medium'
                    )}
                  >
                    {isOverdue
                      ? `⚠️ OVERDUE by ${formatDistanceToNow(dueDate)}`
                      : `Due ${formatDistanceToNow(dueDate, { addSuffix: true })}`}
                  </p>
                </div>
              </div>
              {todo.reminderAt && (
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium">
                  ⏰ Reminder Set
                </span>
              )}
            </div>
          )}

          {/* Subtasks Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Checklist {subtasks.length > 0 ? `(${completedSubtasks}/${subtasks.length})` : ''}
              </h3>
              {subtasks.length > 0 && (
                <span className="text-xs font-medium text-slate-500">
                  {progressPercent}%
                </span>
              )}
            </div>

            {/* Progress bar */}
            {subtasks.length > 0 && (
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}

            {/* List */}
            <div className="space-y-1.5">
              {subtasks.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-1">
                  No subtasks added yet. Add checklist items below to break down this task.
                </p>
              ) : (
                subtasks.map((st, idx) => (
                  <div
                    key={st._id || idx}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 group border border-transparent hover:border-slate-100 transition-colors"
                  >
                    <button
                      onClick={() => handleToggleSubtask(idx)}
                      className="flex items-center gap-2.5 flex-1 text-left"
                    >
                      {st.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 hover:text-indigo-600 shrink-0" />
                      )}
                      <span
                        className={cn(
                          'text-sm text-slate-700',
                          st.completed && 'line-through text-slate-400'
                        )}
                      >
                        {st.title}
                      </span>
                    </button>

                    <button
                      onClick={() => handleDeleteSubtask(idx)}
                      className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Subtask input */}
            <form onSubmit={handleAddSubtask} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add subtask..."
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!newSubtaskTitle.trim()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-40 text-slate-600 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </form>
          </div>

          {/* Attachments Section */}
          {todo.attachments && todo.attachments.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Attachments ({todo.attachments.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {todo.attachments.map((att) => {
                  const url = getAttachmentUrl(todo._id, att.filename)
                  const isImage = att.mimetype?.startsWith('image/')
                  return (
                    <div
                      key={att.filename}
                      className="border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-2 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isImage ? (
                          <img
                            src={url}
                            alt={att.originalName}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-700 truncate">
                            {att.originalName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {Math.round(att.size / 1024)} KB
                          </p>
                        </div>
                      </div>

                      <a
                        href={url}
                        download={att.originalName}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors shrink-0 shadow-sm"
                        title="Download / View"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 rounded-b-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose()
                onEdit(todo)
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-700 bg-white shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Task
            </button>
            <button
              onClick={() => {
                onClose()
                onDelete(todo)
              }}
              className="px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-xs font-medium text-red-600 bg-white shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
