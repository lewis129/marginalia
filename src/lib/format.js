import { pb, pbError } from '../lib/pocketbase'

const dateFmt = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export function formatDate(iso) {
  if (!iso) return ''
  return dateFmt.format(new Date(iso))
}

export function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

const dueFmt = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
})

export function parseDue(iso) {
  if (!iso) return null
  const date = new Date(String(iso).replace(' ', 'T'))
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDue(iso) {
  const d = parseDue(iso)
  return d ? dueFmt.format(d) : ''
}

export function isOverdue(iso) {
  const d = parseDue(iso)
  if (!d) return false
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  return d.getTime() < start.getTime()
}

export function dueSoon(iso) {
  const d = parseDue(iso)
  if (!d) return false
  return d.getTime() - Date.now() <= 7 * 24 * 60 * 60 * 1000
}

export function errorMessage(e) {
  const data = e?.data?.data
  if (data) {
    const key = Object.keys(data)[0]
    if (key && data[key]?.message) return data[key].message
  }
  return e?.message || 'Something went wrong.'
}

export { pbError }