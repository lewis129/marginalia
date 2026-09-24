import { AuthProvider, useAuth } from './context/AuthContext'
import AuthPage from './components/AuthPage'
import NotesApp from './components/NotesApp'
import BrandMark from './components/BrandMark'

function Gate() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <BrandMark className="h-12 w-12 animate-pulse" />
      </div>
    )
  }

  return user ? <NotesApp /> : <AuthPage />
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}