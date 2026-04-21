import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InviteFlow from '@/components/Auth/InviteFlow'
import Sidebar from '@/components/Sidebar/Sidebar'
import { MapProvider } from '@/components/MapContext'
import PhotoDrawer from '@/components/PhotoDrawer'
import ShareLinkHandler from '@/components/ShareLinkHandler'
import MobileBottomSheet from '@/components/Sidebar/MobileBottomSheet'
import MapViewClient from '@/components/Map/MapViewClient'
import InviteCodeWidget from '@/components/InviteCodeWidget'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function MapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: coupleMembers } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .limit(1)

  const coupleMember = coupleMembers?.[0]
  const hasCouple = !!coupleMember?.couple_id

  let inviteCode = ''
  if (hasCouple) {
    const { data: coupleData } = await supabase
      .from('couples')
      .select('invite_code')
      .eq('id', coupleMember.couple_id)
      .single()
    if (coupleData) {
      inviteCode = coupleData.invite_code
    }
  }

  return (
    <main className="w-full h-screen relative bg-slate-100 overflow-hidden text-slate-800 flex flex-col md:flex-row">
      {!hasCouple && <InviteFlow />}
      
      {hasCouple && (
        <MapProvider coupleId={coupleMember.couple_id}>
          <ShareLinkHandler />
          <div className="w-full h-full md:w-[65%] lg:w-[70%] relative z-0">
            <MapViewClient coupleId={coupleMember.couple_id} currentUserId={user.id} />
          </div>
          <div className="hidden md:block w-full md:w-[35%] lg:w-[30%] h-full bg-white shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] z-10 relative">
            <Sidebar coupleId={coupleMember.couple_id} currentUserId={user.id} />
          </div>
          <MobileBottomSheet coupleId={coupleMember.couple_id} currentUserId={user.id} />
          <PhotoDrawer />
          <InviteCodeWidget inviteCode={inviteCode} />
        </MapProvider>
      )}
    </main>
  )
}
