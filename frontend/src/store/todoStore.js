import { create } from 'zustand'
import toast from 'react-hot-toast'
import * as todosAPI from '../api/todos'

function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1) // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    osc.start()
    osc.stop(ctx.currentTime + 0.5)
  } catch {
    // Ignore audio autoplay restrictions
  }
}

const useTodoStore = create((set, get) => ({
  todos: [],
  stats: { total: 0, pending: 0, completed: 0, overdue: 0, inProgress: 0 },
  isLoading: false,
  activeView: 'list', // 'list' | 'kanban'
  filters: { status: '', priority: '', category: '', search: '', filter: '' },
  notifiedReminders: new Set(),

  setActiveView: (activeView) => set({ activeView }),

  fetchTodos: async (params) => {
    set({ isLoading: true })
    try {
      const data = await todosAPI.getTodos(params)
      const todos = data.todos || data.data?.todos || data.data || data
      set({ todos: Array.isArray(todos) ? todos : [], isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  fetchStats: async () => {
    try {
      const data = await todosAPI.getTodoStats()
      const stats = data.stats || data.data?.stats || data.data || data
      set({ stats })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  },

  addTodo: async (formData) => {
    try {
      const data = await todosAPI.createTodo(formData)
      const newTodo = data.todo || data.data?.todo || data.data || data
      set((state) => ({ todos: [newTodo, ...state.todos] }))
      get().fetchStats()
      return newTodo
    } catch (error) {
      throw error
    }
  },

  editTodo: async (id, formData) => {
    const previousTodos = get().todos
    // Optimistic update for subtasks, status, category, or other fields
    set((state) => ({
      todos: state.todos.map((t) =>
        t._id === id ? { ...t, ...formData } : t
      ),
    }))
    try {
      const data = await todosAPI.updateTodo(id, formData)
      const updatedTodo = data.todo || data.data?.todo || data.data || data
      set((state) => ({
        todos: state.todos.map((t) => (t._id === id ? updatedTodo : t)),
      }))
      get().fetchStats()
      return updatedTodo
    } catch (error) {
      set({ todos: previousTodos })
      throw error
    }
  },

  updateTodoStatus: async (id, status) => {
    const previousTodos = get().todos
    // Optimistic status update for instant 60fps drag & drop
    set((state) => ({
      todos: state.todos.map((t) => (t._id === id ? { ...t, status } : t)),
    }))
    try {
      const data = await todosAPI.updateTodo(id, { status })
      const updatedTodo = data.todo || data.data?.todo || data.data || data
      set((state) => ({
        todos: state.todos.map((t) => (t._id === id ? updatedTodo : t)),
      }))
      get().fetchStats()
      return updatedTodo
    } catch (error) {
      set({ todos: previousTodos })
      throw error
    }
  },

  toggleSubtask: async (todoId, subtaskIndex) => {
    const todo = get().todos.find((t) => t._id === todoId)
    if (!todo || !todo.subtasks) return
    const updatedSubtasks = todo.subtasks.map((st, idx) =>
      idx === subtaskIndex ? { ...st, completed: !st.completed } : st
    )
    return get().editTodo(todoId, { subtasks: updatedSubtasks })
  },

  removeTodo: async (id) => {
    try {
      await todosAPI.deleteTodo(id)
      set((state) => ({
        todos: state.todos.filter((t) => t._id !== id),
      }))
      get().fetchStats()
    } catch (error) {
      throw error
    }
  },

  restoreTask: async (id) => {
    try {
      await todosAPI.restoreTodo(id)
      set((state) => ({
        todos: state.todos.filter((t) => t._id !== id),
      }))
      get().fetchStats()
    } catch (error) {
      throw error
    }
  },

  permanentlyDeleteTask: async (id) => {
    try {
      await todosAPI.permanentDeleteTodo(id)
      set((state) => ({
        todos: state.todos.filter((t) => t._id !== id),
      }))
      get().fetchStats()
    } catch (error) {
      throw error
    }
  },

  completeTodo: async (id) => {
    try {
      const data = await todosAPI.toggleComplete(id)
      const updatedTodo = data.todo || data.data?.todo || data.data || data
      set((state) => ({
        todos: state.todos.map((t) => (t._id === id ? updatedTodo : t)),
      }))
      get().fetchStats()
      return updatedTodo
    } catch (error) {
      throw error
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }))
  },

  checkReminders: () => {
    const { todos, notifiedReminders } = get()
    const now = new Date()
    const updated = new Set(notifiedReminders)
    let stateChanged = false

    todos.forEach((todo) => {
      if (todo.status === 'completed' || todo.deletedAt) return

      // 1. Explicit configured Reminder (reminderAt)
      const customKey = `${todo._id}_custom`
      const isDueCustom =
        todo.reminderSent === true ||
        (todo.reminderAt && new Date(todo.reminderAt) <= now)

      if (isDueCustom && !updated.has(customKey)) {
        playChime()
        toast(
          `⏰ Reminder: ${todo.title}${
            todo.priority === 'urgent' ? ' (URGENT)' : ''
          }`,
          { duration: 8000, icon: '🔔' }
        )

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('TaskFlow Reminder', {
            body: `${todo.title}${
              todo.priority === 'urgent' ? ' (🔥 URGENT)' : ''
            }`,
            icon: '/vite.svg',
          })
        }

        updated.add(customKey)
        stateChanged = true
      }

      // 2. Automated Due Date Reminders (1 hour & 1 day)
      if (todo.dueDate) {
        const dueTime = new Date(todo.dueDate).getTime()
        const diffMs = dueTime - now.getTime()

        // 2a. Due in Upcoming 1 Hour (0 < diffMs <= 60 minutes)
        const oneHourKey = `${todo._id}_due_1h`
        if (diffMs > 0 && diffMs <= 60 * 60 * 1000 && !updated.has(oneHourKey)) {
          const remainingMins = Math.max(1, Math.round(diffMs / (60 * 1000)))
          playChime()
          toast(
            `⚠️ Due in ${remainingMins} min${remainingMins > 1 ? 's' : ''}: "${todo.title}"`,
            {
              duration: 9000,
              icon: '⏳',
              style: {
                border: '1px solid #f59e0b',
                color: '#92400e',
                background: '#fffbeb',
                fontWeight: '600',
              },
            }
          )
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('TaskFlow Due Alert', {
              body: `Task "${todo.title}" is due in ${remainingMins} minutes!`,
              icon: '/vite.svg',
            })
          }
          updated.add(oneHourKey)
          stateChanged = true
        }

        // 2b. Due in 1 Day / Tomorrow (20h <= diffMs <= 24h)
        const oneDayKey = `${todo._id}_due_1d`
        if (
          diffMs > 0 &&
          diffMs <= 24 * 60 * 60 * 1000 &&
          diffMs > 20 * 60 * 60 * 1000 &&
          !updated.has(oneDayKey)
        ) {
          playChime()
          toast(
            `📅 Due Tomorrow: "${todo.title}" is due in 24 hours`,
            {
              duration: 8000,
              icon: '📅',
              style: {
                border: '1px solid #6366f1',
                color: '#3730a3',
                background: '#eef2ff',
                fontWeight: '500',
              },
            }
          )
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('TaskFlow Upcoming Due Date', {
              body: `Task "${todo.title}" is due tomorrow!`,
              icon: '/vite.svg',
            })
          }
          updated.add(oneDayKey)
          stateChanged = true
        }

        // 2c. Newly Overdue Alert (became overdue within last 60 minutes)
        const overdueKey = `${todo._id}_overdue`
        if (diffMs < 0 && diffMs >= -60 * 60 * 1000 && !updated.has(overdueKey)) {
          playChime()
          toast.error(`🚨 Overdue Task: "${todo.title}" is past its deadline!`, {
            duration: 10000,
          })
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('TaskFlow Overdue Alert', {
              body: `Task "${todo.title}" is OVERDUE!`,
              icon: '/vite.svg',
            })
          }
          updated.add(overdueKey)
          stateChanged = true
        }
      }
    })

    if (stateChanged) {
      set({ notifiedReminders: updated })
    }
  },
}))

export default useTodoStore
