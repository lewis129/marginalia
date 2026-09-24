import { useEffect, useRef, useState } from 'react'
import {
  Archive,
  ArrowLeft,
  CalendarBlank,
  Eye,
  PencilSimple,
  PushPinSimple,
  Trash,
  X,
} from '@phosphor-icons/react'
import { useToast } from 'cite-ui'
import { formatDate, pbError } from '../lib/format'
import { renderMarkdown } from '../lib/markdown'

function ToolButton({ active, on, label, children }) {
  return (
    <button
      type="button"
      onClick={on}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition active:scale-95 ${
        active
          ? 'border-ember bg-ember text-card'
          : 'border-border bg-card text-ink-soft hover:text-ink'
      }`}
    >
      {children}
      {label}
    </button>
  )
}

export default function NoteEditor({ note, suggestedTags = [], onSave, onDelete, onClose }) {
  const { toast } = useToast()
  const [title, setTitle] = useState(note?.title ?? '')
  const [body, setBody] = useState(note?.body ?? '')
  const [tags, setTags] = useState(Array.isArray(note?.tags) ? note.tags : [])
  const [pinned, setPinned] = useState(Boolean(note?.pinned))
  const [archived, setArchived] = useState(Boolean(note?.archived))
  const [due, setDue] = useState(note?.due ? String(note.due).slice(0, 10) : '')
  const [tagInput, setTagInput] = useState('')
  const [preview, setPreview] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [status, setStatus] = useState('saved')
  const [saveError, setSaveError] = useState('')
  const [armed, setArmed] = useState(false)
  const latest = useRef({ title, body, tags, pinned, archived, due })
  const bodyRef = useRef(null)
  latest.current = { title, body, tags, pinned, archived, due }

  useEffect(() => {
    setTitle(note?.title ?? '')
    setBody(note?.body ?? '')
    setTags(Array.isArray(note?.tags) ? note.tags : [])
    setPinned(Boolean(note?.pinned))
    setArchived(Boolean(note?.archived))
    setDue(note?.due ? String(note.due).slice(0, 10) : '')
    setTagInput('')
    setPreview(false)
    setDirty(false)
    setStatus('saved')
    setSaveError('')
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
        toast.error(`Could not save: ${pbError(err)}`)
      }
      setDirty(false)
    }, 700)
    return () => window.clearTimeout(t)
  }, [dirty, onSave, toast])

  useEffect(() => {
    const el = bodyRef.current
    if (!el || preview) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 600)}px`
  }, [body, preview, note?.id])

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

  function togglePinned() {
    setPinned((p) => !p)
    setDirty(true)
  }

  function toggleArchived() {
    setArchived((a) => !a)
    setDirty(true)
  }

  function handleDelete() {
    if (!armed) {
      setArmed(true)
      window.setTimeout(() => setArmed(false), 2500)
      return
    }
    onDelete(note)
  }

  function addTag(raw) {
    const t = raw
      .trim()
      .replace(/^#/, '')
      .replace(/[\s,]+/g, '-')
      .toLowerCase()
    if (!t) return
    setTags((prev) => (prev.includes(t) ? prev : [...prev, t].slice(0, 8)))
    setTagInput('')
    setDirty(true)
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

        <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-5 py-2">
          <ToolButton
            active={preview}
            on={() => setPreview((p) => !p)}
            label={preview ? 'Write' : 'Preview'}
          >
            {preview ? <PencilSimple size={14} weight="regular" /> : <Eye size={14} weight="regular" />}
          </ToolButton>
          <ToolButton active={pinned} on={togglePinned} label={pinned ? 'Pinned' : 'Pin'}>
            <PushPinSimple size={14} weight={pinned ? 'fill' : 'regular'} />
          </ToolButton>
          <ToolButton active={archived} on={toggleArchived} label={archived ? 'Archived' : 'Archive'}>
            <Archive size={14} weight={archived ? 'fill' : 'regular'} />
          </ToolButton>
          <label className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-ink-soft">
            <CalendarBlank size={14} weight="regular" />
            <input
              type="date"
              value={due}
              onChange={(e) => {
                setDue(e.target.value)
                setDirty(true)
              }}
              aria-label="Due date"
              className="w-28 bg-transparent text-xs outline-none [color-scheme:inherit]"
            />
          </label>

          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full bg-ember-soft px-2 py-0.5 font-mono text-[11px] text-ember-deep"
              >
                #{t}
                <button
                  type="button"
                  aria-label={`Remove tag ${t}`}
                  onClick={() => {
                    setTags((prev) => prev.filter((x) => x !== t))
                    setDirty(true)
                  }}
                  className="transition-colors hover:text-ember active:scale-95"
                >
                  <X size={11} weight="bold" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              list="marginalia-tags"
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  addTag(e.currentTarget.value)
                }
              }}
              onBlur={() => tagInput && addTag(tagInput)}
              placeholder={tags.length === 0 ? 'Add a tag…' : '…'}
              aria-label="Add a tag"
              className="w-24 bg-transparent font-mono text-xs outline-none placeholder:text-ink-faint"
            />
            <datalist id="marginalia-tags">
              {suggestedTags
                .filter((t) => !tags.includes(t))
                .map((t) => (
                  <option key={t} value={t} />
                ))}
            </datalist>
          </div>
        </div>

        <div className="flex items-center gap-2 px-5 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          <span>{body.length} characters</span>
          <span aria-hidden="true">·</span>
          <span>{formatDate(note?.updated)}</span>
          <span className="ml-auto flex items-center gap-1.5" role="status">
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

        {preview ? (
          <div className="flex-1 overflow-y-auto px-5 py-3 text-[15px]">
            <div
              className="prose-marginalia"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
            />
          </div>
        ) : (
          <textarea
            ref={bodyRef}
            value={body}
            onChange={(e) => {
              setBody(e.target.value)
              setDirty(true)
            }}
            placeholder="Start writing in the margins… Markdown works: **bold**, `code`, lists, # headings"
            aria-label="Note body"
            className="flex-1 resize-none overflow-y-auto bg-transparent px-5 py-3 text-[15px] leading-relaxed outline-none placeholder:text-ink-faint"
          />
        )}
      </div>
    </div>
  )
}