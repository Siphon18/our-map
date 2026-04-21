import LoginForm from '@/components/Auth/LoginForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (data?.user) {
    redirect('/map')
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center bg-slate-50 overflow-hidden">
      {/* Soft romantic background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-purple-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[30rem] h-[30rem] bg-pink-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[30rem] h-[30rem] bg-rose-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      
      <div className="relative z-10 w-full px-4 flex justify-center">
        <LoginForm />
      </div>
    </main>
  )
}
