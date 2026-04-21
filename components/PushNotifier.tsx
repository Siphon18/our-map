'use client'

import { useEffect, useState } from 'react'

export default function PushNotifier() {
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Only prompt if notifications are supported and not already granted/denied
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        // Show after a brief delay so it's not jarring
        const timer = setTimeout(() => setShowPrompt(true), 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [])

  const handleEnable = async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setShowPrompt(false)
        console.log('Notification permission granted.')
        
        // In a real implementation:
        // const registration = await navigator.serviceWorker.ready;
        // const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_KEY });
        // supabase.from('users').update({ push_subscription: subscription }).eq('id', user.id)
      } else {
        setShowPrompt(false)
      }
    } catch (error) {
      console.error('Error requesting push permission:', error)
      setShowPrompt(false)
    }
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-24 md:bottom-12 left-1/2 -translate-x-1/2 z-[9999] w-11/12 max-w-sm bg-slate-900 border border-slate-700 p-4 rounded-2xl shadow-2xl flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </div>
        <div className="flex flex-col pt-0.5">
          <span className="text-white font-semibold leading-tight">Enable Push Notifications?</span>
          <span className="text-slate-400 text-sm mt-1 leading-snug">Get notified the second your partner uploads a new memory to the map.</span>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-1">
        <button onClick={() => setShowPrompt(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">Later</button>
        <button onClick={handleEnable} className="px-4 py-2 rounded-lg text-sm font-medium bg-pink-600 hover:bg-pink-500 text-white transition-colors">Enable</button>
      </div>
    </div>
  )
}
