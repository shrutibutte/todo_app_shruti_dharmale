import { useState } from 'react'
import {
  Calendar,
  Paperclip,
  Check,
  ArrowRight,
  ArrowLeft,
  Flame,
  CheckCircle2,
  Clock,
  ListTodo,
  AlertTriangle,
  GripVertical,
} from 'lucide-react'
import { format } from 'date-fns'
import { CATEGORY_STYLES, PRIORITY_STYLES } from '../../lib/constants'
import { getDueStatus } from '../../lib/dueUtils'
import { cn } from '../../lib/utils'

export default function KanbanBoard({
  todos,
  onSelectTodo,
  onStatusChange,
}) {
  const [draggingId, setDraggingId] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)

  const columns = [
    {
      id: 'pending',
      title: 'To Do',
      icon: ListTodo,
      color: 'border-slate-300 text-slate-700 bg-slate-50',
      badge: 'bg-slate-200 text-slate-700',
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      icon: Clock,
      color: 'border-blue-400 text-blue-700 bg-blue-50/40',
      badge: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'completed',
      title: 'Completed',
      icon: CheckCircle2,
      color: 'border-emerald-400 text-emerald-700 bg-emerald-50/40',
      badge: 'bg-emerald-100 text-emerald-700',
    },
  ]

  const getColumnTodos = (statusId) =>
    todos.filter((t) => (t.status || 'pending') === statusId)

  const handleDragStart = (e, todoId) => {
    try {
      e.dataTransfer.setData('text/plain', todoId)
    } catch {}
    e.dataTransfer.effectAllowed = 'move'
    setDraggingId(todoId)
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    setDragOverCol(null)
  }

  const handleDragOver = (e, colId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverCol !== colId) {
      setDragOverCol(colId)
    }
  }

  const handleDragLeave = (e, colId) => {
    if (e.currentTarget.contains(e.relatedTarget)) return
    if (dragOverCol === colId) {
      setDragOverCol(null)
    }
  }

  const handleDrop = (e, colId) => {
    e.preventDefault()
    e.stopPropagation()
    let todoId = ''
    try {
      todoId = e.dataTransfer.getData('text/plain')
    } catch {}
    if (!todoId) {
      todoId = draggingId
    }
    setDragOverCol(null)
    setDraggingId(null)
    if (todoId) {
      onStatusChange(todoId, colId)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
      {columns.map((col) => {
        const colTodos = getColumnTodos(col.id)
        const ColIcon = col.icon
        const isColumnActive = dragOverCol === col.id

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={(e) => handleDragLeave(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
            className={cn(
              'rounded-2xl p-4 border transition-all duration-200 flex flex-col min-h-[520px]',
              isColumnActive
                ? 'border-2 border-dashed border-indigo-500 bg-indigo-50/70 shadow-md ring-2 ring-indigo-200'
                : 'bg-slate-100/70 border-slate-200/60'
            )}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <ColIcon className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-700">
                  {col.title}
                </h3>
              </div>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-semibold',
                  col.badge
                )}
              >
                {colTodos.length}
              </span>
            </div>

            {/* Task list in column */}
            <div
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1 min-h-[300px] flex flex-col"
            >
              {colTodos.length === 0 ? (
                <div
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={cn(
                    'flex-1 min-h-[220px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-xs transition-colors p-4',
                    isColumnActive
                      ? 'border-indigo-500 bg-indigo-50/70 text-indigo-700 font-bold ring-2 ring-indigo-200'
                      : 'border-slate-300 text-slate-400 bg-white/30'
                  )}
                >
                  <span className="pointer-events-none font-semibold">
                    {isColumnActive ? 'Release to drop in ' + col.title : 'No tasks in ' + col.title}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 pointer-events-none">
                    Drag tasks here to set status to {col.title}
                  </span>
                </div>
              ) : (
                colTodos.map((todo) => {
                  const dueInfo = todo.dueDate ? getDueStatus(todo.dueDate, todo.status) : null
                  const isDueIn1Hour = dueInfo?.type === 'due-1h'
                  const isOverdue = dueInfo?.type === 'overdue'
                  const isDueToday = dueInfo?.type === 'due-today'
                  const subtasks = todo.subtasks || []
                  const completedSubtasks = subtasks.filter(
                    (s) => s.completed
                  ).length
                  const isBeingDragged = draggingId === todo._id

                  return (
                    <div
                      key={todo._id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, todo._id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onSelectTodo(todo)}
                      className={cn(
                        'rounded-xl p-3.5 border transition-all cursor-grab active:cursor-grabbing group space-y-2.5 relative shadow-sm',
                        isBeingDragged &&
                          'opacity-40 scale-95 border-dashed border-indigo-500',
                        // Prominent Amber if Due in 1 hour
                        isDueIn1Hour
                          ? 'bg-amber-50/90 border-2 border-amber-400 ring-2 ring-amber-300 shadow-md'
                          : isOverdue
                          ? 'bg-gradient-to-r from-red-50 to-red-100/60 border-2 border-red-400 ring-1 ring-red-300/40 shadow-sm'
                          : isDueToday
                          ? 'bg-amber-50/70 border-2 border-amber-300'
                          : 'bg-white border-slate-200/80 hover:shadow-md'
                      )}
                    >
                      {/* Top tags */}
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
                          <span
                            className={cn(
                              'text-[10px] px-2 py-0.5 rounded-md border font-medium',
                              CATEGORY_STYLES[todo.category] ||
                                CATEGORY_STYLES.Other
                            )}
                          >
                            {todo.category || 'Other'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Prominent Due in 1 Hour tag */}
                          {isDueIn1Hour && (
                            <span className="text-[9px] px-2 py-0.5 rounded-md bg-amber-600 text-white font-extrabold flex items-center gap-1 shadow-sm animate-pulse ring-1 ring-amber-400">
                              <Clock className="w-2.5 h-2.5" />
                              DUE IN ABOUT 1 HOUR ({dueInfo.exactMins}m)
                            </span>
                          )}

                          {isOverdue && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-600 text-white font-bold flex items-center gap-0.5 animate-pulse">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              OVERDUE
                            </span>
                          )}

                          <span
                            className={cn(
                              'text-[10px] px-2 py-0.5 rounded-md border font-medium flex items-center gap-0.5 capitalize',
                              PRIORITY_STYLES[todo.priority] ||
                                PRIORITY_STYLES.medium
                            )}
                          >
                            {todo.priority === 'urgent' && (
                              <Flame className="w-2.5 h-2.5 text-red-600" />
                            )}
                            {todo.priority}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h4
                        className={cn(
                          'text-sm font-semibold leading-snug line-clamp-2',
                          isOverdue ? 'text-red-950 font-bold' : 'text-slate-800',
                          todo.status === 'completed' &&
                            'line-through text-slate-400 font-normal'
                        )}
                      >
                        {todo.title}
                      </h4>

                      {/* Description preview */}
                      {todo.description && (
                        <p
                          className={cn(
                            'text-xs line-clamp-2',
                            isOverdue ? 'text-red-700/80' : 'text-slate-400'
                          )}
                        >
                          {todo.description}
                        </p>
                      )}

                      {/* Subtask progress */}
                      {subtasks.length > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Checklist</span>
                            <span>
                              {completedSubtasks}/{subtasks.length}
                            </span>
                          </div>
                          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{
                                width: `${(completedSubtasks / subtasks.length) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Footer meta & quick move actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                        {dueInfo ? (
                          <span
                            className={cn(
                              'flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-md',
                              isDueIn1Hour
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold'
                                : isOverdue
                                ? 'bg-red-100 text-red-900 border border-red-300 font-bold'
                                : 'bg-slate-100 text-slate-600'
                            )}
                          >
                            <Calendar className="w-3 h-3" />
                            {dueInfo.text}
                          </span>
                        ) : (
                          <span />
                        )}

                        {/* Shift action buttons */}
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {col.id !== 'pending' && (
                            <button
                              onClick={() => onStatusChange(todo._id, 'pending')}
                              title="Move to To Do"
                              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}

                          {col.id !== 'in_progress' && (
                            <button
                              onClick={() =>
                                onStatusChange(todo._id, 'in_progress')
                              }
                              title="Move to In Progress"
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                            >
                              In Progress
                            </button>
                          )}

                          {col.id !== 'completed' && (
                            <button
                              onClick={() =>
                                onStatusChange(todo._id, 'completed')
                              }
                              title="Mark Complete"
                              className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
