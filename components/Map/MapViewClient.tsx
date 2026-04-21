'use client'

import dynamic from 'next/dynamic'

const MapView = dynamic(
  () => import('./MapView'),
  { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Loading Map...</div>
  }
)

export default function MapViewClient({ coupleId, currentUserId }: { coupleId: string, currentUserId: string }) {
  return <MapView coupleId={coupleId} currentUserId={currentUserId} />
}
