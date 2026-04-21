'use client'

import { useState } from 'react'

export default function InviteCodeWidget({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!inviteCode) return null

  return (
    <div className="absolute top-24 left-6 z-[1000] bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col gap-2 animate-in fade-in slide-in-from-left-4">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Join Space Secret Code</div>
      <div className="flex items-center gap-3">
        <code className="text-xl font-mono tracking-widest text-pink-400 font-semibold bg-pink-500/10 px-3 py-1 rounded-lg">
          {inviteCode}
        </code>
        <button 
          onClick={handleCopy}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          )}
        </button>
      </div>
    </div>
  )
}
