'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Lock, Mail, KeyRound, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { adminLogin, adminVerifyOtp } from '@/lib/adminApi'


export default function AdminLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('askbro_admin_token')
      if (token) router.replace('/admin/dashboard')
    }
  }, [router])

  async function handleSendOtp(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await adminLogin(email, password)
      setStep('otp')
    } catch (err) {
      setError(err.message || 'Failed to send OTP.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await adminVerifyOtp(email, otp)
      localStorage.setItem('askbro_admin_token', data.access_token)
      router.push('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid OTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="newsprint-bg flex flex-col items-center justify-center px-4 py-16">

      {/* Card */}
      <div className="w-full max-w-[500px] border border-[#111111]" style={{ background: '#F9F9F7', boxShadow: '4px 4px 0px 0px #111111' }}>

        {/* Masthead header */}
        <div className="flex items-center justify-center gap-3 px-8 py-6 border-b border-[#111111]" style={{ background: '#111111' }}>
          <ShieldCheck className="w-5 h-5" style={{ color: '#CC0000' }} strokeWidth={1.5} />
          <span className="np-serif font-black text-[1.4rem] leading-none" style={{ color: '#F9F9F7' }}>Admin Access</span>
        </div>

        {/* Form body */}
        <div className="px-10 py-8">
          <p className="np-mono text-[9px] uppercase tracking-[0.2em] mb-4" style={{ color: '#CC0000' }}>★ Restricted Area</p>
          <h2 className="np-serif font-black mb-2" style={{ fontSize: '1.6rem', color: '#111111', lineHeight: 0.95 }}>
            {step === 'credentials' ? 'Sign In' : 'Verify OTP'}
          </h2>
          <p className="np-body text-[13px] mb-7" style={{ color: '#737373' }}>
            {step === 'credentials'
              ? 'Enter your admin credentials to receive a one-time password.'
              : `Enter the 6-digit OTP sent to ${email}`}
          </p>

          <AnimatePresence mode="wait">
            {step === 'credentials' ? (
              <motion.form
                key="credentials"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18 }}
                onSubmit={handleSendOtp}
                className="space-y-4"
              >
                <IconField label="Admin Email" Icon={Mail}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError('') }}
                    placeholder="admin@example.com"
                    required
                    autoComplete="email"
                    className="auth-input"
                    style={{ paddingLeft: '42px' }}
                  />
                </IconField>

                <div>
                  <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'rgba(0,0,0,0.75)' }}>
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Lock className="w-4 h-4" style={{ color: 'rgba(0,0,0,0.25)' }} strokeWidth={1.8} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError('') }}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="auth-input"
                      style={{ paddingLeft: '42px', paddingRight: '48px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer transition-colors hover:text-[#111111]"
                      style={{ color: '#A3A3A3' }}
                    >
                      {showPassword
                        ? <EyeOff className="w-4 h-4" strokeWidth={1.8} />
                        : <Eye className="w-4 h-4" strokeWidth={1.8} />
                      }
                    </button>
                  </div>
                </div>

                <ErrorMessage error={error} />

                <SubmitButton loading={loading}>
                  {loading ? 'Sending OTP…' : <>Send OTP <ArrowRight className="w-4 h-4" strokeWidth={2.5} /></>}
                </SubmitButton>

                <div className="flex items-center justify-center pt-1">
                  <Link
                    href="/login"
                    className="np-mono text-[9px] uppercase tracking-widest transition-colors hover:text-[#CC0000]"
                    style={{ color: '#A3A3A3' }}
                  >
                    ← Back to user sign in
                  </Link>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
                onSubmit={handleVerifyOtp}
                className="space-y-4"
              >
                <IconField label="One-Time Password" Icon={KeyRound}>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError('') }}
                    placeholder="123456"
                    required
                    autoComplete="one-time-code"
                    className="auth-input"
                    style={{ paddingLeft: '42px', letterSpacing: '0.2em', fontSize: '18px' }}
                  />
                </IconField>

                <ErrorMessage error={error} />

                <SubmitButton loading={loading}>
                  {loading ? 'Verifying…' : <>Verify & Login <ArrowRight className="w-4 h-4" strokeWidth={2.5} /></>}
                </SubmitButton>

                <button
                  type="button"
                  onClick={() => { setStep('credentials'); setOtp(''); setError('') }}
                  className="w-full text-center np-mono text-[9px] uppercase tracking-widest mt-1 transition-colors hover:text-[#CC0000]"
                  style={{ color: '#A3A3A3' }}
                >
                  ← Back to credentials
                </button>
              </motion.form>
            )}
          </AnimatePresence>
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

function ErrorMessage({ error }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="px-4 py-3"
          style={{ borderLeft: '3px solid #CC0000' }}
        >
          <p className="np-mono text-[11px] uppercase tracking-wide" style={{ color: '#CC0000' }}>{error}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function SubmitButton({ loading, children }) {
  return (
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
          {children}
        </>
      ) : children}
    </button>
  )
}
