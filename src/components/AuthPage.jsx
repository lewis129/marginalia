import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../lib/format'
import BrandMark from './BrandMark'

export default function AuthPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const isRegister = mode === 'register'

  async function submit(e) {
    e.preventDefault()
    setError(null)
    if (isRegister && password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    try {
      if (isRegister) {
        await register(email, password)
      } else {
        await login(email, password)
      }
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-border bg-paper px-4 py-3 text-[15px] outline-none transition placeholder:text-ink-faint focus:border-ember'

  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-[1.05fr_1fr]">
      <aside className="hidden flex-col justify-between border-r border-border bg-paper-soft p-12 lg:flex">
        <div className="flex items-center gap-3">
          <BrandMark className="h-9 w-9" />
          <span className="text-lg font-semibold tracking-tight">Marginalia</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-tighter">
            Notes in the margins of your day.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            A quiet, private place to keep thoughts, snapshots, and half-finished ideas — tied to
            your account, synced everywhere.
          </p>

          <figure className="mt-10 max-w-sm rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(35,32,26,0.06)]">
            <blockquote className="text-[15px] leading-relaxed text-ink-soft">
              Often the ideas that survive are the ones you bothered to write down while they were
              still warm.
            </blockquote>
            <figcaption className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Ember · Sep 24 2026
            </figcaption>
          </figure>
        </div>

        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          A margin for everything
        </p>
      </aside>

      <main className="flex flex-col px-6 py-8 sm:px-10">
        <div className="mb-10 flex items-center gap-3 lg:hidden">
          <BrandMark className="h-9 w-9" />
          <span className="text-lg font-semibold tracking-tight">Marginalia</span>
        </div>

        <div className="mx-auto w-full max-w-sm self-center">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="mt-1.5 text-sm text-ink-soft">
              {isRegister
                ? 'A private space for your notes. Takes a minute.'
                : 'Pick up where you left off.'}
            </p>
          </div>

          <div className="mb-6 flex rounded-full bg-paper-soft p-1" role="tablist" aria-label="Auth mode">
            <button
              type="button"
              role="tab"
              aria-selected={!isRegister}
              onClick={() => {
                setMode('signin')
                setError(null)
              }}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                !isRegister ? 'bg-card text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isRegister}
              onClick={() => {
                setMode('register')
                setError(null)
              }}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                isRegister ? 'bg-card text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            {isRegister && (
              <div className="space-y-2">
                <label htmlFor="confirm" className="block text-sm font-medium">
                  Confirm password
                </label>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-ember/20 bg-ember-soft px-3 py-2.5 text-sm text-ember-deep"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-ember px-6 py-3.5 text-[15px] font-medium text-card transition hover:brightness-95 active:scale-[0.98] disabled:opacity-60"
            >
              {busy
                ? isRegister
                  ? 'Creating…'
                  : 'Signing in…'
                : isRegister
                  ? 'Create account'
                  : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-soft">
            {isRegister ? 'Already have an account?' : 'New to Marginalia?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(isRegister ? 'signin' : 'register')
                setError(null)
              }}
              className="font-medium text-ember hover:underline"
            >
              {isRegister ? 'Sign in' : 'Create an account'}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}