'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Mail, Hash, ArrowRight, HelpCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { login, forgotWorkspaceCode } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import useAuthStore from '@/store/useAuthStore'


export default function LoginForm() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const [form, setForm] = useState({ workspace_code: '', email: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [showForgot, setShowForgot]         = useState(false)
  const [forgotEmail, setForgotEmail]       = useState('')
  const [forgotPassword, setForgotPassword] = useState('')
  const [showForgotPw, setShowForgotPw]     = useState(false)
  const [forgotError, setForgotError]       = useState('')
  const [forgotSuccess, setForgotSuccess]   = useState('')
  const [forgotLoading, setForgotLoading]   = useState(false)

  async function handleForgot(e) {
    e.preventDefault()
    setForgotError('')
    setForgotSuccess('')
    setForgotLoading(true)
    try {
      const data = await forgotWorkspaceCode(forgotEmail, forgotPassword)
      setForgotSuccess(data.message)
    } catch (err) {
      setForgotError(err.message)
    } finally {
      setForgotLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard')
    }
  }, [router])

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(form)
      setUser(data.access_token)
      router.push('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="newsprint-bg flex flex-col items-center justify-center px-4 py-16">

      {/* Card */}
      <div className="w-full max-w-[680px] border border-[#111111]" style={{ background: '#F9F9F7', boxShadow: '4px 4px 0px 0px #111111', borderTop: '3px solid #CC0000' }}>

        {/* Masthead header */}
        <div className="flex items-center justify-center gap-3 px-8 py-6 border-b border-[#111111]" style={{ background: '#111111' }}>
          <span className="np-serif font-black text-[1.5rem] leading-none" style={{ color: '#F9F9F7' }}>Ask<span style={{ color: '#CC0000' }}>Bro</span></span>
        </div>

        {/* Form body */}
        <div className="px-10 py-9">
          <p className="np-mono text-[9px] uppercase tracking-[0.2em] mb-2" style={{ color: '#CC0000' }}>★ Member Access</p>
          <h2 className="np-serif font-black mb-1" style={{ fontSize: '1.8rem', color: '#111111', lineHeight: 0.95 }}>
            Welcome Back
          </h2>
          <p className="np-body text-[13px] mt-3 mb-8" style={{ color: '#737373' }}>
            Sign in to your workspace to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Workspace code */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label className="np-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#111111' }}>
                  Workspace code
                </label>
                <button
                  type="button"
                  onClick={() => { setShowForgot((v) => !v); setForgotError(''); setForgotSuccess('') }}
                  className="np-mono text-[9px] uppercase tracking-widest flex items-center gap-1 transition-colors cursor-pointer hover:text-[#CC0000]"
                  style={{ color: '#A3A3A3' }}
                >
                  <HelpCircle className="w-3 h-3" strokeWidth={1.5} />
                  Forgot your code?
                </button>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Hash className="w-4 h-4" style={{ color: 'rgba(0,0,0,0.25)' }} strokeWidth={1.8} />
                </div>
                <input
                  name="workspace_code"
                  value={form.workspace_code}
                  onChange={handleChange}
                  placeholder="WSP-XXXX"
                  required
                  autoComplete="off"
                  className="auth-input"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <IconField label="Email" Icon={Mail}>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                required
                autoComplete="email"
                className="auth-input"
                style={{ paddingLeft: '42px' }}
              />
            </IconField>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="px-4 py-3"
                  style={{ background: 'transparent', borderLeft: '3px solid #CC0000' }}
                >
                  <p className="np-mono text-[12px] uppercase tracking-wide" style={{ color: '#CC0000' }}>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="btn-ink w-full h-12 cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-40"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" strokeWidth={2.5} /></>
              )}
            </button>
          </form>

          {/* Forgot workspace code panel */}
          <AnimatePresence>
            {showForgot && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="overflow-hidden mt-5"
              >
                <div className="p-5 border border-[#111111]" style={{ background: 'rgba(0,0,0,0.02)' }}>
                  <p className="np-sans text-[12px] font-semibold mb-1 uppercase tracking-widest" style={{ color: '#111111' }}>
                    Retrieve workspace code
                  </p>
                  <p className="np-body text-[12px] mb-4" style={{ color: '#737373' }}>
                    Enter your owner email and workspace password. If verified, our admin will contact you shortly with your code.
                  </p>

                  {forgotSuccess ? (
                    <div
                      className="flex items-start gap-3 rounded-xl px-4 py-3"
                      style={{ background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(74,222,128,0.25)' }}
                    >
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#16A34A' }} strokeWidth={2} />
                      <p className="text-[13px] font-medium" style={{ color: '#16A34A' }}>{forgotSuccess}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleForgot} className="space-y-3">
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => { setForgotEmail(e.target.value); setForgotError('') }}
                        placeholder="Owner email"
                        required
                        className="auth-input"
                      />
                      <div className="relative">
                        <input
                          type={showForgotPw ? 'text' : 'password'}
                          value={forgotPassword}
                          onChange={(e) => { setForgotPassword(e.target.value); setForgotError('') }}
                          placeholder="Workspace password"
                          required
                          className="auth-input pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowForgotPw((v) => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                          style={{ color: 'rgba(0,0,0,0.3)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#09090B' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(0,0,0,0.3)' }}
                        >
                          {showForgotPw
                            ? <EyeOff className="w-4 h-4" strokeWidth={1.8} />
                            : <Eye className="w-4 h-4" strokeWidth={1.8} />
                          }
                        </button>
                      </div>
                      {forgotError && (
                        <div
                          className="rounded-r-lg px-3 py-2.5"
                          style={{ background: 'rgba(220,38,38,0.07)', borderLeft: '3px solid #F87171' }}
                        >
                          <p className="text-[12px]" style={{ color: '#DC2626' }}>{forgotError}</p>
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="btn-ink w-full h-10 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40"
                      >
                        {forgotLoading ? 'Sending…' : <>Notify admin <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} /></>}
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E5E5E0]" />
            <span className="np-mono text-[10px] uppercase tracking-widest" style={{ color: '#A3A3A3' }}>or</span>
            <div className="flex-1 h-px bg-[#E5E5E0]" />
          </div>

          {/* Secondary CTA */}
          <Link
            href="/create"
            className="btn-outline-ink w-full h-11 flex items-center justify-center gap-1.5"
          >
            Create a workspace
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
          </Link>

          {/* Admin login */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E5E5E0]" />
            <span className="np-mono text-[10px] uppercase tracking-widest" style={{ color: '#A3A3A3' }}>admin</span>
            <div className="flex-1 h-px bg-[#E5E5E0]" />
          </div>
          <Link
            href="/admin/login"
            className="block mt-4 np-mono text-[10px] uppercase tracking-widest text-center transition-colors hover:text-[#CC0000]"
            style={{ color: '#737373' }}
          >
            Admin Login →
          </Link>
        </div>
      </div>
    </div>
  )
}

function IconField({ label, Icon, children }) {
  return (
    <div>
      <label className="np-mono text-[10px] font-semibold uppercase tracking-widest block mb-2" style={{ color: '#111111' }}>
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon className="w-4 h-4" style={{ color: '#A3A3A3' }} strokeWidth={1.5} />
        </div>
        {children}
      </div>
    </div>
  )
}
