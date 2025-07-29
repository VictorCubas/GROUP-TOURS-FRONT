// src/store/useSessionStore.ts
import { create } from 'zustand'

export interface SessionDataStore {
  token: string
  usuario: string
}

interface SessionStore {
  session: SessionDataStore | null
  loading: boolean
  login: (data: SessionDataStore) => void
  logout: () => void
  getAccessToken: () => string | null
  initializeSession: () => void
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  session: null,
  loading: true,

  login: (data: SessionDataStore) => {
    localStorage.setItem('session', JSON.stringify(data))
    set({ session: data, loading: false })
  },

  logout: () => {
    localStorage.removeItem('session')
    set({ session: null, loading: false })
  },

  getAccessToken: () => {
    const session = get().session || JSON.parse(localStorage.getItem('session') || 'null')
    return session?.token || null
  },

  initializeSession: () => {
    const stored = localStorage.getItem('session')
    const parsed = stored ? JSON.parse(stored) : null
    set({ session: parsed, loading: false })
  }
}))
