'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Plus, Upload, ChevronUp, Users, LogOut,
  ChevronLeft, ChevronRight, FileText, MessageSquare, Trash2,
  DoorOpen, AlertTriangle, Puzzle, Home, GitBranch,
} from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import useDocumentStore from '@/store/useDocumentStore'
import useChatStore from '@/store/useChatStore'
import useChatsStore from '@/store/useChatsStore'
import useGitHubStore from '@/store/useGitHubStore'
import { leaveWorkspace } from '@/lib/api'
import { getNotionStatus } from '@/lib/integrationsApi'
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
  TXT:  { bg: '#F5F0E8', color: '#6B6B6B' },
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

  const githubRepos = useGitHubStore((s) => s.repos)
  const fetchGitHubRepos = useGitHubStore((s) => s.fetchRepos)
  const githubStatus = useGitHubStore((s) => s.status)
  const fetchGitHubStatus = useGitHubStore((s) => s.fetchStatus)

  const [collapsed, setCollapsed] = useState(false)
  const [notionConnected, setNotionConnected] = useState(false)
  const [reposExpanded, setReposExpanded] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [leaveLoading, setLeaveLoading] = useState(false)
  const [leaveError, setLeaveError] = useState('')
  const [hoveredChatId, setHoveredChatId] = useState(null)
  const [visibleCount, setVisibleCount] = useState(5)
  const [docsExpanded, setDocsExpanded] = useState(false)
  const [docsCount, setDocsCount] = useState(5)
  const menuRef = useRef(null)

  useEffect(() => {
    if (user) fetchChats()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) return
    getNotionStatus()
      .then((s) => setNotionConnected(s.connected))
      .catch(() => {})
    fetchGitHubStatus()
    fetchGitHubRepos()
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
      localStorage.removeItem('askbro_onboarded')
      logout()
      router.replace('/login')
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
      if (pathname === `/dashboard/${chatId}`) {
        clearMessages()
        router.push('/dashboard')
      }
    } catch {
      // silently ignore
    }
  }

  const initial = user?.email?.[0]?.toUpperCase() ?? '?'
  const CHAT_PAGE = 5
  const visibleChats = chats.slice(0, visibleCount)
  const hasMore = chats.length > visibleCount

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 72 : 300 }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        className="shrink-0 flex flex-col h-full relative"
        style={{ backgroundColor: '#F9F9F7', borderRight: '1px solid #E5E5E0' }}
      >

        {/* ── Logo + workspace header ─────────────────────────── */}
        <div
          className="shrink-0"
          style={{
            padding: collapsed ? '16px 12px' : '18px 16px 14px',
            borderBottom: '1px solid #E5E5E0',
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
              <div className="flex items-center gap-1">
                <Link
                  href="/"
                  className="w-7 h-7 flex items-center justify-center transition-all border"
                  style={{ color: '#CC0000', borderColor: '#CC0000', backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#CC0000'
                    e.currentTarget.style.color = '#F9F9F7'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#CC0000'
                  }}
                  title="Go to home page"
                >
                  <Home className="w-3.5 h-3.5" strokeWidth={2.5} />
                </Link>
                <button
                  onClick={() => setCollapsed(true)}
                  className="w-7 h-7 flex items-center justify-center transition-colors cursor-pointer"
                  style={{ color: '#AEABA6' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E5E5E0'
                    e.currentTarget.style.color = '#111111'
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
            </div>
          )}

          {/* Collapsed: expand + home buttons */}
          {collapsed && (
            <div className="flex flex-col items-center gap-1 mb-3">
              <button
                onClick={() => setCollapsed(false)}
                className="w-9 h-9 flex items-center justify-center transition-colors cursor-pointer"
                style={{ color: '#AEABA6' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E5E5E0'
                  e.currentTarget.style.color = '#111111'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#AEABA6'
                }}
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={2} />
              </button>
              <Link
                href="/"
                className="w-9 h-9 flex items-center justify-center transition-all border"
                style={{ color: '#CC0000', borderColor: '#CC0000', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#CC0000'
                  e.currentTarget.style.color = '#F9F9F7'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#CC0000'
                }}
                title="Go to home page"
              >
                <Home className="w-4 h-4" strokeWidth={2.5} />
              </Link>
            </div>
          )}

          {/* Workspace badge */}
          {!collapsed && (
            <div
              className="flex items-center gap-3 px-3 py-2.5 mb-3"
              style={{ backgroundColor: '#F0EDE6', border: '1px solid #E5E5E0' }}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 flex items-center justify-center shrink-0 text-[13px] font-bold text-white"
                style={{ backgroundColor: '#CC0000' }}
              >
                {(user?.workspace_name || user?.workspace_code || '?')[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="np-sans text-[13px] font-bold truncate leading-tight" style={{ color: '#111111' }}>
                  {user?.workspace_name || user?.workspace_code || '—'}
                </p>
                <p className="np-mono text-[11px] truncate mt-0.5" style={{ color: '#AEABA6' }}>
                  {user?.workspace_code ?? '—'}
                </p>
              </div>
            </div>
          )}

          {/* New chat button — btn-ink style */}
          <button
            onClick={handleNewChat}
            className="btn-ink flex items-center justify-center gap-2 cursor-pointer"
            style={{
              height: collapsed ? '40px' : '42px',
              width: collapsed ? '48px' : '100%',
              margin: collapsed ? '0 auto' : '0',
            }}
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

        {/* ── Scrollable body ───────────────────────────────────── */}
        <div className="flex-1 overflow-hidden overflow-x-hidden py-3 flex flex-col">

          {/* Recent chats label */}
          {collapsed ? (
            <div className="flex justify-center mb-3 mt-1">
              <MessageSquare className="w-4 h-4" style={{ color: '#AEABA6' }} strokeWidth={1.8} />
            </div>
          ) : (
            <div className="flex items-center justify-between px-4 mb-2 mt-1">
              <p className="np-mono text-[11px] font-bold uppercase tracking-widest" style={{ color: '#7A7874' }}>
                Recent chats
              </p>
            </div>
          )}

          {!collapsed && visibleChats.length === 0 && (
            <p className="np-body px-4 py-2 text-[12px]" style={{ color: '#AEABA6' }}>
              No chats yet.
            </p>
          )}

          {/* Chat rows */}
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
                    className="flex items-center gap-2.5 px-2.5 py-2.5 transition-colors"
                    style={{
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      backgroundColor: isActive ? '#F0EDE6' : 'transparent',
                      borderLeft: isActive ? '2px solid #CC0000' : '2px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#F5F2EB'
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    title={collapsed ? chat.title : undefined}
                  >
                    <MessageSquare
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: isActive ? '#CC0000' : '#AEABA6' }}
                      strokeWidth={1.8}
                    />
                    {!collapsed && (
                      <span
                        className="flex-1 min-w-0 np-sans text-[13px] truncate"
                        style={{
                          color: isActive ? '#111111' : '#4A4845',
                          fontWeight: isActive ? 600 : 400,
                          paddingRight: hoveredChatId === chat.id ? '20px' : '0',
                        }}
                      >
                        {chat.title}
                      </span>
                    )}
                  </Link>

                  {/* Delete button */}
                  {!collapsed && hoveredChatId === chat.id && (
                    <button
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center transition-colors cursor-pointer"
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
                className="np-mono flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer"
                style={{ color: '#CC0000' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#AA0000' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#CC0000' }}
              >
                <ChevronRight className="w-3 h-3 rotate-90" strokeWidth={2.5} />
                Show {Math.min(CHAT_PAGE, chats.length - visibleCount)} more
              </button>
            </div>
          )}

          {/* Divider */}
          {!collapsed && (
            <div style={{ margin: '8px 16px 0', borderTop: '1px solid #E5E5E0' }} />
          )}

          {/* ── Documents section ─────────────────────────────── */}
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
              <p className="np-mono text-[11px] font-bold uppercase tracking-widest" style={{ color: '#7A7874' }}>
                Documents
              </p>
              <div className="flex items-center gap-1.5">
                {documents.length > 0 && (
                  <span
                    className="np-mono text-[10px] font-bold px-1.5 py-0.5"
                    style={{ backgroundColor: '#111111', color: '#F9F9F7' }}
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

          {/* Document list */}
          <AnimatePresence initial={false}>
          {(docsExpanded || collapsed) && (
            <motion.div
              key="doc-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
          {!collapsed && documents.length === 0 && (
            <p className="np-body px-4 py-2 text-[12px]" style={{ color: '#AEABA6' }}>
              No documents yet.
            </p>
          )}

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
                  className="flex items-center gap-2.5 px-2.5 py-2.5 cursor-default transition-colors"
                  style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F2EB' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                  title={collapsed ? doc.original_filename : undefined}
                >
                  <span
                    className="shrink-0 np-mono text-[9px] font-bold px-1.5 py-0.5 leading-none"
                    style={{ backgroundColor: badge.bg, color: badge.color }}
                  >
                    {ext}
                  </span>

                  {!collapsed && (
                    <>
                      <span className="flex-1 min-w-0 np-sans text-[13px] font-medium truncate" style={{ color: '#111111' }}>
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
                className="np-mono flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer"
                style={{ color: '#CC0000' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#AA0000' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#CC0000' }}
              >
                <ChevronRight className="w-3 h-3 rotate-90" strokeWidth={2.5} />
                Show {Math.min(5, documents.length - docsCount)} more
              </button>
            </div>
          )}

          {/* ── GitHub Repos section ──────────────────────────── */}
          {githubStatus?.connected && githubRepos.length > 0 && (
            <>
              {!collapsed && (
                <div style={{ margin: '8px 16px 0', borderTop: '1px solid #E5E5E0' }} />
              )}
              {collapsed ? (
                <div className="flex justify-center mb-2 mt-3">
                  <GitBranch className="w-4 h-4" style={{ color: '#AEABA6' }} strokeWidth={1.8} />
                </div>
              ) : (
                <button
                  onClick={() => setReposExpanded((v) => !v)}
                  className="w-full flex items-center justify-between px-4 mb-1 mt-3 cursor-pointer"
                >
                  <p className="np-mono text-[11px] font-bold uppercase tracking-widest" style={{ color: '#7A7874' }}>
                    GitHub Repos
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="np-mono text-[10px] font-bold px-1.5 py-0.5" style={{ backgroundColor: '#111111', color: '#F9F9F7' }}>
                      {githubRepos.length}
                    </span>
                    <motion.div animate={{ rotate: reposExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronUp className="w-3.5 h-3.5" style={{ color: '#AEABA6' }} strokeWidth={2} />
                    </motion.div>
                  </div>
                </button>
              )}

              <AnimatePresence initial={false}>
                {(reposExpanded || collapsed) && (
                  <motion.div
                    key="repo-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="space-y-px px-2 overflow-y-auto" style={{ maxHeight: 160 }}>
                      {githubRepos.map((repo) => {
                        const isReady   = repo.status === 'ready'
                        const isFailed  = repo.status === 'failed'
                        const isActive  = ['ingesting', 'syncing', 'pending'].includes(repo.status)
                        const statusLabel = repo.status === 'ingesting' ? 'Indexing…'
                          : repo.status === 'syncing' ? 'Syncing…'
                          : repo.status === 'pending' ? 'Queued…'
                          : null
                        return (
                          <div
                            key={repo.repo_id}
                            className="px-2.5 pt-2.5 pb-2 cursor-default transition-colors"
                            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F2EB' }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                            title={collapsed ? repo.full_name : undefined}
                          >
                            {/* Row */}
                            <div className="flex items-center gap-2.5">
                              <GitBranch
                                className="w-3.5 h-3.5 shrink-0"
                                style={{ color: isReady ? '#CC0000' : '#AEABA6' }}
                                strokeWidth={1.8}
                              />
                              {!collapsed && (
                                <>
                                  <span className="flex-1 min-w-0 np-sans text-[12px] font-medium truncate" style={{ color: '#111111' }}>
                                    {repo.repo_name}
                                  </span>
                                  {isReady && (
                                    <span className="shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#16A34A' }} />
                                  )}
                                  {isFailed && (
                                    <span className="shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#DC2626' }} />
                                  )}
                                  {isActive && (
                                    <span className="shrink-0 np-mono text-[9px] font-bold uppercase tracking-widest truncate max-w-[90px]" style={{ color: '#D97706' }}>
                                      {repo.progress_step || statusLabel}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>

                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Upload button */}
          <div style={{ padding: collapsed ? '12px 8px 0' : '16px 8px 0' }}>
            <Link
              href="/upload"
              className="btn-outline-ink flex items-center gap-2.5 transition-all"
              style={{
                padding: collapsed ? '10px' : '10px 14px',
                justifyContent: 'center',
                width: '100%',
                borderStyle: 'dashed',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#CC0000'
                e.currentTarget.style.color = '#CC0000'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#111111'
                e.currentTarget.style.color = '#111111'
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

          {/* Repositories button (only when GitHub connected) */}
          {githubStatus?.connected && (
            <div style={{ padding: '6px 8px 0' }}>
              <Link
                href="/repositories"
                className="btn-outline-ink flex items-center gap-2.5 transition-all"
                style={{
                  padding: collapsed ? '10px' : '10px 14px',
                  justifyContent: 'center',
                  width: '100%',
                  borderStyle: 'dashed',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#CC0000'
                  e.currentTarget.style.color = '#CC0000'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#111111'
                  e.currentTarget.style.color = '#111111'
                }}
                title={collapsed ? 'Repositories' : undefined}
              >
                <GitBranch className="w-4 h-4 shrink-0" strokeWidth={2} />
                {!collapsed && (
                  <motion.span animate={{ opacity: collapsed ? 0 : 1 }} transition={LABEL_TRANSITION}>
                    Repositories
                  </motion.span>
                )}
              </Link>
            </div>
          )}

          {/* Integrations link */}
          {!collapsed && <div style={{ margin: '16px 16px 0', borderTop: '1px solid #E5E5E0' }} />}
          <div style={{ padding: '12px 8px 16px' }}>
            {pathname === '/integrations' ? (
              <Link
                href="/integrations"
                className="btn-ink flex items-center gap-2.5 relative"
                style={{
                  padding: collapsed ? '10px' : '10px 14px',
                  justifyContent: 'center',
                  width: '100%',
                }}
                title={collapsed ? 'Integrations' : undefined}
              >
                <div className="relative shrink-0">
                  <Puzzle className="w-4 h-4" strokeWidth={1.8} />
                  {notionConnected && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                      style={{ backgroundColor: '#16A34A', border: '1.5px solid #111111' }}
                    />
                  )}
                </div>
                {!collapsed && (
                  <motion.span animate={{ opacity: collapsed ? 0 : 1 }} transition={LABEL_TRANSITION}>
                    Integrations
                  </motion.span>
                )}
              </Link>
            ) : (
              <Link
                href="/integrations"
                className="btn-ink flex items-center gap-2.5 relative transition-all"
                style={{
                  padding: collapsed ? '10px' : '10px 14px',
                  justifyContent: 'center',
                  width: '100%',
                }}
                title={collapsed ? 'Integrations' : undefined}
              >
                <div className="relative shrink-0">
                  <Puzzle className="w-4 h-4" strokeWidth={1.8} />
                  {notionConnected && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                      style={{ backgroundColor: '#16A34A', border: '1.5px solid #111111' }}
                    />
                  )}
                </div>
                {!collapsed && (
                  <motion.span animate={{ opacity: collapsed ? 0 : 1 }} transition={LABEL_TRANSITION}>
                    Integrations
                  </motion.span>
                )}
              </Link>
            )}
          </div>
        </div>

        {/* ── Footer: user + dropdown ──────────────────────────── */}
        <div
          ref={menuRef}
          className="shrink-0 relative"
          style={{ borderTop: '1px solid #E5E5E0' }}
        >
          <AnimatePresence>
            {showMenu && (
              <motion.div
                {...SCALE_IN}
                className="absolute overflow-hidden z-30"
                style={{
                  background: '#F9F9F7',
                  border: '1px solid #111111',
                  boxShadow: '4px 4px 0px 0px #111111',
                  ...(collapsed
                    ? { left: '100%', marginLeft: '8px', bottom: '0', width: '190px' }
                    : { bottom: '100%', left: '8px', right: '8px', marginBottom: '6px' }
                  ),
                }}
              >
                <Link
                  href="/members"
                  onClick={() => setShowMenu(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 np-sans text-[13px] cursor-pointer transition-colors text-left"
                  style={{ color: '#111111' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F0EDE6' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                >
                  <Users className="w-4 h-4 shrink-0" style={{ color: '#AEABA6' }} strokeWidth={1.8} />
                  {user?.role === 'owner' ? 'Manage members' : 'View members'}
                </Link>

                <div style={{ borderTop: '1px solid #E5E5E0' }} />
                <button
                  onClick={() => { setShowLeaveModal(true); setShowMenu(false); setLeaveError('') }}
                  className="w-full flex items-center gap-3 px-4 py-3 np-sans text-[13px] cursor-pointer transition-colors text-left"
                  style={{ color: '#D97706' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFFBEB' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                >
                  <DoorOpen className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                  {user?.role === 'owner' ? 'Delete account' : 'Leave workspace'}
                </button>

                <div style={{ borderTop: '1px solid #E5E5E0' }} />
                <button
                  onClick={() => { setShowMenu(false); logout(); router.replace('/login') }}
                  className="w-full flex items-center gap-3 px-4 py-3 np-sans text-[13px] cursor-pointer transition-colors text-left"
                  style={{ color: '#CC0000' }}
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
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F0EDE6' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
            title={collapsed ? user?.email : undefined}
          >
            <div
              className="w-9 h-9 flex items-center justify-center shrink-0 np-mono text-[13px] font-bold"
              style={{ backgroundColor: '#F5F0E8', color: '#CC0000', border: '1px solid #E5E5E0' }}
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
                  <p className="np-sans text-[13px] font-semibold truncate" style={{ color: '#111111' }}>
                    {user?.email}
                  </p>
                  <p className="np-mono text-[11px]" style={{ color: '#7A7874' }}>
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

      {/* ── Leave / delete confirmation modal ───────────────── */}
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
              className="overflow-hidden w-full max-w-[440px]"
              style={{ background: '#F9F9F7', border: '1px solid #111111', boxShadow: '6px 6px 0px 0px #111111' }}
            >
              {/* Icon header */}
              <div className="flex justify-center pt-8 pb-5">
                <div
                  className="w-16 h-16 flex items-center justify-center"
                  style={{ backgroundColor: user?.role === 'owner' ? '#FEF2F2' : '#FFF7ED', border: '1px solid #E5E5E0' }}
                >
                  {user?.role === 'owner'
                    ? <AlertTriangle className="w-8 h-8" style={{ color: '#DC2626' }} strokeWidth={1.8} />
                    : <DoorOpen className="w-8 h-8" style={{ color: '#D97706' }} strokeWidth={1.8} />
                  }
                </div>
              </div>

              <div className="px-8 pb-6 text-center">
                <h3 className="np-serif text-[18px] font-black mb-2" style={{ color: '#111111' }}>
                  {user?.role === 'owner' ? 'Delete account & workspace?' : 'Leave this workspace?'}
                </h3>
                <p className="np-body text-[14px] leading-[1.65]" style={{ color: '#737373' }}>
                  {user?.role === 'owner'
                    ? 'This will permanently delete your workspace, all uploaded documents, chats, and every member\'s access. This cannot be undone.'
                    : 'You will immediately lose access to this workspace and all its documents. You can rejoin later if the owner invites you again.'
                  }
                </p>
                {leaveError && (
                  <div className="mt-4 px-4 py-3 text-left" style={{ borderLeft: '3px solid #CC0000' }}>
                    <p className="np-mono text-[12px] uppercase tracking-wide" style={{ color: '#CC0000' }}>{leaveError}</p>
                  </div>
                )}
              </div>

              <div className="px-8 pb-8 flex flex-col gap-3">
                <button
                  onClick={handleLeaveConfirm}
                  disabled={leaveLoading}
                  className="w-full h-12 text-white np-sans text-[13px] font-bold uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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
                  className="btn-outline-ink w-full h-11 cursor-pointer"
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
