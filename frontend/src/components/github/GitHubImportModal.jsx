'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitBranch, Lock, Search, X, Loader2, ArrowLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { importRepo, listAvailableRepos, listRepoBranches } from '@/lib/githubApi'
import useGitHubStore from '@/store/useGitHubStore'

const DEFAULT_EXTS    = ['.md', '.py', '.ts', '.tsx', '.js', '.jsx', '.go', '.rs', '.java', '.yaml', '.yml', '.toml', '.json', '.sh', '.sql']
const DEFAULT_EXCLUDE = ['node_modules', 'dist', 'build', '.next', '__pycache__', '.venv', 'vendor', 'coverage']

const SLIDE = {
  initial:    { opacity: 0, x: 24 },
  animate:    { opacity: 1, x: 0  },
  exit:       { opacity: 0, x: -24 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
}
const SLIDE_BACK = {
  initial:    { opacity: 0, x: -24 },
  animate:    { opacity: 1, x: 0   },
  exit:       { opacity: 0, x: 24  },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
}

function Toggle({ checked, onChange, label, sublabel }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none py-1">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative shrink-0 transition-colors mt-0.5"
        style={{ width: 34, height: 18, backgroundColor: checked ? '#111111' : '#D5D2CC', borderRadius: 9 }}
      >
        <span
          className="absolute top-px transition-transform"
          style={{
            left: 2, width: 14, height: 14,
            backgroundColor: '#F9F9F7', borderRadius: '50%',
            transform: checked ? 'translateX(16px)' : 'translateX(0)',
          }}
        />
      </button>
      <div className="flex-1 min-w-0">
        <span className="np-body text-[13px]" style={{ color: '#111111' }}>{label}</span>
        {sublabel && <p className="np-mono text-[10px] mt-0.5" style={{ color: '#AEABA6' }}>{sublabel}</p>}
      </div>
    </label>
  )
}

export default function GitHubImportModal({ onClose, onImported, onImportStarted }) {
  const addRepo      = useGitHubStore((s) => s.addRepo)
  const startPolling = useGitHubStore((s) => s.startPolling)

  // Step: 'pick' | 'configure'
  const [step, setStep]             = useState('pick')
  const [slideDir, setSlideDir]     = useState('forward')

  const [repos, setRepos]           = useState([])
  const [filtered, setFiltered]     = useState([])
  const [search, setSearch]         = useState('')
  const [selected, setSelected]     = useState(null)
  const [loadingRepos, setLoadingRepos] = useState(true)
  const [importing, setImporting]   = useState(false)
  const [error, setError]           = useState('')

  const [branch, setBranch]             = useState('main')
  const [branches, setBranches]         = useState([])
  const [loadingBranches, setLoadingBranches] = useState(false)
  const [includeIssues, setIncludeIssues]   = useState(false)
  const [includePRs, setIncludePRs]         = useState(false)
  const [includeCommits, setIncludeCommits] = useState(true)
  const [autoSync, setAutoSync]             = useState(false)

  useEffect(() => {
    listAvailableRepos()
      .then((r) => { setRepos(r); setFiltered(r) })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingRepos(false))
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(repos.filter((r) => r.full_name.toLowerCase().includes(q)))
  }, [search, repos])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function pickRepo(repo) {
    setSelected(repo)
    setBranch(repo.default_branch || 'main')
    setBranches([])
    setSlideDir('forward')
    setStep('configure')
    // fetch branches in background
    setLoadingBranches(true)
    try {
      const list = await listRepoBranches(repo.owner, repo.repo_name)
      setBranches(list)
      // ensure selected branch is valid; default_branch is always in the list
      if (!list.includes(repo.default_branch)) setBranch(list[0] ?? 'main')
    } catch {
      // silently fall back to text input if fetch fails
    } finally {
      setLoadingBranches(false)
    }
  }

  function backToPick() {
    setSlideDir('back')
    setStep('pick')
    setError('')
  }

  async function handleImport() {
    if (!selected) return
    setImporting(true)
    setError('')
    try {
      const res = await importRepo({
        owner: selected.owner,
        repo_name: selected.repo_name,
        branch,
        include_issues: includeIssues,
        include_prs: includePRs,
        include_commits: includeCommits,
        auto_sync: autoSync,
        filters: {
          include_extensions: DEFAULT_EXTS,
          exclude_dirs: DEFAULT_EXCLUDE,
          max_file_size_kb: 500,
          include_paths: [],
        },
      })
      addRepo({
        repo_id: res.repo_id,
        full_name: res.full_name,
        owner: selected.owner,
        repo_name: selected.repo_name,
        private: selected.private,
        status: 'pending',
        files_indexed: 0, issues_indexed: 0, prs_indexed: 0, commits_indexed: 0,
        include_issues: includeIssues,
        include_prs: includePRs,
        include_commits: includeCommits,
        auto_sync: autoSync,
        default_branch: branch,
      })
      startPolling(res.repo_id)
      onImported?.()
      onImportStarted?.(selected.repo_name)
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setImporting(false)
    }
  }

  const currentSlide = slideDir === 'forward' ? SLIDE : SLIDE_BACK

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(10,10,12,0.35)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        key="panel"
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 36 }}
        className="fixed inset-y-0 right-0 z-50 flex flex-col overflow-hidden"
        style={{ width: 440, backgroundColor: '#F9F9F7', borderLeft: '2px solid #111111' }}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div
          className="shrink-0 px-6 pt-6 pb-4"
          style={{ borderBottom: '1px solid #E5E5E0', backgroundColor: '#F0EDE6' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {step === 'configure' && (
                <button
                  onClick={backToPick}
                  className="w-7 h-7 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                  style={{ color: '#AEABA6' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#111111' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#AEABA6' }}
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                </button>
              )}
              <div className="min-w-0">
                <p className="np-mono text-[9px] font-bold uppercase tracking-[0.2em] mb-0.5" style={{ color: '#CC0000' }}>
                  {step === 'pick' ? '★ Step 1 of 2 — Choose' : '★ Step 2 of 2 — Configure'}
                </p>
                <h2 className="np-serif text-[19px] font-black leading-tight truncate" style={{ color: '#111111' }}>
                  {step === 'pick' ? 'Choose a repository' : selected?.repo_name}
                </h2>
                {step === 'configure' && (
                  <p className="np-mono text-[10px] mt-0.5 truncate" style={{ color: '#7A7874' }}>
                    {selected?.full_name}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center cursor-pointer transition-colors mt-0.5 shrink-0"
              style={{ color: '#AEABA6' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E5E5E0'; e.currentTarget.style.color = '#111111' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '#AEABA6' }}
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* ── Body (animated between steps) ──────────────────── */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait" initial={false}>

            {/* ── STEP 1: Pick ─────────────────────────────── */}
            {step === 'pick' && (
              <motion.div
                key="pick"
                {...currentSlide}
                className="absolute inset-0 flex flex-col"
              >
                {/* Search */}
                <div className="px-6 py-4 shrink-0" style={{ borderBottom: '1px solid #E5E5E0' }}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#AEABA6' }} strokeWidth={1.8} />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search repositories…"
                      autoFocus
                      className="w-full pl-8 pr-4 h-9 np-mono text-[12px] outline-none"
                      style={{ border: '1px solid #E5E5E0', backgroundColor: '#F9F9F7', color: '#111111' }}
                    />
                  </div>
                </div>

                {/* Repo list */}
                <div className="flex-1 overflow-y-auto">
                  {loadingRepos ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#CC0000' }} strokeWidth={2} />
                    </div>
                  ) : filtered.length === 0 ? (
                    <p className="np-body text-[13px] text-center py-12" style={{ color: '#AEABA6' }}>No repositories found.</p>
                  ) : (
                    filtered.map((repo) => {
                      const isImported = repo.already_imported
                      return (
                        <button
                          key={repo.full_name}
                          onClick={() => { if (!isImported) pickRepo(repo) }}
                          disabled={isImported}
                          className="w-full flex items-center gap-3 px-6 py-3.5 text-left transition-colors cursor-pointer disabled:cursor-default"
                          style={{
                            borderBottom: '1px solid #F0EDE6',
                            opacity: isImported ? 0.45 : 1,
                          }}
                          onMouseEnter={(e) => { if (!isImported) e.currentTarget.style.backgroundColor = '#F5F2EB' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        >
                          <GitBranch className="w-4 h-4 shrink-0" style={{ color: '#AEABA6' }} strokeWidth={1.8} />
                          <div className="flex-1 min-w-0">
                            <p className="np-sans text-[13px] font-semibold truncate" style={{ color: '#111111' }}>
                              {repo.full_name}
                            </p>
                            {repo.description && (
                              <p className="np-body text-[11px] truncate mt-0.5" style={{ color: '#7A7874' }}>
                                {repo.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {repo.private && <Lock className="w-3.5 h-3.5" style={{ color: '#AEABA6' }} strokeWidth={1.8} />}
                            {isImported
                              ? <span className="np-mono text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5" style={{ backgroundColor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>Imported</span>
                              : <ChevronRight className="w-3.5 h-3.5" style={{ color: '#D5D2CC' }} strokeWidth={2} />
                            }
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Configure ────────────────────────── */}
            {step === 'configure' && (
              <motion.div
                key="configure"
                {...currentSlide}
                className="absolute inset-0 overflow-y-auto"
              >
                <div className="px-6 py-6 space-y-6">

                  {/* Branch */}
                  <div>
                    <label className="np-mono block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#111111' }}>
                      Branch
                    </label>
                    {loadingBranches ? (
                      <div
                        className="w-full h-10 flex items-center gap-2 px-3"
                        style={{ border: '1px solid #E5E5E0', backgroundColor: '#F9F9F7' }}
                      >
                        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" style={{ color: '#AEABA6' }} strokeWidth={2} />
                        <span className="np-mono text-[12px]" style={{ color: '#AEABA6' }}>Loading branches…</span>
                      </div>
                    ) : branches.length > 0 ? (
                      <div className="relative">
                        <select
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          className="w-full h-10 pl-3 pr-8 np-mono text-[13px] outline-none appearance-none cursor-pointer"
                          style={{ border: '1px solid #E5E5E0', backgroundColor: '#F9F9F7', color: '#111111' }}
                        >
                          {branches.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                        <ChevronDown
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                          style={{ color: '#AEABA6' }}
                          strokeWidth={2}
                        />
                      </div>
                    ) : (
                      <input
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        placeholder="main"
                        className="w-full px-3 h-10 np-mono text-[13px] outline-none"
                        style={{ border: '1px solid #E5E5E0', backgroundColor: '#F9F9F7', color: '#111111' }}
                      />
                    )}
                  </div>

                  {/* What to include */}
                  <div>
                    <p className="np-mono text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#111111' }}>
                      What to include
                    </p>
                    <div style={{ border: '1px solid #E5E5E0', backgroundColor: '#FAFAF8' }}>
                      {/* Always-on: code files */}
                      <div
                        className="px-4 py-3 flex items-start gap-3"
                        style={{ borderBottom: '1px solid #E5E5E0', backgroundColor: '#F0FDF4' }}
                      >
                        <div
                          className="relative shrink-0 mt-0.5"
                          style={{ width: 34, height: 18, backgroundColor: '#16A34A', borderRadius: 9 }}
                        >
                          <span
                            className="absolute top-px"
                            style={{ left: 'auto', right: 2, width: 14, height: 14, backgroundColor: '#F9F9F7', borderRadius: '50%' }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="np-body text-[13px]" style={{ color: '#111111' }}>Code &amp; Documentation</span>
                            <span className="np-mono text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5" style={{ backgroundColor: '#DCFCE7', color: '#16A34A', border: '1px solid #BBF7D0' }}>Always on</span>
                          </div>
                          <p className="np-mono text-[10px] mt-0.5" style={{ color: '#AEABA6' }}>All code files, configs and docs — always included</p>
                        </div>
                      </div>

                      {[
                        { checked: includeCommits, onChange: setIncludeCommits, label: 'Commit history', sublabel: 'Ask who changed what, when, and why — blame queries' },
                        { checked: includeIssues,  onChange: setIncludeIssues,  label: 'Issues',          sublabel: 'Chat with issue discussions and comments' },
                        { checked: includePRs,     onChange: setIncludePRs,     label: 'Pull Requests',   sublabel: 'Chat with PR descriptions and review threads' },
                      ].map(({ checked, onChange, label, sublabel }, i, arr) => (
                        <div key={label} className="px-4 py-3" style={i < arr.length - 1 ? { borderBottom: '1px solid #E5E5E0' } : {}}>
                          <Toggle checked={checked} onChange={onChange} label={label} sublabel={sublabel} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Auto sync */}
                  <div style={{ border: '1px solid #E5E5E0', backgroundColor: '#FAFAF8' }}>
                    <div className="px-4 py-3">
                      <Toggle
                        checked={autoSync}
                        onChange={setAutoSync}
                        label="Auto daily sync"
                        sublabel="Keep this repo up to date automatically"
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="px-4 py-3" style={{ backgroundColor: '#F5F0E8', borderLeft: '3px solid #CC0000' }}>
                    <p className="np-mono text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#CC0000' }}>Ready to import</p>
                    <p className="np-body text-[12px] leading-[1.6]" style={{ color: '#3D3C3A' }}>
                      <strong>{selected?.full_name}</strong> · branch <strong>{branch || 'main'}</strong>
                      {' · code'}
                      {includeCommits && ' · commits'}
                      {includeIssues && ' · issues'}
                      {includePRs && ' · PRs'}
                      {autoSync && ' · auto-sync'}
                    </p>
                  </div>

                  {error && (
                    <div className="px-4 py-3" style={{ borderLeft: '3px solid #CC0000' }}>
                      <p className="np-mono text-[12px] uppercase tracking-wide" style={{ color: '#CC0000' }}>{error}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div
          className="shrink-0 px-6 py-4"
          style={{ borderTop: '1px solid #E5E5E0', backgroundColor: '#F9F9F7' }}
        >
          {step === 'pick' ? (
            <button
              onClick={onClose}
              className="btn-outline-ink w-full h-10 cursor-pointer np-mono text-[11px] font-bold uppercase tracking-widest"
            >
              Cancel
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={backToPick}
                className="btn-outline-ink h-10 flex-1 cursor-pointer np-mono text-[11px] font-bold uppercase tracking-widest"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                className="btn-ink h-10 flex-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 np-mono text-[11px] font-bold uppercase tracking-widest"
              >
                {importing
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} /> Starting…</>
                  : 'Import repository'
                }
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}
