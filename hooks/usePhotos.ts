import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Photo } from '@/types'

export function usePhotos(coupleId: string) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchPhotos() {
        const { data } = await supabase
          .from('photos')
          .select('*')
          .eq('couple_id', coupleId)
          .order('created_at', { ascending: false })
        
        if (data) setPhotos(data as Photo[])
        setLoading(false)
    }

    fetchPhotos()

    const channel = supabase
      .channel(`couple:${coupleId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'photos', filter: `couple_id=eq.${coupleId}` },
        (payload) => {
          setPhotos(prev => [payload.new as Photo, ...prev])
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'photos', filter: `couple_id=eq.${coupleId}` },
        (payload) => {
          setPhotos(prev => prev.filter(p => p.id !== payload.old.id))
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'photos', filter: `couple_id=eq.${coupleId}` },
        (payload) => {
          setPhotos(prev => prev.map(p => p.id === payload.new.id ? payload.new as Photo : p))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [coupleId])

  return { photos, loading, setPhotos }
}
