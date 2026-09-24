import { useMemo, useState } from 'react'
import {
  Archive,
  MagnifyingGlass,
  Moon,
  NotePencil,
  Plus,
  PushPinSimple,
  SignOut,
  Sun,
  Timer,
} from '@phosphor-icons/react'
import { useToast } from 'cite-ui'
import { useAuth } from '../context/AuthContext'
import { useNotes } from '../hooks/useNotes'
import { useTheme } from '../hooks/useTheme'
import { dueSoon, greeting, parseDue, pbError } from '../lib/format'
import { stripMarkdown } from '../lib/markdown'
import BrandMark from './BrandMark'
import NoteCard from './NoteCard'
import NoteEditor from './NoteEditor'

const VIEWS = [
  { id: 'active', label: 'Active', icon: NotePencil },
  { id: 'upcoming', label: 'Upcoming', icon: Timer },
  { id: 'pinned', label: 'Pinned', icon: PushPinSimple },
  { id: 'archived', label: 'Archived', icon: Archive },
]

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

function EmptyBlock({ title, body, cta, onClick }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-paper-soft/50 px-8 py-16 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ember-soft text-ember-deep">
        <NotePencil size={26} weight="regular" />
      </span>
      <h3 className="mt-5 text-lg font-medium">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">{body}</p>
      {cta && (
        <button
          type="button"
          onClick={onClick}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-ember px-5 py-2.5 text-sm font-medium text-card transition hover:brightness-95 active:scale-[0.98]"
        >
          <Plus size={18} weight="bold" />
          {cta}
        </button>
      )}
    </div>
  )
}

export default function NotesApp() {
  const { user, logout } = useAuth()
  const { notes, error, createNote, updateNote, removeNote } = useNotes(user)
  const { dark, toggle } = useTheme()
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [view, setView] = useState('active')
  const [tag, setTag] = useState(null)

  const allTags = useMemo(() => {
    const set = new Set()
    ;(notes ?? []).forEach((n) => (n.tags || []).forEach((t) => set.add(t)))
    return [...set].sort()
  }, [notes])

  const counts = useMemo(() => {
    if (!notes) return {}
    return {
      active: notes.filter((n) => !n.archived).length,
      upcoming: notes.filter((n) => !n.archived && dueSoon(n.due)).length,
      pinned: notes.filter((n) => !n.archived && n.pinned).length,
      archived: notes.filter((n) => n.archived).length,
    }
  }, [notes])

  const filtered = useMemo(() => {
    if (!notes) return null
    let list = notes.slice()

    if (view === 'archived') {
      list = list.filter((n) => n.archived)
    } else {
      list = list.filter((n) => !n.archived)
      if (view === 'pinned') list = list.filter((n) => n.pinned)
      if (view === 'upcoming') list = list.filter((n) => dueSoon(n.due))
    }

    if (tag) list = list.filter((n) => (n.tags || []).includes(tag))

    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (n) =>
          (n.title || '').toLowerCase().includes(q) ||
          stripMarkdown(n.body || '').toLowerCase().includes(q)
      )
    }

    list.sort((a, b) => {
      if (!!a.pinned !== !!b.pinned) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
      const ad = parseDue(a.due)
      const bd = parseDue(b.due)
      if (ad && bd) return ad - bd
      if (ad) return -1
      if (bd) return 1
      return String(b.updated || '').localeCompare(String(a.updated || ''))
    })
    return list
  }, [notes, view, tag, query])

  const displayName = user?.email?.split('@')[0] || 'reader'
  const initials = user?.email?.charAt(0)?.toUpperCase() || '?'

  async function handleSave(draft) {
    if (editing?.id) {
      await updateNote(editing.id, draft)
      return
    }
    const record = await createNote(draft)
    setEditing(record)
    toast.success('Saved to the margins')
  }

  async function handleDelete(note) {
    if (!note?.id) {
      setEditing(null)
      return
    }
    try {
      await removeNote(note.id)
      if (editing?.id === note?.id) setEditing(null)
      toast.success('Note deleted')
    } catch (e) {
      toast.error(`Could not delete: ${pbError(e)}`)
    }
  }

  async function handlePin(note) {
    const next = !note.pinned
    try {
      await updateNote(note.id, { pinned: next })
      toast.success(next ? 'Pinned to the top' : 'Unpinned')
    } catch (e) {
      toast.error(`Could not pin: ${pbError(e)}`)
    }
  }

  async function handleArchive(note) {
    const next = !note.archived
    try {
      await updateNote(note.id, { archived: next })
      toast.success(next ? 'Archived' : 'Restored from archive')
    } catch (e) {
      toast.error(`Could not archive: ${pbError(e)}`)
    }
  }

  function newNote() {
    setEditing({ id: null, title: '', body: '', tags: [], pinned: false, archived: false, due: null })
  }

  const empty = {
    active: {
      title: 'No notes yet',
      body: 'Your margin starts empty. Capture the first thought worth keeping.',
      cta: 'Start writing',
    },
    upcoming: {
      title: 'Nothing due soon',
      body: 'Notes with a due date in the next week (including overdue ones) gather here.',
    },
    pinned: {
      title: 'Nothing pinned',
      body: 'Pin the notes you want to keep at the top of the page.',
    },
    archived: {
      title: 'Archive is empty',
      body: 'Notes you archive rest here, out of the way until you restore them.',
    },
  }[view]

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

        {notes && notes.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {VIEWS.map((v) => {
              const active = view === v.id
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setView(v.id)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition active:scale-[0.98] ${
                    active
                      ? 'border-ember bg-ember text-card'
                      : 'border-border bg-card text-ink-soft hover:text-ink'
                  }`}
                >
                  <v.icon size={14} weight={active ? 'fill' : 'regular'} />
                  {v.label}
                  <span className={`font-mono text-[10px] ${active ? 'text-card/80' : 'text-ink-faint'}`}>
                    {counts[v.id] ?? 0}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {allTags.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">Tags</span>
            {allTags.map((t) => {
              const on = tag === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(on ? null : t)}
                  aria-pressed={on}
                  className={`rounded-full border px-2.5 py-1 font-mono text-xs transition active:scale-[0.98] ${
                    on ? 'border-ember bg-ember text-card' : 'border-border bg-card text-ink-soft hover:text-ink'
                  }`}
                >
                  #{t}
                </button>
              )
            })}
          </div>
        )}

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
            <EmptyBlock {...empty} onClick={newNote} />
          )
        ) : (
          <div className="columns-1 gap-5 sm:columns-2 xl:columns-3">
            {filtered.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                query={query}
                onOpen={(n) => setEditing(n)}
                onDelete={handleDelete}
                onPin={handlePin}
                onArchive={handleArchive}
              />
            ))}
          </div>
        )}
      </main>

      {editing && (
        <NoteEditor
          note={editing}
          suggestedTags={allTags}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}