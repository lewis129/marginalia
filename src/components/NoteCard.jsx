import { useState } from 'react'
import { Archive, CalendarBlank, PushPinSimple, Trash } from '@phosphor-icons/react'
import { formatDue, formatDate, isOverdue } from '../lib/format'
import { stripMarkdown } from '../lib/markdown'

function HighlightText({ text = '', query }) {
  const q = query?.trim()
  if (!q) return text
  const lower = text.toLowerCase()
  const needle = q.toLowerCase()
  const out = []
  let i = 0
  let idx
  while ((idx = lower.indexOf(needle, i)) !== -1) {
    if (idx > i) out.push(text.slice(i, idx))
    out.push(
      <mark key={idx} className="rounded-sm bg-ember-soft px-0.5 text-ember-deep">
        {text.slice(idx, idx + needle.length)}
      </mark>
    )
    i = idx + needle.length
  }
  out.push(text.slice(i))
  return out
}

export default function NoteCard({ note, query, onOpen, onDelete, onPin, onArchive }) {
  const [armed, setArmed] = useState(false)
  const snippet = stripMarkdown(note.body) || 'No text yet.'
  const tags = note.tags || []
  const due = note.due ? formatDue(note.due) : ''
  const overdue = note.due && isOverdue(note.due)

  function handleDeleteClick(e) {
    e.stopPropagation()
    if (armed) {
      onDelete(note)
      return
    }
    setArmed(true)
    window.setTimeout(() => setArmed(false), 2500)
  }

  return (
    <article
      onClick={() => onOpen(note)}
      className="group mb-5 cursor-pointer break-inside-avoid rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(35,32,26,0.06)] transition-transform duration-200 hover:scale-[1.015] active:scale-[0.99]"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="flex min-w-0 items-start gap-1.5 text-[15px] font-medium leading-snug tracking-tight">
          <HighlightText text={note.title?.trim() || 'Untitled'} query={query} />
        </h3>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
            onClick={(e) => {
              e.stopPropagation()
              onPin(note)
            }}
            className="rounded-full border border-transparent p-1.5 transition-colors hover:border-border hover:bg-paper-soft active:scale-95"
          >
            <PushPinSimple
              size={15}
              weight={note.pinned ? 'fill' : 'regular'}
              className={note.pinned ? 'text-ember' : 'text-ink-faint'}
            />
          </button>
          <button
            type="button"
            aria-label={note.archived ? 'Restore note' : 'Archive note'}
            onClick={(e) => {
              e.stopPropagation()
              onArchive(note)
            }}
            className="rounded-full border border-transparent p-1.5 transition-colors hover:border-border hover:bg-paper-soft active:scale-95"
          >
            <Archive size={15} weight={note.archived ? 'fill' : 'regular'} className="text-ink-faint" />
          </button>
          <button
            type="button"
            aria-label={armed ? 'Confirm delete' : 'Delete note'}
            onClick={handleDeleteClick}
            className="rounded-full border border-transparent p-1.5 transition-colors hover:border-border hover:text-ember active:scale-95"
          >
            {armed ? (
              <span className="px-1 font-mono text-[10px] uppercase tracking-wide text-ember">Sure?</span>
            ) : (
              <Trash size={15} weight="regular" className="text-ink-faint" />
            )}
          </button>
        </div>
      </div>
      {note.pinned && (
        <p className="mb-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ember">
          <PushPinSimple size={11} weight="fill" />
          Pinned
        </p>
      )}
      <p className="text-sm leading-relaxed text-ink-soft line-clamp-5">
        <HighlightText text={snippet} query={query} />
      </p>
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className="rounded-full bg-paper-soft px-2 py-0.5 font-mono text-[11px] text-ink-soft">
              #{t}
            </span>
          ))}
        </div>
      )}
      <div className="mt-4 flex items-center justify-between gap-2">
        <time className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          {formatDate(note.updated)}
        </time>
        {due && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
              overdue ? 'bg-ember-soft text-ember-deep' : 'bg-paper-soft text-ink-soft'
            }`}
          >
            <CalendarBlank size={11} weight="regular" />
            {overdue ? `Overdue · ${due}` : `Due ${due}`}
          </span>
        )}
      </div>
    </article>
  )
}