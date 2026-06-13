'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff, CheckCircle2, Mail, Lock, Building2, ArrowRight } from 'lucide-react'
import { createWorkspace, login } from '@/lib/api'
import useAuthStore from '@/store/useAuthStore'


// ── Helpers ───────────────────────────────────────────────────

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

function Field({ label, children }) {
  return (
    <div>
      <label className="np-mono text-[10px] font-semibold uppercase tracking-widest block mb-2" style={{ color: '#111111' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function ErrorAlert({ msg }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="px-4 py-3"
      style={{ borderLeft: '3px solid #CC0000' }}
    >
      <p className="np-mono text-[11px] uppercase tracking-wide" style={{ color: '#CC0000' }}>{msg}</p>
    </motion.div>
  )
}

function PrimaryButton({ children, type = 'button', onClick, loading, disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className="btn-ink w-full h-12 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40"
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
          <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  )
}

// ── Password strength ─────────────────────────────────────────

function getStrength(pw) {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

const STRENGTH_META = [
  null,
  { label: 'Weak',   color: '#CC0000' },
  { label: 'Fair',   color: '#D97706' },
  { label: 'Good',   color: '#525252' },
  { label: 'Strong', color: '#111111' },
]

function StrengthBar({ password }) {
  const s = getStrength(password)
  if (!password) return null
  const meta = STRENGTH_META[s] ?? STRENGTH_META[1]
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((seg) => (
          <div
            key={seg}
            className="flex-1 h-0.5 transition-colors duration-150"
            style={{ backgroundColor: s >= seg ? meta.color : '#E5E5E0' }}
          />
        ))}
      </div>
      <p className="np-mono text-[9px] uppercase tracking-widest mt-1.5" style={{ color: meta.color }}>
        {meta.label}
      </p>
    </div>
  )
}

// ── Step progress ─────────────────────────────────────────────

function StepProgress({ step }) {
  const steps = ['Workspace', 'Members', 'Confirm']
  const pct = ((step - 1) / (steps.length - 1)) * 100
  return (
    <div className="mb-8">
      <p className="np-mono text-[9px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#737373' }}>
        Step {step} of {steps.length}
      </p>
      <div className="relative h-0.5 mb-3" style={{ backgroundColor: '#E5E5E0' }}>
        <div
          className="absolute left-0 top-0 h-full transition-all duration-300 ease-out"
          style={{ width: `${pct}%`, background: '#CC0000' }}
        />
      </div>
      <div className="flex justify-between">
        {steps.map((label, i) => (
          <p
            key={label}
            className="np-mono text-[9px] uppercase tracking-widest"
            style={{
              color: i + 1 === step ? '#CC0000' : '#A3A3A3',
              fontWeight: i + 1 === step ? 700 : 400,
            }}
          >
            {label}
          </p>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────

export default function CreateWorkspaceForm() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)

  const [step, setStep] = useState(1)
  const [step1, setStep1] = useState({ name: '', owner_email: '', password: '', confirm: '' })
  const [memberEmails, setMemberEmails] = useState([''])
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleStep1Change(e) {
    setStep1((p) => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  function advanceStep1(e) {
    e.preventDefault()
    setError('')
    if (step1.password !== step1.confirm) { setError('Passwords do not match.'); return }
    if (step1.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setStep(2)
  }

  function addEmail() {
    if (memberEmails.length >= 5) return
    setMemberEmails((p) => [...p, ''])
  }

  function updateEmail(i, val) {
    setMemberEmails((p) => p.map((e, idx) => (idx === i ? val : e)))
  }

  function removeEmail(i) {
    if (memberEmails.length === 1) { setMemberEmails(['']); return }
    setMemberEmails((p) => p.filter((_, idx) => idx !== i))
  }

  async function handleCreate() {
    setError('')
    setLoading(true)
    try {
      const created = await createWorkspace({
        name: step1.name,
        owner_email: step1.owner_email,
        password: step1.password,
        member_emails: memberEmails.map((e) => e.trim()).filter(Boolean),
      })
      const { access_token } = await login({
        workspace_code: created.workspace_code,
        email: step1.owner_email,
        password: step1.password,
      })
      setUser(access_token)
      router.replace('/dashboard')
    } catch (err) {
      setError(err.message || 'Failed to create workspace.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="newsprint-bg flex flex-col items-center justify-center px-4 py-16"
    >
      {/* Card */}
      <div className="w-full max-w-[680px] border border-[#111111]" style={{ background: '#F9F9F7', boxShadow: '4px 4px 0px 0px #111111', borderTop: '3px solid #CC0000' }}>

        {/* Masthead header */}
        <div className="flex items-center justify-center gap-3 px-8 py-6 border-b border-[#111111]" style={{ background: '#111111' }}>
          <img src="/AskBro_Logo.png" alt="AskBro" className="h-7 w-7 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
          <span className="np-serif font-black text-[1.5rem] leading-none" style={{ color: '#F9F9F7' }}>AskBro</span>
        </div>

        {/* Form body */}
        <div className="px-10 py-9">
          <p className="np-mono text-[9px] uppercase tracking-[0.2em] mb-6" style={{ color: '#CC0000' }}>★ New Workspace</p>
          <StepProgress step={step} />

          <AnimatePresence mode="wait">

            {/* Step 1 — workspace details */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                onSubmit={advanceStep1}
                className="space-y-4"
              >
                <IconField label="Workspace name" Icon={Building2}>
                  <input
                    name="name"
                    value={step1.name}
                    onChange={handleStep1Change}
                    placeholder="Acme Corp"
                    required
                    className="auth-input"
                    style={{ paddingLeft: '42px' }}
                  />
                </IconField>

                <IconField label="Your email" Icon={Mail}>
                  <input
                    name="owner_email"
                    type="email"
                    value={step1.owner_email}
                    onChange={handleStep1Change}
                    placeholder="you@company.com"
                    required
                    className="auth-input"
                    style={{ paddingLeft: '42px' }}
                  />
                </IconField>

                <div>
                  <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'rgba(0,0,0,0.75)' }}>
                    Workspace password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Lock className="w-4 h-4" style={{ color: 'rgba(0,0,0,0.25)' }} strokeWidth={1.8} />
                    </div>
                    <input
                      name="password"
                      type={showPw ? 'text' : 'password'}
                      value={step1.password}
                      onChange={handleStep1Change}
                      placeholder="Choose a strong password"
                      required
                      className="auth-input"
                      style={{ paddingLeft: '42px', paddingRight: '48px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer transition-colors hover:text-[#111111]"
                      style={{ color: '#A3A3A3' }}
                    >
                      {showPw
                        ? <EyeOff className="w-4 h-4" strokeWidth={1.8} />
                        : <Eye className="w-4 h-4" strokeWidth={1.8} />
                      }
                    </button>
                  </div>
                  <StrengthBar password={step1.password} />
                </div>

                <IconField label="Confirm password" Icon={Lock}>
                  <input
                    name="confirm"
                    type="password"
                    value={step1.confirm}
                    onChange={handleStep1Change}
                    placeholder="Re-enter password"
                    required
                    className="auth-input"
                    style={{ paddingLeft: '42px' }}
                  />
                </IconField>

                <AnimatePresence>
                  {error && <ErrorAlert msg={error} />}
                </AnimatePresence>

                <PrimaryButton type="submit">
                  Continue <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </PrimaryButton>
              </motion.form>
            )}

            {/* Step 2 — invite members */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <AnimatePresence>
                    {memberEmails.map((email, i) => (
                      <motion.div
                        key={i}
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => updateEmail(i, e.target.value)}
                          placeholder="teammate@company.com"
                          className="auth-input flex-1"
                        />
                        {memberEmails.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEmail(i)}
                            className="w-9 h-9 flex items-center justify-center text-lg leading-none cursor-pointer transition-colors hover:text-[#CC0000]"
                            style={{ color: '#A3A3A3' }}
                          >
                            ×
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {memberEmails.length < 5 && (
                  <button
                    type="button"
                    onClick={addEmail}
                    className="np-mono text-[10px] uppercase tracking-widest cursor-pointer hover:text-[#CC0000] transition-colors"
                    style={{ color: '#111111' }}
                  >
                    + Add another
                  </button>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn-outline-ink flex-1 h-12 cursor-pointer"
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn-ink flex-1 h-12 cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3 — confirm & create */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="space-y-5"
              >
                <div className="border border-[#111111]">
                  {[
                    ['Workspace', step1.name],
                    ['Owner', step1.owner_email],
                    ['Members', `${memberEmails.filter((e) => e.trim()).length} invited`],
                  ].map(([label, value], i, arr) => (
                    <div
                      key={label}
                      className="flex items-center justify-between px-5 py-3"
                      style={{
                        background: i % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent',
                        borderBottom: i < arr.length - 1 ? '1px solid #E5E5E0' : 'none',
                      }}
                    >
                      <span className="np-mono text-[9px] uppercase tracking-widest" style={{ color: '#737373' }}>{label}</span>
                      <span className="np-sans text-[12px] font-semibold" style={{ color: '#111111' }}>
                        {value || '—'}
                      </span>
                    </div>
                  ))}
                </div>

                <AnimatePresence>
                  {error && <ErrorAlert msg={error} />}
                </AnimatePresence>

                <PrimaryButton onClick={handleCreate} loading={loading}>
                  {loading ? 'Creating...' : 'Create workspace'}
                </PrimaryButton>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full np-mono text-[9px] uppercase tracking-widest cursor-pointer transition-colors hover:text-[#CC0000]"
                  style={{ color: '#A3A3A3' }}
                >
                  ← Back
                </button>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Footer link */}
          <div className="mt-6 pt-6 border-t border-[#E5E5E0] text-center">
            <p className="np-mono text-[10px] uppercase tracking-widest" style={{ color: '#737373' }}>
              Already have a workspace?{' '}
              <Link href="/login" className="font-bold hover:text-[#CC0000] transition-colors" style={{ color: '#111111' }}>
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
