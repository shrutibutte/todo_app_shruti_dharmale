export const CATEGORIES = [
  'Work',
  'Personal',
  'Shopping',
  'Health',
  'Other',
]

export const CATEGORY_DOTS = {
  Work: 'bg-blue-500',
  Personal: 'bg-purple-500',
  Shopping: 'bg-amber-500',
  Health: 'bg-rose-500',
  Other: 'bg-slate-400',
  General: 'bg-slate-400',
  Study: 'bg-emerald-500',
  Finance: 'bg-amber-500',
}

export const CATEGORY_STYLES = {
  Work: 'bg-blue-50 text-blue-700 border-blue-200',
  Personal: 'bg-purple-50 text-purple-700 border-purple-200',
  Shopping: 'bg-amber-50 text-amber-700 border-amber-200',
  Health: 'bg-rose-50 text-rose-700 border-rose-200',
  Other: 'bg-slate-100 text-slate-700 border-slate-200',
  General: 'bg-slate-100 text-slate-700 border-slate-200',
  Study: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Finance: 'bg-amber-50 text-amber-700 border-amber-200',
}

export const PRIORITY_STYLES = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  urgent: 'bg-red-50 text-red-700 border-red-300 font-semibold',
}

export const STATUS_CONFIG = {
  pending: {
    label: 'To Do',
    badge: 'bg-slate-100 text-slate-700',
    color: 'border-slate-300',
  },
  in_progress: {
    label: 'In Progress',
    badge: 'bg-blue-50 text-blue-700 border border-blue-200',
    color: 'border-blue-400',
  },
  completed: {
    label: 'Completed',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    color: 'border-emerald-500',
  },
}
