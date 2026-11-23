import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import useAuthStore from './store/authStore'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import TodosPage from './pages/TodosPage'
import WeeklyProgressPage from './pages/WeeklyProgressPage'

export default function App() {
  const { token, loadUser } = useAuthStore()

  useEffect(() => {
    if (token) loadUser()
  }, [])

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="todos" element={<TodosPage />} />
          <Route path="today" element={<TodosPage filter="today" />} />
          <Route path="upcoming" element={<TodosPage filter="upcoming" />} />
          <Route path="completed" element={<TodosPage filter="completed" />} />
          <Route path="progress" element={<WeeklyProgressPage />} />
          <Route path="trash" element={<TodosPage filter="trash" />} />
        </Route>
      </Routes>
    </>
  )
}
