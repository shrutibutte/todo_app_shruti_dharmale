import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children }) {
  const { token, user, isLoading } = useAuthStore()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (token && !user && isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    )
  }

  return children
}
