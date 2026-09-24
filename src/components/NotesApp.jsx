import { useMemo, useState } from 'react'
import {
  MagnifyingGlass,
  Moon,
  NotePencil,
  Plus,
  SignOut,
  Sun,
} from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import { useNotes } from '../hooks/useNotes'
import { useTheme } from '../hooks/useTheme'
import { greeting } from '../lib/format'
import BrandMark from './BrandMark'
import NoteCard from './NoteCard'
import NoteEditor from './NoteEditor'

function SkeletonCard() {
  return (
    <div className="mb-5 break-inside-avoid rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 h-4 w-1/2 animate-pulse rounded-full bg-paper-soft" />
      <div className="space-y-2">
        <div className="h-3 w-full animate-pulse rounded-full bg-paper-soft" />
        <div className="h-3 w-4/5 animate-pulse rounded-full bg-paper-soft" />
        <div className="h-3 w-2/3 animate-pulse rounded-full bg-paper-soft" />
      </div>
    </div>
  )
}

export default function NotesApp() {
  const { user, logout } = useAuth()
  const { notes, error, createNote, updateNote, removeNote } = useNotes(user)
  const { dark, toggle } = useTheme()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)

  const filtered = useMemo(() => {
    if (!notes) return null
    const q = query.trim().toLowerCase()
    if (!q) return notes
    return notes.filter(
      (n) =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.body || '').toLowerCase().includes(q)
    )
  }, [notes, query])

  const displayName = user?.email?.split('@')[0] || 'reader'
  const initials = user?.email?.charAt(0)?.toUpperCase() || '?'

  async function handleSave(draft) {
    if (editing?.id) {
      await updateNote(editing.id, draft)
      return
    }
    const record = await createNote(draft)
    setEditing({ id: record.id, title: record.title, body: record.body })
  }

  async function handleDelete(note) {
    if (note?.id) {
      await removeNote(note.id)
    }
    if (editing?.id === note?.id) {
      setEditing(null)
    } else if (!note?.id) {
      setEditing(null)
    }
  }

  function newNote() {
    setEditing({ id: null, title: '', body: '' })
  }

  return (
    <div className="min-h-[100dvh]">
      <header className="sticky top-0 z-30 border-b border-border bg-paper/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-7 w-7" />
            <span className="font-semibold tracking-tight">Marginalia</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <MagnifyingGlass
                size={16}
                weight="regular"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search notes"
                placeholder="Search notes"
                className="w-36 rounded-full border border-border bg-card py-2 pl-9 pr-4 text-sm outline-none transition placeholder:text-ink-faint focus:border-ember sm:w-56"
              />
            </div>

            <button
              type="button"
              onClick={toggle}
              aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
              className="rounded-full border border-border p-2.5 text-ink-soft transition hover:bg-card hover:text-ink active:scale-95"
            >
              {dark ? <Sun size={16} weight="regular" /> : <Moon size={16} weight="regular" />}
            </button>

            <div className="hidden items-center gap-2.5 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-4 md:flex">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ember-soft text-xs font-semibold text-ember-deep">
                {initials}
              </span>
              <span className="max-w-32 truncate text-sm text-ink-soft">{displayName}</span>
            </div>

            <button
              type="button"
              onClick={logout}
              aria-label="Sign out"
              className="rounded-full border border-border p-2.5 text-ink-soft transition hover:bg-card hover:text-ember active:scale-95"
            >
              <SignOut size={16} weight="regular" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
              {greeting()}, {displayName}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">Your notes</h1>
            {notes && (
              <p className="mt-1 text-sm text-ink-soft">
                {notes.length === 0
                  ? 'Nothing saved yet'
                  : `${notes.length} ${notes.length === 1 ? 'note' : 'notes'} in the margins`}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={newNote}
            className="inline-flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 text-sm font-medium text-card transition hover:brightness-95 active:scale-[0.98]"
          >
            <Plus size={18} weight="bold" />
            New note
          </button>
        </div>

        {error && (
          <p role="alert" className="mb-6 rounded-2xl border border-ember/20 bg-ember-soft px-4 py-3 text-sm text-ember-deep">
            Could not load notes: {error}
          </p>
        )}

        {filtered === null ? (
          <div className="columns-1 gap-5 sm:columns-2 xl:columns-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filtered.length === 0 ? (
          query.trim() ? (
            <div className="rounded-3xl border border-dashed border-border bg-paper-soft/50 px-8 py-16 text-center">
              <h3 className="text-lg font-medium">No matches for “{query.trim()}”</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
                Try a different word, or clear the search to see everything.
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="mt-6 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium transition hover:text-ember active:scale-[0.98]"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-paper-soft/50 px-8 py-16 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ember-soft text-ember-deep">
                <NotePencil size={26} weight="regular" />
              </span>
              <h3 className="mt-5 text-lg font-medium">No notes yet</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
                Your margin starts empty. Capture the first thought worth keeping.
              </p>
              <button
                type="button"
                onClick={newNote}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 text-sm font-medium text-card transition hover:brightness-95 active:scale-[0.98]"
              >
                <Plus size={18} weight="bold" />
                Start writing
              </button>
            </div>
          )
        ) : (
          <div className="columns-1 gap-5 sm:columns-2 xl:columns-3">
            {filtered.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onOpen={(n) => setEditing({ id: n.id, title: n.title, body: n.body })}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {editing && (
        <NoteEditor
          note={editing}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}