import { useEffect, useState } from 'react'

const STORAGE_KEY = 'marginalia:theme'

function systemPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useTheme() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return stored === 'dark'
    return systemPrefersDark()
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
  }, [dark])

  return { dark, toggle: () => setDark((d) => !d) }
}