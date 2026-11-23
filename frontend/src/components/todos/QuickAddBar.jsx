import { useState, useEffect } from 'react'
import { Plus, Flame, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import useTodoStore from '../../store/todoStore'
import { CATEGORIES } from '../../lib/constants'

export default function QuickAddBar() {
  const { addTodo, filters } = useTodoStore()
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [category, setCategory] = useState(
    filters.category && filters.category !== 'All' ? filters.category : 'Work'
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync category with active category filter
  useEffect(() => {
    if (filters.category && filters.category !== 'All') {
      setCategory(filters.category)
    }
  }, [filters.category])

  const handleQuickAdd = async (e) => {
    if (e) e.preventDefault()
    if (!title.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await addTodo({
        title: title.trim(),
        priority,
        category,
        status: 'pending',
      })
      setTitle('')
      toast.success('Task added!')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to add task'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleQuickAdd}
      className="bg-white rounded-xl border border-slate-200/80 p-2.5 shadow-sm flex flex-col sm:flex-row items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500"
    >
      <div className="flex items-center gap-2 flex-1 w-full px-2">
        <Plus className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleQuickAdd(e)
            }
          }}
          placeholder="Add a task quickly... (Press Enter)"
          className="w-full text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none bg-transparent"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
        {/* Category selector */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Priority selector */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">🔥 Urgent</option>
        </select>

        <button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 shrink-0"
        >
          {isSubmitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            'Add'
          )}
        </button>
      </div>
    </form>
  )
}
