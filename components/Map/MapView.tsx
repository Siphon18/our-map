'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, ZoomControl, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { usePhotos } from '@/hooks/usePhotos'
import PhotoMarker from './PhotoMarker'
import CurrentLocation from './CurrentLocation'
import DistanceLine from './DistanceLine'
import PhotoLightbox from './PhotoLightbox'
import PartnerStatus from './PartnerStatus'
import MemoryPlayback from './MemoryPlayback'
import { useMapContext } from '@/components/MapContext'
import MarkerClusterGroup from 'react-leaflet-cluster'

function MapEvents({ coupleId }: { coupleId: string }) {
  const { setMapInstance, placementPhoto, setPlacementPhoto, performUpload } = useMapContext()
  const map = useMapEvents({
    click(e: any) {
      if (placementPhoto) {
         performUpload(placementPhoto.client_id, placementPhoto.file, coupleId, {
            title: null,
            note: null,
            category: 'memory',
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            hasGps: true,
            takenAt: placementPhoto.takenAt
         })
         setPlacementPhoto(null)
      }
    }
  })
  
  useEffect(() => {
    if (map) setMapInstance(map)
  }, [map, setMapInstance])
  
  // Style cursor
  useEffect(() => {
    if (placementPhoto && map) {
      map.getContainer().style.cursor = 'crosshair'
    } else if (map) {
      map.getContainer().style.cursor = ''
    }
  }, [placementPhoto, map])
  
  return null
}

export default function MapView({ coupleId, currentUserId }: { coupleId: string, currentUserId: string }) {
  const [mounted, setMounted] = useState(false)
  const { photos, placementPhoto, setPlacementPhoto, pendingPhotos } = useMapContext()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="w-full h-full relative z-0 bg-[#0f172a]">
      {placementPhoto && (
         <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-slate-800 text-white px-6 py-3 rounded-full shadow-lg font-medium text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            Click anywhere to place {placementPhoto?.file.name}
            <button onClick={() => setPlacementPhoto(null)} className="ml-2 text-slate-300 hover:text-white">Cancel</button>
         </div>
      )}
      <MapContainer 
        center={[25, 0]} 
        zoom={3} 
        zoomControl={false}
        scrollWheelZoom={true} 
        className="w-full h-full"
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapEvents coupleId={coupleId} />
        <CurrentLocation />
        <DistanceLine />
        
        <MarkerClusterGroup 
          chunkedLoading 
          maxClusterRadius={50}
          showCoverageOnHover={false}
          spiderfyOnMaxZoom={true}
        >
          {photos.map(photo => (
            <PhotoMarker key={photo.id} photo={photo} />
          ))}
          
          {/* Render uploading/pending markers natively if they have GPS */}
          {pendingPhotos.filter(p => p.state === 'uploading' && p.lat && p.lng).map(p => (
             <PhotoMarker key={p.client_id} photo={{
               id: p.client_id, couple_id: coupleId, uploaded_by: currentUserId, storage_path: '', thumbnail_path: '', filename: p.file.name, title: null, note: null, category: 'memory', lat: p.lat, lng: p.lng, has_gps: true, taken_at: p.takenAt, created_at: new Date().toISOString()
             }} isPending previewUrl={p.previewDataUrl} />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
      <PhotoLightbox />
      <PartnerStatus currentUserId={currentUserId} />
      <MemoryPlayback />
    </div>
  )
}
