'use client'

import { Photo } from '@/types'
import { useMapContext } from '@/components/MapContext'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

import { useEffect, useState } from 'react'

const categoryColors: Record<string, string> = {
  memory: 'bg-purple-100 text-purple-700',
  us: 'bg-pink-100 text-pink-700',
  me: 'bg-blue-100 text-blue-700',
  them: 'bg-emerald-100 text-emerald-700',
  dream: 'bg-amber-100 text-amber-700'
}

export default function PhotoCard({ photo, currentUserId }: { photo: Photo, currentUserId: string }) {
  const { flyTo, setActivePhotoId, activePhotoId } = useMapContext()
  const supabase = createClient()
  const [thumbUrl, setThumbUrl] = useState<string | null>(null)
  
  useEffect(() => {
    if (photo.thumbnail_path) {
      supabase.storage.from('photos').createSignedUrl(photo.thumbnail_path, 3600).then(({ data }) => {
        if (data?.signedUrl) setThumbUrl(data.signedUrl)
      })
    }
  }, [photo.thumbnail_path, supabase])
  
  const isMe = photo.uploaded_by === currentUserId
  const isActive = activePhotoId === photo.id

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Delete this memory?')) return
    
    await supabase.from('photos').delete().eq('id', photo.id)
    await supabase.storage.from('photos').remove([photo.storage_path, photo.thumbnail_path])
  }

  function onClick() {
    setActivePhotoId(photo.id)
    if (photo.lat && photo.lng) {
      flyTo(photo.lat, photo.lng)
    }
  }

  return (
    <div 
      onClick={onClick}
      className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-4 items-center group
        ${isActive ? 'bg-purple-50 border-purple-200 shadow-[0_4px_20px_0_rgba(168,85,247,0.15)]' : 'bg-white border-slate-100 hover:border-purple-200 hover:bg-slate-50'}`}
    >
      <div className="w-[60px] h-[60px] rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative">
        {thumbUrl && (
          <img 
            src={thumbUrl} 
            className="w-full h-full object-cover transition-opacity duration-300"
            alt={photo.filename}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <p className="font-semibold text-slate-800 truncate pr-2">
            {photo.title || photo.filename}
          </p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${categoryColors[photo.category]}`}>
            {photo.category}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
          <span>{photo.taken_at ? new Date(photo.taken_at).toLocaleDateString() : new Date(photo.created_at).toLocaleDateString()}</span>
          <span>•</span>
          {photo.lat && photo.lng ? (
            <span className="flex items-center gap-1 text-purple-600 font-medium">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Mapped
            </span>
          ) : (
            <span className="text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded-md">No GPS - Needs placement</span>
          )}
        </div>
      </div>

      {isMe && (
        <button 
          onClick={handleDelete}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  )
}
