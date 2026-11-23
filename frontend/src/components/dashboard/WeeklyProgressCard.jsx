import { TrendingUp, CheckCircle2, Award } from 'lucide-react'
import { format, startOfWeek, endOfWeek } from 'date-fns'

export default function WeeklyProgressCard({ stats, todos = [] }) {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  // Calculate client fallback if stats.weeklyCompleted is 0 but completed tasks exist
  const localCompleted = todos.filter((t) => {
    if (t.status !== 'completed') return false
    const d = t.completedAt ? new Date(t.completedAt) : new Date(t.updatedAt || t.createdAt)
    return d >= weekStart && d <= weekEnd
  }).length

  const localDueThisWeek = todos.filter((t) => {
    if (!t.dueDate) return false
    const d = new Date(t.dueDate)
    return d >= weekStart && d <= weekEnd
  }).length

  const weeklyCompleted = Math.max(stats?.weeklyCompleted || 0, localCompleted)
  const calculatedTotal = Math.max(stats?.weeklyTotal || 0, localCompleted + localDueThisWeek, weeklyCompleted)
  const weeklyTotal = calculatedTotal > 0 ? calculatedTotal : weeklyCompleted
  const weeklyRate = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : (weeklyCompleted > 0 ? 100 : 0)

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const todayDayName = format(now, 'EEE')

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
      {/* Background soft glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />

      {/* Top row */}
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-100 font-medium uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Weekly Progress
          </div>
          <h3 className="text-xl font-bold">
            {weeklyCompleted} Tasks Done
          </h3>
          <p className="text-xs text-indigo-100/90 mt-0.5">
            {weeklyCompleted} completed of {weeklyTotal} total tracked this week
          </p>
        </div>

        <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md flex flex-col items-center justify-center border border-white/20">
          <span className="text-base font-extrabold">{weeklyRate}%</span>
          <span className="text-[9px] uppercase tracking-wider text-indigo-100 font-semibold">
            Rate
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="my-4 relative z-10 space-y-1.5">
        <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-white rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${Math.min(100, Math.max(5, weeklyRate))}%` }}
          />
        </div>
      </div>

      {/* Days of week strip */}
      <div className="grid grid-cols-7 gap-1 pt-1 border-t border-white/15 text-center relative z-10">
        {daysOfWeek.map((day) => {
          const isCurrent = day === todayDayName
          return (
            <div
              key={day}
              className={`py-1 rounded-md text-[11px] font-medium transition-colors ${
                isCurrent
                  ? 'bg-white text-indigo-700 font-bold shadow-sm'
                  : 'text-indigo-100/80 hover:text-white'
              }`}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}
