import { useState, useEffect } from 'react'
import {
  X,
  Upload,
  FileText,
  Image,
  Trash2,
  Plus,
  Flame,
  CheckSquare,
} from 'lucide-react'
import toast from 'react-hot-toast'
import useTodoStore from '../../store/todoStore'
import { getAttachmentUrl, deleteAttachment } from '../../api/todos'
import { CATEGORIES, CATEGORY_STYLES, PRIORITY_STYLES } from '../../lib/constants'
import { cn } from '../../lib/utils'

export default function TodoModal({ isOpen, onClose, todo }) {
  const { addTodo, editTodo, filters } = useTodoStore()
  const isEditing = !!todo

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Work')
  const [priority, setPriority] = useState('medium')
  const [status, setStatus] = useState('pending')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [reminder, setReminder] = useState(false)
  const [reminderTime, setReminderTime] = useState('60')
  const [subtasks, setSubtasks] = useState([])
  const [newSubtaskInput, setNewSubtaskInput] = useState('')
  const [files, setFiles] = useState([])
  const [existingAttachments, setExistingAttachments] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (todo) {
      setTitle(todo.title || '')
      setDescription(todo.description || '')
      setCategory(todo.category || 'Work')
      setPriority(todo.priority || 'medium')
      setStatus(todo.status || 'pending')
      if (todo.dueDate) {
        const d = new Date(todo.dueDate)
        setDueDate(d.toISOString().split('T')[0])
        setDueTime(d.toTimeString().slice(0, 5))
      } else {
        setDueDate('')
        setDueTime('')
      }
      setReminder(!!todo.reminderAt)
      setReminderTime('60')
      setSubtasks(todo.subtasks || [])
      setExistingAttachments(todo.attachments || [])
    } else {
      setTitle('')
      setDescription('')
      setCategory(
        filters.category && filters.category !== 'All'
          ? filters.category
          : 'Work'
      )
      setPriority('medium')
      setStatus('pending')
      setDueDate('')
      setDueTime('')
      setReminder(false)
      setReminderTime('30')
      setSubtasks([])
      setExistingAttachments([])
    }
    setNewSubtaskInput('')
    setFiles([])
  }, [todo, isOpen, filters.category])

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles((prev) => [...prev, ...selectedFiles])
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDeleteAttachment = async (filename) => {
    try {
      await deleteAttachment(todo._id, filename)
      setExistingAttachments((prev) =>
        prev.filter((a) => a.filename !== filename)
      )
      toast.success('Attachment removed')
    } catch {
      toast.error('Failed to remove attachment')
    }
  }

  const handleAddSubtask = (e) => {
    e.preventDefault()
    if (!newSubtaskInput.trim()) return
    setSubtasks((prev) => [
      ...prev,
      { title: newSubtaskInput.trim(), completed: false },
    ])
    setNewSubtaskInput('')
  }

  const handleRemoveSubtask = (index) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    setIsSubmitting(true)
    try {
      let fullDueDate = ''
      if (dueDate) {
        fullDueDate = dueTime
          ? new Date(`${dueDate}T${dueTime}`).toISOString()
          : new Date(`${dueDate}T23:59:59`).toISOString()
      }

      let reminderTimestamp = undefined
      if (reminder && fullDueDate) {
        const targetDate = new Date(fullDueDate)
        if (reminderTime === 'both') {
          const oneDayBefore = new Date(targetDate.getTime() - 24 * 60 * 60 * 1000)
          if (oneDayBefore > new Date()) {
            reminderTimestamp = oneDayBefore.toISOString()
          } else {
            const oneHourBefore = new Date(targetDate.getTime() - 60 * 60 * 1000)
            reminderTimestamp = oneHourBefore.toISOString()
          }
        } else {
          targetDate.setMinutes(targetDate.getMinutes() - parseInt(reminderTime, 10))
          reminderTimestamp = targetDate.toISOString()
        }
      }

      const finalSubtasks = [...subtasks]
      if (newSubtaskInput.trim()) {
        finalSubtasks.push({ title: newSubtaskInput.trim(), completed: false })
      }

      const formData = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status,
        dueDate: fullDueDate || undefined,
        reminderAt: reminderTimestamp,
        subtasks: finalSubtasks,
        attachments: files,
      }

      if (isEditing) {
        await editTodo(todo._id, formData)
        toast.success('Task updated!')
      } else {
        await addTodo(formData)
        toast.success('Task created!')
      }
      onClose()
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Something went wrong'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const isImage = (filename) => /\.(jpg|jpeg|png|webp)$/i.test(filename)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEditing ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                    category === cat
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Add more details..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors resize-none"
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-1">
                {['low', 'medium', 'high', 'urgent'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      'py-1.5 px-1 rounded-lg text-xs font-medium capitalize transition-colors border text-center flex items-center justify-center gap-0.5',
                      priority === p
                        ? p === 'urgent'
                          ? 'bg-red-600 text-white border-red-600 font-semibold'
                          : p === 'high'
                          ? 'bg-orange-500 text-white border-orange-500'
                          : p === 'medium'
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    )}
                  >
                    {p === 'urgent' && <Flame className="w-2.5 h-2.5" />}
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="pending">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Checklist / Subtasks */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Checklist / Subtasks
            </label>
            <div className="space-y-1.5 mb-2">
              {subtasks.map((st, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-xs"
                >
                  <span className="text-slate-700 truncate">{st.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(i)}
                    className="text-slate-400 hover:text-red-500 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSubtask(e)
                  }
                }}
                placeholder="Add subtask and hit Add..."
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
              >
                Add
              </button>
            </div>
          </div>

          {/* Due Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
              />
            </div>
          </div>

          {/* Reminder */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">
                Reminder
              </label>
              <button
                type="button"
                onClick={() => setReminder(!reminder)}
                className={cn(
                  'w-10 h-5.5 rounded-full relative transition-colors',
                  reminder ? 'bg-indigo-600' : 'bg-slate-300'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform',
                    reminder ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
            {reminder && (
              <div className="mt-2">
                <select
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                >
                  <option value="60">1 hour before due date</option>
                  <option value="1440">1 day before due date (24 hours)</option>
                  <option value="both">Both (1 day & 1 hour before)</option>
                  <option value="30">30 minutes before</option>
                  <option value="15">15 minutes before</option>
                </select>
              </div>
            )}
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Attachments (Images or PDF)
            </label>

            {/* Existing attachments */}
            {existingAttachments.length > 0 && (
              <div className="space-y-2 mb-3">
                {existingAttachments.map((att) => (
                  <div
                    key={att.filename}
                    className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    {isImage(att.filename) ? (
                      <Image className="w-4 h-4 text-slate-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-xs text-slate-600 flex-1 truncate">
                      {att.originalName || att.filename}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAttachment(att.filename)}
                      className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* File upload area */}
            <label className="flex flex-col items-center justify-center w-full py-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors">
              <Upload className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-xs text-slate-500">
                Click to attach image or PDF
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                Up to 3 files, max 5MB each
              </span>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Selected files */}
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs text-slate-600 p-1.5 bg-slate-50 rounded-md"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span className="flex-1 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? 'Saving...'
                : isEditing
                ? 'Update Task'
                : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
