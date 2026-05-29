'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '@/store/useAuthStore'
import useDocumentStore from '@/store/useDocumentStore'
import useChatStore from '@/store/useChatStore'
import MembersPanel from '@/components/workspace/MembersPanel'
import { PAGE_ANIM, ITEM_ANIM, SCALE_IN } from '@/lib/animations'

const TYPE_CONFIG = {
  pdf:  { label: 'PDF', bg: '#FEF2F2', color: '#EF4444' },
  docx: { label: 'DOC', bg: '#EFF6FF', color: '#3B82F6' },
  md:   { label: 'MD',  bg: '#F5F3FF', color: '#8B5CF6' },
  txt:  { label: 'TXT', bg: '#F9FAFB', color: '#6B7280' },
}

const STATUS_DOT = {
  completed:  '#10B981',
  processing: '#F59E0B',
  failed:     '#EF4444',
  pending:    '#D1D5DB',
}

export default function Sidebar() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const documents = useDocumentStore((s) => s.documents)
  const clearMessages = useChatStore((s) => s.clearMessages)

  const [showMembers, setShowMembers] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!showMenu) return
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  function handleNewChat() {
    clearMessages()
    router.push('/dashboard')
  }

  const initial = user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <>
      <AnimatePresence>
        {showMembers && <MembersPanel onClose={() => setShowMembers(false)} />}
      </AnimatePresence>

      <aside className="w-60 shrink-0 bg-white border-r border-border flex flex-col h-full">

        {/* Top — workspace + new chat */}
        <div className="px-4 pt-5 pb-4 border-b border-border shrink-0">
          {/* Workspace pill */}
          <div className="inline-flex items-center gap-1.5 bg-brand-light border border-brand-border rounded-lg px-3 py-1.5 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
            <span className="text-[12px] font-semibold text-brand truncate max-w-[140px]">
              {user?.workspace_code ?? '—'}
            </span>
          </div>

          <motion.button
            onClick={handleNewChat}
            whileHover={{ backgroundColor: '#F8F9FC' }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="w-full h-9 flex items-center justify-center gap-2 bg-white border border-border rounded-xl text-[13px] font-medium text-fg-2 cursor-pointer"
            style={{ borderColor: '#E4E7EF' }}
          >
            <svg className="w-3.5 h-3.5 text-fg-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New chat
          </motion.button>
        </div>

        {/* Documents list */}
        <div className="flex-1 overflow-y-auto py-3">
          <p className="px-4 mb-2 text-[10.5px] font-semibold text-fg-4 uppercase tracking-widest">
            Documents
          </p>

          {documents.length === 0 && (
            <p className="px-4 py-2 text-[12px] text-fg-4">No documents yet.</p>
          )}

          <motion.div {...PAGE_ANIM}>
            {documents.map((doc) => {
              const typeCfg = TYPE_CONFIG[doc.file_type] ?? TYPE_CONFIG.txt
              const dotColor = STATUS_DOT[doc.status] ?? '#D1D5DB'
              return (
                <motion.div
                  key={doc.document_id}
                  {...ITEM_ANIM}
                  whileHover={{ x: 2, backgroundColor: '#F8F9FC' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="flex items-center gap-2.5 px-3 mx-1 py-2 rounded-lg cursor-default"
                >
                  <span
                    className="shrink-0 text-[9px] font-bold rounded-md px-1.5 py-0.5 leading-none"
                    style={{ backgroundColor: typeCfg.bg, color: typeCfg.color }}
                  >
                    {typeCfg.label}
                  </span>
                  <span className="flex-1 min-w-0 text-[12px] text-fg-2 truncate">
                    {doc.original_filename}
                  </span>
                  <span
                    className={`shrink-0 w-1.5 h-1.5 rounded-full ${doc.status === 'processing' ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: dotColor }}
                  />
                </motion.div>
              )
            })}
          </motion.div>

          <Link
            href="/upload"
            className="flex items-center gap-1.5 px-4 mt-3 text-[12px] text-brand hover:opacity-75 transition-opacity"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Upload a document
          </Link>
        </div>

        {/* Footer — user + dropdown */}
        <div ref={menuRef} className="border-t border-border shrink-0 relative">
          {/* Dropdown menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                {...SCALE_IN}
                className="absolute bottom-full left-2 right-2 mb-1.5 bg-white border border-border rounded-xl overflow-hidden"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
              >
                <button
                  onClick={() => { setShowMembers(true); setShowMenu(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-fg-2 hover:bg-surface transition-colors cursor-pointer text-left"
                >
                  <svg className="w-4 h-4 text-fg-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {user?.role === 'owner' ? 'Manage members' : 'View members'}
                </button>
                <div className="border-t border-border-2" />
                <button
                  onClick={() => { logout(); setShowMenu(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-danger hover:bg-red-50 transition-colors cursor-pointer text-left"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowMenu((v) => !v)}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface transition-colors cursor-pointer"
          >
            {/* Gradient avatar */}
            <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center shrink-0">
              <span className="text-[12px] font-bold text-white">{initial}</span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[12px] font-medium text-fg-2 truncate">{user?.email}</p>
              <p className="text-[10px] text-fg-4">{user?.role === 'owner' ? 'Owner' : 'Member'}</p>
            </div>
            <motion.svg
              className="w-3.5 h-3.5 text-fg-4 shrink-0"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              animate={{ rotate: showMenu ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </motion.svg>
          </button>
        </div>
      </aside>
    </>
  )
}
