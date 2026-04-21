'use client'

import { useMapContext } from '@/components/MapContext'
import { useEffect, useState, useMemo } from 'react'

export default function MemoryPlayback() {
  const { photos, flyTo, setActivePhotoId, activePhotoId } = useMapContext()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(-1) // -1 means nothing is playing explicitly from timeline

  // Filter photos with GPS and sort chronologically
  const timelinePhotos = useMemo(() => {
    return photos
      .filter(p => p.lat && p.lng)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }, [photos])

  // Sync currentIndex if user clicks around
  useEffect(() => {
    if (activePhotoId) {
      const idx = timelinePhotos.findIndex(p => p.id === activePhotoId)
      if (idx !== -1 && !isPlaying) {
        setCurrentIndex(idx)
      }
    }
  }, [activePhotoId, timelinePhotos, isPlaying])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && timelinePhotos.length > 0) {
      interval = setInterval(() => {
        setCurrentIndex(prev => {
          const nextIndex = (prev + 1) % timelinePhotos.length
          const nextPhoto = timelinePhotos[nextIndex]
          flyTo(nextPhoto.lat!, nextPhoto.lng!)
          setActivePhotoId(nextPhoto.id)
          return nextIndex
        })
      }, 3500) // 3.5 seconds per memory
    }
    return () => clearInterval(interval)
  }, [isPlaying, timelinePhotos, flyTo, setActivePhotoId])

  if (timelinePhotos.length === 0) return null

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false)
    const newIdx = parseInt(e.target.value)
    setCurrentIndex(newIdx)
    const activePhoto = timelinePhotos[newIdx]
    if (activePhoto) {
      flyTo(activePhoto.lat!, activePhoto.lng!)
      setActivePhotoId(activePhoto.id)
    }
  }

  const handlePlayPause = () => {
    if (!isPlaying && currentIndex === -1 && timelinePhotos.length > 0) {
      // Start from the beginning
      setCurrentIndex(0)
      flyTo(timelinePhotos[0].lat!, timelinePhotos[0].lng!)
      setActivePhotoId(timelinePhotos[0].id)
    }
    setIsPlaying(!isPlaying)
  }

  const progressPercent = currentIndex === -1 ? 0 : (currentIndex / (timelinePhotos.length - 1)) * 100

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-11/12 max-w-xl bg-slate-900/90 backdrop-blur-md rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 px-6 py-4 flex items-center gap-6">
      
      <button 
        onClick={handlePlayPause}
        className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-pink-500 hover:bg-pink-400 text-white rounded-full transition-colors shadow-[0_0_15px_rgba(236,72,153,0.5)]"
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        )}
      </button>

      <div className="flex-1 flex flex-col relative w-full gap-2">
        <input 
          type="range"
          min="0"
          max={timelinePhotos.length - 1}
          value={currentIndex === -1 ? 0 : currentIndex}
          onChange={handleSliderChange}
          className="w-full appearance-none bg-slate-700 h-1.5 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer relative z-10"
        />
        {/* Custom Progress Bar Cover */}
        <div 
          className="absolute top-[1.5px] left-0 h-1.5 bg-pink-500 rounded-full pointer-events-none" 
          style={{ width: `${progressPercent}%` }}
        ></div>
        
        <div className="flex justify-between w-full px-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Start</span>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex-1 text-center">
            {currentIndex !== -1 && timelinePhotos[currentIndex] ? (
              <span className="text-pink-400">
                {new Date(timelinePhotos[currentIndex].created_at).toLocaleDateString()}
              </span>
            ) : 'Timeline'}
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Now</span>
        </div>
      </div>

    </div>
  )
}
