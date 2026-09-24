import { useState } from 'react'
import { Trash } from '@phosphor-icons/react'
import { formatDate } from '../lib/format'

export default function NoteCard({ note, onOpen, onDelete }) {
  const [armed, setArmed] = useState(false)
  const snippet = (note.body || '').trim() || 'No text yet.'

  return (
    <article
      onClick={() => onOpen(note)}
      className="group mb-5 cursor-pointer break-inside-avoid rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(35,32,26,0.06)] transition-transform duration-200 hover:scale-[1.015] active:scale-[0.99]"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="text-[15px] font-medium leading-snug tracking-tight">
          {note.title?.trim() || 'Untitled'}
        </h3>
        <button
          type="button"
          aria-label={armed ? 'Confirm delete' : 'Delete note'}
          onClick={(e) => {
            e.stopPropagation()
            if (armed) {
              onDelete(note)
              return
            }
            setArmed(true)
            window.setTimeout(() => setArmed(false), 2500)
          }}
          className="shrink-0 rounded-full border border-transparent p-1.5 text-ink-faint transition-opacity hover:border-border hover:text-ember focus-visible:opacity-100 group-hover:opacity-100 sm:opacity-0"
        >
          {armed ? (
            <span className="px-1 font-mono text-[10px] uppercase tracking-wide text-ember">Sure?</span>
          ) : (
            <Trash size={15} weight="regular" />
          )}
        </button>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft line-clamp-5">{snippet}</p>
      <div className="mt-4 flex items-center justify-between">
        <time className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          {formatDate(note.updated)}
        </time>
      </div>
    </article>
  )
}