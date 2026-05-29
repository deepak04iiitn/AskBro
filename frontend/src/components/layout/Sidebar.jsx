'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Plus, Upload, ChevronUp, Users, LogOut,
  ChevronLeft, ChevronRight, FileText,
} from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import useDocumentStore from '@/store/useDocumentStore'
import useChatStore from '@/store/useChatStore'
import MembersPanel from '@/components/workspace/MembersPanel'
import { SCALE_IN } from '@/lib/animations'

const STATUS_COLOR = {
  completed:  '#16A34A',
  processing: '#D97706',
  failed:     '#DC2626',
  pending:    '#D1D5DB',
}

// Fades text labels out fast so they're invisible before the sidebar noticeably narrows
const LABEL_TRANSITION = { duration: 0.12 }

export default function Sidebar() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const documents = useDocumentStore((s) => s.documents)
  const clearMessages = useChatStore((s) => s.clearMessages)

  const [collapsed, setCollapsed] = useState(false)
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
  const completedCount = documents.filter((d) => d.status === 'completed').length

  return (
    <>
      <AnimatePresence>
        {showMembers && <MembersPanel onClose={() => setShowMembers(false)} />}
      </AnimatePresence>

      <motion.aside
        animate={{ width: collapsed ? 68 : 280 }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        className="shrink-0 flex flex-col h-full relative"
        style={{ backgroundColor: '#F7F5F2', borderRight: '1px solid #E3E1DC' }}
      >

        {/* ── Header: workspace identity + collapse toggle ────── */}
        <div
          className="shrink-0 flex flex-col"
          style={{
            padding: collapsed ? '20px 12px 16px' : '20px 16px 16px',
            borderBottom: '1px solid #E3E1DC',
          }}
        >
          {/* Top row: workspace info + toggle */}
          <div className={`flex items-center mb-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {!collapsed && (
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: '#4361EE' }}
                />
                <div className="min-w-0">
                  <motion.p
                    animate={{ opacity: collapsed ? 0 : 1 }}
                    transition={LABEL_TRANSITION}
                    className="text-[13px] font-semibold truncate"
                    style={{ color: '#111110' }}
                  >
                    {user?.workspace_code ?? '—'}
                  </motion.p>
                  <motion.p
                    animate={{ opacity: collapsed ? 0 : 1 }}
                    transition={LABEL_TRANSITION}
                    className="text-[10px]"
                    style={{ color: '#AEABA6' }}
                  >
                    workspace
                  </motion.p>
                </div>
              </div>
            )}

            {/* Collapse / expand toggle */}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0"
              style={{ color: '#AEABA6' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E3E1DC'
                e.currentTarget.style.color = '#3D3C3A'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#AEABA6'
              }}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed
                ? <ChevronRight className="w-4 h-4" strokeWidth={2} />
                : <ChevronLeft className="w-4 h-4" strokeWidth={2} />
              }
            </button>
          </div>

          {/* New chat button */}
          <button
            onClick={handleNewChat}
            className="flex items-center justify-center gap-2 text-white rounded-lg cursor-pointer transition-colors"
            style={{
              backgroundColor: '#4361EE',
              height: '36px',
              width: collapsed ? '44px' : '100%',
              margin: collapsed ? '0 auto' : '0',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#3451D6' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#4361EE' }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)' }}
            onMouseUp={(e) => { e.currentTarget.style.transform = '' }}
            title={collapsed ? 'New chat' : undefined}
          >
            <Plus className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
            {!collapsed && (
              <motion.span
                animate={{ opacity: collapsed ? 0 : 1 }}
                transition={LABEL_TRANSITION}
                className="text-[13px] font-medium whitespace-nowrap"
              >
                New chat
              </motion.span>
            )}
          </button>
        </div>

        {/* ── Documents section ────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto py-4">

          {/* Section label */}
          {collapsed ? (
            <div className="flex justify-center mb-3">
              <FileText
                className="w-4 h-4"
                style={{ color: '#AEABA6' }}
                strokeWidth={1.8}
              />
            </div>
          ) : (
            <motion.div
              animate={{ opacity: collapsed ? 0 : 1 }}
              transition={LABEL_TRANSITION}
              className="flex items-center justify-between px-4 mb-2"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#AEABA6' }}>
                Documents
              </p>
              {completedCount > 0 && (
                <span className="text-[10px]" style={{ color: '#AEABA6' }}>
                  {completedCount} indexed
                </span>
              )}
            </motion.div>
          )}

          {/* Empty label */}
          {!collapsed && documents.length === 0 && (
            <motion.p
              animate={{ opacity: collapsed ? 0 : 1 }}
              transition={LABEL_TRANSITION}
              className="px-4 py-1 text-[12px]"
              style={{ color: '#AEABA6' }}
            >
              No documents yet.
            </motion.p>
          )}

          {/* Document rows */}
          <div>
            {documents.map((doc) => {
              const ext = doc.file_type?.toUpperCase() ?? 'FILE'
              const dotColor = STATUS_COLOR[doc.status] ?? '#D1D5DB'
              return (
                <div
                  key={doc.document_id}
                  className="flex items-center rounded-lg cursor-default transition-colors"
                  style={{
                    gap: collapsed ? 0 : '10px',
                    padding: collapsed ? '8px' : '8px 12px',
                    margin: '0 4px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EEECEA' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                  title={collapsed ? doc.original_filename : undefined}
                >
                  <span
                    className="shrink-0 text-[9px] font-bold uppercase"
                    style={{ color: '#AEABA6', minWidth: collapsed ? 'auto' : '28px' }}
                  >
                    {ext}
                  </span>
                  {!collapsed && (
                    <>
                      <motion.span
                        animate={{ opacity: collapsed ? 0 : 1 }}
                        transition={LABEL_TRANSITION}
                        className="flex-1 min-w-0 text-[12px] truncate"
                        style={{ color: '#3D3C3A' }}
                      >
                        {doc.original_filename}
                      </motion.span>
                      <span
                        className={`shrink-0 w-1.5 h-1.5 rounded-full ${doc.status === 'processing' ? 'animate-pulse' : ''}`}
                        style={{ backgroundColor: dotColor }}
                      />
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {/* Upload button */}
          <Link
            href="/upload"
            className="flex items-center gap-2 transition-all mt-4 rounded-lg"
            style={{
              color: '#3D3C3A',
              padding: collapsed ? '9px' : '9px 12px',
              margin: collapsed ? '16px auto 0' : '16px 4px 0',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 500,
              border: '1.5px dashed #D9D7D2',
              backgroundColor: 'white',
              width: collapsed ? '44px' : 'calc(100% - 8px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#4361EE'
              e.currentTarget.style.backgroundColor = '#EEF1FD'
              e.currentTarget.style.color = '#4361EE'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#D9D7D2'
              e.currentTarget.style.backgroundColor = 'white'
              e.currentTarget.style.color = '#3D3C3A'
            }}
            title={collapsed ? 'Upload document' : undefined}
          >
            <Upload className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            {!collapsed && (
              <motion.span
                animate={{ opacity: collapsed ? 0 : 1 }}
                transition={LABEL_TRANSITION}
              >
                Upload a document
              </motion.span>
            )}
          </Link>
        </div>

        {/* ── Footer: user + dropdown ──────────────────────────── */}
        <div
          ref={menuRef}
          className="shrink-0 relative"
          style={{ borderTop: '1px solid #E3E1DC' }}
        >
          {/* Dropdown — pops up when expanded, pops right when collapsed */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                {...SCALE_IN}
                className="absolute bg-white rounded-xl overflow-hidden z-30"
                style={{
                  border: '1px solid #E3E1DC',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                  ...(collapsed
                    ? { left: '100%', marginLeft: '8px', bottom: '0', width: '180px' }
                    : { bottom: '100%', left: '8px', right: '8px', marginBottom: '6px' }
                  ),
                }}
              >
                <button
                  onClick={() => { setShowMembers(true); setShowMenu(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[13px] cursor-pointer transition-colors text-left"
                  style={{ color: '#3D3C3A' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F7F5F2' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                >
                  <Users className="w-4 h-4 shrink-0" style={{ color: '#AEABA6' }} strokeWidth={1.8} />
                  {user?.role === 'owner' ? 'Manage members' : 'View members'}
                </button>
                <div style={{ borderTop: '1px solid #E3E1DC' }} />
                <button
                  onClick={() => { logout(); setShowMenu(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[13px] cursor-pointer transition-colors text-left"
                  style={{ color: '#DC2626' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEF2F2' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                >
                  <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User row */}
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="w-full flex items-center cursor-pointer transition-colors"
            style={{
              padding: collapsed ? '14px 12px' : '14px 16px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: collapsed ? 0 : '12px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EEECEA' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
            title={collapsed ? user?.email : undefined}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold"
              style={{ backgroundColor: '#E3E1DC', color: '#3D3C3A' }}
            >
              {initial}
            </div>

            {!collapsed && (
              <>
                <motion.div
                  animate={{ opacity: collapsed ? 0 : 1 }}
                  transition={LABEL_TRANSITION}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="text-[12px] font-medium truncate" style={{ color: '#3D3C3A' }}>
                    {user?.email}
                  </p>
                  <p className="text-[10px]" style={{ color: '#AEABA6' }}>
                    {user?.role === 'owner' ? 'Owner' : 'Member'}
                  </p>
                </motion.div>
                <motion.div
                  animate={{ rotate: showMenu ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronUp className="w-3.5 h-3.5 shrink-0" style={{ color: '#AEABA6' }} strokeWidth={2} />
                </motion.div>
              </>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  )
}
