'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function InviteFlow() {
  const [mode, setMode] = useState<'initial' | 'create' | 'join'>('initial')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [createdCode, setCreatedCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  async function handleCreateSpace() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.rpc('create_couple')
    
    if (error) {
      setError(error.message)
    } else if (data.error) {
      setError(data.error)
    } else {
      setCreatedCode(data.invite_code)
      setMode('create')
      router.refresh()
    }
    setLoading(false)
  }

  async function handleJoinSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode })
      })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to join')
      }
      
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function copyCode() {
    if (createdCode) {
      navigator.clipboard.writeText(createdCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-2xl font-serif text-slate-800 mb-2">Welcome to Our Map</h2>
          <p className="text-slate-500 text-sm">Set up your shared space to start mapping memories.</p>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'initial' && (
            <motion.div 
              key="initial"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-4 relative z-10"
            >
              <button
                onClick={handleCreateSpace}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-3 rounded-xl shadow-[0_4px_14px_0_rgba(168,85,247,0.39)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.23)] hover:bg-[rgba(168,85,247,0.9)] transform active:scale-95 transition-all"
              >
                {loading ? 'Creating...' : 'Create our space'}
              </button>
              
              <div className="flex items-center gap-2 my-2 opacity-50">
                <div className="h-px bg-slate-400 flex-1"></div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Or</span>
                <div className="h-px bg-slate-400 flex-1"></div>
              </div>

              <button
                onClick={() => setMode('join')}
                className="w-full bg-slate-100 text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-200 transform active:scale-95 transition-all"
              >
                Join with invite code
              </button>
              
              {error && <p className="text-red-500 text-sm text-center mt-2 font-medium">{error}</p>}
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-4 text-center relative z-10"
            >
              <p className="text-slate-600 mb-2">Your space is ready! Share this invitation code with your partner:</p>
              
              <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-200">
                <span className="font-mono text-2xl tracking-widest font-bold text-purple-700">{createdCode}</span>
                <button 
                  onClick={copyCode}
                  className="p-2 text-slate-500 hover:text-purple-600 transition-colors bg-white rounded-lg shadow-sm font-medium"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <button
                onClick={() => window.location.reload()}
                className="mt-4 w-full bg-slate-800 text-white font-medium py-3 rounded-xl hover:bg-slate-700 transition-all font-medium"
              >
                Go to map
              </button>
            </motion.div>
          )}

          {mode === 'join' && (
            <motion.div
              key="join"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-4 relative z-10"
            >
              <form onSubmit={handleJoinSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">
                    Partner's Invite Code
                  </label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.trim())}
                    placeholder="e.g. 1a2b3c4d"
                    required
                    maxLength={12}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all text-center font-mono text-xl tracking-widest uppercase shadow-inner"
                  />
                </div>
                
                {error && <p className="text-red-500 text-sm ml-1 font-medium text-center">{error}</p>}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setMode('initial'); setError(null); }}
                    className="bg-slate-100 text-slate-700 font-medium py-3 px-4 rounded-xl hover:bg-slate-200 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !inviteCode}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-3 rounded-xl shadow-[0_4px_14px_0_rgba(168,85,247,0.39)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.23)] hover:bg-[rgba(168,85,247,0.9)] transform active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Joining...' : 'Join Space'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
