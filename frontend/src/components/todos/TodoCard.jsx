import {
  Calendar,
  Paperclip,
  Pencil,
  Trash2,
  Check,
  Flame,
  CheckSquare,
  Clock,
  AlertTriangle,
  RotateCcw,
  Bell,
  BellRing,
} from 'lucide-react'
import { format } from 'date-fns'
import { CATEGORY_STYLES, PRIORITY_STYLES } from '../../lib/constants'
import { getDueStatus } from '../../lib/dueUtils'
import { cn } from '../../lib/utils'

export default function TodoCard({
  todo,
  onEdit,
  onDelete,
  onToggleComplete,
  onSelect,
  isTrash,
  onRestore,
  onPermanentDelete,
}) {
  const isCompleted = todo.status === 'completed'
  const isInProgress = todo.status === 'in_progress'
  const dueInfo =
    todo.dueDate && !isCompleted && !isTrash
      ? getDueStatus(todo.dueDate, todo.status)
      : null
  const isDueIn1Hour = dueInfo?.type === 'due-1h'
  const isOverdue = dueInfo?.type === 'overdue'
  const isDueToday = dueInfo?.type === 'due-today'
  const attachmentCount = todo.attachments?.length || 0
  const subtasks = todo.subtasks || []
  const completedSubtasks = subtasks.filter((s) => s.completed).length

  return (
    <div
      onClick={() => onSelect && onSelect(todo)}
      className={cn(
        'rounded-xl border p-4 transition-all group cursor-pointer relative shadow-sm',
        // Default Active Card
        'bg-white border-slate-200/80 hover:shadow-md',
        // Completed
        isCompleted && 'opacity-70 bg-slate-50/60 border-slate-200',
        // Prominent Amber Card when Due in 1 hour
        isDueIn1Hour &&
          'bg-gradient-to-r from-amber-50 to-amber-100/70 border-2 border-amber-400 ring-2 ring-amber-300/60 shadow-md hover:border-amber-500',
        // Prominent Red Card when Overdue
        isOverdue &&
          'bg-gradient-to-r from-red-50/95 to-red-100/60 border-2 border-red-400 ring-2 ring-red-300/40 shadow-md hover:border-red-500',
        // Highlight when Due Today
        isDueToday &&
          !isDueIn1Hour &&
          'bg-gradient-to-r from-amber-50/80 to-amber-100/40 border-2 border-amber-300 ring-1 ring-amber-200',
        // Trash
        isTrash && 'bg-slate-50/80 border-slate-200'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox (or Trash Icon) */}
        {!isTrash ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleComplete(todo._id)
            }}
            className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors',
              isCompleted
                ? 'bg-emerald-500 border-emerald-500'
                : isInProgress
                ? 'border-blue-500 hover:bg-blue-50'
                : isOverdue
                ? 'border-red-500 bg-white hover:bg-red-50'
                : isDueToday
                ? 'border-amber-500 bg-white hover:bg-amber-50'
                : 'border-slate-300 hover:border-indigo-400'
            )}
            title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
          >
            {isCompleted && <Check className="w-3 h-3 text-white" />}
            {isInProgress && !isCompleted && (
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            )}
          </button>
        ) : (
          <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center mt-0.5 shrink-0 text-slate-500">
            <Trash2 className="w-3 h-3" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {/* Category tag */}
            <span
              className={cn(
                'text-[10px] px-2 py-0.5 rounded-md border font-medium shrink-0',
                CATEGORY_STYLES[todo.category] || CATEGORY_STYLES.Other
              )}
            >
              {todo.category || 'Other'}
            </span>

            {/* Status indicator if in progress */}
            {isInProgress && !isTrash && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                In Progress
              </span>
            )}

            {/* Prominent Due in about 1 hour badge */}
            {isDueIn1Hour && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-amber-600 text-white font-extrabold flex items-center gap-1 shadow-sm animate-pulse ring-2 ring-amber-300">
                <Clock className="w-3 h-3" />
                ⚡ DUE IN ABOUT 1 HOUR ({dueInfo.exactMins}m)
              </span>
            )}

            {/* Prominent Overdue Badge */}
            {isOverdue && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-600 text-white font-bold flex items-center gap-1 shadow-sm animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                {dueInfo ? dueInfo.text.toUpperCase() : 'OVERDUE'}
              </span>
            )}

            {/* Due Today Badge */}
            {isDueToday && !isDueIn1Hour && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500 text-white font-bold flex items-center gap-1 shadow-sm">
                <Clock className="w-3 h-3" />
                DUE TODAY
              </span>
            )}

            {isTrash && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 font-medium">
                In Trash
              </span>
            )}
          </div>

          <p
            className={cn(
              'text-sm font-semibold text-slate-800 leading-snug',
              isCompleted && 'line-through text-slate-400 font-normal',
              isDueIn1Hour && 'text-amber-950 font-extrabold',
              isOverdue && 'text-red-950 font-bold',
              isDueToday && !isDueIn1Hour && 'text-amber-950 font-bold'
            )}
          >
            {todo.title}
          </p>

          {todo.description && (
            <p
              className={cn(
                'text-xs mt-0.5 line-clamp-1',
                isDueIn1Hour ? 'text-amber-800/80 font-medium' : isOverdue ? 'text-red-700/80 font-medium' : 'text-slate-400'
              )}
            >
              {todo.description}
            </p>
          )}

          {/* Bottom row badges */}
          <div className="flex items-center flex-wrap gap-2 mt-2.5">
            {dueInfo && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium',
                  isDueIn1Hour
                    ? 'bg-amber-200 text-amber-950 font-bold border border-amber-300'
                    : isOverdue
                    ? 'bg-red-200/80 text-red-900 font-bold border border-red-300'
                    : 'bg-slate-50 text-slate-500'
                )}
              >
                <Calendar className="w-3 h-3" />
                {dueInfo.text}
              </span>
            )}

            {/* Priority */}
            {todo.priority && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full capitalize',
                  PRIORITY_STYLES[todo.priority] || PRIORITY_STYLES.medium
                )}
              >
                {todo.priority === 'urgent' && (
                  <Flame className="w-3 h-3 text-red-600" />
                )}
                {todo.priority}
              </span>
            )}

            {/* Reminder Badge */}
            {todo.reminderAt && !isTrash && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium',
                  todo.reminderSent
                    ? 'bg-slate-100 text-slate-500'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                )}
                title={
                  todo.reminderSent
                    ? 'Reminder notification already sent'
                    : `Reminder scheduled for ${format(new Date(todo.reminderAt), 'MMM d, h:mm a')}`
                }
              >
                {todo.reminderSent ? (
                  <Bell className="w-3 h-3 text-slate-400" />
                ) : (
                  <BellRing className="w-3 h-3 text-indigo-600 animate-pulse" />
                )}
                <span>
                  {todo.reminderSent
                    ? 'Reminder Sent'
                    : `Reminder: ${format(new Date(todo.reminderAt), 'h:mm a')}`}
                </span>
              </span>
            )}

            {subtasks.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                <CheckSquare className="w-3 h-3 text-slate-400" />
                {completedSubtasks}/{subtasks.length}
              </span>
            )}

            {attachmentCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <Paperclip className="w-3 h-3" />
                {attachmentCount}
              </span>
            )}
          </div>
        </div>

        {/* Normal Actions vs Trash Actions */}
        {!isTrash ? (
          <div
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onEdit(todo)}
              className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(todo)}
              className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Move to Trash"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            className="flex items-center gap-1 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onRestore && onRestore(todo)}
              className="px-2.5 py-1 rounded-md text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-1 transition-colors"
              title="Restore Task"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore
            </button>
            <button
              onClick={() => onPermanentDelete && onPermanentDelete(todo)}
              className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete Permanently"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
