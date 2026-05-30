'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Hash, ArrowRight } from 'lucide-react'
import { login } from '@/lib/api'
import useAuthStore from '@/store/useAuthStore'

// Subtle dot pattern for page bg — SVG data URI, no CSS gradient
const DOT_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%23D9D7D2' opacity='0.7'/%3E%3C/svg%3E")`

export default function LoginForm() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const [form, setForm] = useState({ workspace_code: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
            <IconField label="Workspace code" Icon={Hash}>
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
            </IconField>

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

            <div>
              <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#111110' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="w-4 h-4" style={{ color: '#AEABA6' }} strokeWidth={1.8} />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="auth-input"
                  style={{ paddingLeft: '42px', paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                  style={{ color: '#AEABA6' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#4A4845' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#AEABA6' }}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" strokeWidth={1.8} />
                    : <Eye className="w-4 h-4" strokeWidth={1.8} />
                  }
                </button>
              </div>
            </div>

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
