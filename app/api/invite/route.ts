import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { inviteCode } = body

    if (!inviteCode) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('join_couple', { invite: inviteCode })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: data.status || 400 })
    }

    return NextResponse.json({ success: true, couple_id: data.couple_id })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
