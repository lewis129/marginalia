import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Trash } from '@phosphor-icons/react'
import { formatDate } from '../lib/format'

export default function NoteEditor({ note, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(note?.title ?? '')
  const [body, setBody] = useState(note?.body ?? '')
  const [dirty, setDirty] = useState(false)
  const [status, setStatus] = useState('saved')
  const [saveError, setSaveError] = useState('')
  const [armed, setArmed] = useState(false)
  const latest = useRef({ title, body })
  const bodyRef = useRef(null)
  latest.current = { title, body }

  useEffect(() => {
    setTitle(note?.title ?? '')
    setBody(note?.body ?? '')
    setDirty(false)
    setStatus('saved')
  }, [note?.id])

  useEffect(() => {
    if (!dirty) return
    setStatus('saving')
    const t = window.setTimeout(async () => {
      try {
        await onSave(latest.current)
        setStatus('saved')
        setSaveError('')
      } catch (err) {
        console.error('marginalia save failed:', err)
        setStatus('error')
        setSaveError(err?.message || JSON.stringify(err))
      }
      setDirty(false)
    }, 700)
    return () => window.clearTimeout(t)
  }, [dirty])

  useEffect(() => {
    const el = bodyRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 600)}px`
  }, [body, note?.id])

  const closeRef = useRef(null)
  async function close() {
    if (dirty) {
      try {
        await onSave(latest.current)
      } catch {
        /* keep the note open so nothing is lost */
      }
    }
    onClose()
  }
  closeRef.current = close

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') closeRef.current()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  function handleDelete() {
    if (!armed) {
      setArmed(true)
      window.setTimeout(() => setArmed(false), 2500)
      return
    }
    onDelete(note)
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end bg-black/40 backdrop-blur-sm lg:items-center lg:p-6"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-[92vh] w-full flex-col bg-card lg:mx-auto lg:h-[min(720px,86vh)] lg:max-w-3xl lg:rounded-3xl lg:border lg:border-border lg:shadow-2xl"
      >
        <div className="flex items-center gap-1 border-b border-border px-3 py-2.5">
          <button
            type="button"
            onClick={close}
            aria-label="Close editor"
            className="rounded-full p-2 text-ink-soft transition hover:bg-paper-soft hover:text-ink active:scale-95"
          >
            <ArrowLeft size={18} weight="regular" />
          </button>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setDirty(true)
            }}
            placeholder="Untitled"
            aria-label="Note title"
            className="flex-1 truncate bg-transparent px-2 text-lg font-semibold tracking-tight outline-none placeholder:text-ink-faint sm:text-xl"
          />
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Delete note"
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-transparent px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-ink-faint transition hover:border-border hover:text-ember active:scale-95"
          >
            <Trash size={14} weight="regular" />
            {armed ? 'Delete note?' : 'Delete'}
          </button>
        </div>

        <div className="flex items-center gap-2 px-5 pb-1 pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          <span>{body.length} characters</span>
          <span aria-hidden="true">·</span>
          <span>{formatDate(note?.updated)}</span>
          <span
            className="ml-auto flex items-center gap-1.5"
            role="status"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status === 'error'
                  ? 'bg-ember'
                  : status === 'saving'
                    ? 'bg-ember/70'
                    : 'bg-ink-faint'
              }`}
              aria-hidden="true"
            />
            {status === 'saving' ? 'Saving…' : status === 'error' && saveError ? saveError : status === 'error' ? 'Could not save' : 'Saved'}
          </span>
        </div>

        <textarea
          ref={bodyRef}
          value={body}
          onChange={(e) => {
            setBody(e.target.value)
            setDirty(true)
          }}
          placeholder="Start writing in the margins…"
          aria-label="Note body"
          className="flex-1 resize-none overflow-y-auto bg-transparent px-5 py-3 text-[15px] leading-relaxed outline-none placeholder:text-ink-faint"
        />
      </div>
    </div>
  )
}