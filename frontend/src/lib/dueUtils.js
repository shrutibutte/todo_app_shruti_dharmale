import { format, isToday, isSameDay, isPast } from 'date-fns'

/**
 * Returns detailed due status for a task
 */
export function getDueStatus(dueDate, status) {
  if (!dueDate || status === 'completed') return null

  const now = new Date()
  const due = new Date(dueDate)
  const diffMs = due.getTime() - now.getTime()

  // Overdue
  if (diffMs < 0) {
    const minsAgo = Math.abs(Math.round(diffMs / 60000))
    if (minsAgo < 60) {
      return {
        type: 'overdue',
        text: `Overdue by ${minsAgo}m`,
        badgeClass: 'bg-red-600 text-white font-bold animate-pulse',
        cardClass: 'bg-gradient-to-r from-red-50 to-red-100/70 border-red-400 ring-2 ring-red-300',
        titleClass: 'text-red-950 font-bold',
        isOverdue: true,
      }
    }
    const hoursAgo = Math.floor(minsAgo / 60)
    if (hoursAgo < 24) {
      return {
        type: 'overdue',
        text: `Overdue by ${hoursAgo}h`,
        badgeClass: 'bg-red-600 text-white font-bold animate-pulse',
        cardClass: 'bg-gradient-to-r from-red-50 to-red-100/70 border-red-400 ring-2 ring-red-300',
        titleClass: 'text-red-950 font-bold',
        isOverdue: true,
      }
    }
    return {
      type: 'overdue',
      text: `Overdue · ${format(due, 'MMM d')}`,
      badgeClass: 'bg-red-600 text-white font-bold animate-pulse',
      cardClass: 'bg-gradient-to-r from-red-50 to-red-100/70 border-red-400 ring-2 ring-red-300',
      titleClass: 'text-red-950 font-bold',
      isOverdue: true,
    }
  }

  // Due within 1 hour! (High priority)
  if (diffMs <= 60 * 60 * 1000) {
    const mins = Math.max(1, Math.round(diffMs / 60000))
    return {
      type: 'due-1h',
      text: mins <= 10 ? `⚡ Due in ${mins}m!` : `⚡ Due in about 1 hour (${mins}m)`,
      exactMins: mins,
      badgeClass: 'bg-amber-600 text-white font-extrabold shadow-sm animate-pulse ring-2 ring-amber-300',
      cardClass: 'bg-amber-50/90 border-2 border-amber-400 ring-2 ring-amber-300/60 shadow-md',
      titleClass: 'text-amber-950 font-extrabold',
      isDueIn1Hour: true,
    }
  }

  // Due within 3 hours
  if (diffMs <= 3 * 60 * 60 * 1000) {
    const hours = Math.round(diffMs / (60 * 60 * 1000))
    return {
      type: 'due-soon',
      text: `⏳ Due in ~${hours} hours`,
      badgeClass: 'bg-amber-500 text-white font-bold',
      cardClass: 'bg-amber-50/50 border border-amber-300',
      titleClass: 'text-amber-900 font-semibold',
    }
  }

  // Due Today
  if (isToday(due)) {
    return {
      type: 'due-today',
      text: `DUE TODAY · ${format(due, 'h:mm a')}`,
      badgeClass: 'bg-amber-500 text-white font-bold shadow-sm',
      cardClass: 'bg-amber-50/40 border border-amber-300',
      titleClass: 'text-amber-950 font-bold',
      isDueToday: true,
    }
  }

  // Due Tomorrow
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (isSameDay(due, tomorrow)) {
    return {
      type: 'due-tomorrow',
      text: `Due Tomorrow · ${format(due, 'h:mm a')}`,
      badgeClass: 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200',
      cardClass: 'bg-white border-slate-200',
      titleClass: 'text-slate-800',
    }
  }

  return {
    type: 'normal',
    text: format(due, 'MMM d, yyyy'),
    badgeClass: 'bg-slate-100 text-slate-600 font-medium',
    cardClass: 'bg-white border-slate-200',
    titleClass: 'text-slate-800',
  }
}
