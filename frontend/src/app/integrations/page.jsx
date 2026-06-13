'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Check, CheckCircle2, Link2Off,
  Loader2, ExternalLink, GitBranch, Puzzle,
} from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import useDocumentStore from '@/store/useDocumentStore'
import Sidebar from '@/components/layout/Sidebar'
import { connectNotion, disconnectNotion, getNotionStatus } from '@/lib/integrationsApi'

function NotionLogo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933z" />
    </svg>
  )
}

function StepRow({ num, title, right, last = false }) {
  return (
    <div
      className="flex items-center gap-4 px-6 h-12"
      style={last ? {} : { borderBottom: '1px solid #E5E5E0' }}
    >
      <div
        className="w-6 h-6 shrink-0 flex items-center justify-center np-mono text-[11px] font-bold"
        style={{ backgroundColor: '#111111', color: '#F9F9F7', lineHeight: 1 }}
      >
        {num}
      </div>
      <p className="flex-1 np-body text-[13px]" style={{ color: '#111111' }}>{title}</p>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  )
}

function NotionDetail({ status, onStatusChange }) {
  const user = useAuthStore((s) => s.user)
  const isOwner = user?.role === 'owner'

  const [token, setToken]           = useState('')
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError]           = useState('')

  async function handleConnect(e) {
    e.preventDefault()
    if (!token.trim()) return
    setError('')
    setConnecting(true)
    try {
      const res = await connectNotion(token.trim())
      setToken('')
      onStatusChange({ connected: true, workspace_name: res.workspace_name })
    } catch (err) {
      setError(err.message)
    } finally {
      setConnecting(false)
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true)
    try {
      await disconnectNotion()
      onStatusChange({ connected: false })
    } catch (err) {
      setError(err.message)
    } finally {
      setDisconnecting(false)
    }
  }

  if (status?.connected) {
    return (
      <div className="space-y-4 mt-6">

        {/* Connected status card */}
        <div style={{ border: '1px solid #111111', boxShadow: '4px 4px 0px 0px #16A34A' }}>
          <div className="px-6 py-5" style={{ backgroundColor: '#F0FDF4', borderBottom: '1px solid #E5E5E0' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center shrink-0" style={{ backgroundColor: '#DCFCE7', border: '1px solid #BBF7D0' }}>
                <CheckCircle2 className="w-6 h-6" style={{ color: '#16A34A' }} strokeWidth={2} />
              </div>
              <div>
                <p className="np-serif text-[16px] font-black" style={{ color: '#15803D' }}>Notion connected</p>
                {status.workspace_name && (
                  <p className="np-mono text-[11px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#4B9660' }}>{status.workspace_name}</p>
                )}
              </div>
              <span className="ml-auto flex items-center gap-1.5 np-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1.5" style={{ backgroundColor: '#DCFCE7', color: '#16A34A', border: '1px solid #BBF7D0' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#16A34A' }} />
                Live
              </span>
            </div>
          </div>
          <div className="px-6 py-5" style={{ backgroundColor: '#F9F9F7' }}>
            <p className="np-body text-[13px] leading-[1.6] mb-4" style={{ color: '#737373' }}>
              Your workspace is connected. Share any Notion page with your AskBro connection, then import it from the upload page.
            </p>
            <Link
              href="/upload"
              className="btn-ink inline-flex items-center gap-2 px-5 h-11"
            >
              <NotionLogo size={16} />
              Go to Upload a document
              <ArrowLeft className="w-4 h-4 rotate-180" strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        {/* How to import guide */}
        <div style={{ border: '1px solid #E5E5E0', backgroundColor: '#F9F9F7' }}>
          <div className="px-6 py-3.5" style={{ backgroundColor: '#F0EDE6', borderBottom: '1px solid #E5E5E0' }}>
            <p className="np-mono text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#CC0000' }}>★ How to import a page</p>
          </div>
          <StepRow num={1} title="Open the Notion page you want to import" />
          <StepRow num={2} title={<>Click <strong>...</strong> (three dots) in the top-right corner of the page</>} />
          <StepRow num={3} title={<>Click <strong>"Add connections"</strong> and select your <strong>AskBro</strong> integration</>} />
          <StepRow num={4} title="Copy the Notion page URL from your browser" />
          <StepRow num={5} last
            title={<>Go to <Link href="/upload" className="font-semibold underline underline-offset-2 transition-colors hover:text-[#AA0000]" style={{ color: '#CC0000' }}>Upload a document</Link> — open the <strong>Notion</strong> tab and paste the URL</>}
          />
        </div>

        {/* Disconnect (owner only) */}
        {isOwner && (
          <div>
            {error && (
              <div className="px-4 py-3 mb-3" style={{ borderLeft: '3px solid #CC0000' }}>
                <p className="np-mono text-[12px] uppercase tracking-wide" style={{ color: '#CC0000' }}>{error}</p>
              </div>
            )}
            <button
              onClick={() => setShowConfirm(true)}
              disabled={disconnecting}
              className="flex items-center gap-2 np-mono text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-colors px-4 py-2.5 disabled:opacity-50"
              style={{ color: '#DC2626', border: '1px solid #FECACA', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEF2F2' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              {disconnecting ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> : <Link2Off className="w-4 h-4" strokeWidth={2} />}
              {disconnecting ? 'Disconnecting...' : 'Disconnect Notion'}
            </button>

            <AnimatePresence>
              {showConfirm && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="fixed inset-0 z-50 flex items-center justify-center px-4"
                  style={{ backgroundColor: 'rgba(10,10,12,0.60)', backdropFilter: 'blur(6px)' }}
                  onClick={(e) => { if (e.target === e.currentTarget) setShowConfirm(false) }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden w-full max-w-[420px]"
                    style={{ background: '#F9F9F7', border: '1px solid #111111', boxShadow: '6px 6px 0px 0px #111111' }}
                  >
                    <div className="flex justify-center pt-8 pb-4">
                      <div className="w-16 h-16 flex items-center justify-center" style={{ backgroundColor: '#FEF2F2', border: '1px solid #E5E5E0' }}>
                        <Link2Off className="w-8 h-8" style={{ color: '#DC2626' }} strokeWidth={1.8} />
                      </div>
                    </div>
                    <div className="px-8 pb-6 text-center">
                      <h3 className="np-serif text-[18px] font-black mb-2" style={{ color: '#111111' }}>Disconnect Notion?</h3>
                      <p className="np-body text-[14px] leading-[1.65]" style={{ color: '#737373' }}>
                        Members will no longer be able to import Notion pages. Previously imported documents will remain in your knowledge base.
                      </p>
                    </div>
                    <div className="px-8 pb-8 flex flex-col gap-3">
                      <button
                        onClick={() => { setShowConfirm(false); handleDisconnect() }}
                        className="w-full h-12 text-white np-sans text-[13px] font-bold uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 transition-colors"
                        style={{ backgroundColor: '#DC2626' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#B91C1C' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#DC2626' }}
                      >
                        <Link2Off className="w-4 h-4" strokeWidth={2} />
                        Yes, disconnect
                      </button>
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="btn-outline-ink w-full h-11 cursor-pointer"
                      >
                        Cancel, keep it connected
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mt-6">

      {/* Setup guide card */}
      <div style={{ border: '1px solid #E5E5E0', backgroundColor: '#F9F9F7' }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: '#F0EDE6', borderBottom: '1px solid #E5E5E0' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 flex items-center justify-center np-mono text-[10px] font-black" style={{ backgroundColor: '#111111', color: '#F9F9F7', lineHeight: 1 }}>
              1
            </div>
            <p className="np-mono text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#CC0000' }}>
              ★ Create your Notion connection
            </p>
          </div>
          <a
            href="https://www.notion.so/profile/integrations"
            target="_blank" rel="noopener noreferrer"
            className="np-mono flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest transition-colors"
            style={{ color: '#111111' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#CC0000' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#111111' }}
          >
            Open Notion
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
          </a>
        </div>

        <StepRow num={1}
          title={<>Go to <a href="https://www.notion.so/profile/integrations" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2 transition-colors hover:text-[#AA0000]" style={{ color: '#CC0000' }}>notion.so/profile/integrations</a></>}
        />
        <StepRow num={2}
          title={<>Click the <span className="inline-flex items-center font-bold px-1.5 py-0.5 np-mono text-[11px] mx-0.5" style={{ backgroundColor: '#111111', color: '#F9F9F7' }}>+ New connection</span> button in the top-right</>}
        />
        <StepRow num={3} title={<>Enter <strong>"AskBro"</strong> as the name, select <strong>Access token</strong> method</>} />
        <StepRow num={4} title={<>Under <strong>Installable in</strong>, pick your Notion workspace</>} />
        <StepRow num={5} title={<>Scroll to <strong>Capabilities</strong> — check <strong>"Read content"</strong> only, then <strong>Save</strong></>} last />
      </div>

      {/* Connector */}
      <div className="flex items-center gap-3 my-4 px-2">
        <div className="h-px flex-1" style={{ backgroundColor: '#E5E5E0' }} />
        <span className="np-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1" style={{ backgroundColor: '#111111', color: '#F9F9F7' }}>
          then
        </span>
        <div className="h-px flex-1" style={{ backgroundColor: '#E5E5E0' }} />
      </div>

      {/* Token form card */}
      <div style={{ border: '1px solid #E5E5E0', backgroundColor: '#F9F9F7' }}>
        <div className="px-6 py-4 flex items-center gap-2.5" style={{ backgroundColor: '#F0EDE6', borderBottom: '1px solid #E5E5E0' }}>
          <div className="w-5 h-5 flex items-center justify-center np-mono text-[10px] font-black" style={{ backgroundColor: '#111111', color: '#F9F9F7', lineHeight: 1 }}>
            6
          </div>
          <p className="np-mono text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#CC0000' }}>
            ★ Paste your Access Token
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="np-mono block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#111111' }}>
                Access Token
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => { setToken(e.target.value); setError('') }}
                placeholder="ntn_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                required
                className="auth-input"
                style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '12px' }}
              />
              <p className="np-mono text-[10px] mt-1.5" style={{ color: '#AEABA6' }}>
                notion.so/profile/integrations → your connection → Integration token → Access token
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#16A34A', flexShrink: 0 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <p className="np-body text-[11px]" style={{ color: '#16A34A' }}>
                  Your token is encrypted and completely secure with us.
                </p>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3" style={{ borderLeft: '3px solid #CC0000' }}
              >
                <p className="np-mono text-[12px] uppercase tracking-wide" style={{ color: '#CC0000' }}>{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={connecting || !token.trim()}
              className="btn-ink w-full h-11 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              {connecting
                ? <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> Verifying...</>
                : <>Connect Notion <Check className="w-4 h-4" strokeWidth={2.5} /></>
              }
            </button>
          </form>
        </div>
      </div>

      {/* Info banner */}
      <div className="mt-3 p-4 flex items-start gap-3" style={{ backgroundColor: '#F5F0E8', border: '1px solid #E5E5E0', borderLeft: '3px solid #CC0000' }}>
        <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 text-white font-black np-mono" style={{ backgroundColor: '#111111', fontSize: '11px' }}>
          i
        </div>
        <p className="np-body text-[12px] leading-[1.65]" style={{ color: '#3D3C3A' }}>
          After connecting, <strong>share each page</strong> (or a parent page) with your AskBro connection so it can be imported. Sub-pages are accessible automatically.
        </p>
      </div>
    </div>
  )
}

function IntegrationCard({ icon, name, desc, badge, active, connected, onClick, comingSoon }) {
  return (
    <button
      onClick={!comingSoon ? onClick : undefined}
      className="text-left p-5 transition-all w-full"
      style={{
        border: active ? '2px solid #CC0000' : '1px solid #E5E5E0',
        backgroundColor: active ? '#FEF9F0' : '#F9F9F7',
        boxShadow: active ? '4px 4px 0px 0px #CC0000' : 'none',
        cursor: comingSoon ? 'default' : 'pointer',
        opacity: comingSoon ? 0.6 : 1,
      }}
      onMouseEnter={(e) => { if (!comingSoon && !active) { e.currentTarget.style.boxShadow = '4px 4px 0px 0px #111111'; e.currentTarget.style.borderColor = '#111111' } }}
      onMouseLeave={(e) => { if (!comingSoon && !active) { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E5E5E0' } }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div
          className="w-11 h-11 flex items-center justify-center shrink-0"
          style={{ backgroundColor: active ? '#F5F0E8' : '#F0EDE6', color: active ? '#CC0000' : '#7A7874', border: '1px solid #E5E5E0' }}
        >
          {icon}
        </div>
        {badge && (
          <span
            className="np-mono text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 shrink-0"
            style={{ backgroundColor: connected ? '#F0FDF4' : '#FFF7ED', color: connected ? '#16A34A' : '#D97706', border: `1px solid ${connected ? '#BBF7D0' : '#FDE68A'}` }}
          >
            {badge}
          </span>
        )}
        {comingSoon && (
          <span className="np-mono text-[9px] font-bold uppercase tracking-widest px-2.5 py-1" style={{ backgroundColor: '#F5F0E8', color: '#AEABA6', border: '1px solid #E5E5E0' }}>
            Coming soon
          </span>
        )}
      </div>
      <p className="np-serif text-[14px] font-black mb-1" style={{ color: '#111111' }}>{name}</p>
      <p className="np-body text-[12px] leading-[1.55]" style={{ color: '#737373' }}>{desc}</p>
    </button>
  )
}

export default function IntegrationsPage() {
  const router = useRouter()
  const hydrate   = useAuthStore((s) => s.hydrate)
  const user      = useAuthStore((s) => s.user)
  const fetchDocs = useDocumentStore((s) => s.fetchDocuments)
  const [hydrated, setHydrated] = useState(false)
  const [active, setActive]     = useState('notion')
  const [notionStatus, setNotionStatus] = useState(null)

  useEffect(() => { hydrate(); setHydrated(true) }, [hydrate])

  useEffect(() => {
    if (!hydrated) return
    if (!user) { router.replace('/login'); return }
    fetchDocs()
    getNotionStatus().then(setNotionStatus).catch(() => {})
  }, [hydrated, user, router, fetchDocs])

  if (!hydrated || !user) return null

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F9F9F7' }}>
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto newsprint-bg" style={{ backgroundColor: '#F9F9F7' }}>

        {/* ── Top bar ─────────────────────────────────────────── */}
        <div
          className="sticky top-0 z-10 px-8 h-14 flex items-center justify-between shrink-0"
          style={{ backgroundColor: '#F9F9F7', borderBottom: '1px solid #111111' }}
        >
          <div className="flex items-center gap-3">
            <Puzzle className="w-4 h-4" style={{ color: '#CC0000' }} strokeWidth={2} />
            <h1 className="np-serif font-black text-[16px]" style={{ color: '#111111' }}>Integrations</h1>
          </div>
          <Link
            href="/dashboard"
            className="np-mono flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest transition-colors"
            style={{ color: '#CC0000' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#AA0000' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#CC0000' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
            Back to chat
          </Link>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-8 pb-20">

          {/* Page heading */}
          <div className="mb-8">
            <p className="np-mono text-[9px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#CC0000' }}>★ Integrations</p>
            <h2 className="np-serif font-black" style={{ fontSize: '28px', color: '#111111', lineHeight: 0.95 }}>
              Connect your tools
            </h2>
            <p className="np-body text-[13px] mt-3" style={{ color: '#737373' }}>
              Import content directly from your favourite apps into your AskBro knowledge base.
            </p>
          </div>

          {/* Integration cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <IntegrationCard
              icon={<NotionLogo size={22} />}
              name="Notion"
              desc="Import pages and databases from your Notion workspace as searchable documents."
              badge={notionStatus?.connected ? 'Connected' : 'Not connected'}
              connected={notionStatus?.connected}
              active={active === 'notion'}
              onClick={() => setActive('notion')}
            />
            <IntegrationCard
              icon={<GitBranch className="w-5 h-5" strokeWidth={1.8} />}
              name="GitHub"
              desc="Sync repositories, READMEs, and wikis as knowledge base documents."
              comingSoon
            />
          </div>

          {/* Selected integration detail */}
          <AnimatePresence mode="wait">
            {active === 'notion' && (
              <motion.div
                key="notion"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
              >
                {/* Section header */}
                <div
                  className="flex items-center gap-3 px-5 py-4 mb-1"
                  style={{ backgroundColor: '#F0EDE6', border: '1px solid #E5E5E0', borderLeft: '3px solid #CC0000' }}
                >
                  <div className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: '#111111', color: 'white' }}>
                    <NotionLogo size={16} />
                  </div>
                  <div>
                    <p className="np-serif text-[14px] font-black" style={{ color: '#111111' }}>Notion Integration</p>
                    <p className="np-body text-[12px]" style={{ color: '#737373' }}>
                      {notionStatus?.connected
                        ? `Connected to "${notionStatus.workspace_name}"`
                        : 'Connect your workspace to start importing pages'}
                    </p>
                  </div>
                  {notionStatus?.connected && (
                    <span className="ml-auto flex items-center gap-1.5 np-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1" style={{ backgroundColor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#16A34A' }} />
                      Active
                    </span>
                  )}
                </div>

                <NotionDetail
                  status={notionStatus}
                  onStatusChange={(s) => setNotionStatus(s)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
