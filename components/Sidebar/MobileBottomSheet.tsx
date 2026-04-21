'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'

export default function MobileBottomSheet({ coupleId, currentUserId }: { coupleId: string, currentUserId: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-slate-800 px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 z-30"
      >
        <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        Our Memories
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] md:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 h-[85vh] bg-white z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col md:hidden"
            >
              <div className="w-full flex justify-center py-4 bg-white rounded-t-3xl" onClick={() => setIsOpen(false)}>
                <div className="w-12 h-1.5 bg-slate-200 rounded-full cursor-pointer hover:bg-slate-300 transition-colors"></div>
              </div>
              <div className="flex-1 overflow-hidden pb-6">
                <Sidebar coupleId={coupleId} currentUserId={currentUserId} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
