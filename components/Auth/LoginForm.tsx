'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm p-8 bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl border border-white/50"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif text-slate-800 mb-2">Our Map</h2>
        <p className="text-slate-500 text-sm">Your private space for shared memories.</p>
      </div>

      {sent ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-4 bg-purple-50 rounded-2xl border border-purple-100 shadow-inner"
        >
          <p className="text-purple-800 font-medium">Magic link sent!</p>
          <p className="text-purple-600 text-sm mt-1">Check your email <b>{email}</b> to sign in.</p>
        </motion.div>
      ) : (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1 ml-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all placeholder:text-slate-300 shadow-inner text-slate-700"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm ml-1 font-medium">{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium py-3 rounded-xl shadow-[0_4px_14px_0_rgba(168,85,247,0.39)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.23)] hover:bg-[rgba(168,85,247,0.9)] transform active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Sending link...' : 'Sign in to your map'}
          </button>
        </form>
      )}
    </motion.div>
  )
}
