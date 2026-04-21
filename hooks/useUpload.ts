import { useState } from 'react'
import { extractPhotoMeta } from '@/lib/exif'

export type UploadState = 'idle' | 'extracting' | 'uploading' | 'done' | 'error'

export type PendingPhoto = {
  client_id: string
  file: File
  previewDataUrl: string
  lat: number | null
  lng: number | null
  takenAt: string | null
  hasGps: boolean
  progress: number
  state: UploadState
  error?: string
}

export function useUpload(coupleId: string) {
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([])

  async function uploadFiles(files: FileList | File[], forceLat?: number, forceLng?: number) {
    const newPendings: PendingPhoto[] = []
    
    // 1. Initial State parsing
    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const client_id = Math.random().toString(36).substring(7)
        
        setPendingPhotos(prev => [...prev, {
            client_id,
            file,
            previewDataUrl: '',
            lat: forceLat || null,
            lng: forceLng || null,
            takenAt: null,
            hasGps: false,
            progress: 0,
            state: 'extracting'
        }])
        
        newPendings.push({ client_id, file } as PendingPhoto)
    }

    // Process individually
    for(const p of newPendings) {
       let meta = await extractPhotoMeta(p.file);
       const finalLat = forceLat !== undefined ? forceLat : meta.lat;
       const finalLng = forceLng !== undefined ? forceLng : meta.lng;
       const hasGps = forceLat !== undefined ? true : meta.hasGps;
       
       setPendingPhotos(prev => prev.map(x => x.client_id === p.client_id ? {
           ...x,
           previewDataUrl: meta.previewDataUrl,
           lat: finalLat,
           lng: finalLng,
           hasGps: hasGps,
           takenAt: meta.takenAt,
           state: 'uploading'
       } : x))

       // If it needs GPS, queue it instead of uploading
       if (!hasGps) {
         continue; // Remains in 'uploading' but doesn't actually upload until manual placement 
       }

       await performUpload(p.client_id, p.file, coupleId, {
           title: null,
           note: null,
           category: 'memory',
           lat: finalLat,
           lng: finalLng,
           hasGps: hasGps,
           takenAt: meta.takenAt 
       })
    }
  }

  async function performUpload(client_id: string, file: File, coupleId: string, metadata: any) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('coupleId', coupleId)
      formData.append('metadata', JSON.stringify(metadata))

      // Simulate progress via XHR or just assume simple fetch for now since fetch doesn't have progress.
      // For accurate progress we'd need XMLHttpRequest, but for now we set to 50 immediately
      setPendingPhotos(prev => prev.map(x => x.client_id === client_id ? { ...x, progress: 50 } : x))

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      setPendingPhotos(prev => prev.map(x => x.client_id === client_id ? { ...x, progress: 100, state: 'done' } : x))

      // Keep it in done state briefly then remove it 
      setTimeout(() => {
        setPendingPhotos(prev => prev.filter(x => x.client_id !== client_id))
      }, 2000)

    } catch (e: any) {
      setPendingPhotos(prev => prev.map(x => x.client_id === client_id ? { ...x, state: 'error', error: e.message } : x))
    }
  }

  return { pendingPhotos, uploadFiles, performUpload }
}
