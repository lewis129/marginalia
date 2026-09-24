import PocketBase from 'pocketbase'

export const pb = new PocketBase(
  import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090'
)

pb.autoCancellation(false)

export function pbError(e) {
  const data = e?.data?.data
  if (data) {
    const key = Object.keys(data)[0]
    if (key && data[key]?.message) return data[key].message
  }
  return e?.message || 'Something went wrong.'
}