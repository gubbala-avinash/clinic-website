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
      console.log('Attempting login with credentials:', credentials.email)
      const response = await authApi.login(credentials)
      console.log('Login response:', response)
      
      if (response.success) {
        // Store token in localStorage
        if (response.token) {
          console.log('Storing token in localStorage')
          localStorage.setItem('authToken', response.token)
        } else {
          console.log('No token in response!')
        }
        
        console.log('Setting authenticated user:', response.user)
        set({ 
          user: response.user, 
          isAuthenticated: true, 
          isLoading: false,
          error: null 
        })
      } else {
        console.log('Login failed:', response)
        set({ 
          error: 'Login failed', 
          isLoading: false 
        })
      }
    } catch (error) {
      console.log('Login error:', error)
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
      // Clear token from localStorage
      localStorage.removeItem('authToken')
      
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
    
    // Check if token exists in localStorage
    const token = localStorage.getItem('authToken')
    console.log('Checking auth, token exists:', !!token)
    
    if (!token) {
      console.log('No token found, setting unauthenticated')
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null 
      })
      return
    }
    
    try {
      console.log('Making API call to check current user')
      const response = await authApi.getCurrentUser()
      console.log('Auth check response:', response)
      
      if (response.success) {
        console.log('Auth successful, setting user:', response.user)
        set({ 
          user: response.user, 
          isAuthenticated: true, 
          isLoading: false,
          error: null 
        })
      } else {
        console.log('Auth failed, clearing token')
        // Token is invalid, clear it
        localStorage.removeItem('authToken')
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          error: null 
        })
      }
    } catch (error) {
      console.log('Auth check error:', error)
      // Token is invalid, clear it
      localStorage.removeItem('authToken')
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


