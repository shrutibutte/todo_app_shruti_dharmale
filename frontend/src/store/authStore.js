import { create } from 'zustand'
import * as authAPI from '../api/auth'

const getStoredToken = () => {
  const token = localStorage.getItem('taskflow_token')
  return token && token !== 'undefined' && token !== 'null' ? token : null
}

const useAuthStore = create((set, get) => ({
  user: null,
  token: getStoredToken(),
  isLoading: false,

  get isAuthenticated() {
    return !!get().token
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const res = await authAPI.login({ email, password })
      const token = res.data?.token || res.token
      const user = res.data?.user || res.user
      if (token) {
        localStorage.setItem('taskflow_token', token)
      }
      set({ token, user, isLoading: false })
      return res
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true })
    try {
      const res = await authAPI.register({ name, email, password })
      const token = res.data?.token || res.token
      const user = res.data?.user || res.user
      if (token) {
        localStorage.setItem('taskflow_token', token)
      }
      set({ token, user, isLoading: false })
      return res
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('taskflow_token')
    set({ token: null, user: null })
  },

  loadUser: async () => {
    set({ isLoading: true })
    try {
      const res = await authAPI.getMe()
      const user = res.data?.user || res.data || res.user
      set({ user, isLoading: false })
    } catch (error) {
      localStorage.removeItem('taskflow_token')
      set({ token: null, user: null, isLoading: false })
    }
  },
}))

export default useAuthStore
