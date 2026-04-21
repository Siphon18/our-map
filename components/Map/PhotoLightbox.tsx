'use client'

import { useMapContext } from '@/components/MapContext'
import { useEffect, useState } from 'react'

export default function PhotoLightbox() {
  const { activePhotoId, setActivePhotoId, photos } = useMapContext()
  const photo = photos.find(p => p.id === activePhotoId)
  
  if (!activePhotoId || !photo) return null

  const isPublicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${photo.storage_path}`

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Close button background overlay (clicking outside closes it) */}
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={() => setActivePhotoId(null)} 
      />

      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row bg-slate-900 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 mx-4">
        
        {/* Close Button */}
        <button 
          onClick={() => setActivePhotoId(null)}
          className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/80 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {/* Image Section */}
        <div className="flex-1 min-h-[40vh] md:min-h-0 bg-black flex items-center justify-center relative">
          <img 
            src={isPublicUrl} 
            className="w-full h-full object-contain max-h-[60vh] md:max-h-[90vh]"
            alt={photo.title || 'Memory'}
          />
        </div>

        {/* Details Section */}
        <div className="w-full md:w-[380px] bg-slate-900 border-t md:border-t-0 md:border-l border-white/10 p-6 md:p-8 flex flex-col overflow-y-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-pink-500/20 text-pink-400 border border-pink-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
              {photo.category}
            </span>
            <span className="text-sm font-medium text-slate-400">
              {photo.taken_at ? new Date(photo.taken_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : new Date(photo.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
            {photo.title || 'A Beautiful Memory'}
          </h2>

          <div className="prose prose-invert prose-slate h-full flex-1">
            {photo.note ? (
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{photo.note}</p>
            ) : (
              <p className="text-slate-500 italic">No note added for this memory.</p>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {photo.lat?.toFixed(4)}, {photo.lng?.toFixed(4)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
