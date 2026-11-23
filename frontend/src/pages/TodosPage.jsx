import { useEffect, useState, useCallback } from 'react'
import { Plus, ListTodo, Calendar, Clock, CheckCircle2, Trash2, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import useTodoStore from '../store/todoStore'
import TodoCard from '../components/todos/TodoCard'
import TodoModal from '../components/todos/TodoModal'
import TaskDetailModal from '../components/todos/TaskDetailModal'
import KanbanBoard from '../components/todos/KanbanBoard'
import QuickAddBar from '../components/todos/QuickAddBar'
import TodoFilters from '../components/todos/TodoFilters'
import DeleteConfirmDialog from '../components/todos/DeleteConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import LoadingSkeleton from '../components/ui/Skeleton'

const filterConfig = {
  today: { title: "Today's Tasks", icon: Calendar },
  upcoming: { title: 'Upcoming Tasks', icon: Clock },
  completed: { title: 'Completed Tasks', icon: CheckCircle2 },
  trash: { title: 'Recently Deleted / Trash', icon: Trash2 },
}

export default function TodosPage({ filter }) {
  const {
    todos,
    isLoading,
    filters,
    setFilters,
    activeView,
    setActiveView,
    fetchTodos,
    completeTodo,
    updateTodoStatus,
    removeTodo,
    restoreTask,
    permanentlyDeleteTask,
  } = useTodoStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState(null)
  const [selectedTodo, setSelectedTodo] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    todo: null,
    permanent: false,
  })

  const isTrash = filter === 'trash'

  const pageTitle = filter
    ? filterConfig[filter]?.title || 'Tasks'
    : 'All Tasks'

  const loadTodos = useCallback(() => {
    const params = {}
    if (filter) {
      params.filter = filter
      if (filter === 'completed') {
        params.status = 'completed'
      }
    } else {
      if (filters.status) params.status = filters.status
      if (filters.priority) params.priority = filters.priority
      if (filters.category) params.category = filters.category
      if (filters.search) params.search = filters.search
    }
    fetchTodos(params).catch(() => {
      toast.error('Failed to load tasks')
    })
  }, [
    filter,
    filters.status,
    filters.priority,
    filters.category,
    filters.search,
    fetchTodos,
  ])

  useEffect(() => {
    loadTodos()
  }, [loadTodos])

  // Sync selectedTodo when todos change
  useEffect(() => {
    if (selectedTodo) {
      const refreshed = todos.find((t) => t._id === selectedTodo._id)
      if (refreshed) setSelectedTodo(refreshed)
    }
  }, [todos])

  // Defensive client-side filtering for fast and robust updates
  const displayedTodos = todos.filter((t) => {
    if (filter === 'completed' && t.status !== 'completed') return false
    if (!filter) {
      if (filters.category && filters.category !== 'All') {
        const cat = (t.category || 'Other').toLowerCase()
        if (cat !== filters.category.toLowerCase()) return false
      }
      // In Kanban board, do not filter by status because columns display every status!
      if (activeView !== 'kanban' && filters.status && t.status !== filters.status) return false
      if (filters.priority && t.priority !== filters.priority) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const matchesTitle = t.title?.toLowerCase().includes(q)
        const matchesDesc = t.description?.toLowerCase().includes(q)
        if (!matchesTitle && !matchesDesc) return false
      }
    }
    return true
  })

  const handleEdit = (todo) => {
    setEditingTodo(todo)
    setModalOpen(true)
  }

  const handleDelete = (todo) => {
    setDeleteDialog({ open: true, todo, permanent: false })
  }

  const handlePermanentDelete = (todo) => {
    setDeleteDialog({ open: true, todo, permanent: true })
  }

  const handleRestore = async (todo) => {
    try {
      await restoreTask(todo._id)
      toast.success('Task restored successfully')
    } catch {
      toast.error('Failed to restore task')
    }
  }

  const confirmDelete = async () => {
    if (deleteDialog.todo) {
      try {
        if (deleteDialog.permanent) {
          await permanentlyDeleteTask(deleteDialog.todo._id)
          toast.success('Task permanently deleted')
        } else {
          await removeTodo(deleteDialog.todo._id)
          toast.success('Task moved to trash')
        }
        if (selectedTodo?._id === deleteDialog.todo._id) {
          setSelectedTodo(null)
        }
      } catch {
        toast.error('Failed to delete task')
      }
    }
    setDeleteDialog({ open: false, todo: null, permanent: false })
  }

  const handleToggleComplete = async (id) => {
    try {
      await completeTodo(id)
    } catch {
      toast.error('Failed to update task')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await updateTodoStatus(id, status)
      toast.success('Task moved')
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to update task status'
      toast.error(msg)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingTodo(null)
    loadTodos()
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">{pageTitle}</h1>
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-sm font-semibold rounded-full">
              {displayedTodos.length}
            </span>
          </div>
          {isTrash && (
            <p className="text-xs text-slate-500 mt-1">
              Soft-deleted tasks stay here. You can restore them or permanently delete them.
            </p>
          )}
        </div>

        {!isTrash && (
          <button
            onClick={() => {
              setEditingTodo(null)
              setModalOpen(true)
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        )}
      </div>

      {/* Quick Add Bar (only for active views) */}
      {!isTrash && <QuickAddBar />}

      {/* Filters (only when no preset filter) */}
      {!filter && (
        <TodoFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          activeView={activeView}
          onViewChange={setActiveView}
        />
      )}

      {/* Content: List or Kanban Board */}
      {isLoading ? (
        <LoadingSkeleton type="todo" count={5} />
      ) : activeView === 'kanban' && !filter ? (
        <KanbanBoard
          todos={displayedTodos}
          onSelectTodo={(todo) => setSelectedTodo(todo)}
          onStatusChange={handleStatusChange}
        />
      ) : displayedTodos.length > 0 ? (
        <div className="space-y-3">
          {displayedTodos.map((todo) => (
            <TodoCard
              key={todo._id}
              todo={todo}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
              onSelect={(todo) => !isTrash && setSelectedTodo(todo)}
              isTrash={isTrash}
              onRestore={handleRestore}
              onPermanentDelete={handlePermanentDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={isTrash ? Trash2 : ListTodo}
          title={isTrash ? 'Trash is empty' : 'No tasks found'}
          description={
            isTrash
              ? 'No deleted tasks. Deleted items will appear here.'
              : filter
              ? `You have no ${filter} tasks.`
              : 'Create your first task to get started!'
          }
          actionLabel={isTrash ? null : 'Add Task'}
          onAction={() => {
            setEditingTodo(null)
            setModalOpen(true)
          }}
        />
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={!!selectedTodo && !isTrash}
        onClose={() => setSelectedTodo(null)}
        todo={selectedTodo}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add / Edit Modal */}
      <TodoModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        todo={editingTodo}
      />

      {/* Delete Confirm */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, todo: null, permanent: false })}
        onConfirm={confirmDelete}
        title={
          deleteDialog.permanent
            ? `permanently delete "${deleteDialog.todo?.title}"? This cannot be undone.`
            : `move "${deleteDialog.todo?.title}" to trash?`
        }
      />
    </div>
  )
}
