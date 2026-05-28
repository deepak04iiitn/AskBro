import { create } from 'zustand'
import { clearToken, getPayload, isAuthenticated, saveToken } from '@/lib/auth'

const useAuthStore = create((set) => ({
  user: null,

  /**
   * Hydrate store from whatever JWT is currently in localStorage.
   * Call once on app mount (e.g. in root layout client wrapper).
   */
  hydrate() {
    if (isAuthenticated()) {
      const payload = getPayload()
      set({
        user: {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          workspace_id: payload.workspace_id,
          workspace_code: payload.workspace_code,
        },
      })
    }
  },

  /**
   * Called after a successful login — persist token and populate store.
   */
  setUser(token) {
    saveToken(token)
    const payload = getPayload()
    set({
      user: {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        workspace_id: payload.workspace_id,
        workspace_code: payload.workspace_code,
      },
    })
  },

  logout() {
    clearToken()
    set({ user: null })
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  },
}))

export default useAuthStore
