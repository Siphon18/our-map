import exifr from 'exifr'

export async function extractPhotoMeta(file: File) {
  try {
    let meta = null;
    try {
      meta = await exifr.parse(file, { gps: true, pick: ['latitude', 'longitude', 'DateTimeOriginal'] })
    } catch(e) {
      console.warn("Exif parsing error or no exif data", e)
    }
    
    const previewDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.readAsDataURL(file)
    })

    return {
      lat: meta?.latitude || null,
      lng: meta?.longitude || null,
      takenAt: meta?.DateTimeOriginal ? new Date(meta.DateTimeOriginal).toISOString() : null,
      hasGps: !!(meta?.latitude && meta?.longitude),
      previewDataUrl
    }
  } catch (error) {
    console.error('EXIF extraction error:', error)
    const previewDataUrl = URL.createObjectURL(file)
    return { lat: null, lng: null, takenAt: null, hasGps: false, previewDataUrl }
  }
}
