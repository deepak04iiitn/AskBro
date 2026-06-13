'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, AlertTriangle, X, ShieldAlert } from 'lucide-react'

export default function WorkspaceCodeModal({ code, onClose }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ backgroundColor: 'rgba(10,10,12,0.72)', backdropFilter: 'blur(6px)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
          style={{ maxWidth: 560, backgroundColor: '#F9F9F7', border: '2px solid #111111', boxShadow: '8px 8px 0px 0px #111111' }}
        >

          {/* ── Header ──────────────────────────────────────────── */}
          <div
            className="px-8 pt-7 pb-6 flex items-start gap-4"
            style={{ borderBottom: '1px solid #E5E5E0', backgroundColor: '#111111' }}
          >
            <div
              className="w-12 h-12 flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#CC0000', border: '1px solid #CC0000' }}
            >
              <ShieldAlert className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="np-mono text-[9px] font-bold uppercase tracking-[0.22em] mb-1" style={{ color: '#CC0000' }}>
                ★ Important — Read Before Continuing
              </p>
              <h2 className="np-serif font-black text-[22px] leading-tight" style={{ color: '#F9F9F7' }}>
                Save Your Workspace Code
              </h2>
            </div>
          </div>

          {/* ── Body ────────────────────────────────────────────── */}
          <div className="px-8 py-7 space-y-6">

            {/* Warning banner */}
            <div
              className="flex items-start gap-3 px-5 py-4"
              style={{ backgroundColor: '#FEF2F2', border: '1.5px solid #FECACA' }}
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#DC2626' }} strokeWidth={2} />
              <p className="np-body text-[13.5px] leading-relaxed" style={{ color: '#7F1D1D' }}>
                This code is the <strong>only way</strong> to invite teammates and recover access to your workspace.
                It is <strong>not shown again</strong> after you close this screen — copy it now.
              </p>
            </div>

            {/* Code display */}
            <div>
              <p className="np-mono text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#737373' }}>
                Your Workspace Code
              </p>
              <div
                className="flex items-center justify-between gap-4 px-6 py-5"
                style={{ backgroundColor: '#F0EDE6', border: '1.5px solid #E5E5E0' }}
              >
                <span
                  className="np-mono font-black tracking-[0.3em]"
                  style={{ fontSize: '2rem', color: '#CC0000', letterSpacing: '0.3em' }}
                >
                  {code}
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-5 py-2.5 np-mono text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-all shrink-0"
                  style={{
                    backgroundColor: copied ? '#16A34A' : '#111111',
                    color: '#F9F9F7',
                    border: `1.5px solid ${copied ? '#16A34A' : '#111111'}`,
                  }}
                >
                  {copied
                    ? <><Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Copied!</>
                    : <><Copy className="w-3.5 h-3.5" strokeWidth={2} /> Copy</>
                  }
                </button>
              </div>
            </div>

            {/* Tip list */}
            <ul className="space-y-2">
              {[
                'Paste it into your password manager or notes app.',
                'Share it with teammates so they can join your workspace.',
                'You can view it again in the Members section of your sidebar.',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="np-mono text-[10px] font-bold mt-0.5 shrink-0" style={{ color: '#CC0000' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="np-body text-[13px] leading-relaxed" style={{ color: '#525252' }}>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Footer ──────────────────────────────────────────── */}
          <div
            className="px-8 py-5 flex items-center justify-between"
            style={{ borderTop: '1px solid #E5E5E0', backgroundColor: '#F0EDE6' }}
          >
            <p className="np-mono text-[10px] uppercase tracking-widest" style={{ color: '#AEABA6' }}>
              This notice won't appear again
            </p>
            <button
              onClick={onClose}
              disabled={!copied}
              className="btn-ink px-6 py-2.5 flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title={!copied ? 'Copy the code first' : undefined}
            >
              <X className="w-3.5 h-3.5" strokeWidth={2.5} />
              Got it, close
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
