'use client'

import { useMapContext } from '@/components/MapContext'
import { Polyline, Tooltip } from 'react-leaflet'
import L from 'leaflet'

export default function DistanceLine() {
  const { photos } = useMapContext()

  // Find the two users
  const userIds = Array.from(new Set(photos.map(p => p.uploaded_by)))
  
  if (userIds.length < 2) return null // Need at least 2 users to draw a line

  const userA = userIds[0]
  const userB = userIds[1]

  // Get the latest photo with GPS for each user
  const latestA = photos
    .filter(p => p.uploaded_by === userA && p.lat && p.lng)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

  const latestB = photos
    .filter(p => p.uploaded_by === userB && p.lat && p.lng)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

  if (!latestA || !latestB) return null // Need locations for both

  const pointA = L.latLng(latestA.lat!, latestA.lng!)
  const pointB = L.latLng(latestB.lat!, latestB.lng!)
  
  // Calculate distance in km
  const distanceKm = (pointA.distanceTo(pointB) / 1000).toFixed(1)
  
  // Define the middle point for the label
  const midLat = (pointA.lat + pointB.lat) / 2
  const midLng = (pointA.lng + pointB.lng) / 2
  const midPoint: [number, number] = [midLat, midLng]

  return (
    <>
      <Polyline 
        positions={[pointA, pointB]} 
        pathOptions={{ 
          color: '#ec4899', // pink-500
          weight: 3, 
          dashArray: '10, 10',
          opacity: 0.7 
        }} 
      />
      
      {/* We use a tiny invisible polyline or just a Marker/Tooltip at the midpoint, but Tooltip can be attached to the Polyline itself? Actually, an empty marker at midpoint is easier for static label */}
      <Tooltip position={midPoint} permanent direction="center" className="bg-white/90 px-3 py-1.5 rounded-full shadow-md text-pink-600 font-semibold border-none before:hidden">
        {distanceKm} km apart
      </Tooltip>
    </>
  )
}
