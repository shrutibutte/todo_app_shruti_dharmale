import { cn } from '../../lib/utils'

const colorMap = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
  red: { bg: 'bg-red-50', text: 'text-red-600' },
}

export default function StatCard({ title, value, icon: Icon, color = 'indigo' }) {
  const colors = colorMap[color] || colorMap.indigo

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            colors.bg,
            colors.text
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          <p className="text-sm text-slate-500">{title}</p>
        </div>
      </div>
    </div>
  )
}
