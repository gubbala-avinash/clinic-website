import { create } from 'zustand'
import { authApi, type User, type LoginRequest, ApiError } from '../services/api'

type Role = 'admin' | 'receptionist' | 'doctor' | 'pharmacist' | 'patient'

type AuthState = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await authApi.login(credentials)
      
      if (response.success) {
        set({ 
          user: response.user, 
          isAuthenticated: true, 
          isLoading: false,
          error: null 
        })
      } else {
        set({ 
          error: 'Login failed', 
          isLoading: false 
        })
      }
    } catch (error) {
      if (error instanceof ApiError) {
        set({ 
          error: error.message, 
          isLoading: false 
        })
      } else {
        set({ 
          error: 'An unexpected error occurred', 
          isLoading: false 
        })
      }
    }
  },

  logout: async () => {
    set({ isLoading: true })
    
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null 
      })
    }
  },

  checkAuth: async () => {
    set({ isLoading: true })
    
    try {
      const response = await authApi.getCurrentUser()
      
      if (response.success) {
        set({ 
          user: response.user, 
          isAuthenticated: true, 
          isLoading: false,
          error: null 
        })
      } else {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          error: null 
        })
      }
    } catch (error) {
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null 
      })
    }
  },

  clearError: () => set({ error: null })
}))

export function useAuthRoleGuard() {
  const { user, isAuthenticated } = useAuthStore()
  return { 
    role: user?.role || null,
    isAuthenticated,
    user 
  }
}


