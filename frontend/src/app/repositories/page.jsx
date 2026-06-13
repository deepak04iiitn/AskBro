'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft, GitBranch, Plus, RefreshCw, Trash2,
  ExternalLink, AlertTriangle, Loader2, Lock, Check,
} from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import useGitHubStore from '@/store/useGitHubStore'
import Sidebar from '@/components/layout/Sidebar'
import GitHubImportModal from '@/components/github/GitHubImportModal'

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS = {
  ready:     { label: 'Ready',    bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  ingesting: { label: 'Working…', bg: '#FFF7ED', color: '#D97706', border: '#FDE68A' },
  syncing:   { label: 'Syncing…', bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
  pending:   { label: 'Queued',   bg: '#FFF7ED', color: '#D97706', border: '#FDE68A' },
  failed:    { label: 'Failed',   bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
}

// ── Step-wise progress ─────────────────────────────────────────────────────────
const REPO_STEPS = [
  { label: 'Connecting to GitHub',  detail: 'Verifying access and preparing the repository' },
  { label: 'Reading your code',     detail: 'Downloading and understanding your code files' },
  { label: 'Learning from history', detail: 'Going through commits, issues and pull requests' },
  { label: 'Finishing up',          detail: 'Building your knowledge base' },
]

function progressToStepIndex(progressStep, status) {
  if (status === 'pending') return -1
  if (!progressStep) return 0
  const s = progressStep.toLowerCase()
  if (s.includes('connecting') || s.includes('getting ready')) return 0
  if (s.includes('reading your code') || s.includes('downloading') || s.includes('understanding')) return 1
  if (s.includes('commit') || s.includes('issue') || s.includes('pull request') || s.includes('analysing') || s.includes('learning from')) return 2
  if (s.includes('building') || s.includes('knowledge')) return 3
  return 0
}

function ShimmerBar() {
  return (
    <div className="relative overflow-hidden" style={{ height: 2, backgroundColor: '#F0EDE6' }}>
      <motion.div
        className="absolute inset-y-0"
        style={{ width: '35%', backgroundColor: '#D97706' }}
        animate={{ left: ['-35%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

function RepoStepRow({ step, index, isDone, isActive, isFailed }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18, delay: index * 0.04 }}
      className="flex flex-col gap-1.5"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-5 h-5 flex items-center justify-center shrink-0 np-mono text-[10px] font-bold transition-all duration-300"
          style={{
            backgroundColor: isDone ? '#DCFCE7' : isFailed ? '#FEE2E2' : isActive ? '#FFF7ED' : '#F0EDE6',
            color: isDone ? '#16A34A' : isFailed ? '#DC2626' : isActive ? '#D97706' : '#AEABA6',
            border: isActive ? '1px solid #D97706' : '1px solid transparent',
          }}
        >
          {isDone ? <Check className="w-2.5 h-2.5" strokeWidth={3} /> : index + 1}
        </div>

        <span
          className="flex-1 np-body text-[13px] transition-all duration-300"
          style={{
            color: isDone ? '#AEABA6' : isFailed ? '#DC2626' : isActive ? '#111111' : '#AEABA6',
            textDecorationLine: isDone ? 'line-through' : 'none',
            textDecorationColor: isDone ? '#16A34A' : 'transparent',
          }}
        >
          {step.label}
        </span>

        {isDone && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18 }}
            className="shrink-0 np-mono text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5"
            style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}
          >
            Done ✓
          </motion.span>
        )}
        {isActive && (
          <span className="shrink-0 np-mono text-[9px] font-semibold uppercase tracking-widest" style={{ color: '#D97706' }}>
            In progress…
          </span>
        )}
        {isFailed && (
          <span className="shrink-0 np-mono text-[9px] font-semibold uppercase tracking-widest" style={{ color: '#DC2626' }}>
            Failed
          </span>
        )}
      </div>

      {isActive && (
        <div className="ml-8">
          <ShimmerBar />
          <p className="np-body text-[11px] mt-1" style={{ color: '#737373' }}>{step.detail}</p>
        </div>
      )}
    </motion.div>
  )
}

function StatPill({ value, label }) {
  if (!value) return null
  return (
    <div className="flex flex-col items-center px-4 py-2" style={{ borderRight: '1px solid #E5E5E0' }}>
      <span className="np-mono text-[16px] font-black" style={{ color: '#111111' }}>
        {value.toLocaleString()}
      </span>
      <span className="np-mono text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#AEABA6' }}>
        {label}
      </span>
    </div>
  )
}

function RepoRow({ repo }) {
  const syncRepo   = useGitHubStore((s) => s.syncRepo)
  const removeRepo = useGitHubStore((s) => s.removeRepo)

  const [syncing, setSyncing]       = useState(false)
  const [showRemove, setShowRemove] = useState(false)
  const [removing, setRemoving]     = useState(false)

  const cfg    = STATUS[repo.status] ?? STATUS.pending
  const isActive = ['ingesting', 'syncing', 'pending'].includes(repo.status)

  async function handleSync() {
    setSyncing(true)
    try { await syncRepo(repo.repo_id) } finally { setSyncing(false) }
  }

  async function handleRemove() {
    setRemoving(true)
    try { await removeRepo(repo.repo_id) }
    finally { setRemoving(false); setShowRemove(false) }
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.2 }}
        style={{ border: '1px solid #E5E5E0', backgroundColor: '#F9F9F7' }}
      >
        {/* Row header */}
        <div
          className="flex items-center gap-4 px-6 py-4"
          style={{ borderBottom: isActive || repo.status === 'ready' ? '1px solid #E5E5E0' : undefined, backgroundColor: '#F0EDE6' }}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {repo.private && (
              <Lock className="w-3.5 h-3.5 shrink-0" style={{ color: '#AEABA6' }} strokeWidth={1.8} />
            )}
            <GitBranch className="w-4 h-4 shrink-0" style={{ color: '#CC0000' }} strokeWidth={1.8} />
            <div className="min-w-0">
              <p className="np-sans text-[15px] font-bold truncate" style={{ color: '#111111' }}>
                {repo.full_name}
              </p>
              <p className="np-mono text-[10px] mt-0.5" style={{ color: '#7A7874' }}>
                {repo.default_branch}
                {repo.last_synced_at && (
                  <span style={{ color: '#AEABA6' }}>
                    {' · synced '}{new Date(repo.last_synced_at).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <span
            className="shrink-0 flex items-center gap-1.5 np-mono text-[9px] font-bold uppercase tracking-widest px-2.5 py-1"
            style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isActive ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: cfg.color }}
            />
            {cfg.label}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <a
              href={`https://github.com/${repo.full_name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center cursor-pointer transition-colors"
              style={{ color: '#AEABA6' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#111111' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#AEABA6' }}
              title="Open on GitHub"
            >
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
            </a>
            <button
              onClick={handleSync}
              disabled={syncing || isActive}
              className="w-8 h-8 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-30"
              style={{ color: '#AEABA6' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#111111' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#AEABA6' }}
              title="Sync now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing || isActive ? 'animate-spin' : ''}`} strokeWidth={2} />
            </button>
            <button
              onClick={() => setShowRemove(true)}
              className="w-8 h-8 flex items-center justify-center cursor-pointer transition-colors"
              style={{ color: '#AEABA6' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#DC2626' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#AEABA6' }}
              title="Remove repository"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Step-wise progress (active states) */}
        {isActive && (
          <div className="px-6 py-4 space-y-3" style={{ borderBottom: '1px solid #E5E5E0' }}>
            {repo.status === 'pending' && (
              <div className="flex items-center gap-2 pb-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" style={{ color: '#D97706' }} strokeWidth={2} />
                <span className="np-mono text-[11px] font-semibold" style={{ color: '#D97706' }}>
                  Waiting in queue…
                </span>
              </div>
            )}
            {REPO_STEPS.map((step, i) => {
              const activeStep = progressToStepIndex(repo.progress_step, repo.status)
              const isDone     = repo.status === 'ready' || activeStep > i
              const isStepActive = repo.status !== 'pending' && repo.status !== 'failed' && activeStep === i
              const isFailed   = repo.status === 'failed' && activeStep === i
              return (
                <RepoStepRow
                  key={i} step={step} index={i}
                  isDone={isDone} isActive={isStepActive} isFailed={isFailed}
                />
              )
            })}
          </div>
        )}

        {/* Stats (ready state) */}
        {repo.status === 'ready' && (
          <div className="flex" style={{ borderBottom: '1px solid #E5E5E0' }}>
            <StatPill value={repo.files_indexed} label="files read" />
            {repo.include_commits && <StatPill value={repo.commits_indexed} label="commits read" />}
            {repo.include_issues  && <StatPill value={repo.issues_indexed}  label="issues read"  />}
            {repo.include_prs     && <StatPill value={repo.prs_indexed}     label="PRs read"     />}
          </div>
        )}

        {/* Error */}
        {repo.status === 'failed' && repo.error_message && (
          <div
            className="px-6 py-3 flex items-start gap-2.5"
            style={{ backgroundColor: '#FEF2F2', borderBottom: '1px solid #FECACA' }}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#DC2626' }} strokeWidth={1.8} />
            <p className="np-mono text-[11px]" style={{ color: '#DC2626' }}>{repo.error_message}</p>
          </div>
        )}

        {/* Index settings footer */}
        <div className="px-6 py-2.5 flex items-center gap-4">
          {[
            'Code',
            repo.include_commits && 'Commits',
            repo.include_issues  && 'Issues',
            repo.include_prs     && 'PRs',
            repo.auto_sync       && 'Auto-sync',
          ].filter(Boolean).map((tag) => (
            <span key={tag} className="np-mono text-[9px] font-bold uppercase tracking-widest" style={{ color: '#AEABA6' }}>
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Remove confirm modal */}
      <AnimatePresence>
        {showRemove && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backgroundColor: 'rgba(10,10,12,0.65)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => { if (e.target === e.currentTarget && !removing) setShowRemove(false) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="w-full max-w-[420px] overflow-hidden"
              style={{ background: '#F9F9F7', border: '1px solid #111111', boxShadow: '6px 6px 0px 0px #111111' }}
            >
              <div className="flex justify-center pt-8 pb-4">
                <div className="w-16 h-16 flex items-center justify-center" style={{ backgroundColor: '#FEF2F2', border: '1px solid #E5E5E0' }}>
                  <Trash2 className="w-8 h-8" style={{ color: '#DC2626' }} strokeWidth={1.8} />
                </div>
              </div>
              <div className="px-8 pb-6 text-center">
                <h3 className="np-serif text-[18px] font-black mb-2" style={{ color: '#111111' }}>Remove {repo.repo_name}?</h3>
                <p className="np-body text-[14px] leading-[1.65]" style={{ color: '#737373' }}>
                  All content read from this repository will be removed from your knowledge base. This cannot be undone.
                </p>
              </div>
              <div className="px-8 pb-8 flex flex-col gap-3">
                <button
                  onClick={handleRemove}
                  disabled={removing}
                  className="w-full h-12 text-white np-sans text-[13px] font-bold uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: '#DC2626' }}
                  onMouseEnter={(e) => { if (!removing) e.currentTarget.style.backgroundColor = '#B91C1C' }}
                  onMouseLeave={(e) => { if (!removing) e.currentTarget.style.backgroundColor = '#DC2626' }}
                >
                  {removing ? <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> Removing…</> : 'Yes, remove'}
                </button>
                <button
                  onClick={() => setShowRemove(false)}
                  disabled={removing}
                  className="btn-outline-ink w-full h-11 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default function RepositoriesPage() {
  const router       = useRouter()
  const hydrate      = useAuthStore((s) => s.hydrate)
  const user         = useAuthStore((s) => s.user)
  const repos        = useGitHubStore((s) => s.repos)
  const fetchRepos   = useGitHubStore((s) => s.fetchRepos)
  const fetchStatus  = useGitHubStore((s) => s.fetchStatus)
  const githubStatus = useGitHubStore((s) => s.status)

  const [hydrated, setHydrated]         = useState(false)
  const [showImport, setShowImport]     = useState(false)
  const [coffeeRepo, setCoffeeRepo]     = useState(null)   // repo name when coffee modal is shown

  useEffect(() => { hydrate(); setHydrated(true) }, [hydrate])

  useEffect(() => {
    if (!hydrated) return
    if (!user) { router.replace('/login'); return }
    fetchStatus()
    fetchRepos()
  }, [hydrated, user, router, fetchStatus, fetchRepos])

  if (!hydrated || !user) return null

  const isConnected = githubStatus?.connected

  return (
    <>
      <AnimatePresence>
        {showImport && (
          <GitHubImportModal
            onClose={() => setShowImport(false)}
            onImported={fetchRepos}
            onImportStarted={(repoName) => setCoffeeRepo(repoName)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {coffeeRepo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backgroundColor: 'rgba(10,10,12,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setCoffeeRepo(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className="w-full max-w-[460px] overflow-hidden text-center"
              style={{ background: '#F9F9F7', border: '1px solid #111111', boxShadow: '8px 8px 0px 0px #111111' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* top accent */}
              <div className="h-1.5" style={{ backgroundColor: '#CC0000' }} />

              {/* coffee icon */}
              <div className="pt-10 pb-2 flex justify-center">
                <motion.div
                  animate={{ rotate: [-4, 4, -4] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-[64px] leading-none select-none"
                >
                  ☕
                </motion.div>
              </div>

              {/* headline */}
              <div className="px-10 pb-3">
                <p className="np-mono text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#CC0000' }}>
                  Import started
                </p>
                <h2 className="np-serif font-black" style={{ fontSize: '26px', color: '#111111', lineHeight: 1.1 }}>
                  Go grab a coffee.
                </h2>
                <p className="np-body text-[14px] mt-3 leading-relaxed" style={{ color: '#4A4845' }}>
                  We're importing <span className="np-mono font-bold" style={{ color: '#111111' }}>{coffeeRepo}</span> in the background.
                  This takes a few minutes — your code, commits and discussions are worth the wait.
                </p>
              </div>

              {/* fun detail strip */}
              <div
                className="mx-10 mb-6 mt-4 px-5 py-3.5 flex items-center gap-3"
                style={{ backgroundColor: '#F5F0E8', border: '1px solid #E5E5E0' }}
              >
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: '#D97706' }}
                />
                <p className="np-mono text-[11px] text-left" style={{ color: '#737373' }}>
                  Reading your code, commits &amp; discussions in parallel…
                </p>
              </div>

              <div className="px-10 pb-10">
                <button
                  onClick={() => setCoffeeRepo(null)}
                  className="btn-ink w-full h-11 np-mono text-[11px] font-bold uppercase tracking-widest cursor-pointer"
                >
                  Got it, I'll check back soon
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F9F9F7' }}>
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: '#F9F9F7' }}>

          {/* ── Top bar ──────────────────────────────────────── */}
          <div
            className="sticky top-0 z-10 px-8 h-14 flex items-center justify-between shrink-0"
            style={{ backgroundColor: '#F9F9F7', borderBottom: '1px solid #111111' }}
          >
            <div className="flex items-center gap-3">
              <GitBranch className="w-4 h-4" style={{ color: '#CC0000' }} strokeWidth={2} />
              <h1 className="np-serif font-black text-[16px]" style={{ color: '#111111' }}>Repositories</h1>
              {repos.length > 0 && (
                <span
                  className="np-mono text-[10px] font-bold px-1.5 py-0.5"
                  style={{ backgroundColor: '#111111', color: '#F9F9F7' }}
                >
                  {repos.length}
                </span>
              )}
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

          <div className="max-w-4xl mx-auto px-8 py-8 pb-20">

            {/* ── Page heading ─────────────────────────────── */}
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="np-mono text-[9px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#CC0000' }}>★ GitHub</p>
                <h2 className="np-serif font-black" style={{ fontSize: '28px', color: '#111111', lineHeight: 0.95 }}>
                  Your repositories
                </h2>
                <p className="np-body text-[13px] mt-3" style={{ color: '#737373' }}>
                  Import repos to chat with your code, commits, issues and PRs.
                </p>
              </div>

              {isConnected && (
                <button
                  onClick={() => setShowImport(true)}
                  className="btn-ink flex items-center gap-2 px-5 h-10 cursor-pointer np-mono text-[11px] font-bold uppercase tracking-widest shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Add repository
                </button>
              )}
            </div>

            {/* ── Not connected state ───────────────────────── */}
            {!isConnected && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
                style={{ border: '1px dashed #E5E5E0' }}
              >
                <div
                  className="w-16 h-16 flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#F0EDE6', border: '1px solid #E5E5E0' }}
                >
                  <GitBranch className="w-7 h-7" style={{ color: '#AEABA6' }} strokeWidth={1.5} />
                </div>
                <p className="np-serif text-[17px] font-black mb-2" style={{ color: '#111111' }}>
                  GitHub not connected
                </p>
                <p className="np-body text-[13px] mb-6" style={{ color: '#737373', maxWidth: 340 }}>
                  Connect your GitHub account from the Integrations page to start importing repositories.
                </p>
                <Link
                  href="/integrations"
                  className="btn-ink flex items-center gap-2 px-5 h-10 np-mono text-[11px] font-bold uppercase tracking-widest"
                >
                  Go to Integrations
                  <ArrowLeft className="w-3.5 h-3.5 rotate-180" strokeWidth={2.5} />
                </Link>
              </motion.div>
            )}

            {/* ── Empty state (connected but no repos) ─────── */}
            {isConnected && repos.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
                style={{ border: '1px dashed #E5E5E0' }}
              >
                <div
                  className="w-16 h-16 flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#F0EDE6', border: '1px solid #E5E5E0' }}
                >
                  <GitBranch className="w-7 h-7" style={{ color: '#AEABA6' }} strokeWidth={1.5} />
                </div>
                <p className="np-serif text-[17px] font-black mb-2" style={{ color: '#111111' }}>
                  No repositories yet
                </p>
                <p className="np-body text-[13px] mb-6" style={{ color: '#737373', maxWidth: 340 }}>
                  Import a repository to start chatting with your code, commits, issues and pull requests.
                </p>
                <button
                  onClick={() => setShowImport(true)}
                  className="btn-ink flex items-center gap-2 px-5 h-10 cursor-pointer np-mono text-[11px] font-bold uppercase tracking-widest"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Add your first repository
                </button>
              </motion.div>
            )}

            {/* ── Repo list ────────────────────────────────── */}
            {isConnected && repos.length > 0 && (
              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {repos.map((repo) => (
                    <RepoRow key={repo.repo_id} repo={repo} />
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
