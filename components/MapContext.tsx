'use client'
import { createContext, useContext, useState, ReactNode } from 'react'
import { PendingPhoto, useUpload } from '@/hooks/useUpload'
import { usePhotos } from '@/hooks/usePhotos'
import { Photo } from '@/types'

type MapContextType = {
  activePhotoId: string | null
  setActivePhotoId: (id: string | null) => void
  flyTo: (lat: number, lng: number) => void
  mapInstance: any
  setMapInstance: (map: any) => void
  pendingPhotos: PendingPhoto[]
  uploadFiles: (files: FileList | File[], forceLat?: number, forceLng?: number) => void
  performUpload: (client_id: string, file: File, coupleId: string, meta: any) => void
  placementPhoto: PendingPhoto | null
  setPlacementPhoto: (photo: PendingPhoto | null) => void
  photos: Photo[]
  loadingPhotos: boolean
}

const MapContext = createContext<MapContextType | null>(null)

export function MapProvider({ children, coupleId }: { children: ReactNode, coupleId: string }) {
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [placementPhoto, setPlacementPhoto] = useState<PendingPhoto | null>(null)

  const { pendingPhotos, uploadFiles, performUpload } = useUpload(coupleId)
  const { photos, loading: loadingPhotos } = usePhotos(coupleId)

  function flyTo(lat: number, lng: number) {
    if (mapInstance) {
      mapInstance.flyTo([lat, lng], 16, { duration: 1.2 })
    }
  }

  return (
    <MapContext.Provider value={{ activePhotoId, setActivePhotoId, flyTo, mapInstance, setMapInstance, pendingPhotos, uploadFiles, performUpload, placementPhoto, setPlacementPhoto, photos, loadingPhotos }}>
      {children}
    </MapContext.Provider>
  )
}

export function useMapContext() {
  const ctx = useContext(MapContext)
  if (!ctx) throw new Error('useMapContext must be used within MapProvider')
  return ctx
}
