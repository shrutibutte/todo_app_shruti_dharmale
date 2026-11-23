import { useState } from 'react'
import { Menu, Search, Bell } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import useTodoStore from '../../store/todoStore'
import NotificationDropdown from './NotificationDropdown'
import { getDueStatus } from '../../lib/dueUtils'

export default function TopNav({ onMenuToggle, pageTitle }) {
  const { user } = useAuthStore()
  const { setFilters, todos } = useTodoStore()
  const [notificationOpen, setNotificationOpen] = useState(false)
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

  // Calculate alert count (due in 1h, overdue, due today, active reminders)
  const urgentCount = todos.filter((t) => {
    if (t.status === 'completed' || t.deletedAt) return false
    if (t.dueDate) {
      const status = getDueStatus(t.dueDate, t.status)
      if (
        status?.type === 'due-1h' ||
        status?.type === 'overdue' ||
        status?.type === 'due-today'
      ) {
        return true
      }
    }
    if (t.reminderAt && !t.reminderSent) return true
    return false
  }).length

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-30">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-slate-800">
          {pageTitle || 'Dashboard'}
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Search - desktop only */}
        <div className="hidden md:flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search tasks..."
            onChange={(e) => setFilters({ search: e.target.value })}
            className="rounded-lg bg-slate-50 border border-slate-200 pl-9 pr-4 py-2 w-64 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
          />
        </div>

        {/* Notification bell with Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {urgentCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-sm animate-pulse">
                {urgentCount > 9 ? '9+' : urgentCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={notificationOpen}
            onClose={() => setNotificationOpen(false)}
          />
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-sm">
          {userInitial}
        </div>
      </div>
    </header>
  )
}
