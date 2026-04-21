'use client'

import { useEffect, useState } from 'react'
import { useMapContext } from '@/components/MapContext'

export default function PartnerStatus({ currentUserId }: { currentUserId: string }) {
  const { photos } = useMapContext()
  const [data, setData] = useState<{ temp: number, time: string, isDay: boolean } | null>(null)

  const partnerPhotos = photos.filter(p => p.uploaded_by !== currentUserId && p.lat && p.lng)
  const latestPartnerPhoto = partnerPhotos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

  useEffect(() => {
    if (!latestPartnerPhoto) return

    async function fetchWeather() {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latestPartnerPhoto.lat}&longitude=${latestPartnerPhoto.lng}&current_weather=true&timezone=auto`)
        const json = await res.json()
        
        if (json.current_weather) {
          const isDay = json.current_weather.is_day === 1
          
          // Helper to get time in the specific timezone
          const timeString = new Date().toLocaleTimeString('en-US', {
            timeZone: json.timezone || 'UTC',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })

          setData({
            temp: json.current_weather.temperature,
            time: timeString,
            isDay
          })
        }
      } catch (err) {
        console.error('Failed to fetch weather', err)
      }
    }

    fetchWeather()
    // Refresh time every minute
    const interval = setInterval(fetchWeather, 60000)
    return () => clearInterval(interval)
  }, [latestPartnerPhoto?.id])

  if (!latestPartnerPhoto || !data) return null

  return (
    <div className="absolute top-6 left-6 z-[1000] bg-slate-900/80 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-white/10 flex items-center gap-4 animate-in fade-in slide-in-from-left-4 select-none pointer-events-none">
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Partner's Area</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg leading-none tracking-tight">{data.time}</span>
          <span className="text-slate-400 text-xs mt-0.5 leading-none px-1.5 py-0.5 bg-white/10 rounded-md">
            {data.temp}°C
          </span>
        </div>
      </div>
      <div className="text-2xl opacity-90 drop-shadow-md">
        {data.isDay ? '☀️' : '🌙'}
      </div>
    </div>
  )
}
