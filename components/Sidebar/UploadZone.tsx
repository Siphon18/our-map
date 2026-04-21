'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { extractPhotoMeta } from '@/lib/exif'
import { useMapContext } from '@/components/MapContext'

export default function UploadZone({ coupleId }: { coupleId: string }) {
  const [isHovering, setIsHovering] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { uploadFiles, setPlacementPhoto, pendingPhotos } = useMapContext()
  const needsPlacement = pendingPhotos.filter(p => !p.hasGps && p.state === 'uploading')

  async function handleFiles(files: FileList | File[]) {
    if(files.length > 0) {
       uploadFiles(files)
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {needsPlacement.map(p => (
         <div key={p.client_id} className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex justify-between items-center text-sm shadow-sm relative overflow-hidden">
           <div className="flex items-center gap-3 w-full overflow-hidden">
             <div className="w-10 h-10 border-2 border-amber-200 rounded-lg bg-cover bg-center shrink-0" style={{backgroundImage: `url('${p.previewDataUrl}')`}}></div>
             <span className="text-amber-800 font-medium truncate flex-1 leading-tight pr-2">{p.file.name}<br/><span className="text-[10px] uppercase font-bold text-amber-600 opacity-80 mt-0.5 inline-block">Needs Placement</span></span>
           </div>
           
           <button onClick={() => setPlacementPhoto(p)} className="bg-gradient-to-tr from-amber-500 to-orange-400 text-white px-3 py-1.5 rounded-lg font-medium shadow-md active:scale-95 transition-all flex-shrink-0 z-10 hover:shadow-lg focus:outline-none">Place</button>
         </div>
      ))}
      <div 
        className={`relative w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
          isHovering 
            ? 'bg-purple-50 border-purple-400' 
            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
        }`}
        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsHovering(true) }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsHovering(false) }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
        onDrop={(e) => {
          e.preventDefault(); e.stopPropagation();
          setIsHovering(false)
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files)
          }
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          multiple 
          accept="image/jpeg, image/png, image/webp, image/heic"
          className="hidden" 
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files)
          }}
        />
        <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500">
          <svg className={`w-8 h-8 mb-2 transition-colors duration-300 ${isHovering ? 'text-purple-500 scale-110' : 'text-slate-400 scale-100'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p className="font-medium text-sm">Upload Photos</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Drag & drop or Click</p>
        </div>
      </div>
    </div>
  )
}
