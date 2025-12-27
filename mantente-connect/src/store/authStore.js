import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabaseAuthService, pb } from '../services/pocketbaseService'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isInitializing: true,
      isLoading: false,
      error: null,
      isOnline: navigator.onLine,
      lastSyncTime: null,
      offlineMode: false,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setIsInitializing: (value) => set({ isInitializing: value }),
      setIsLoading: (value) => set({ isLoading: value }),
      setError: (error) => set({ error }),
      setIsOnline: (value) => {
        set({ isOnline: value })
        if (!value) {
          set({ offlineMode: true })
          console.log('📴 Activado modo offline')
        }
      },
      setLastSyncTime: (time) => set({ lastSyncTime: time }),
      setOfflineMode: (value) => set({ offlineMode: value }),

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { user, session } = await supabaseAuthService.login(email, password)
          console.log('🔐 After login - pb.authStore state:', {
            isValid: pb.authStore.isValid,
            hasRecord: !!pb.authStore.record,
            recordId: pb.authStore.record?.id,
            recordEmail: pb.authStore.record?.email
          })
          set({ user, session, isLoading: false })
          console.log('✅ Login exitoso:', email)
          return { user, session }
        } catch (error) {
          const errorMessage = error.message || 'Error en el login'
          set({ error: errorMessage, isLoading: false })
          console.error('❌ Error en login:', errorMessage)
          throw error
        }
      },

      signup: async (email, password, metadata) => {
        set({ isLoading: true, error: null })
        try {
          const { user, session } = await supabaseAuthService.signup(email, password, metadata)
          set({ user, session, isLoading: false })
          console.log('✅ Registro exitoso:', email)
          return { user, session }
        } catch (error) {
          const errorMessage = error.message || 'Error en el registro'
          set({ error: errorMessage, isLoading: false })
          console.error('❌ Error en registro:', errorMessage)
          throw error
        }
      },

      logout: async () => {
        try {
          await supabaseAuthService.logout()
          set({ user: null, session: null, error: null, offlineMode: false })
          console.log('✅ Logout exitoso')
        } catch (error) {
          console.error('❌ Error en logout:', error.message)
          // De todos modos, limpiar el estado local
          set({ user: null, session: null, offlineMode: false })
        }
      },

      restoreSession: async () => {
        try {
          console.log('🔄 Restaurando sesión...')
          const session = await supabaseAuthService.getSession()
          console.log('🔍 Session obtenida:', {
            hasSession: !!session,
            sessionToken: !!session?.token,
            sessionRecord: !!session?.record,
            recordId: session?.record?.id
          })

          if (session) {
            // Cargar el token y modelo en pb.authStore
            pb.authStore.save(session.token, session.record)
            console.log('💾 pb.authStore saved:', {
              pbValid: pb.authStore.isValid,
              pbRecordId: pb.authStore.record?.id
            })
            set({ user: session.record, session, isInitializing: false })
            console.log('✅ Sesión restaurada para:', session.record?.email)
          } else {
            set({ isInitializing: false })
            console.log('ℹ️ No hay sesión activa')
          }
        } catch (error) {
          console.error('⚠️ Error restaurando sesión:', error.message)
          set({ isInitializing: false })
        }
      },

      setupAuthListener: () => {
        // Escuchar cambios en el estado de autenticación
        const subscription = supabaseAuthService.onAuthStateChange((event, session) => {
          console.log('🔔 Evento de auth:', event)
          set({ session })
          
          if (session) {
            supabaseAuthService.getCurrentUser()
              .then(user => set({ user }))
              .catch(err => console.error('Error getting user:', err))
          } else {
            set({ user: null })
          }
        })
        
        return subscription
      },

      resetPassword: async (email) => {
        try {
          await supabaseAuthService.resetPassword(email)
          console.log('✅ Email de reset enviado a:', email)
        } catch (error) {
          const errorMessage = error.message || 'Error enviando email de reset'
          set({ error: errorMessage })
          console.error('❌ Error:', errorMessage)
          throw error
        }
      },

      updateProfile: async (updates) => {
        set({ isLoading: true, error: null })
        try {
          const updatedUser = await supabaseAuthService.updateProfile(updates)
          set({ user: updatedUser, isLoading: false })
          console.log('✅ Perfil actualizado')
          return updatedUser
        } catch (error) {
          const errorMessage = error.message || 'Error actualizando perfil'
          set({ error: errorMessage, isLoading: false })
          console.error('❌ Error:', errorMessage)
          throw error
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        session: state.session,
        user: state.user,
        lastSyncTime: state.lastSyncTime,
        offlineMode: state.offlineMode,
      }),
    }
  )
)