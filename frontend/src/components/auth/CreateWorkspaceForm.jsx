'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff, Check, Mail, Lock, Building2, Users, ArrowRight } from 'lucide-react'
import { createWorkspace, login } from '@/lib/api'
import useAuthStore from '@/store/useAuthStore'

const DOT_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%23D9D7D2' opacity='0.7'/%3E%3C/svg%3E")`

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
  { label: 'Weak',   color: '#DC2626' },
  { label: 'Fair',   color: '#D97706' },
  { label: 'Good',   color: '#4361EE' },
  { label: 'Strong', color: '#16A34A' },
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
            className="flex-1 h-[3px] rounded-full transition-colors duration-150"
            style={{ backgroundColor: s >= seg ? meta.color : '#E3E1DC' }}
          />
        ))}
      </div>
      <p className="text-[11px] font-medium mt-1.5" style={{ color: meta.color }}>
        {meta.label}
      </p>
    </div>
  )
}

// ── Step progress indicator ───────────────────────────────────

function StepProgress({ step }) {
  const steps = ['Workspace', 'Members', 'Confirm']
  const pct = ((step - 1) / (steps.length - 1)) * 100
  return (
    <div className="mb-8">
      <p className="text-[12px] font-medium mb-3" style={{ color: '#6B6865' }}>
        Step {step} of {steps.length}
      </p>
      <div className="relative h-px mb-3" style={{ backgroundColor: '#E3E1DC' }}>
        <div
          className="absolute left-0 top-0 h-full transition-all duration-300 ease-out"
          style={{ width: `${pct}%`, backgroundColor: '#4361EE' }}
        />
      </div>
      <div className="flex justify-between">
        {steps.map((label, i) => (
          <p
            key={label}
            className="text-[11px]"
            style={{
              color: i + 1 === step ? '#111110' : '#7A7874',
              fontWeight: i + 1 === step ? 600 : 400,
            }}
          >
            {label}
          </p>
        ))}
      </div>
    </div>
  )
}

// ── Shared primitives ─────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#111110' }}>
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
      className="rounded-r-lg px-4 py-3"
      style={{ backgroundColor: '#FEF2F2', borderLeft: '3px solid #DC2626' }}
    >
      <p className="text-[13px]" style={{ color: '#DC2626' }}>{msg}</p>
    </motion.div>
  )
}

function PrimaryButton({ children, type = 'button', onClick, loading, disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className="w-full h-12 text-white text-[14px] font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
      style={{ backgroundColor: '#4361EE' }}
      onMouseEnter={(e) => { if (!loading && !disabled) e.currentTarget.style.backgroundColor = '#3451D6' }}
      onMouseLeave={(e) => { if (!loading && !disabled) e.currentTarget.style.backgroundColor = '#4361EE' }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.99)' }}
      onMouseUp={(e) => { e.currentTarget.style.transform = '' }}
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

// ── Step context copy ─────────────────────────────────────────

const CONTEXT = [
  {
    num: "01",
    heading: ["Set up your", "workspace."],
    tagline: "Your private environment for team knowledge.",
    benefits: [
      "Fully isolated from other workspaces",
      "One shared password for your whole team",
      "Unique workspace code generated on creation",
      "Full admin control from the dashboard",
    ],
  },
  {
    num: "02",
    heading: ["Invite your", "team."],
    tagline: "Add members now or any time later.",
    benefits: [
      "Members log in with the shared workspace code",
      "No individual passwords to manage",
      "Add or remove members from the dashboard",
      "Up to unlimited team members",
    ],
  },
  {
    num: "03",
    heading: ["Everything", "looks right?"],
    tagline: "One click away from your workspace.",
    benefits: [
      "Workspace code shared with your team instantly",
      "Start uploading documents right away",
      "Password and members editable anytime",
      "All settings accessible from the dashboard",
    ],
  },
]

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

  const ctx = CONTEXT[step - 1]

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
        {/* Tinted logo header */}
        <div
          className="flex justify-center px-12 py-8"
          style={{ backgroundColor: '#EEF1FD', borderBottom: '1px solid #DDE3F8' }}
        >
          <img src="/AskBro_Logo.png" alt="AskBro" className="h-28 w-auto mix-blend-multiply" />
        </div>

        {/* Form body */}
        <div className="px-12 py-9">
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
                      <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#111110' }}>
                        Workspace password
                      </label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                          <Lock className="w-4 h-4" style={{ color: '#AEABA6' }} strokeWidth={1.8} />
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
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                          style={{ color: '#AEABA6' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#4A4845' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#AEABA6' }}
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
                                className="w-9 h-9 flex items-center justify-center text-lg leading-none rounded-lg cursor-pointer transition-colors"
                                style={{ color: '#7A7874' }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = '#DC2626'
                                  e.currentTarget.style.backgroundColor = '#FEF2F2'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = '#AEABA6'
                                  e.currentTarget.style.backgroundColor = ''
                                }}
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
                        className="text-[13px] font-medium cursor-pointer hover:underline"
                        style={{ color: '#4361EE' }}
                      >
                        + Add another
                      </button>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="flex-1 h-12 text-[14px] font-medium rounded-xl cursor-pointer transition-colors"
                        style={{ border: '1.5px solid #E3E1DC', color: '#7A7874', backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F0EFEC' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        Skip
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="flex-1 h-12 text-white text-[14px] font-semibold rounded-xl cursor-pointer transition-colors"
                        style={{ backgroundColor: '#4361EE' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#3451D6' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#4361EE' }}
                        onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.99)' }}
                        onMouseUp={(e) => { e.currentTarget.style.transform = '' }}
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
                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E3E1DC' }}>
                      {[
                        ['Workspace', step1.name],
                        ['Owner', step1.owner_email],
                        ['Members', `${memberEmails.filter((e) => e.trim()).length} invited`],
                      ].map(([label, value], i, arr) => (
                        <div
                          key={label}
                          className="flex items-center justify-between px-5 py-4"
                          style={{
                            backgroundColor: '#F4F3F0',
                            borderBottom: i < arr.length - 1 ? '1px solid #E3E1DC' : 'none',
                          }}
                        >
                          <span className="text-[12px]" style={{ color: '#7A7874' }}>{label}</span>
                          <span className="text-[14px] font-semibold" style={{ color: '#111110' }}>
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
                      className="w-full text-[13px] cursor-pointer transition-colors"
                      style={{ color: '#7A7874' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#7A7874' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#AEABA6' }}
                    >
                      ← Back
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>

          {/* Footer link — inside card */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ backgroundColor: '#E3E1DC' }} />
            <p className="text-[13px] shrink-0" style={{ color: '#6B6865' }}>
              Already have a workspace?{' '}
              <Link href="/login" className="font-medium hover:underline" style={{ color: '#4361EE' }}>
                Sign in →
              </Link>
            </p>
            <div className="flex-1 h-px" style={{ backgroundColor: '#E3E1DC' }} />
          </div>

        </div>{/* end form body */}
      </div>{/* end card */}
    </div>
  )
}
