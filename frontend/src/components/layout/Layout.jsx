import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopNav from './TopNav'
import useTodoStore from '../../store/todoStore'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/todos': 'All Tasks',
  '/today': "Today's Tasks",
  '/upcoming': 'Upcoming Tasks',
  '/completed': 'Completed Tasks',
  '/progress': 'Weekly Progress',
  '/trash': 'Trash (Recently Deleted)',
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { checkReminders } = useTodoStore()

  const pageTitle = pageTitles[location.pathname] || 'Dashboard'

  // Request notification permission and start reminder checks
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Run check immediately on mount
    checkReminders()

    const interval = setInterval(() => {
      checkReminders()
    }, 10000)

    return () => clearInterval(interval)
  }, [checkReminders])

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNav
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={pageTitle}
        />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
