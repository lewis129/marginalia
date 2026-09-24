import { useCallback, useEffect, useState } from 'react'
import { pb } from '../lib/pocketbase'

export function useNotes(user) {
  const [notes, setNotes] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const records = await pb.collection('notes').getFullList({ sort: '-updated' })
      setNotes(records)
      setError(null)
    } catch (e) {
      setNotes([])
      setError(e.message)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    let alive = true
    let unsubscribe = null
    load()

    pb.collection('notes')
      .subscribe('*', () => load())
      .then((u) => {
        if (alive) unsubscribe = u
        else u()
      })

    return () => {
      alive = false
      if (unsubscribe) unsubscribe()
    }
  }, [user, load])

  const createNote = useCallback(
    async ({ title, body, tags = [], pinned = false, archived = false, due = null }) => {
      const record = await pb.collection('notes').create({
        title,
        body,
        author: user.id,
        tags,
        pinned,
        archived,
        due,
      })
      setNotes((prev) => [record, ...(prev ?? []).filter((n) => n.id !== record.id)])
      return record
    },
    [user]
  )

  const updateNote = useCallback(async (id, patch) => {
    const record = await pb.collection('notes').update(id, patch)
    setNotes((prev) => [record, ...(prev ?? []).filter((n) => n.id !== id)])
    return record
  }, [])

  const removeNote = useCallback(async (id) => {
    await pb.collection('notes').delete(id)
    setNotes((prev) => (prev ?? []).filter((n) => n.id !== id))
  }, [])

  return { notes, error, createNote, updateNote, removeNote, reload: load }
}