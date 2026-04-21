'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMapContext } from '@/components/MapContext'
import { createClient } from '@/lib/supabase/client'

export default function PhotoDrawer() {
  const { activePhotoId, setActivePhotoId, photos } = useMapContext()
  const photo = photos.find(p => p.id === activePhotoId)
  
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [category, setCategory] = useState('memory')
  const [saving, setSaving] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    if (photo) {
      setTitle(photo.title || '')
      setNote(photo.note || '')
      setCategory(photo.category || 'memory')
      
      if (photo.storage_path) {
        supabase.storage.from('photos').createSignedUrl(photo.storage_path, 3600)
          .then(({ data }) => setSignedUrl(data?.signedUrl || null))
      }
    } else {
      setSignedUrl(null)
    }
  }, [photo, supabase])

  if (!photo) return null

  function handleClose() {
    setActivePhotoId(null)
  }

  async function handleAutoSave() {
    if (!photo) return
    setSaving(true)
    await supabase.from('photos').update({
      title,
      note,
      category
    }).eq('id', photo.id)
    setSaving(false)
  }

  function handleShare() {
    const link = `${window.location.origin}/map?photo=${photo?.id}`
    navigator.clipboard.writeText(link)
    alert('Link copied to clipboard!')
  }

  return (
    <AnimatePresence>
      <motion.div 
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
      />
      <motion.div
        key="drawer"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 h-[85vh] md:h-auto md:top-6 md:bottom-6 md:right-6 md:left-auto md:w-[420px] bg-white z-50 rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100"
      >
        <div className="absolute top-4 right-4 z-50">
          <button onClick={handleClose} className="p-2 bg-black/40 text-white rounded-full hover:bg-black/60 backdrop-blur-md">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="w-full h-1/2 min-h-[300px] bg-slate-50 relative group">
          {signedUrl ? (
            <img src={signedUrl} className="w-full h-full object-cover" alt="Memory" />
          ) : (
            <div className="flex w-full h-full items-center justify-center animate-pulse bg-slate-100">
               <span className="text-slate-400">Loading full photo...</span>
            </div>
          )}
        </div>

        <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <input 
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={handleAutoSave}
              placeholder="Give this memory a title..."
              className="font-serif text-2xl text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-purple-200 border-b border-transparent transition-colors py-1"
            />
            <div className="flex gap-2 items-center text-[10px] uppercase font-bold text-slate-400 tracking-wider">
               <span>{photo.taken_at ? new Date(photo.taken_at).toLocaleDateString() : new Date(photo.created_at).toLocaleDateString()}</span>
               {saving && <span className="text-purple-400 ml-auto">Saving...</span>}
            </div>
          </div>

          <textarea
             value={note}
             onChange={e => setNote(e.target.value)}
             onBlur={handleAutoSave}
             placeholder="Add notes, memories, or a journal entry..."
             className="w-full min-h-[100px] mt-2 resize-none text-slate-600 focus:outline-none placeholder:text-slate-300 text-sm leading-relaxed"
          ></textarea>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-4">
             <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
                <select 
                  value={category} 
                  onChange={e => { setCategory(e.target.value); handleAutoSave() }}
                  className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium px-3 py-2 outline-none cursor-pointer text-slate-700"
                >
                  <option value="memory">Purple: Memory</option>
                  <option value="us">Pink: Us</option>
                  <option value="me">Blue: Me</option>
                  <option value="them">Green: Them</option>
                  <option value="dream">Amber: Dream</option>
                </select>
             </div>

             <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
                <span className="text-slate-600 font-medium text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {photo.lat ? `${photo.lat.toFixed(4)}, ${photo.lng?.toFixed(4)}` : 'Location unknown'}
                </span>
                
                <button 
                  onClick={handleShare}
                  className="flex gap-2 items-center bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:border-purple-300 transition-colors shadow-sm"
                >
                  Share link
                </button>
             </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
