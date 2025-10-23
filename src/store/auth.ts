import { create } from 'zustand'
import { useNavigate } from 'react-router-dom'

type Role = 'admin' | 'receptionist' | 'doctor' | 'pharmacist' | 'patient'

type AuthState = {
  role: Role | null
  email: string | null
  login: (u: { email: string; role: Role }) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  email: null,
  login: ({ email, role }) => set({ email, role }),
  logout: () => set({ email: null, role: null }),
}))

export function useAuthRoleGuard() {
  const role = useAuthStore((s) => s.role)
  return { role }
}


