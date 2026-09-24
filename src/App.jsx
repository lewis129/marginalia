import { useState } from 'react'
import { ToastProvider } from 'cite-ui'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage from './components/AuthPage'
import HomePage from './components/HomePage'
import NotesApp from './components/NotesApp'
import BrandMark from './components/BrandMark'

function Gate() {
  const { user, loading } = useAuth()
  const [auth, setAuth] = useState(null)

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <BrandMark className="h-12 w-12 animate-pulse" />
      </div>
    )
  }

  if (user) return <NotesApp />

  return auth ? (
    <AuthPage initialMode={auth} onBack={() => setAuth(null)} />
  ) : (
    <HomePage onOpen={(mode) => setAuth(mode)} />
  )
}

export default function App() {
  return (
    <ToastProvider position="top-right">
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </ToastProvider>
  )
}