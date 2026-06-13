'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, CheckCircle2, ExternalLink, Link2Off, Loader2 } from 'lucide-react'
import { connectGitHubPAT, disconnectGitHub, getGitHubOAuthUrl } from '@/lib/githubApi'
import useAuthStore from '@/store/useAuthStore'

function GitHubLogo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function StepRow({ num, title, last = false }) {
  return (
    <div
      className="flex items-center gap-4 px-6 h-12"
      style={last ? {} : { borderBottom: '1px solid #E5E5E0' }}
    >
      <div className="w-6 h-6 shrink-0 flex items-center justify-center np-mono text-[11px] font-bold" style={{ backgroundColor: '#111111', color: '#F9F9F7', lineHeight: 1 }}>
        {num}
      </div>
      <p className="flex-1 np-body text-[13px]" style={{ color: '#111111' }}>{title}</p>
    </div>
  )
}

export default function GitHubConnectPanel({ status, onStatusChange }) {
  const user = useAuthStore((s) => s.user)
  const isOwner = user?.role === 'owner'

  const [mode, setMode] = useState('oauth')   // 'oauth' | 'pat'
  const [pat, setPat] = useState('')
  const [loading, setLoading] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')

  async function handleOAuth() {
    setLoading(true)
    setError('')
    try {
      const { redirect_url } = await getGitHubOAuthUrl()
      window.location.href = redirect_url
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  async function handlePAT(e) {
    e.preventDefault()
    if (!pat.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await connectGitHubPAT(pat.trim())
      setPat('')
      onStatusChange({ connected: true, github_username: res.github_username })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true)
    try {
      await disconnectGitHub()
      onStatusChange({ connected: false })
    } catch (err) {
      setError(err.message)
    } finally {
      setDisconnecting(false)
      setShowConfirm(false)
    }
  }

  if (status?.connected) {
    return (
      <div className="space-y-4 mt-6">
        {/* Connected card */}
        <div style={{ border: '1px solid #111111', boxShadow: '4px 4px 0px 0px #16A34A' }}>
          <div className="px-6 py-5" style={{ backgroundColor: '#F0FDF4', borderBottom: '1px solid #E5E5E0' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center shrink-0" style={{ backgroundColor: '#DCFCE7', border: '1px solid #BBF7D0' }}>
                <CheckCircle2 className="w-6 h-6" style={{ color: '#16A34A' }} strokeWidth={2} />
              </div>
              <div>
                <p className="np-serif text-[16px] font-black" style={{ color: '#15803D' }}>GitHub connected</p>
                {status.github_username && (
                  <p className="np-mono text-[11px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#4B9660' }}>@{status.github_username}</p>
                )}
              </div>
              <span className="ml-auto flex items-center gap-1.5 np-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1.5" style={{ backgroundColor: '#DCFCE7', color: '#16A34A', border: '1px solid #BBF7D0' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#16A34A' }} />
                Live
              </span>
            </div>
          </div>
          <div className="px-6 py-5" style={{ backgroundColor: '#F9F9F7' }}>
            <p className="np-body text-[13px] leading-[1.6]" style={{ color: '#737373' }}>
              Your GitHub account is connected. Go to your workspace to import repositories and start chatting with your code.
            </p>
          </div>
        </div>

        {/* Disconnect */}
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
              {disconnecting ? 'Disconnecting...' : 'Disconnect GitHub'}
            </button>

            <AnimatePresence>
              {showConfirm && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center px-4"
                  style={{ backgroundColor: 'rgba(10,10,12,0.60)', backdropFilter: 'blur(6px)' }}
                  onClick={(e) => { if (e.target === e.currentTarget) setShowConfirm(false) }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    className="w-full max-w-[420px] overflow-hidden"
                    style={{ background: '#F9F9F7', border: '1px solid #111111', boxShadow: '6px 6px 0px 0px #111111' }}
                  >
                    <div className="flex justify-center pt-8 pb-4">
                      <div className="w-16 h-16 flex items-center justify-center" style={{ backgroundColor: '#FEF2F2', border: '1px solid #E5E5E0' }}>
                        <Link2Off className="w-8 h-8" style={{ color: '#DC2626' }} strokeWidth={1.8} />
                      </div>
                    </div>
                    <div className="px-8 pb-6 text-center">
                      <h3 className="np-serif text-[18px] font-black mb-2" style={{ color: '#111111' }}>Disconnect GitHub?</h3>
                      <p className="np-body text-[14px] leading-[1.65]" style={{ color: '#737373' }}>
                        All imported repositories will be removed from the knowledge base. Previously created chats will remain.
                      </p>
                    </div>
                    <div className="px-8 pb-8 flex flex-col gap-3">
                      <button
                        onClick={handleDisconnect}
                        className="w-full h-12 text-white np-sans text-[13px] font-bold uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#DC2626' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#B91C1C' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#DC2626' }}
                      >
                        <Link2Off className="w-4 h-4" strokeWidth={2} /> Yes, disconnect
                      </button>
                      <button onClick={() => setShowConfirm(false)} className="btn-outline-ink w-full h-11 cursor-pointer">
                        Cancel
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
    <div className="mt-6 space-y-4">
      {/* Mode tabs */}
      <div className="flex" style={{ border: '1px solid #E5E5E0' }}>
        {['oauth', 'pat'].map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError('') }}
            className="flex-1 h-10 np-mono text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-colors"
            style={{
              backgroundColor: mode === m ? '#111111' : '#F9F9F7',
              color: mode === m ? '#F9F9F7' : '#7A7874',
              borderRight: m === 'oauth' ? '1px solid #E5E5E0' : 'none',
            }}
          >
            {m === 'oauth' ? 'Connect with GitHub' : 'Personal Access Token'}
          </button>
        ))}
      </div>

      {mode === 'oauth' && (
        <div style={{ border: '1px solid #E5E5E0', backgroundColor: '#F9F9F7' }}>
          <div className="px-6 py-4" style={{ backgroundColor: '#F0EDE6', borderBottom: '1px solid #E5E5E0' }}>
            <p className="np-mono text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#CC0000' }}>★ Recommended — One click</p>
          </div>
          <div className="p-6">
            <p className="np-body text-[13px] leading-[1.65] mb-5" style={{ color: '#3D3C3A' }}>
              Authorise AskBro on GitHub. This gives access to all your repos — public and private — plus any organisations you belong to. No token copying required.
            </p>
            {error && (
              <div className="px-4 py-3 mb-4" style={{ borderLeft: '3px solid #CC0000' }}>
                <p className="np-mono text-[12px] uppercase tracking-wide" style={{ color: '#CC0000' }}>{error}</p>
              </div>
            )}
            <button
              onClick={handleOAuth}
              disabled={loading}
              className="btn-ink w-full h-11 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> Redirecting to GitHub…</>
                : <><GitHubLogo size={16} /> Continue with GitHub</>
              }
            </button>
          </div>
        </div>
      )}

      {mode === 'pat' && (
        <div style={{ border: '1px solid #E5E5E0', backgroundColor: '#F9F9F7' }}>
          <div className="px-6 py-4" style={{ backgroundColor: '#F0EDE6', borderBottom: '1px solid #E5E5E0' }}>
            <p className="np-mono text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#CC0000' }}>★ Personal Access Token setup</p>
          </div>
          <div style={{ borderBottom: '1px solid #E5E5E0' }}>
            <StepRow num={1} title={<>Go to <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2 hover:text-[#AA0000]" style={{ color: '#CC0000' }}>github.com/settings/tokens</a></>} />
            <StepRow num={2} title={<>Click <strong>Generate new token (fine-grained)</strong></>} />
            <StepRow num={3} title={<>Under <strong>Repository access</strong>, select <strong>All repositories</strong></>} />
            <StepRow num={4} title={<>Under <strong>Permissions → Repository</strong>, enable <strong>Contents: Read-only</strong> and <strong>Metadata: Read-only</strong></>} />
            <StepRow num={5} title="Generate the token and copy it below" last />
          </div>
          <div className="p-6">
            <form onSubmit={handlePAT} className="space-y-4">
              <div>
                <label className="np-mono block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#111111' }}>Personal Access Token</label>
                <input
                  type="password"
                  value={pat}
                  onChange={(e) => { setPat(e.target.value); setError('') }}
                  placeholder="github_pat_xxxxxxxxxxxx"
                  required
                  className="auth-input"
                  style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '12px' }}
                />
                <div className="flex items-center gap-1.5 mt-2">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#16A34A', flexShrink: 0 }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <p className="np-body text-[11px]" style={{ color: '#16A34A' }}>Encrypted at rest and never shared.</p>
                </div>
              </div>
              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-3" style={{ borderLeft: '3px solid #CC0000' }}>
                  <p className="np-mono text-[12px] uppercase tracking-wide" style={{ color: '#CC0000' }}>{error}</p>
                </motion.div>
              )}
              <button
                type="submit"
                disabled={loading || !pat.trim()}
                className="btn-ink w-full h-11 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> Verifying…</>
                  : <>Connect GitHub <Check className="w-4 h-4" strokeWidth={2.5} /></>
                }
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
