'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useMapContext } from './MapContext'

function ShareParamsHandler() {
  const searchParams = useSearchParams()
  const photoId = searchParams.get('photo')
  const { setActivePhotoId } = useMapContext()

  useEffect(() => {
    if (photoId) {
      setActivePhotoId(photoId)
    }
  }, [photoId, setActivePhotoId])

  return null
}

export default function ShareLinkHandler() {
  return (
    <Suspense fallback={null}>
      <ShareParamsHandler />
    </Suspense>
  )
}
