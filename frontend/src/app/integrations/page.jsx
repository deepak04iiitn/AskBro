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

// ── Notion SVG logo ───────────────────────────────────────────
function NotionLogo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933z" />
    </svg>
  )
}

// ── Step row (single-line horizontal) ─────────────────────────
function StepRow({ num, title, right, last = false }) {
  return (
    <div
      className="flex items-center gap-4 px-6 h-12"
      style={last ? {} : { borderBottom: '1px solid #F4F3F0' }}
    >
      <div
        className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold"
        style={{ backgroundColor: '#EEF1FD', color: '#4361EE', border: '1.5px solid #C7D2FE', lineHeight: 1 }}
      >
        {num}
      </div>
      <p className="flex-1 text-[13px] font-medium" style={{ color: '#111110' }}>{title}</p>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  )
}

// ── Notion detail panel ────────────────────────────────────────
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

        {/* ── Connected status card ──────────────────────────── */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid #BBF7D0', boxShadow: '0 4px 20px rgba(22,163,74,0.08)' }}>
          <div className="px-6 py-5" style={{ backgroundColor: '#F0FDF4' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#DCFCE7', border: '1.5px solid #BBF7D0' }}>
                <CheckCircle2 className="w-6 h-6" style={{ color: '#16A34A' }} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[16px] font-bold tracking-[-0.01em]" style={{ color: '#15803D' }}>Notion connected</p>
                {status.workspace_name && (
                  <p className="text-[13px] font-medium mt-0.5" style={{ color: '#4B9660' }}>{status.workspace_name}</p>
                )}
              </div>
              <span className="ml-auto flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#16A34A' }} />
                Live
              </span>
            </div>
          </div>
          <div className="px-6 py-5 bg-white">
            <p className="text-[13px] leading-[1.6] mb-4" style={{ color: '#7A7874' }}>
              Your workspace is connected. Share any Notion page with your AskBro connection, then import it from the upload page.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 text-white text-[14px] font-semibold rounded-xl px-5 h-11 transition-colors"
              style={{ backgroundColor: '#4361EE' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#3451D6' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#4361EE' }}
            >
              <NotionLogo size={16} />
              Go to Upload a document
              <ArrowLeft className="w-4 h-4 rotate-180" strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        {/* ── How to import guide ────────────────────────────── */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E3E1DC', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="px-6 py-3.5" style={{ backgroundColor: '#FAFAF9', borderBottom: '1px solid #F0EFEC' }}>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#AEABA6' }}>How to import a page</p>
          </div>
          <StepRow num={1} title="Open the Notion page you want to import" />
          <StepRow num={2} title={<>Click <strong>...</strong> (three dots) in the top-right corner of the page</>} />
          <StepRow num={3} title={<>Click <strong>"Add connections"</strong> and select your <strong>AskBro</strong> integration</>} />
          <StepRow num={4} title="Copy the Notion page URL from your browser" />
          <StepRow num={5} last
            title={<>Go to <Link href="/upload" className="font-semibold underline underline-offset-2" style={{ color: '#4361EE' }}>Upload a document</Link> &mdash; open the <strong>Notion</strong> tab and paste the URL</>}
          />
        </div>

        {/* ── Disconnect (owner only) ────────────────────────── */}
        {isOwner && (
          <div>
            {error && (
              <div className="rounded-xl px-4 py-3 mb-3" style={{ backgroundColor: '#FEF2F2', borderLeft: '3px solid #DC2626' }}>
                <p className="text-[12px]" style={{ color: '#DC2626' }}>{error}</p>
              </div>
            )}
            <button
              onClick={() => setShowConfirm(true)}
              disabled={disconnecting}
              className="flex items-center gap-2 text-[13px] font-semibold cursor-pointer transition-colors rounded-xl px-4 py-2.5 disabled:opacity-50"
              style={{ color: '#DC2626', border: '1.5px solid #FECACA', backgroundColor: 'transparent' }}
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
                    className="bg-white rounded-3xl overflow-hidden w-full max-w-[420px]"
                    style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.06)' }}
                  >
                    <div className="flex justify-center pt-8 pb-4">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                        <Link2Off className="w-8 h-8" style={{ color: '#DC2626' }} strokeWidth={1.8} />
                      </div>
                    </div>
                    <div className="px-8 pb-6 text-center">
                      <h3 className="text-[18px] font-bold tracking-[-0.01em] mb-2" style={{ color: '#111110' }}>Disconnect Notion?</h3>
                      <p className="text-[14px] leading-[1.65]" style={{ color: '#7A7874' }}>
                        Members will no longer be able to import Notion pages. Previously imported documents will remain in your knowledge base.
                      </p>
                    </div>
                    <div className="px-8 pb-8 flex flex-col gap-3">
                      <button
                        onClick={() => { setShowConfirm(false); handleDisconnect() }}
                        className="w-full h-12 text-white text-[14px] font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-colors"
                        style={{ backgroundColor: '#DC2626' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#B91C1C' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#DC2626' }}
                      >
                        <Link2Off className="w-4 h-4" strokeWidth={2} />
                        Yes, disconnect
                      </button>
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="w-full h-11 text-[14px] font-medium rounded-xl cursor-pointer transition-colors"
                        style={{ border: '1.5px solid #E3E1DC', color: '#4A4845', backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F7F5F2' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
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

  // ── Not connected ──────────────────────────────────────────────
  return (
    <div className="mt-6">

      {/* Setup guide card */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E3E1DC', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        {/* Card header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: '#FAFAF9', borderBottom: '1px solid #F0EFEC' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: '#EEF1FD', color: '#4361EE', lineHeight: 1 }}>
              1
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#AEABA6' }}>
              Create your Notion connection
            </p>
          </div>
          <a
            href="https://www.notion.so/profile/integrations"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-[12px] font-semibold transition-colors"
            style={{ color: '#4361EE' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#3451D6' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#4361EE' }}
          >
            Open Notion
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
          </a>
        </div>

        {/* Steps */}
        <StepRow num={1}
          title={<>Go to <a href="https://www.notion.so/profile/integrations" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2" style={{ color: '#4361EE' }}>notion.so/profile/integrations</a></>}
        />
        <StepRow num={2}
          title={<>Click the <span className="inline-flex items-center font-semibold px-1.5 py-0.5 rounded-md text-[11px] mx-0.5" style={{ backgroundColor: '#EEF1FD', color: '#4361EE' }}>+ New connection</span> button in the top-right</>}
        />
        <StepRow num={3} title={<>Enter <strong>"AskBro"</strong> as the name, select <strong>Access token</strong> method</>} />
        <StepRow num={4} title={<>Under <strong>Installable in</strong>, pick your Notion workspace</>} />
        <StepRow num={5} title={<>Scroll to <strong>Capabilities</strong> &mdash; check <strong>"Read content"</strong> only, then <strong>Save</strong></>} last />
      </div>

      {/* Connector */}
      <div className="flex items-center gap-3 my-3 px-2">
        <div className="h-px flex-1" style={{ backgroundColor: '#E3E1DC' }} />
        <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ backgroundColor: '#EEF1FD', color: '#4361EE' }}>
          then
        </span>
        <div className="h-px flex-1" style={{ backgroundColor: '#E3E1DC' }} />
      </div>

      {/* Token form card */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E3E1DC', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div className="px-6 py-4 flex items-center gap-2.5" style={{ backgroundColor: '#FAFAF9', borderBottom: '1px solid #F0EFEC' }}>
          <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: '#EEF1FD', color: '#4361EE', lineHeight: 1 }}>
            6
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#AEABA6' }}>
            Paste your Access Token
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#111110' }}>
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
              <p className="text-[11px] mt-1.5" style={{ color: '#AEABA6' }}>
                notion.so/profile/integrations &rarr; your connection &rarr; Integration token &rarr; Access token
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#16A34A', flexShrink: 0 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <p className="text-[11px]" style={{ color: '#16A34A' }}>
                  Your token is encrypted and completely secure with us.
                </p>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-r-lg px-4 py-3" style={{ backgroundColor: '#FEF2F2', borderLeft: '3px solid #DC2626' }}
              >
                <p className="text-[13px]" style={{ color: '#DC2626' }}>{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={connecting || !token.trim()}
              className="w-full h-11 flex items-center justify-center gap-2 text-white text-[14px] font-semibold rounded-xl cursor-pointer transition-colors disabled:opacity-40"
              style={{ backgroundColor: '#4361EE' }}
              onMouseEnter={(e) => { if (!connecting) e.currentTarget.style.backgroundColor = '#3451D6' }}
              onMouseLeave={(e) => { if (!connecting) e.currentTarget.style.backgroundColor = '#4361EE' }}
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
      <div className="mt-3 rounded-xl p-4 flex items-start gap-3" style={{ backgroundColor: '#EEF1FD', border: '1px solid #C7D2FE' }}>
        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white font-black" style={{ backgroundColor: '#4361EE', fontSize: '11px' }}>
          i
        </div>
        <p className="text-[12px] leading-[1.65]" style={{ color: '#3451D6' }}>
          After connecting, <strong>share each page</strong> (or a parent page) with your AskBro connection so it can be imported. Sub-pages are accessible automatically.
        </p>
      </div>
    </div>
  )
}

// ── Integration card ───────────────────────────────────────────
function IntegrationCard({ icon, name, desc, badge, active, connected, onClick, comingSoon }) {
  return (
    <button
      onClick={!comingSoon ? onClick : undefined}
      className="text-left rounded-2xl p-5 transition-all w-full"
      style={{
        border: active ? '2px solid #4361EE' : '1.5px solid #E3E1DC',
        backgroundColor: active ? '#F7F9FF' : 'white',
        boxShadow: active ? '0 4px 20px rgba(67,97,238,0.10)' : '0 2px 8px rgba(0,0,0,0.04)',
        cursor: comingSoon ? 'default' : 'pointer',
        opacity: comingSoon ? 0.6 : 1,
      }}
      onMouseEnter={(e) => { if (!comingSoon && !active) e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)' }}
      onMouseLeave={(e) => { if (!comingSoon && !active) e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: active ? '#EEF1FD' : '#F4F3F0', color: active ? '#4361EE' : '#7A7874' }}
        >
          {icon}
        </div>
        {badge && (
          <span
            className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shrink-0"
            style={{ backgroundColor: connected ? '#F0FDF4' : '#FFF7ED', color: connected ? '#16A34A' : '#D97706' }}
          >
            {badge}
          </span>
        )}
        {comingSoon && (
          <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full" style={{ backgroundColor: '#F4F3F0', color: '#AEABA6' }}>
            Coming soon
          </span>
        )}
      </div>
      <p className="text-[14px] font-bold mb-1" style={{ color: '#111110' }}>{name}</p>
      <p className="text-[12px] leading-[1.55]" style={{ color: '#7A7874' }}>{desc}</p>
    </button>
  )
}

// ── Main page ──────────────────────────────────────────────────
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
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F7F5F2' }}>
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto" style={{ backgroundColor: '#F0F4FF' }}>

        {/* ── Top bar ─────────────────────────────────────────── */}
        <div
          className="sticky top-0 z-10 bg-white px-8 h-14 flex items-center justify-between shrink-0"
          style={{ borderBottom: '1px solid #E3E1DC' }}
        >
          <div className="flex items-center gap-2.5">
            <Puzzle className="w-4 h-4" style={{ color: '#4361EE' }} strokeWidth={2} />
            <h1 className="text-[15px] font-bold" style={{ color: '#111110' }}>Integrations</h1>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-[13px] font-semibold transition-colors"
            style={{ color: '#4361EE' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#3451D6' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#4361EE' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
            Back to chat
          </Link>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-8 pb-20">

          {/* Page heading */}
          <div className="mb-8">
            <h2 className="text-[22px] font-bold tracking-[-0.02em]" style={{ color: '#111110' }}>
              Connect your tools
            </h2>
            <p className="text-[13px] mt-1" style={{ color: '#7A7874' }}>
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
                  className="flex items-center gap-3 px-5 py-4 rounded-2xl mb-1"
                  style={{ backgroundColor: 'white', border: '1px solid #E3E1DC', boxShadow: '0 1px 4px rgba(67,97,238,0.06)' }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#111110', color: 'white' }}>
                    <NotionLogo size={16} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold" style={{ color: '#111110' }}>Notion Integration</p>
                    <p className="text-[12px]" style={{ color: '#7A7874' }}>
                      {notionStatus?.connected
                        ? `Connected to "${notionStatus.workspace_name}"`
                        : 'Connect your workspace to start importing pages'}
                    </p>
                  </div>
                  {notionStatus?.connected && (
                    <span className="ml-auto flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
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
