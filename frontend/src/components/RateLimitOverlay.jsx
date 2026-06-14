'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Fun tips to rotate while the user waits ───────────────────────────────────
const TIPS = [
  'Pro tip: Speed-readers still need breaks. Even the internet does.',
  'Fun fact: The first rate limiter was invented to stop overeager robots.',
  'Use this moment to stretch. Your posture will thank you.',
  'AskBro is still here for you — just catching its breath.',
  'Good things come to those who wait. Great answers too.',
  'Did you know? The average human blinks 15–20 times per minute. Try it.',
  'Your next question is going to be legendary. We can feel it.',
]

// ── SVG ring countdown ────────────────────────────────────────────────────────
function RingTimer({ total, remaining }) {
  const R = 54
  const C = 2 * Math.PI * R
  const progress = total > 0 ? remaining / total : 0
  const dash = C * progress

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      {/* Track */}
      <circle
        cx="70" cy="70" r={R}
        fill="none"
        stroke="#E5E5E0"
        strokeWidth="8"
      />
      {/* Progress ring — red, counter-clockwise fill */}
      <circle
        cx="70" cy="70" r={R}
        fill="none"
        stroke="#CC0000"
        strokeWidth="8"
        strokeLinecap="square"
        strokeDasharray={`${dash} ${C}`}
        strokeDashoffset={0}
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke-dasharray 1s linear' }}
      />
      {/* Seconds label */}
      <text
        x="70" y="64"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="28"
        fontWeight="700"
        fill="#111111"
      >
        {remaining}
      </text>
      <text
        x="70" y="82"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="10"
        fill="#737373"
        letterSpacing="2"
      >
        SECONDS
      </text>
    </svg>
  )
}

// ── Animated ticker strip ─────────────────────────────────────────────────────
function Ticker({ text }) {
  return (
    <div
      className="overflow-hidden w-full"
      style={{ borderTop: '2px solid #CC0000', borderBottom: '2px solid #CC0000', background: '#CC0000' }}
    >
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        className="flex whitespace-nowrap"
        style={{ willChange: 'transform' }}
      >
        {[...Array(6)].map((_, i) => (
          <span
            key={i}
            className="np-mono text-[11px] tracking-widest uppercase px-8 py-1.5"
            style={{ color: '#ffffff' }}
          >
            {text} &nbsp;◆&nbsp;
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// ── Main overlay ──────────────────────────────────────────────────────────────
export default function RateLimitOverlay() {
  const [visible, setVisible] = useState(false)
  const [total, setTotal] = useState(60)
  const [remaining, setRemaining] = useState(60)
  const [tipIdx, setTipIdx] = useState(0)
  const intervalRef = useRef(null)
  const tipTimerRef = useRef(null)

  // Listen for the custom event fired by any API layer
  useEffect(() => {
    function onRateLimit(e) {
      const secs = e.detail?.retryAfter ?? 60
      setTotal(secs)
      setRemaining(secs)
      setTipIdx(Math.floor(Math.random() * TIPS.length))
      setVisible(true)
    }

    window.addEventListener('askbro:rate-limit', onRateLimit)
    return () => window.removeEventListener('askbro:rate-limit', onRateLimit)
  }, [])

  // Countdown tick
  useEffect(() => {
    if (!visible) return

    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current)
          setVisible(false)
          return 0
        }
        return r - 1
      })
    }, 1000)

    // Rotate tips every 8 seconds
    tipTimerRef.current = setInterval(() => {
      setTipIdx((i) => (i + 1) % TIPS.length)
    }, 8000)

    return () => {
      clearInterval(intervalRef.current)
      clearInterval(tipTimerRef.current)
    }
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-9998"
            style={{ background: 'rgba(5,5,6,0.72)', backdropFilter: 'blur(4px)' }}
          />

          {/* Card */}
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-9999 flex items-center justify-center p-4"
            role="alertdialog"
            aria-modal="true"
            aria-label="Rate limit reached"
          >
            <div
              className="w-full max-w-md"
              style={{
                background: '#F9F9F7',
                border: '3px solid #111111',
                boxShadow: '8px 8px 0 #111111',
              }}
            >
              {/* Header bar */}
              <div
                className="flex items-center justify-between px-4 py-2"
                style={{ borderBottom: '2px solid #111111', background: '#111111' }}
              >
                <span className="np-mono text-[10px] tracking-widest uppercase" style={{ color: '#737373' }}>
                  Ask<span style={{ color: '#CC0000' }}>Bro</span> Daily
                </span>
                <span className="np-mono text-[10px] tracking-widest uppercase" style={{ color: '#737373' }}>
                  Rate Limit Notice
                </span>
              </div>

              {/* Ticker */}
              <Ticker text="Slow down, speed-reader — you've hit your limit for now" />

              {/* Body */}
              <div className="px-6 pt-6 pb-4 flex flex-col items-center gap-4">
                {/* Headline */}
                <div className="text-center">
                  <p
                    className="np-mono text-[10px] tracking-widest uppercase mb-1"
                    style={{ color: '#CC0000' }}
                  >
                    ◆ Breaking News ◆
                  </p>
                  <h2
                    className="np-serif leading-tight"
                    style={{ fontSize: '28px', color: '#111111', fontWeight: '700' }}
                  >
                    Hold The Press!
                  </h2>
                  <p
                    className="np-body mt-1"
                    style={{ fontSize: '13px', color: '#737373', maxWidth: '300px' }}
                  >
                    You've been on a roll — too many requests in a short time.
                    Take a breather and we'll be right back.
                  </p>
                </div>

                {/* Ring timer */}
                <RingTimer total={total} remaining={remaining} />

                {/* Divider */}
                <div className="w-full" style={{ borderTop: '1px solid #E5E5E0' }} />

                {/* Rotating tip */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={tipIdx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.35 }}
                    className="np-body text-center px-2"
                    style={{ fontSize: '12px', color: '#737373', minHeight: '36px' }}
                  >
                    {TIPS[tipIdx]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ borderTop: '2px solid #111111', background: '#F9F9F7' }}
              >
                <span
                  className="np-mono text-[10px] tracking-wide"
                  style={{ color: '#AEABA6' }}
                >
                  Auto-resumes in {remaining}s
                </span>

                {/* Progress bar */}
                <div
                  className="flex-1 mx-4 overflow-hidden"
                  style={{ height: '4px', background: '#E5E5E0' }}
                >
                  <motion.div
                    style={{
                      height: '100%',
                      background: '#CC0000',
                      width: `${total > 0 ? (remaining / total) * 100 : 0}%`,
                      transition: 'width 1s linear',
                    }}
                  />
                </div>

                <button
                  onClick={() => setVisible(false)}
                  className="np-mono text-[10px] tracking-widest uppercase"
                  style={{ color: '#111111', textDecoration: 'underline', cursor: 'pointer' }}
                  aria-label="Dismiss rate limit notice"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
