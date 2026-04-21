import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const coupleId = formData.get('coupleId') as string | null
    const metadataStr = formData.get('metadata') as string | null

    if (!file || !coupleId || !metadataStr) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'Photo is too large — try under 20MB' }, { status: 400 })
    }

    const { data: memberData } = await supabase
      .from('couple_members')
      .select('id')
      .eq('couple_id', coupleId)
      .eq('user_id', user.id)
      .single()

    if (!memberData) {
      return NextResponse.json({ error: 'Not a member of this space' }, { status: 403 })
    }

    const metadata = JSON.parse(metadataStr)
    const uuid = uuidv4()
    
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const thumbnailBuffer = await sharp(buffer)
      .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 70 })
      .toBuffer()

    const originalPath = `${coupleId}/originals/${uuid}.jpg`
    const thumbnailPath = `${coupleId}/thumbnails/${uuid}.jpg`

    const [uploadOrig, uploadThumb] = await Promise.all([
      supabase.storage.from('photos').upload(originalPath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: false
      }),
      supabase.storage.from('photos').upload(thumbnailPath, thumbnailBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      })
    ])

    if (uploadOrig.error || uploadThumb.error) {
      return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 })
    }

    const { data: photoData, error: dbError } = await supabase
      .from('photos')
      .insert({
        id: uuid,
        couple_id: coupleId,
        uploaded_by: user.id,
        storage_path: originalPath,
        thumbnail_path: thumbnailPath,
        filename: file.name,
        title: metadata.title || null,
        note: metadata.note || null,
        category: metadata.category || 'memory',
        lat: metadata.lat,
        lng: metadata.lng,
        has_gps: metadata.hasGps,
        taken_at: metadata.takenAt
      })
      .select()
      .single()

    if (dbError) {
      await supabase.storage.from('photos').remove([originalPath, thumbnailPath])
      return NextResponse.json({ error: 'Database insert failed' }, { status: 500 })
    }

    return NextResponse.json({ 
      id: uuid, 
      thumbnailUrl: uploadThumb.data?.path, 
      originalUrl: uploadOrig.data?.path,
      photo: photoData
    })
  } catch (error: any) {
    console.error('Upload Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
