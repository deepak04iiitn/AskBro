'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Plus, Upload, ChevronUp, Users, LogOut,
  ChevronLeft, ChevronRight, FileText, MessageSquare, Trash2,
  DoorOpen, AlertTriangle,
} from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import useDocumentStore from '@/store/useDocumentStore'
import useChatStore from '@/store/useChatStore'
import useChatsStore from '@/store/useChatsStore'
import MembersPanel from '@/components/workspace/MembersPanel'
import { leaveWorkspace } from '@/lib/api'
import { SCALE_IN } from '@/lib/animations'

const STATUS_COLOR = {
  completed:  '#16A34A',
  processing: '#D97706',
  failed:     '#DC2626',
  pending:    '#CBD5E1',
}

const TYPE_BADGE = {
  PDF:  { bg: '#FEF2F2', color: '#DC2626' },
  DOC:  { bg: '#EFF6FF', color: '#2563EB' },
  DOCX: { bg: '#EFF6FF', color: '#2563EB' },
  MD:   { bg: '#F5F3FF', color: '#7C3AED' },
  TXT:  { bg: '#F8FAFC', color: '#64748B' },
}

const LABEL_TRANSITION = { duration: 0.12 }

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const documents = useDocumentStore((s) => s.documents)
  const clearMessages = useChatStore((s) => s.clearMessages)

  const chats = useChatsStore((s) => s.chats)
  const fetchChats = useChatsStore((s) => s.fetchChats)
  const deleteChat = useChatsStore((s) => s.deleteChat)

  const [collapsed, setCollapsed] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [leaveLoading, setLeaveLoading] = useState(false)
  const [leaveError, setLeaveError] = useState('')
  const [hoveredChatId, setHoveredChatId] = useState(null)
  const [visibleCount, setVisibleCount] = useState(5)
  const [docsExpanded, setDocsExpanded] = useState(false)
  const [docsCount, setDocsCount] = useState(5)
  const menuRef = useRef(null)

  // Load chat list on mount (once user is available)
  useEffect(() => {
    if (user) fetchChats()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!showMenu) return
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  async function handleLeaveConfirm() {
    setLeaveLoading(true)
    setLeaveError('')
    try {
      await leaveWorkspace()
      logout()
      localStorage.removeItem('askbro_onboarded')
    } catch (err) {
      setLeaveError(err.message)
      setLeaveLoading(false)
    }
  }

  function handleNewChat() {
    clearMessages()
    router.push('/dashboard')
  }

  async function handleDeleteChat(e, chatId) {
    e.preventDefault()
    e.stopPropagation()
    try {
      await deleteChat(chatId)
      // If we deleted the currently active chat, go back to /dashboard
      if (pathname === `/dashboard/${chatId}`) {
        clearMessages()
        router.push('/dashboard')
      }
    } catch {
      // silently ignore
    }
  }

  const initial = user?.email?.[0]?.toUpperCase() ?? '?'
  const completedCount = documents.filter((d) => d.status === 'completed').length
  const CHAT_PAGE = 5
  const visibleChats = chats.slice(0, visibleCount)
  const hasMore = chats.length > visibleCount

  return (
    <>
      <AnimatePresence>
        {showMembers && <MembersPanel onClose={() => setShowMembers(false)} />}
      </AnimatePresence>

      <motion.aside
        animate={{ width: collapsed ? 72 : 300 }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        className="shrink-0 flex flex-col h-full relative"
        style={{ backgroundColor: '#F7F5F2', borderRight: '1px solid #E3E1DC' }}
      >

        {/* ── Logo + workspace header ─────────────────────────── */}
        <div
          className="shrink-0"
          style={{
            padding: collapsed ? '16px 12px' : '18px 16px 14px',
            borderBottom: '1px solid #E3E1DC',
          }}
        >
          {/* Logo row */}
          {!collapsed && (
            <div className="flex items-center justify-between mb-4">
              <Link href="/dashboard">
                <img
                  src="/AskBro_Logo.png"
                  alt="AskBro"
                  className="h-11 w-auto mix-blend-multiply cursor-pointer"
                />
              </Link>
              <button
                onClick={() => setCollapsed(true)}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                style={{ color: '#AEABA6' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E3E1DC'
                  e.currentTarget.style.color = '#3D3C3A'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#AEABA6'
                }}
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          )}

          {/* Collapsed: expand button */}
          {collapsed && (
            <div className="flex justify-center mb-3">
              <button
                onClick={() => setCollapsed(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                style={{ color: '#AEABA6' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E3E1DC'
                  e.currentTarget.style.color = '#3D3C3A'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#AEABA6'
                }}
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          )}

          {/* Workspace badge */}
          {!collapsed && (
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-3"
              style={{ backgroundColor: '#EEECEA', border: '1px solid #E3E1DC' }}
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#4361EE' }} />
              <div className="min-w-0">
                <p className="text-[13px] font-bold truncate" style={{ color: '#111110' }}>
                  {user?.workspace_code ?? '—'}
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: '#AEABA6' }}>
                  Workspace
                </p>
              </div>
            </div>
          )}

          {/* New chat button */}
          <button
            onClick={handleNewChat}
            className="flex items-center justify-center gap-2 text-white rounded-xl cursor-pointer transition-colors font-semibold"
            style={{
              backgroundColor: '#4361EE',
              height: collapsed ? '40px' : '42px',
              width: collapsed ? '48px' : '100%',
              margin: collapsed ? '0 auto' : '0',
              fontSize: '13px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#3451D6' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#4361EE' }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)' }}
            onMouseUp={(e) => { e.currentTarget.style.transform = '' }}
            title={collapsed ? 'New chat' : undefined}
          >
            <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
            {!collapsed && (
              <motion.span animate={{ opacity: collapsed ? 0 : 1 }} transition={LABEL_TRANSITION}>
                New chat
              </motion.span>
            )}
          </button>
        </div>

        {/* ── Scrollable body: chats + documents ───────────────── */}
        <div className="flex-1 overflow-hidden py-3 flex flex-col">

          {/* ── Recent chats section ─────────────────────────────── */}
          {collapsed ? (
            <div className="flex justify-center mb-3 mt-1">
              <MessageSquare className="w-4 h-4" style={{ color: '#AEABA6' }} strokeWidth={1.8} />
            </div>
          ) : (
            <div className="flex items-center justify-between px-4 mb-2 mt-1">
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#7A7874' }}>
                Recent chats
              </p>
            </div>
          )}

          {!collapsed && visibleChats.length === 0 && (
            <p className="px-4 py-2 text-[12px]" style={{ color: '#AEABA6' }}>
              No chats yet.
            </p>
          )}

          {/* Chat rows — scrollable, max 4 rows visible (~176px) */}
          <div
            className="space-y-0.5 px-2 overflow-y-auto"
            style={{ maxHeight: '176px' }}
          >
            {visibleChats.map((chat) => {
              const isActive = pathname === `/dashboard/${chat.id}`
              return (
                <div
                  key={chat.id}
                  className="relative group"
                  onMouseEnter={() => setHoveredChatId(chat.id)}
                  onMouseLeave={() => setHoveredChatId(null)}
                >
                  <Link
                    href={`/dashboard/${chat.id}`}
                    className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-colors"
                    style={{
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      backgroundColor: isActive ? '#E3E1DC' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#EEECEA'
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    title={collapsed ? chat.title : undefined}
                  >
                    <MessageSquare
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: isActive ? '#4361EE' : '#AEABA6' }}
                      strokeWidth={1.8}
                    />
                    {!collapsed && (
                      <span
                        className="flex-1 min-w-0 text-[13px] truncate"
                        style={{
                          color: isActive ? '#111110' : '#4A4845',
                          fontWeight: isActive ? 600 : 400,
                          paddingRight: hoveredChatId === chat.id ? '20px' : '0',
                        }}
                      >
                        {chat.title}
                      </span>
                    )}
                  </Link>

                  {/* Delete button — shown on hover, expanded only */}
                  {!collapsed && hoveredChatId === chat.id && (
                    <button
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                      style={{ color: '#AEABA6' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FEE2E2'
                        e.currentTarget.style.color = '#DC2626'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = ''
                        e.currentTarget.style.color = '#AEABA6'
                      }}
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Show more chats */}
          {!collapsed && hasMore && (
            <div className="flex justify-center mt-1 px-2">
              <button
                onClick={() => setVisibleCount((n) => n + CHAT_PAGE)}
                className="flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer"
                style={{ color: '#4361EE' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#3451D6' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#4361EE' }}
              >
                <ChevronRight className="w-3 h-3 rotate-90" strokeWidth={2.5} />
                Show {Math.min(CHAT_PAGE, chats.length - visibleCount)} more
              </button>
            </div>
          )}

          {/* Divider between chats and documents */}
          {!collapsed && (
            <div style={{ margin: '8px 16px 0', borderTop: '1px solid #E3E1DC' }} />
          )}

          {/* ── Documents section ────────────────────────────────── */}
          {collapsed ? (
            <button
              onClick={() => setDocsExpanded((v) => !v)}
              className="flex justify-center mb-3 mt-3 w-full cursor-pointer"
              title="Toggle documents"
            >
              <FileText className="w-4 h-4" style={{ color: '#AEABA6' }} strokeWidth={1.8} />
            </button>
          ) : (
            <button
              onClick={() => setDocsExpanded((v) => !v)}
              className="w-full flex items-center justify-between px-4 mb-1 mt-3 cursor-pointer group"
            >
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#7A7874' }}>
                Documents
              </p>
              <div className="flex items-center gap-1.5">
                {documents.length > 0 && (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: '#EEF1FD', color: '#4361EE' }}
                  >
                    {documents.length}
                  </span>
                )}
                <motion.div
                  animate={{ rotate: docsExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronUp className="w-3.5 h-3.5" style={{ color: '#AEABA6' }} strokeWidth={2} />
                </motion.div>
              </div>
            </button>
          )}

          {/* Collapsible document list */}
          <AnimatePresence initial={false}>
          {(docsExpanded || collapsed) && (
            <motion.div
              key="doc-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
          {/* Empty state */}
          {!collapsed && documents.length === 0 && (
            <p className="px-4 py-2 text-[12px]" style={{ color: '#AEABA6' }}>
              No documents yet.
            </p>
          )}

          {/* Document rows — scrollable, show max docsCount */}
          <div
            className="space-y-0.5 px-2 overflow-y-auto"
            style={{ maxHeight: '176px' }}
          >
            {documents.slice(0, docsCount).map((doc) => {
              const ext = (doc.file_type?.toUpperCase()) ?? 'FILE'
              const badge = TYPE_BADGE[ext] ?? TYPE_BADGE.TXT
              const dotColor = STATUS_COLOR[doc.status] ?? '#CBD5E1'
              return (
                <div
                  key={doc.document_id}
                  className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl cursor-default transition-colors"
                  style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EEECEA' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                  title={collapsed ? doc.original_filename : undefined}
                >
                  {/* Type badge */}
                  <span
                    className="shrink-0 text-[9px] font-bold rounded-md px-1.5 py-0.5 leading-none"
                    style={{ backgroundColor: badge.bg, color: badge.color }}
                  >
                    {ext}
                  </span>

                  {!collapsed && (
                    <>
                      <span className="flex-1 min-w-0 text-[13px] font-medium truncate" style={{ color: '#111110' }}>
                        {doc.original_filename}
                      </span>
                      <span
                        className={`shrink-0 w-2 h-2 rounded-full ${doc.status === 'processing' ? 'animate-pulse' : ''}`}
                        style={{ backgroundColor: dotColor }}
                      />
                    </>
                  )}
                </div>
              )
            })}
          </div>

            </motion.div>
          )}
          </AnimatePresence>

          {/* Show more docs */}
          {!collapsed && docsExpanded && documents.length > docsCount && (
            <div className="flex justify-center mt-1 px-2">
              <button
                onClick={() => setDocsCount((n) => n + 5)}
                className="flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer"
                style={{ color: '#4361EE' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#3451D6' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#4361EE' }}
              >
                <ChevronRight className="w-3 h-3 rotate-90" strokeWidth={2.5} />
                Show {Math.min(5, documents.length - docsCount)} more
              </button>
            </div>
          )}

          {/* Upload button */}
          <div style={{ padding: collapsed ? '12px 8px 0' : '12px 8px 0' }}>
            <Link
              href="/upload"
              className="flex items-center gap-2.5 rounded-xl transition-all"
              style={{
                color: '#4A4845',
                padding: collapsed ? '10px' : '10px 14px',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 500,
                border: '1.5px dashed #D9D7D2',
                backgroundColor: 'white',
                width: '100%',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4361EE'
                e.currentTarget.style.backgroundColor = '#EEF1FD'
                e.currentTarget.style.color = '#4361EE'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#D9D7D2'
                e.currentTarget.style.backgroundColor = 'white'
                e.currentTarget.style.color = '#4A4845'
              }}
              title={collapsed ? 'Upload document' : undefined}
            >
              <Upload className="w-4 h-4 shrink-0" strokeWidth={2} />
              {!collapsed && (
                <motion.span animate={{ opacity: collapsed ? 0 : 1 }} transition={LABEL_TRANSITION}>
                  Upload a document
                </motion.span>
              )}
            </Link>
          </div>
        </div>

        {/* ── Footer: user + dropdown ──────────────────────────── */}
        <div
          ref={menuRef}
          className="shrink-0 relative"
          style={{ borderTop: '1px solid #E3E1DC' }}
        >
          <AnimatePresence>
            {showMenu && (
              <motion.div
                {...SCALE_IN}
                className="absolute bg-white rounded-xl overflow-hidden z-30"
                style={{
                  border: '1px solid #E3E1DC',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                  ...(collapsed
                    ? { left: '100%', marginLeft: '8px', bottom: '0', width: '190px' }
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

                {/* Leave / Delete account */}
                <div style={{ borderTop: '1px solid #E3E1DC' }} />
                <button
                  onClick={() => { setShowLeaveModal(true); setShowMenu(false); setLeaveError('') }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[13px] cursor-pointer transition-colors text-left"
                  style={{ color: '#D97706' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFFBEB' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                >
                  <DoorOpen className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                  {user?.role === 'owner' ? 'Delete account' : 'Leave workspace'}
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
              padding: collapsed ? '12px' : '12px 16px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: collapsed ? 0 : '12px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EEECEA' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
            title={collapsed ? user?.email : undefined}
          >
            {/* Avatar with accent bg */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[13px] font-bold"
              style={{ backgroundColor: '#EEF1FD', color: '#4361EE' }}
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
                  <p className="text-[13px] font-semibold truncate" style={{ color: '#111110' }}>
                    {user?.email}
                  </p>
                  <p className="text-[11px]" style={{ color: '#7A7874' }}>
                    {user?.role === 'owner' ? 'Owner' : 'Member'}
                  </p>
                </motion.div>
                <motion.div animate={{ rotate: showMenu ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronUp className="w-4 h-4 shrink-0" style={{ color: '#AEABA6' }} strokeWidth={2} />
                </motion.div>
              </>
            )}
          </button>
        </div>
      </motion.aside>

      {/* ── Centered leave / delete confirmation modal ───────── */}
      <AnimatePresence>
        {showLeaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backgroundColor: 'rgba(10,10,12,0.65)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => { if (e.target === e.currentTarget && !leaveLoading) { setShowLeaveModal(false); setLeaveError('') } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl overflow-hidden w-full max-w-[440px]"
              style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.06)' }}
            >
              {/* Icon header */}
              <div className="flex justify-center pt-8 pb-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: user?.role === 'owner' ? '#FEF2F2' : '#FFF7ED' }}
                >
                  {user?.role === 'owner'
                    ? <AlertTriangle className="w-8 h-8" style={{ color: '#DC2626' }} strokeWidth={1.8} />
                    : <DoorOpen className="w-8 h-8" style={{ color: '#D97706' }} strokeWidth={1.8} />
                  }
                </div>
              </div>

              {/* Text */}
              <div className="px-8 pb-6 text-center">
                <h3 className="text-[18px] font-bold tracking-[-0.01em] mb-2" style={{ color: '#111110' }}>
                  {user?.role === 'owner' ? 'Delete account & workspace?' : 'Leave this workspace?'}
                </h3>
                <p className="text-[14px] leading-[1.65]" style={{ color: '#7A7874' }}>
                  {user?.role === 'owner'
                    ? 'This will permanently delete your workspace, all uploaded documents, chats, and every member\'s access. This cannot be undone.'
                    : 'You will immediately lose access to this workspace and all its documents. You can rejoin later if the owner invites you again.'
                  }
                </p>
                {leaveError && (
                  <div className="mt-4 rounded-xl px-4 py-3 text-left" style={{ backgroundColor: '#FEF2F2', borderLeft: '3px solid #DC2626' }}>
                    <p className="text-[13px]" style={{ color: '#DC2626' }}>{leaveError}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-8 pb-8 flex flex-col gap-3">
                <button
                  onClick={handleLeaveConfirm}
                  disabled={leaveLoading}
                  className="w-full h-12 text-white text-[14px] font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  style={{ backgroundColor: user?.role === 'owner' ? '#DC2626' : '#D97706' }}
                  onMouseEnter={(e) => { if (!leaveLoading) e.currentTarget.style.backgroundColor = user?.role === 'owner' ? '#B91C1C' : '#B45309' }}
                  onMouseLeave={(e) => { if (!leaveLoading) e.currentTarget.style.backgroundColor = user?.role === 'owner' ? '#DC2626' : '#D97706' }}
                >
                  {leaveLoading ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</>
                  ) : user?.role === 'owner' ? 'Yes, delete everything' : 'Yes, leave workspace'}
                </button>
                <button
                  onClick={() => { setShowLeaveModal(false); setLeaveError('') }}
                  disabled={leaveLoading}
                  className="w-full h-11 text-[14px] font-medium rounded-xl cursor-pointer transition-colors"
                  style={{ border: '1.5px solid #E3E1DC', color: '#4A4845', backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F7F5F2' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  Cancel, keep my account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
