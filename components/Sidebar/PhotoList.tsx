'use client'

import { useState } from 'react'
import { useMapContext } from '@/components/MapContext'
import PhotoCard from './PhotoCard'

export default function PhotoList({ coupleId, currentUserId }: { coupleId: string, currentUserId: string }) {
  const { photos, loadingPhotos: loading } = useMapContext()
  
  const [filterCat, setFilterCat] = useState('all')
  const [filterUser, setFilterUser] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  let sorted = [...photos]

  if (filterCat !== 'all') {
    sorted = sorted.filter(p => p.category === filterCat)
  }
  
  if (filterUser !== 'all') {
    sorted = sorted.filter(p => filterUser === 'me' ? p.uploaded_by === currentUserId : p.uploaded_by !== currentUserId)
  }

  if (sortBy === 'oldest') {
    sorted.reverse()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium px-2 py-1.5 focus:ring-2 focus:ring-purple-400 outline-none cursor-pointer">
          <option value="all">Categories: All</option>
          <option value="memory">Purple: Memory</option>
          <option value="us">Pink: Us</option>
          <option value="me">Blue: Me</option>
          <option value="them">Green: Them</option>
          <option value="dream">Amber: Dream</option>
        </select>

        <select value={filterUser} onChange={e => setFilterUser(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium px-2 py-1.5 focus:ring-2 focus:ring-purple-400 outline-none cursor-pointer">
          <option value="all">Everyone</option>
          <option value="me">Just Me</option>
          <option value="them">Partner</option>
        </select>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium px-2 py-1.5 focus:ring-2 focus:ring-purple-400 outline-none cursor-pointer">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
             <div key={i} className="animate-pulse bg-slate-100 h-[86px] rounded-2xl w-full"></div>
          ))
        ) : sorted.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-4">
             <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center">
               <svg className="w-10 h-10 text-pink-300" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
               </svg>
             </div>
             <p className="text-sm font-medium">Drop your first memory on the map from above.</p>
           </div>
        ) : (
          sorted.map(photo => <PhotoCard key={photo.id} photo={photo} currentUserId={currentUserId} />)
        )}
      </div>
    </div>
  )
}
