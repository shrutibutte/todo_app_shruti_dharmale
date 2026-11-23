import { useEffect, useState } from 'react'
import {
  ListTodo,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  CalendarDays,
  Zap,
} from 'lucide-react'
import { format, isToday, isFuture, addDays, isBefore } from 'date-fns'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import useTodoStore from '../store/todoStore'
import StatCard from '../components/dashboard/StatCard'
import TodoCard from '../components/todos/TodoCard'
import TodoModal from '../components/todos/TodoModal'
import TaskDetailModal from '../components/todos/TaskDetailModal'
import QuickAddBar from '../components/todos/QuickAddBar'
import DeleteConfirmDialog from '../components/todos/DeleteConfirmDialog'
import WeeklyProgressCard from '../components/dashboard/WeeklyProgressCard'
import EmptyState from '../components/ui/EmptyState'
import { StatCardSkeleton, TodoCardSkeleton } from '../components/ui/Skeleton'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const {
    todos,
    stats,
    isLoading,
    fetchTodos,
    fetchStats,
    completeTodo,
    removeTodo,
  } = useTodoStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState(null)
  const [selectedTodo, setSelectedTodo] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, todo: null })
  const [statsLoading, setStatsLoading] = useState(true)

  const loadData = async () => {
    setStatsLoading(true)
    try {
      await Promise.all([fetchStats(), fetchTodos({})])
    } catch {
      // handled
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Sync selectedTodo
  useEffect(() => {
    if (selectedTodo) {
      const refreshed = todos.find((t) => t._id === selectedTodo._id)
      if (refreshed) setSelectedTodo(refreshed)
    }
  }, [todos])

  const todayTodos = todos.filter((t) => {
    if (t.status === 'completed') return false
    if (!t.dueDate) return false
    return isToday(new Date(t.dueDate))
  })

  const upcomingTodos = todos.filter((t) => {
    if (t.status === 'completed') return false
    if (!t.dueDate) return false
    const d = new Date(t.dueDate)
    return isFuture(d) && isBefore(d, addDays(new Date(), 7)) && !isToday(d)
  })

  const handleEdit = (todo) => {
    setEditingTodo(todo)
    setModalOpen(true)
  }

  const handleDelete = (todo) => {
    setDeleteDialog({ open: true, todo })
  }

  const confirmDelete = async () => {
    if (deleteDialog.todo) {
      try {
        await removeTodo(deleteDialog.todo._id)
        if (selectedTodo?._id === deleteDialog.todo._id) {
          setSelectedTodo(null)
        }
        toast.success('Task deleted')
      } catch {
        toast.error('Failed to delete task')
      }
    }
    setDeleteDialog({ open: false, todo: null })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTodo(null)
            setModalOpen(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Quick Add Bar */}
      <QuickAddBar />

      {/* Weekly Progress Banner */}
      {!statsLoading && (
        <WeeklyProgressCard stats={stats} todos={todos} />
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Tasks"
              value={stats.total || 0}
              icon={ListTodo}
              color="indigo"
            />
            <StatCard
              title="Pending"
              value={stats.pending || 0}
              icon={Clock}
              color="amber"
            />
            <StatCard
              title="Completed"
              value={stats.completed || 0}
              icon={CheckCircle}
              color="emerald"
            />
            <StatCard
              title="Overdue"
              value={stats.overdue || 0}
              icon={AlertCircle}
              color="red"
            />
          </>
        )}
      </div>

      {/* Today's Tasks */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-indigo-500" />
          Today&apos;s Tasks
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            <TodoCardSkeleton />
            <TodoCardSkeleton />
          </div>
        ) : todayTodos.length > 0 ? (
          <div className="space-y-3">
            {todayTodos.map((todo) => (
              <TodoCard
                key={todo._id}
                todo={todo}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={completeTodo}
                onSelect={(todo) => setSelectedTodo(todo)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CheckCircle}
            title="No tasks for today"
            description="You're all caught up! Add a new task to get started."
          />
        )}
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          Upcoming Deadlines
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            <TodoCardSkeleton />
            <TodoCardSkeleton />
          </div>
        ) : upcomingTodos.length > 0 ? (
          <div className="space-y-3">
            {upcomingTodos.map((todo) => (
              <TodoCard
                key={todo._id}
                todo={todo}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={completeTodo}
                onSelect={(todo) => setSelectedTodo(todo)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="No upcoming deadlines"
            description="No tasks due in the next 7 days."
          />
        )}
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={!!selectedTodo}
        onClose={() => setSelectedTodo(null)}
        todo={selectedTodo}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      <TodoModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingTodo(null)
          loadData()
        }}
        todo={editingTodo}
      />

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, todo: null })}
        onConfirm={confirmDelete}
        title={deleteDialog.todo?.title}
      />
    </div>
  )
}
