// src/store/useSessionStore.ts
import { create } from 'zustand'

// Tipos para permisos
export interface PermisosModulo {
  modulo: string
  permisos: {
    crear: boolean
    leer: boolean
    modificar: boolean
    eliminar: boolean
    exportar: boolean
  }
}

export interface SessionDataStore {
  token: string
  usuario: string
  debeResetearContrasenia: boolean
  cotizacionDiariaCargada: boolean
  roles: string[]
  permisos: PermisosModulo[] // <--- Nuevo campo
  esAdmin: boolean,
  nombreUsuario: string,
  usuarioId: number,
}

interface SessionStore {
  session: SessionDataStore | null
  loading: boolean
  login: (data: SessionDataStore) => void
  logout: () => void
  getAccessToken: () => string | null
  initializeSession: () => void
  setDebeResetearContrasenia: (value: boolean) => void
  getDebeResetearContrasenia: () => boolean | undefined
  setCotizacionDiariaCargada: (value: boolean) => void
  getCotizacionDiariaCargada: () => boolean | undefined
  hasRole: (role: string) => boolean
  siTienePermiso: (modulo: string, tipo: keyof PermisosModulo["permisos"]) => boolean
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  session: null,
  loading: true,
  esAdmin: false,
  nombreUsuario: '',

  login: (data: SessionDataStore) => {
    console.log(data)
    localStorage.setItem('session', JSON.stringify(data))
    set({
      session: {
        ...data,
        debeResetearContrasenia: data.debeResetearContrasenia,
        cotizacionDiariaCargada: data.cotizacionDiariaCargada,
        roles: data.roles,
        permisos: data.permisos,
        esAdmin: data.esAdmin,
        nombreUsuario: data.nombreUsuario,
      },
      loading: false
    })
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
  },

  setDebeResetearContrasenia: (value: boolean) => {
    const currentSession = get().session
    if (!currentSession) return

    const updatedSession = { ...currentSession, debeResetearContrasenia: value }
    localStorage.setItem('session', JSON.stringify(updatedSession))
    set({ session: updatedSession })
  },

  getDebeResetearContrasenia: () => {
    const currentSession = get().session
    return currentSession?.debeResetearContrasenia
  },

  setCotizacionDiariaCargada: (value: boolean) => {
    const currentSession = get().session
    if (!currentSession) return

    const updatedSession = { ...currentSession, cotizacionDiariaCargada: value }
    localStorage.setItem('session', JSON.stringify(updatedSession))
    set({ session: updatedSession })
  },

  getCotizacionDiariaCargada: () => {
    const currentSession = get().session
    return currentSession?.cotizacionDiariaCargada
  },

  // ✅ Verificar si el usuario tiene un rol específico
  hasRole: (role: string) => {
    const currentSession = get().session
    return currentSession?.roles?.includes(role) ?? false
  },

  // ✅ Verificar si el usuario tiene un permiso específico en un módulo
  siTienePermiso: (modulo: string, tipo: keyof PermisosModulo["permisos"]) => {
    const currentSession = get().session


    if(currentSession?.esAdmin)
        return true;

    console.log(modulo)
    console.log(tipo)

    console.log('currentSession: ', currentSession)
    //  permisos: [
    //   {
    //     modulo: 'Usuarios',
    //     permisos: {
    //       crear: false,
    //       leer: false,
    //       modificar: true,
    //       eliminar: false,
    //       exportar: false
    //     }
    //   }
    // ]
    if (!currentSession?.permisos) return false

    const moduloPerm = currentSession.permisos.find(p => p.modulo.toLowerCase() === modulo)

    console.log(moduloPerm)
    console.log(moduloPerm?.permisos[tipo])
    return moduloPerm?.permisos[tipo] ?? false
  }
}))
