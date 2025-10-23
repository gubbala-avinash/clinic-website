import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/auth'

// Generic hook for API calls with loading and error states
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await apiCall()
        
        if (!isCancelled) {
          setData(result)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'An error occurred')
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isCancelled = true
    }
  }, dependencies)

  const refetch = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await apiCall()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return { data, isLoading, error, refetch }
}

// Hook for authentication state
export function useAuth() {
  const { user, isAuthenticated, isLoading, error, login, logout, checkAuth, clearError } = useAuthStore()

  useEffect(() => {
    // Check authentication status on mount
    checkAuth()
  }, [])

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
    clearError
  }
}

// Hook for role-based access control
export function useRoleGuard(allowedRoles: string[]) {
  const { user, isAuthenticated } = useAuthStore()

  const hasAccess = isAuthenticated && user && allowedRoles.includes(user.role)
  
  return {
    hasAccess,
    user,
    isAuthenticated
  }
}
