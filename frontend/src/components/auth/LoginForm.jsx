'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { login } from '@/lib/api'
import useAuthStore from '@/store/useAuthStore'


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
      router.push('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F5F2' }}>

      {/* ── Main ────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-8 py-14">
        <div className="w-full max-w-[1100px]">
          <div className="flex gap-0">

            {/* Left: logo + context + product excerpt */}
            <div
              className="hidden lg:flex w-[55%] flex-col pr-20"
              style={{ borderRight: '1px solid #E3E1DC' }}
            >
              {/* Logo */}
              <div className="mb-7 flex justify-center">
                <img src="/AskBro_Logo.png" alt="AskBro" className="h-50 w-auto mix-blend-multiply" />
              </div>

              <h2
                className="font-bold leading-[1.1] tracking-[-0.03em] mb-5"
                style={{ fontSize: '40px', color: '#111110' }}
              >
                Ask once.<br />Know forever.
              </h2>
              <p className="text-[15px] leading-[1.7] mb-5" style={{ color: '#7A7874' }}>
                Upload your team's documents. Ask questions in plain English. Every answer cites its exact source.
              </p>
              <p className="text-[15px] leading-[1.7]" style={{ color: '#7A7874' }}>
                Every workspace is private and isolated — only the members you invite can access your documents and conversation history.
              </p>
            </div>

            {/* Right: form */}
            <div className="flex-1 lg:pl-20">
              {/* Mobile logo */}
              <div className="lg:hidden mb-10">
                <img src="/AskBro_Logo.png" alt="AskBro" className="h-10 w-auto mix-blend-multiply" />
              </div>

              {/* Mirrors the step heading style from CreateWorkspaceForm */}
              <p className="text-[11px] mb-3" style={{ color: '#AEABA6' }}>
                Sign in to your workspace
              </p>
              <div className="relative h-px mb-8" style={{ backgroundColor: '#E3E1DC' }}>
                <div className="absolute left-0 top-0 h-full" style={{ width: '100%', backgroundColor: '#4361EE' }} />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Workspace code">
                  <input
                    name="workspace_code"
                    value={form.workspace_code}
                    onChange={handleChange}
                    placeholder="WSP-XXXX"
                    required
                    autoComplete="off"
                    className="auth-input"
                  />
                </Field>

                <Field label="Email">
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    required
                    autoComplete="email"
                    className="auth-input"
                  />
                </Field>

                <Field label="Password">
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="auth-input pr-14"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-medium cursor-pointer"
                      style={{ color: '#AEABA6' }}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </Field>

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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 text-white text-[14px] font-semibold rounded-lg cursor-pointer flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
                  style={{ backgroundColor: '#4361EE' }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#3451D6' }}
                  onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#4361EE' }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.99)' }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = '' }}
                >
                  {loading && (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  )}
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex-1 h-px" style={{ backgroundColor: '#E3E1DC' }} />
                <span className="text-[12px]" style={{ color: '#AEABA6' }}>or</span>
                <div className="flex-1 h-px" style={{ backgroundColor: '#E3E1DC' }} />
              </div>

              <p className="mt-5 text-[13px]" style={{ color: '#AEABA6' }}>
                New to AskBro?{' '}
                <Link href="/create" className="font-medium hover:underline" style={{ color: '#4361EE' }}>
                  Create a workspace →
                </Link>
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="px-10 py-5 shrink-0" style={{ borderTop: '1px solid #E3E1DC' }}>
        <p className="text-[13px]" style={{ color: '#AEABA6' }}>
          Need help?{' '}
          <span className="font-medium" style={{ color: '#7A7874' }}>
            Contact your workspace admin.
          </span>
        </p>
      </footer>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#3D3C3A' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
