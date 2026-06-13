'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitBranch, Lock, RefreshCw, Trash2, ExternalLink, AlertTriangle, Loader2 } from 'lucide-react'
import useGitHubStore from '@/store/useGitHubStore'

const STATUS_CONFIG = {
  ready:      { label: 'Ready',     bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0', dot: true  },
  ingesting:  { label: 'Indexing…', bg: '#FFF7ED', color: '#D97706', border: '#FDE68A', dot: true, pulse: true },
  syncing:    { label: 'Syncing…',  bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE', dot: true, pulse: true },
  pending:    { label: 'Pending',   bg: '#FFF7ED', color: '#D97706', border: '#FDE68A', dot: true, pulse: true },
  failed:     { label: 'Failed',    bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', dot: false },
}

function Stat({ value, label }) {
  if (!value) return null
  return (
    <div className="text-center">
      <p className="np-mono text-[13px] font-bold" style={{ color: '#111111' }}>{value.toLocaleString()}</p>
      <p className="np-mono text-[9px] uppercase tracking-widest" style={{ color: '#AEABA6' }}>{label}</p>
    </div>
  )
}

export default function GitHubRepoCard({ repo }) {
  const syncRepo = useGitHubStore((s) => s.syncRepo)
  const removeRepo = useGitHubStore((s) => s.removeRepo)

  const [syncing, setSyncing] = useState(false)
  const [showRemove, setShowRemove] = useState(false)
  const [removing, setRemoving] = useState(false)

  const cfg = STATUS_CONFIG[repo.status] ?? STATUS_CONFIG.pending
  const isActive = ['ingesting', 'syncing', 'pending'].includes(repo.status)

  async function handleSync() {
    setSyncing(true)
    try {
      await syncRepo(repo.repo_id)
    } finally {
      setSyncing(false)
    }
  }

  async function handleRemove() {
    setRemoving(true)
    try {
      await removeRepo(repo.repo_id)
    } finally {
      setRemoving(false)
      setShowRemove(false)
    }
  }

  return (
    <>
      <div style={{ border: '1px solid #E3E1DC', backgroundColor: '#F9F9F7' }}>
        {/* Header */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #E3E1DC', backgroundColor: '#F0EDE6' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {repo.private && <Lock className="w-3.5 h-3.5 shrink-0" style={{ color: '#AEABA6' }} strokeWidth={1.8} />}
              <GitBranch className="w-3.5 h-3.5 shrink-0" style={{ color: '#CC0000' }} strokeWidth={1.8} />
              <p className="np-sans text-[14px] font-bold truncate" style={{ color: '#111111' }}>{repo.full_name}</p>
            </div>

            <span
              className="flex items-center gap-1.5 np-mono text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 shrink-0"
              style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
            >
              {cfg.dot && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${cfg.pulse ? 'animate-pulse' : ''}`}
                  style={{ backgroundColor: cfg.color }}
                />
              )}
              {cfg.label}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <span className="np-mono text-[10px]" style={{ color: '#7A7874' }}>
              {repo.default_branch}
            </span>
            {repo.last_synced_at && (
              <span className="np-mono text-[10px]" style={{ color: '#AEABA6' }}>
                · synced {new Date(repo.last_synced_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        {repo.status === 'ready' && (
          <div className="px-5 py-3 flex items-center gap-6" style={{ borderBottom: '1px solid #E3E1DC' }}>
            <Stat value={repo.files_indexed} label="files" />
            {repo.include_commits && <Stat value={repo.commits_indexed} label="commits" />}
            {repo.include_issues && <Stat value={repo.issues_indexed} label="issues" />}
            {repo.include_prs && <Stat value={repo.prs_indexed} label="PRs" />}
          </div>
        )}

        {/* Error */}
        {repo.status === 'failed' && repo.error_message && (
          <div className="px-5 py-3 flex items-start gap-2" style={{ borderBottom: '1px solid #E3E1DC', backgroundColor: '#FEF2F2' }}>
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#DC2626' }} strokeWidth={1.8} />
            <p className="np-mono text-[11px]" style={{ color: '#DC2626' }}>{repo.error_message}</p>
          </div>
        )}

        {/* Actions */}
        <div className="px-5 py-3 flex items-center gap-3">
          <a
            href={`https://github.com/${repo.full_name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 np-mono text-[11px] font-bold uppercase tracking-widest transition-colors"
            style={{ color: '#7A7874' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#111111' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#7A7874' }}
          >
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} /> Open on GitHub
          </a>

          <div className="flex-1" />

          <button
            onClick={handleSync}
            disabled={syncing || isActive}
            className="flex items-center gap-1.5 np-mono text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-colors disabled:opacity-40"
            style={{ color: '#111111' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#CC0000' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#111111' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing || isActive ? 'animate-spin' : ''}`} strokeWidth={2} />
            {syncing ? 'Syncing…' : 'Sync'}
          </button>

          <button
            onClick={() => setShowRemove(true)}
            className="flex items-center gap-1.5 np-mono text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-colors"
            style={{ color: '#AEABA6' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#DC2626' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#AEABA6' }}
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={2} /> Remove
          </button>
        </div>
      </div>

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
                  All indexed content for this repository will be deleted from the knowledge base. This cannot be undone.
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
                <button onClick={() => setShowRemove(false)} disabled={removing} className="btn-outline-ink w-full h-11 cursor-pointer">
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
