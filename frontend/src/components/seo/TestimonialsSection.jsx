'use client'

import { useEffect, useState } from 'react'
import { X, Loader2, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react'
import { fetchApprovedTestimonials, submitTestimonial } from '@/lib/testimonialsApi'

// ── Static seed cards shown while loading / as minimum floor ─────────────────

const STATIC = [
  { id: 's1', quote: 'Cut my study time in half. The flashcard generation from my lecture notes is genuinely magic.', name: 'Sarah A.', role: 'CS Student, Univ. of Edinburgh', initials: 'SA', stars: 5 },
  { id: 's2', quote: 'Onboarded 3 developers to a new codebase in 2 days. Previously that took two full weeks.',      name: 'James M.', role: 'Engineering Lead',               initials: 'JM', stars: 5 },
  { id: 's3', quote: 'Landed my dream role after 2 weeks of interview prep with AskBro. The feedback is brutally honest.', name: 'Riya K.', role: 'Software Engineer',          initials: 'RK', stars: 5 },
]

// ── Star picker ───────────────────────────────────────────────────────────────

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="text-[22px] cursor-pointer transition-transform hover:scale-110"
          style={{ color: n <= (hovered || value) ? '#CC0000' : '#D9D7D2', lineHeight: 1 }}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

// ── Submit modal ──────────────────────────────────────────────────────────────

function SubmitModal({ onClose, onSuccess }) {
  const [form, setForm]     = useState({ quote: '', name: '', role: '', stars: 5 })
  const [submitting, setSub] = useState(false)
  const [error, setError]   = useState('')

  function set(key, val) { setForm((f) => ({ ...f, [key]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.quote.trim() || !form.name.trim() || !form.role.trim()) {
      setError('All fields are required.')
      return
    }
    if (form.quote.trim().length < 20) {
      setError('Quote must be at least 20 characters.')
      return
    }
    setSub(true)
    setError('')
    try {
      await submitTestimonial({
        quote: form.quote.trim(),
        name:  form.name.trim(),
        role:  form.role.trim(),
        stars: form.stars,
      })
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setSub(false)
    }
  }

  const inputBase = {
    padding: '9px 12px',
    backgroundColor: '#F9F9F7',
    border: '1.5px solid #E5E5E0',
    color: '#111111',
    width: '100%',
    outline: 'none',
    fontSize: '13px',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }

  function focusStyle(e)  { e.currentTarget.style.borderColor = '#111111'; e.currentTarget.style.boxShadow = '2px 2px 0 #111111' }
  function blurStyle(e)   { e.currentTarget.style.borderColor = '#E5E5E0'; e.currentTarget.style.boxShadow = 'none' }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(17,17,17,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg flex flex-col"
        style={{ backgroundColor: '#F9F9F7', border: '2px solid #111111', maxHeight: '90vh', overflow: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: '1px solid #E5E5E0', backgroundColor: '#F0EDE6' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: '#111111' }}>
              <MessageSquare className="w-4 h-4" style={{ color: '#CC0000' }} strokeWidth={2} />
            </div>
            <div>
              <p className="np-mono text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#CC0000' }}>★ Share Your Story</p>
              <p className="np-sans text-[13px] font-semibold" style={{ color: '#111111' }}>Submit a testimonial</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center cursor-pointer transition-colors"
            style={{ color: '#AEABA6' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E5E5E0'; e.currentTarget.style.color = '#111111' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '#AEABA6' }}
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Stars */}
          <div>
            <label className="np-mono text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: '#737373' }}>
              Rating
            </label>
            <StarPicker value={form.stars} onChange={(v) => set('stars', v)} />
          </div>

          {/* Quote */}
          <div>
            <label className="np-mono text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: '#737373' }}>
              Your experience *
              <span className="ml-2 normal-case font-normal" style={{ color: '#AEABA6' }}>({form.quote.length}/500)</span>
            </label>
            <textarea
              rows={4}
              value={form.quote}
              onChange={(e) => set('quote', e.target.value)}
              maxLength={500}
              placeholder="What has AskBro helped you achieve? Be specific — your words inspire others."
              style={{ ...inputBase, resize: 'none' }}
              onFocus={focusStyle}
              onBlur={blurStyle}
            />
          </div>

          {/* Name + Role row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="np-mono text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: '#737373' }}>Name *</label>
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                maxLength={100}
                placeholder="Sarah A."
                style={inputBase}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
            <div>
              <label className="np-mono text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: '#737373' }}>Role *</label>
              <input
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
                maxLength={100}
                placeholder="Software Engineer"
                style={inputBase}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
              <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: '#DC2626' }} strokeWidth={2} />
              <p className="np-mono text-[11px] uppercase tracking-wide" style={{ color: '#DC2626' }}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-between pt-1">
            <p className="np-mono text-[10px]" style={{ color: '#AEABA6' }}>
              Reviews appear after a quick moderation check.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="h-10 px-6 np-sans text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer disabled:opacity-40 transition-opacity hover:opacity-85"
              style={{ backgroundColor: '#CC0000', color: '#F9F9F7', border: '2px solid #CC0000' }}
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Success toast ─────────────────────────────────────────────────────────────

function SuccessBanner({ onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 flex items-center gap-3 px-5 py-3.5 -translate-x-1/2"
      style={{ backgroundColor: '#111111', border: '2px solid #CC0000', minWidth: 320 }}
    >
      <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#CC0000' }} strokeWidth={2} />
      <p className="np-sans text-[13px]" style={{ color: '#F9F9F7' }}>
        Thank you! Your testimonial will appear after review.
      </p>
      <button onClick={onClose} className="ml-auto cursor-pointer" style={{ color: '#737373' }}>
        <X className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  )
}

// ── Testimonial card ──────────────────────────────────────────────────────────

function TestimonialCard({ quote, name, role, initials, stars, index }) {
  const isMiddle = index === 1

  return (
    <div
      className="flex flex-col p-8"
      style={{
        background: '#fff',
        border: '1px solid #E5E5E0',
        boxShadow: isMiddle ? '0 8px 32px rgba(0,0,0,0.08)' : '0 2px 12px rgba(0,0,0,0.04)',
        transform: isMiddle ? 'translateY(-8px)' : 'none',
      }}
    >
      {/* Stars */}
      <div className="flex gap-1 mb-5">
        {Array.from({ length: stars }).map((_, s) => (
          <span key={s} style={{ color: '#CC0000', fontSize: '14px' }}>★</span>
        ))}
      </div>

      {/* Quote */}
      <p className="np-body text-[15px] leading-relaxed flex-1 mb-7" style={{ color: '#404040' }}>
        "{quote}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-5" style={{ borderTop: '1px solid #F0F0EE' }}>
        <div
          className="w-10 h-10 shrink-0 flex items-center justify-center np-sans text-[12px] font-bold"
          style={{ background: isMiddle ? '#CC0000' : '#111111', color: '#F9F9F7', borderRadius: 0 }}
        >
          {initials}
        </div>
        <div>
          <p className="np-sans text-[13px] font-semibold" style={{ color: '#111111' }}>{name}</p>
          <p className="np-mono text-[9px] uppercase mt-0.5" style={{ letterSpacing: '0.1em', color: '#A3A3A3' }}>{role}</p>
        </div>
      </div>
    </div>
  )
}

// ── Main exported section ─────────────────────────────────────────────────────

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState(STATIC)
  const [showModal, setShowModal]       = useState(false)
  const [showSuccess, setShowSuccess]   = useState(false)

  useEffect(() => {
    fetchApprovedTestimonials()
      .then((data) => {
        // Prefer live data; fall back to static seeds if nothing is approved yet
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data)
        }
      })
      .catch(() => { /* keep static fallback silently */ })
  }, [])

  function handleSuccess() {
    setShowModal(false)
    setShowSuccess(true)
  }

  // Show at most 3 cards in the same visual row the page always had
  const visible = testimonials.slice(0, 3)

  return (
    <>
      <section className="mt-10" style={{ background: '#F9F9F7', borderBottom: '4px solid #111111' }}>
        <div className="mx-auto max-w-screen-xl px-6 py-16 md:py-20">

          {/* Section header */}
          <div className="flex items-center gap-5 mb-14">
            <span className="np-mono text-[9px] uppercase" style={{ letterSpacing: '0.2em', color: '#CC0000' }}>§ 04</span>
            <h2 className="np-serif font-black" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', color: '#111111' }}>User Testimonials</h2>
            <div className="flex-1 h-px bg-[#111111] hidden md:block" />
          </div>

          {/* Cards grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {visible.map((t, i) => (
              <TestimonialCard key={t.id} index={i} {...t} />
            ))}
          </div>

          {/* Bottom row — trust line + CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12">
            <p className="np-mono text-[10px] uppercase" style={{ letterSpacing: '0.15em', color: '#A3A3A3' }}>
              Joining 2,400+ workspaces worldwide · Rated 4.9 ★
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 np-sans text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-colors hover:border-[#CC0000] hover:text-[#CC0000]"
              style={{ color: '#111111', border: '2px solid #111111' }}
            >
              <MessageSquare className="w-3.5 h-3.5" strokeWidth={2.5} />
              Share your experience
            </button>
          </div>

        </div>
      </section>

      {showModal  && <SubmitModal onClose={() => setShowModal(false)} onSuccess={handleSuccess} />}
      {showSuccess && <SuccessBanner onClose={() => setShowSuccess(false)} />}
    </>
  )
}
