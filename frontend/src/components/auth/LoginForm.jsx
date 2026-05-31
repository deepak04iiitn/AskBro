'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Mail, Hash, ArrowRight, HelpCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { login, forgotWorkspaceCode } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import useAuthStore from '@/store/useAuthStore'

// Subtle dot pattern for page bg — SVG data URI, no CSS gradient
const DOT_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%23D9D7D2' opacity='0.7'/%3E%3C/svg%3E")`

export default function LoginForm() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const [form, setForm] = useState({ workspace_code: '', email: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Forgot code state
  const [showForgot, setShowForgot]           = useState(false)
  const [forgotEmail, setForgotEmail]         = useState('')
  const [forgotPassword, setForgotPassword]   = useState('')
  const [showForgotPw, setShowForgotPw]       = useState(false)
  const [forgotError, setForgotError]         = useState('')
  const [forgotSuccess, setForgotSuccess]     = useState('')
  const [forgotLoading, setForgotLoading]     = useState(false)

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

  // Redirect already-authenticated users away from the login page
  useEffect(() => {
    if (isAuthenticated()) {
      const seen = localStorage.getItem('askbro_onboarded')
      router.replace(seen ? '/dashboard' : '/onboarding')
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
      const seen = localStorage.getItem('askbro_onboarded')
      router.push(seen ? '/dashboard' : '/onboarding')
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#F7F5F2', backgroundImage: DOT_BG }}
    >
      {/* Card */}
      <div
        className="w-full max-w-[660px] bg-white rounded-3xl overflow-hidden"
        style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.10), 0 6px 16px rgba(0,0,0,0.06)' }}
      >
        {/* ── Tinted logo header ─────────────────────────────── */}
        <div
          className="flex justify-center px-12 py-8"
          style={{ backgroundColor: '#EEF1FD', borderBottom: '1px solid #DDE3F8' }}
        >
          <img
            src="/AskBro_Logo.png"
            alt="AskBro"
            className="h-28 w-auto mix-blend-multiply"
          />
        </div>

        {/* ── Form body ──────────────────────────────────────── */}
        <div className="px-12 py-9">
          <h2
            className="font-bold tracking-[-0.02em] mb-1"
            style={{ fontSize: '24px', color: '#111110' }}
          >
            Welcome back
          </h2>
          <p className="text-[13px] mb-8" style={{ color: '#6B6865' }}>
            Sign in to your workspace to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Workspace code with "Forgot?" link */}
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label className="block text-[13px] font-semibold" style={{ color: '#111110' }}>Workspace code</label>
                <button type="button" onClick={() => { setShowForgot((v) => !v); setForgotError(''); setForgotSuccess('') }}
                  className="flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer" style={{ color: '#AEABA6' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#4361EE' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#AEABA6' }}>
                  <HelpCircle className="w-3 h-3" strokeWidth={2} />
                  Forgot your code?
                </button>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Hash className="w-4 h-4" style={{ color: '#AEABA6' }} strokeWidth={1.8} />
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
                  className="rounded-r-lg px-4 py-3"
                  style={{ backgroundColor: '#FEF2F2', borderLeft: '3px solid #DC2626' }}
                >
                  <p className="text-[13px]" style={{ color: '#DC2626' }}>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-white text-[14px] font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-colors disabled:opacity-40 mt-2"
              style={{ backgroundColor: '#4361EE' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#3451D6' }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#4361EE' }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.99)' }}
              onMouseUp={(e) => { e.currentTarget.style.transform = '' }}
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
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </>
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
                <div className="rounded-2xl p-5" style={{ backgroundColor: '#F7F5F2', border: '1.5px solid #E3E1DC' }}>
                  <p className="text-[13px] font-semibold mb-1" style={{ color: '#111110' }}>Retrieve workspace code</p>
                  <p className="text-[12px] mb-4" style={{ color: '#7A7874' }}>
                    Enter your owner email and workspace password. If verified, our admin will contact you shortly with your code.
                  </p>

                  {forgotSuccess ? (
                    <div className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#16A34A' }} strokeWidth={2} />
                      <p className="text-[13px] font-medium" style={{ color: '#15803D' }}>{forgotSuccess}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleForgot} className="space-y-3">
                      <input type="email" value={forgotEmail} onChange={(e) => { setForgotEmail(e.target.value); setForgotError('') }}
                        placeholder="Owner email" required className="auth-input" />
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
                          style={{ color: '#AEABA6' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#4A4845' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#AEABA6' }}
                        >
                          {showForgotPw
                            ? <EyeOff className="w-4 h-4" strokeWidth={1.8} />
                            : <Eye className="w-4 h-4" strokeWidth={1.8} />
                          }
                        </button>
                      </div>
                      {forgotError && (
                        <div className="rounded-r-lg px-3 py-2.5" style={{ backgroundColor: '#FEF2F2', borderLeft: '3px solid #DC2626' }}>
                          <p className="text-[12px]" style={{ color: '#DC2626' }}>{forgotError}</p>
                        </div>
                      )}
                      <button type="submit" disabled={forgotLoading}
                        className="w-full h-10 text-white text-[13px] font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                        style={{ backgroundColor: '#4361EE' }}
                        onMouseEnter={(e) => { if (!forgotLoading) e.currentTarget.style.backgroundColor = '#3451D6' }}
                        onMouseLeave={(e) => { if (!forgotLoading) e.currentTarget.style.backgroundColor = '#4361EE' }}>
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
            <div className="flex-1 h-px" style={{ backgroundColor: '#E3E1DC' }} />
            <span className="text-[12px]" style={{ color: '#7A7874' }}>or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#E3E1DC' }} />
          </div>

          {/* Secondary CTA */}
          <Link
            href="/create"
            className="w-full h-11 flex items-center justify-center gap-1.5 text-[13px] font-semibold rounded-xl transition-colors"
            style={{ border: '1.5px solid #E3E1DC', color: '#4361EE', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#EEF1FD'
              e.currentTarget.style.borderColor = '#C7D2FE'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.borderColor = '#E3E1DC'
            }}
          >
            Create a workspace
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </Link>

          {/* Admin login — separated by a divider */}
          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ backgroundColor: '#E3E1DC' }} />
            <span className="text-[12px]" style={{ color: '#AEABA6' }}>admin</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#E3E1DC' }} />
          </div>
          <Link
            href="/admin/login"
            className="block mt-4 text-[13px] font-semibold text-center transition-colors"
            style={{ color: '#4361EE' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#3451D6' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#4361EE' }}
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
      <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#111110' }}>
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon className="w-4 h-4" style={{ color: '#AEABA6' }} strokeWidth={1.8} />
        </div>
        {children}
      </div>
    </div>
  )
}
