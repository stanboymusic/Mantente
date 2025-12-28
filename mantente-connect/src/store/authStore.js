import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabaseAuthService, pb } from '../services/pocketbaseService'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isInitializing: true,
      isAuthRefreshed: false,
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
          set({ user, session, isLoading: false, isAuthRefreshed: true })
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
          set({ user, session, isLoading: false, isAuthRefreshed: true })
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
          set({ user: null, session: null, error: null, offlineMode: false, isAuthRefreshed: false })
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
          // Get persisted session from Zustand storage
          const persistedState = get()
          const persistedSession = persistedState.session

          console.log('🔍 Session persistida:', {
            hasSession: !!persistedSession,
            sessionToken: !!persistedSession?.token,
            sessionRecord: !!persistedSession?.record,
            recordId: persistedSession?.record?.id,
            recordEmail: persistedSession?.record?.email
          })

          if (persistedSession && persistedSession.token) {
            // Cargar el token y modelo en pb.authStore desde datos persistidos
            pb.authStore.save(persistedSession.token, persistedSession.record)
            console.log('💾 pb.authStore saved from persisted data:', {
              pbValid: pb.authStore.isValid,
              pbRecordId: pb.authStore.record?.id,
              pbRecordEmail: pb.authStore.record?.email
            })

            // Refresh to ensure record is loaded properly
            console.log('🔄 Before authRefresh, pb.authStore state:', {
              isValid: pb.authStore.isValid,
              hasRecord: !!pb.authStore.record,
              record: pb.authStore.record,
              tokenPresent: !!pb.authStore.token
            })
            try {
              const refreshResult = await pb.collection('users').authRefresh()
              console.log('🔄 authRefresh result:', refreshResult)
              console.log('🔄 pb.authStore refreshed after restore:', {
                pbValid: pb.authStore.isValid,
                pbRecordId: pb.authStore.record?.id,
                pbRecordEmail: pb.authStore.record?.email,
                pbModel: pb.authStore.model
              })
            } catch (refreshError) {
              console.error('⚠️ Error refreshing auth store after restore:', refreshError.message)
              console.error('⚠️ Refresh error details:', refreshError)
              // If refresh fails, the token is invalid, clear the session
              pb.authStore.clear()
              set({ user: null, session: null, isInitializing: false, isAuthRefreshed: false })
              console.log('🧹 Sesión inválida limpiada')
              return
            }

            set({ user: persistedSession.record, session: persistedSession, isInitializing: false, isAuthRefreshed: true })
            console.log('✅ Sesión restaurada para:', persistedSession.record?.email)
          } else {
            set({ isInitializing: false, isAuthRefreshed: true })
            console.log('ℹ️ No hay sesión persistida')
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