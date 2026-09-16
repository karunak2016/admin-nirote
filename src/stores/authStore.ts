import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AdminUser } from '../types'

interface AuthState {
  user: AdminUser | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: AdminUser, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem('admin_accessToken', token)
        set({ user, token, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('admin_accessToken')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'nirote-admin-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
