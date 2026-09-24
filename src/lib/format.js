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

export function errorMessage(e) {
  const data = e?.data?.data
  if (data) {
    const key = Object.keys(data)[0]
    if (key && data[key]?.message) return data[key].message
  }
  return e?.message || 'Something went wrong.'
}

export { pbError }