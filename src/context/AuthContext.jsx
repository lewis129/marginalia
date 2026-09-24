import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { pb } from '../lib/pocketbase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => pb.authStore.record ?? null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(record ?? null)
    })

    ;(async () => {
      if (pb.authStore.isValid) {
        try {
          const res = await pb.collection('users').authRefresh()
          setUser(res.record ?? null)
        } catch {
          pb.authStore.clear()
        }
      }
      setLoading(false)
    })()

    return unsubscribe
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      async register(email, password) {
        const record = await pb.collection('users').create({
          email,
          password,
          passwordConfirm: password,
        })
        if (pb.authStore.isValid) return record
        return pb.collection('users').authWithPassword(email, password)
      },
      async login(email, password) {
        return pb.collection('users').authWithPassword(email, password)
      },
      logout() {
        pb.authStore.clear()
      },
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}