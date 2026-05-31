'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Lock, Mail, KeyRound, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { adminLogin, adminVerifyOtp } from '@/lib/adminApi'

const DOT_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%23D9D7D2' opacity='0.7'/%3E%3C/svg%3E")`

export default function AdminLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState('credentials') // 'credentials' | 'otp'
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
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#F7F5F2', backgroundImage: DOT_BG }}
    >
      <div
        className="w-full max-w-[600px] bg-white rounded-3xl overflow-hidden"
        style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.10), 0 6px 16px rgba(0,0,0,0.06)' }}
      >
        {/* Logo header */}
        <div
          className="flex justify-center px-12 py-10"
          style={{ backgroundColor: '#EEF1FD', borderBottom: '1px solid #DDE3F8' }}
        >
          <img
            src="/AskBro_Logo.png"
            alt="AskBro"
            className="h-20 w-auto mix-blend-multiply"
          />
        </div>

        {/* Form body */}
        <div className="px-10 py-8">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#EEF1FD' }}
            >
              <Lock className="w-3.5 h-3.5" style={{ color: '#4361EE' }} strokeWidth={2} />
            </div>
            <h2
              className="font-bold tracking-[-0.02em]"
              style={{ fontSize: '20px', color: '#111110' }}
            >
              Admin Access
            </h2>
          </div>
          <p className="text-[13px] mb-7" style={{ color: '#6B6865' }}>
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
                  <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#111110' }}>
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Lock className="w-4 h-4" style={{ color: '#AEABA6' }} strokeWidth={1.8} />
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

                <ErrorMessage error={error} />

                <SubmitButton loading={loading}>
                  {loading ? 'Sending OTP…' : <>Send OTP <ArrowRight className="w-4 h-4" strokeWidth={2.5} /></>}
                </SubmitButton>

                <div className="flex items-center justify-center pt-1">
                  <Link
                    href="/login"
                    className="text-[12px] font-medium transition-colors"
                    style={{ color: '#AEABA6' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#4361EE' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#AEABA6' }}
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
                  className="w-full text-center text-[13px] mt-1"
                  style={{ color: '#AEABA6' }}
                >
                  Back to credentials
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

function ErrorMessage({ error }) {
  return (
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
  )
}

function SubmitButton({ loading, children }) {
  return (
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
          {children}
        </>
      ) : children}
    </button>
  )
}
