import { Search, LayoutList, LayoutGrid } from 'lucide-react'
import { CATEGORIES } from '../../lib/constants'
import { cn } from '../../lib/utils'

export default function TodoFilters({
  filters,
  onFilterChange,
  activeView,
  onViewChange,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
          />
        </div>

        {/* Category filter */}
        <select
          value={filters.category || ''}
          onChange={(e) => onFilterChange({ category: e.target.value })}
          className="w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filters.status || ''}
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className="w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="pending">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        {/* Priority filter */}
        <select
          value={filters.priority || ''}
          onChange={(e) => onFilterChange({ priority: e.target.value })}
          className="w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">🔥 Urgent</option>
        </select>

        {/* View Switcher: List vs Board */}
        {onViewChange && (
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => onViewChange('list')}
              className={cn(
                'p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors',
                activeView === 'list'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              )}
              title="List View"
            >
              <LayoutList className="w-4 h-4" />
              <span className="hidden md:inline">List</span>
            </button>
            <button
              onClick={() => onViewChange('kanban')}
              className={cn(
                'p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors',
                activeView === 'kanban'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              )}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline">Board</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick category filter tags */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => onFilterChange({ category: '' })}
          className={cn(
            'px-2.5 py-1 rounded-full border transition-colors shrink-0',
            !filters.category
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          )}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              onFilterChange({
                category: filters.category === cat ? '' : cat,
              })
            }
            className={cn(
              'px-2.5 py-1 rounded-full border transition-colors shrink-0',
              filters.category === cat
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}
