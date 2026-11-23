import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  X,
  Flame,
  ChevronRight,
} from 'lucide-react'
import useTodoStore from '../../store/todoStore'
import { getDueStatus } from '../../lib/dueUtils'
import { cn } from '../../lib/utils'

export default function NotificationDropdown({ isOpen, onClose }) {
  const { todos } = useTodoStore()
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  // Close on escape or outside click
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Collect urgent tasks:
  // 1. Due within 1 hour
  // 2. Overdue
  // 3. Due today
  // 4. Custom reminders
  const activeTodos = todos.filter((t) => t.status !== 'completed' && !t.deletedAt)

  const dueIn1Hour = []
  const overdue = []
  const dueToday = []
  const upcomingReminders = []

  activeTodos.forEach((todo) => {
    if (todo.dueDate) {
      const status = getDueStatus(todo.dueDate, todo.status)
      if (status?.type === 'due-1h') {
        dueIn1Hour.push({ todo, status })
      } else if (status?.type === 'overdue') {
        overdue.push({ todo, status })
      } else if (status?.type === 'due-today' || status?.type === 'due-soon') {
        dueToday.push({ todo, status })
      }
    }
    if (todo.reminderAt && !todo.reminderSent) {
      upcomingReminders.push(todo)
    }
  })

  const totalAlerts = dueIn1Hour.length + overdue.length + dueToday.length + upcomingReminders.length

  const handleTaskClick = (todo) => {
    onClose()
    navigate('/todos')
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-slate-50 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
          {totalAlerts > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
              {totalAlerts}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
        {totalAlerts === 0 ? (
          <div className="py-8 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-700">All caught up!</p>
            <p className="text-xs text-slate-400 mt-0.5">
              No tasks due in 1 hour or overdue right now.
            </p>
          </div>
        ) : (
          <>
            {/* 1. DUE IN 1 HOUR (Highest Priority Section) */}
            {dueIn1Hour.length > 0 && (
              <div className="pb-2">
                <div className="px-2 py-1 text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Due in about 1 hour ({dueIn1Hour.length})
                </div>
                <div className="space-y-1.5 mt-1">
                  {dueIn1Hour.map(({ todo, status }) => (
                    <div
                      key={todo._id}
                      onClick={() => handleTaskClick(todo)}
                      className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-300 hover:bg-amber-100/70 cursor-pointer transition-colors group flex items-start justify-between gap-2"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-600 text-white font-extrabold shadow-sm animate-pulse flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {status.text}
                          </span>
                          {todo.priority === 'urgent' && (
                            <span className="text-[10px] text-red-600 font-bold flex items-center gap-0.5">
                              <Flame className="w-3 h-3" />
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-amber-950 truncate group-hover:text-amber-900">
                          {todo.title}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform mt-1 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. OVERDUE TASKS */}
            {overdue.length > 0 && (
              <div className="py-2">
                <div className="px-2 py-1 text-[11px] font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  Overdue Tasks ({overdue.length})
                </div>
                <div className="space-y-1.5 mt-1">
                  {overdue.map(({ todo, status }) => (
                    <div
                      key={todo._id}
                      onClick={() => handleTaskClick(todo)}
                      className="p-2.5 rounded-xl bg-red-50/80 border border-red-300 hover:bg-red-100/70 cursor-pointer transition-colors group flex items-start justify-between gap-2"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-600 text-white font-bold inline-block">
                          {status.text}
                        </span>
                        <p className="text-xs font-bold text-red-950 truncate">
                          {todo.title}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-red-500 group-hover:translate-x-0.5 transition-transform mt-1 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. DUE TODAY */}
            {dueToday.length > 0 && (
              <div className="py-2">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Due Today ({dueToday.length})
                </div>
                <div className="space-y-1.5 mt-1">
                  {dueToday.map(({ todo, status }) => (
                    <div
                      key={todo._id}
                      onClick={() => handleTaskClick(todo)}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 cursor-pointer transition-colors group flex items-start justify-between gap-2"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold inline-block">
                          {status.text}
                        </span>
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {todo.title}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform mt-1 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer link to All Tasks */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200/80 text-center">
        <button
          onClick={() => {
            onClose()
            navigate('/todos')
          }}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1"
        >
          View all tasks in Todo List
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
