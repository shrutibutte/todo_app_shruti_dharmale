import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  CheckSquare,
  LayoutDashboard,
  ListTodo,
  Calendar,
  Clock,
  CheckCircle2,
  LogOut,
  X,
  Tag,
  Trash2,
  TrendingUp,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import useTodoStore from '../../store/todoStore'
import { CATEGORIES, CATEGORY_DOTS } from '../../lib/constants'
import { cn } from '../../lib/utils'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'All Tasks', icon: ListTodo, to: '/todos' },
  { label: 'Today', icon: Calendar, to: '/today' },
  { label: 'Upcoming', icon: Clock, to: '/upcoming' },
  { label: 'Completed', icon: CheckCircle2, to: '/completed' },
  { label: 'Weekly Progress', icon: TrendingUp, to: '/progress' },
  { label: 'Trash', icon: Trash2, to: '/trash' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore()
  const { filters, setFilters, stats } = useTodoStore()
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleCategoryClick = (cat) => {
    setFilters({ category: filters.category === cat ? '' : cat })
    navigate('/todos')
    if (onClose) onClose()
  }

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800">TaskFlow</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                )
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.to === '/trash' && stats.trashCount > 0 && (
                <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-semibold">
                  {stats.trashCount}
                </span>
              )}
            </NavLink>
          ))}

          {/* Categories section - Collapsible */}
          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-left"
            >
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Categories
              </span>
              <div className="flex items-center gap-1.5">
                {filters.category && (
                  <span className="text-[10px] bg-indigo-50 text-indigo-600 font-semibold px-1.5 py-0.5 rounded">
                    Active
                  </span>
                )}
                {isCategoriesOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {isCategoriesOpen && (
              <div className="mt-1 space-y-0.5 animate-in fade-in duration-150 pl-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors',
                      filters.category === cat
                        ? 'bg-indigo-50 text-indigo-600 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        CATEGORY_DOTS[cat] || 'bg-slate-400'
                      )}
                    />
                    <span className="truncate flex-1 text-left">{cat}</span>
                  </button>
                ))}
                {filters.category && (
                  <button
                    onClick={() => setFilters({ category: '' })}
                    className="w-full text-left text-[11px] text-indigo-600 hover:underline px-3 py-1"
                  >
                    Clear category filter
                  </button>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* User info */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-sm">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.email || ''}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
