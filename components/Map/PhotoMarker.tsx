'use client'

import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import { Photo } from '@/types'
import { useMapContext } from '@/components/MapContext'

import { useEffect, useState } from 'react'

const categoryColors: Record<string, string> = {
  memory: 'rgba(127, 119, 221, 0.4)',
  us: 'rgba(212, 83, 126, 0.4)',
  me: 'rgba(55, 138, 221, 0.4)',
  them: 'rgba(29, 158, 117, 0.4)',
  dream: 'rgba(186, 117, 23, 0.4)'
}

const borderColors: Record<string, string> = {
  memory: '#7F77DD',
  us: '#D4537E',
  me: '#378ADD',
  them: '#1D9E75',
  dream: '#BA7517'
}

export default function PhotoMarker({ photo, isPending, previewUrl }: { photo: Photo, isPending?: boolean, previewUrl?: string }) {
  const { setActivePhotoId, activePhotoId } = useMapContext()
  const isActive = activePhotoId === photo.id
  const [thumbUrl, setThumbUrl] = useState<string | null>(isPending ? previewUrl || null : null)

  useEffect(() => {
    if (!isPending && photo.thumbnail_path) {
      import('@/lib/supabase/client').then(({ createClient }) => {
        const supabase = createClient()
        supabase.storage.from('photos').createSignedUrl(photo.thumbnail_path, 3600)
          .then(({ data }) => {
            if (data?.signedUrl) setThumbUrl(data.signedUrl)
          })
      })
    }
  }, [isPending, photo.thumbnail_path])

  if (!photo.lat || !photo.lng) return null

  const size = isActive ? 64 : 48
  const borderColor = borderColors[photo.category] || borderColors.memory
  const glowColor = categoryColors[photo.category] || categoryColors.memory

  const iconHtml = `
    <div style="
        width: ${size}px; 
        height: ${size}px; 
        border-radius: 50%; 
        background: url('${thumbUrl || ''}') center/cover;
        border: 3px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.15), 0 0 0 ${isActive ? '4px' : '2px'} ${borderColor}, 0 0 20px ${isActive ? glowColor : 'transparent'};
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform-origin: center bottom;
    "></div>
  `

  const icon = L.divIcon({
    html: iconHtml,
    className: 'photo-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  })

  return (
    <Marker 
      position={[photo.lat, photo.lng]} 
      icon={icon}
      eventHandlers={{
        click: () => setActivePhotoId(photo.id),
      }}
    />
  )
}
