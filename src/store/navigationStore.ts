import { create } from 'zustand'

interface NavigationStore {
  redirectTo: string | null
  setRedirect: (path: string) => void
  clearRedirect: () => void
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  redirectTo: null,
  setRedirect: (path: string) => set({ redirectTo: path }),
  clearRedirect: () => set({ redirectTo: null }),
}))