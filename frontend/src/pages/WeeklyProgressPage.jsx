import { useEffect } from 'react'
import {
  TrendingUp,
  CheckCircle2,
  Calendar,
  Award,
  Sparkles,
  Clock,
  ArrowRight,
  ListTodo,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { format, startOfWeek, endOfWeek, isSameDay } from 'date-fns'
import useTodoStore from '../store/todoStore'
import WeeklyProgressCard from '../components/dashboard/WeeklyProgressCard'
import TodoCard from '../components/todos/TodoCard'

export default function WeeklyProgressPage() {
  const { todos, stats, fetchStats, fetchTodos, completeTodo } = useTodoStore()

  useEffect(() => {
    fetchStats()
    fetchTodos({})
  }, [])

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  // Find all tasks completed during the current week
  const completedThisWeek = todos.filter((todo) => {
    if (todo.status !== 'completed') return false
    const d = todo.completedAt ? new Date(todo.completedAt) : new Date(todo.updatedAt || todo.createdAt)
    return d >= weekStart && d <= weekEnd
  })

  // Pending tasks due this week
  const dueThisWeekPending = todos.filter((todo) => {
    if (todo.status === 'completed') return false
    if (!todo.dueDate) return false
    const d = new Date(todo.dueDate)
    return d >= weekStart && d <= weekEnd
  })

  const effectiveCompleted = Math.max(stats.weeklyCompleted || 0, completedThisWeek.length)
  const effectiveTotal = Math.max(stats.weeklyTotal || 0, effectiveCompleted + dueThisWeekPending.length, effectiveCompleted)
  const effectiveRate = effectiveTotal > 0 ? Math.round((effectiveCompleted / effectiveTotal) * 100) : (effectiveCompleted > 0 ? 100 : 0)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            Weekly Progress & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Week of {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
          </p>
        </div>

        <Link
          to="/todos"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition-colors self-start sm:self-auto"
        >
          View All Tasks
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Banner Card */}
      <WeeklyProgressCard stats={stats} todos={todos} />

      {/* Stat Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Completed This Week</p>
            <p className="text-xl font-bold text-slate-800">
              {effectiveCompleted}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Weekly Goal Rate</p>
            <p className="text-xl font-bold text-slate-800">
              {effectiveRate}%
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Remaining Due This Week</p>
            <p className="text-xl font-bold text-slate-800">
              {dueThisWeekPending.length}
            </p>
          </div>
        </div>
      </div>

      {/* Tasks Completed This Week List */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Tasks Completed This Week ({completedThisWeek.length})
        </h2>

        {completedThisWeek.length > 0 ? (
          <div className="space-y-2.5">
            {completedThisWeek.map((todo) => (
              <TodoCard
                key={todo._id}
                todo={todo}
                onEdit={() => {}}
                onDelete={() => {}}
                onToggleComplete={completeTodo}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center text-slate-400 text-sm">
            <ListTodo className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No tasks completed yet this week. Complete tasks to see them tracked here!
          </div>
        )}
      </div>
    </div>
  )
}
