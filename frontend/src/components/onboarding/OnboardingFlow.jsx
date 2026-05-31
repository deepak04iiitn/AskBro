'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, UploadCloud, MessageSquare,
  BadgeCheck, ArrowRight, ChevronLeft, ShieldCheck,
  FileSearch, Users, Quote, Puzzle,
} from 'lucide-react'

const DOT_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%23D9D7D2' opacity='0.7'/%3E%3C/svg%3E")`

// ── Step definitions ──────────────────────────────────────────

const STEPS = [
  {
    Icon: Bot,
    iconBg: '#EEF1FD',
    iconColor: '#4361EE',
    badge: 'Welcome',
    headline: 'Your team\'s knowledge,\nnow searchable.',
    body: 'AskBro turns your documents into a living knowledge base. Upload once — your entire team can ask questions and get cited answers instantly.',
    visual: 'benefits',
  },
  {
    Icon: MessageSquare,
    iconBg: '#F0FDF4',
    iconColor: '#16A34A',
    badge: 'How it works',
    headline: 'Three steps.\nZero friction.',
    body: null,
    visual: 'steps',
  },
  {
    Icon: BadgeCheck,
    iconBg: '#FFF7ED',
    iconColor: '#D97706',
    badge: 'Ready',
    headline: "You're all set!",
    body: 'Your workspace is live. Upload a document or connect Notion to start — every answer will cite exactly where it came from.',
    visual: 'cta',
  },
]

const BENEFITS = [
  {
    Icon: FileSearch,
    title: 'Instant answers from your docs',
    desc: 'No more digging — just ask and get the answer in seconds',
    iconColor: '#4361EE',
    iconBg: '#EEF1FD',
  },
  {
    Icon: Quote,
    title: 'Every answer cites its source',
    desc: 'Responses link directly to the exact file and page',
    iconColor: '#7C3AED',
    iconBg: '#F5F3FF',
  },
  {
    Icon: Users,
    title: 'Shared across your whole team',
    desc: 'One workspace — everyone gets access to the same knowledge',
    iconColor: '#D97706',
    iconBg: '#FFF7ED',
  },
]

const HOW_IT_WORKS = [
  {
    num: '01',
    Icon: UploadCloud,
    title: 'Upload or import from Notion',
    desc: 'PDF, DOCX, TXT — or pull pages straight from your Notion workspace',
    iconColor: '#4361EE',
    iconBg: '#EEF1FD',
  },
  {
    num: '02',
    Icon: MessageSquare,
    title: 'Ask in plain English',
    desc: 'No keywords or Boolean syntax — just ask naturally',
    iconColor: '#7C3AED',
    iconBg: '#F5F3FF',
  },
  {
    num: '03',
    Icon: ShieldCheck,
    title: 'Get cited answers',
    desc: 'Every response traces back to its exact source file',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4',
  },
]

// ── Slide variants ────────────────────────────────────────────

const variants = {
  enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center:         { x: 0, opacity: 1 },
  exit:  (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
}

const transition = { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }

// ── Main component ────────────────────────────────────────────

export default function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const dir = useRef(1)

  function goNext() {
    if (step < STEPS.length - 1) {
      dir.current = 1
      setStep((s) => s + 1)
    } else {
      finish()
    }
  }

  function goBack() {
    if (step > 0) {
      dir.current = -1
      setStep((s) => s - 1)
    }
  }

  function finish() {
    try { localStorage.setItem('askbro_onboarded', '1') } catch {}
    router.replace('/dashboard')
  }

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ backgroundColor: '#F7F5F2', backgroundImage: DOT_BG }}
    >
      {/* Skip */}
      {!isLast && (
        <button
          onClick={finish}
          className="absolute top-6 right-8 text-[13px] font-medium transition-colors cursor-pointer"
          style={{ color: '#AEABA6' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#4A4845' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#AEABA6' }}
        >
          Skip →
        </button>
      )}

      {/* Card */}
      <div
        className="w-full max-w-[680px] bg-white rounded-3xl overflow-hidden"
        style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.10), 0 6px 16px rgba(0,0,0,0.06)' }}
      >
        <AnimatePresence mode="wait" custom={dir.current}>
          <motion.div
            key={step}
            custom={dir.current}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
          >
            {/* ── Hero section ─────────────────────────────── */}
            <div
              className="flex flex-col items-center justify-center px-12 py-12"
              style={{ backgroundColor: current.iconBg, borderBottom: '1px solid rgba(0,0,0,0.06)' }}
            >
              {/* Badge */}
              <span
                className="text-[11px] font-bold uppercase tracking-[0.12em] px-3 py-1 rounded-full mb-6"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  color: current.iconColor,
                  border: `1px solid ${current.iconColor}22`,
                }}
              >
                {current.badge}
              </span>

              {/* Icon */}
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center"
                style={{
                  backgroundColor: 'white',
                  boxShadow: `0 8px 32px ${current.iconColor}30`,
                }}
              >
                <current.Icon
                  className="w-12 h-12"
                  style={{ color: current.iconColor }}
                  strokeWidth={1.6}
                />
              </div>
            </div>

            {/* ── Content section ───────────────────────────── */}
            <div className="px-12 py-9">
              <h2
                className="font-bold tracking-[-0.02em] mb-3 whitespace-pre-line"
                style={{ fontSize: '26px', color: '#111110', lineHeight: 1.2 }}
              >
                {current.headline}
              </h2>

              {current.body && (
                <p className="text-[15px] leading-[1.7] mb-8" style={{ color: '#4A4845' }}>
                  {current.body}
                </p>
              )}

              {/* Step 1 — Benefits */}
              {current.visual === 'benefits' && (
                <div className="space-y-3 mb-8">
                  {BENEFITS.map(({ Icon, title, desc, iconColor, iconBg }) => (
                    <div
                      key={title}
                      className="flex items-center gap-4 px-4 py-3.5 rounded-xl"
                      style={{ backgroundColor: '#F7F5F2', border: '1px solid #E3E1DC' }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: iconBg }}
                      >
                        <Icon className="w-5 h-5" style={{ color: iconColor }} strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold" style={{ color: '#111110' }}>{title}</p>
                        <p className="text-[12px] mt-0.5" style={{ color: '#7A7874' }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 2 — How it works cards */}
              {current.visual === 'steps' && (
                <div className="space-y-3 mb-8">
                  {HOW_IT_WORKS.map(({ num, Icon, title, desc, iconColor, iconBg }) => (
                    <div
                      key={num}
                      className="flex items-center gap-4 px-4 py-3.5 rounded-xl"
                      style={{ backgroundColor: '#F7F5F2', border: '1px solid #E3E1DC' }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: iconBg }}
                      >
                        <Icon className="w-5 h-5" style={{ color: iconColor }} strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold" style={{ color: '#111110' }}>{title}</p>
                        <p className="text-[12px] mt-0.5" style={{ color: '#7A7874' }}>{desc}</p>
                      </div>
                      <span
                        className="ml-auto text-[11px] font-bold tabular-nums shrink-0"
                        style={{ color: '#D9D7D2' }}
                      >
                        {num}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 3 — CTA trio */}
              {current.visual === 'cta' && (
                <div className="flex flex-col gap-3 mb-8">
                  <button
                    onClick={() => { finish(); router.replace('/upload') }}
                    className="w-full h-12 text-white text-[14px] font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-colors"
                    style={{ backgroundColor: '#4361EE' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#3451D6' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#4361EE' }}
                  >
                    Upload my first document
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => { finish(); router.replace('/integrations') }}
                    className="w-full h-11 text-[14px] font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-colors"
                    style={{ backgroundColor: '#EEF1FD', border: '1.5px solid #C7D2FE', color: '#4361EE' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#4361EE'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#4361EE' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#EEF1FD'; e.currentTarget.style.color = '#4361EE'; e.currentTarget.style.borderColor = '#C7D2FE' }}
                  >
                    <Puzzle className="w-4 h-4" strokeWidth={1.8} />
                    Connect Notion
                  </button>
                  <button
                    onClick={finish}
                    className="w-full h-11 text-[14px] font-medium rounded-xl cursor-pointer transition-colors"
                    style={{ border: '1.5px solid #E3E1DC', color: '#7A7874', backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F7F5F2' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    Go to dashboard
                  </button>
                </div>
              )}

              {/* ── Navigation ──────────────────────────────── */}
              <div className="flex items-center justify-between mt-2">
                {/* Back */}
                <button
                  onClick={goBack}
                  disabled={step === 0}
                  className="flex items-center gap-1.5 text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-0"
                  style={{ color: '#AEABA6' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#4A4845' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#AEABA6' }}
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                  Back
                </button>

                {/* Progress dots */}
                <div className="flex items-center gap-2">
                  {STEPS.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        width: i === step ? 24 : 8,
                        backgroundColor: i === step ? '#4361EE' : '#D9D7D2',
                      }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="h-2 rounded-full cursor-pointer"
                      onClick={() => {
                        dir.current = i > step ? 1 : -1
                        setStep(i)
                      }}
                    />
                  ))}
                </div>

                {/* Next / Finish */}
                {current.visual !== 'cta' && (
                  <button
                    onClick={goNext}
                    className="flex items-center gap-1.5 text-[13px] font-semibold transition-colors cursor-pointer"
                    style={{ color: '#4361EE' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#3451D6' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#4361EE' }}
                  >
                    {isLast ? 'Get started' : 'Next'}
                    <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                )}

                {/* Spacer when CTA step (no next button) */}
                {current.visual === 'cta' && <div className="w-16" />}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step counter */}
      <p className="mt-5 text-[12px]" style={{ color: '#AEABA6' }}>
        {step + 1} of {STEPS.length}
      </p>
    </div>
  )
}
