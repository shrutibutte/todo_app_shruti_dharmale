export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-200" />
        <div className="space-y-2">
          <div className="h-6 w-12 bg-slate-200 rounded" />
          <div className="h-4 w-20 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  )
}

export function TodoCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-slate-200 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-slate-200 rounded" />
          <div className="h-3 w-1/2 bg-slate-200 rounded" />
          <div className="flex items-center gap-2 mt-2">
            <div className="h-5 w-16 bg-slate-200 rounded-full" />
            <div className="h-5 w-14 bg-slate-200 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoadingSkeleton({ type = 'todo', count = 3 }) {
  if (type === 'stat') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </>
    )
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <TodoCardSkeleton key={i} />
      ))}
    </div>
  )
}
