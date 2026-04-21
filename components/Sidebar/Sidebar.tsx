'use client'

import UploadZone from './UploadZone'
import PhotoList from './PhotoList'

export default function Sidebar({ coupleId, currentUserId }: { coupleId: string, currentUserId: string }) {
  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden p-6 gap-6 rounded-l-[2rem] md:rounded-none z-10 shadow-2xl relative">
      <div>
        <h2 className="text-2xl font-serif text-slate-800">Our Memories</h2>
        <p className="text-slate-500 text-sm">Drop a new photo to add it to the map.</p>
      </div>

      <UploadZone coupleId={coupleId} />

      <div className="flex-1 overflow-y-auto w-full relative">
        <PhotoList coupleId={coupleId} currentUserId={currentUserId} />
      </div>
    </div>
  )
}
