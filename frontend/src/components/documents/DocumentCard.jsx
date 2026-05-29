'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import StatusBadge from './StatusBadge'
import useDocumentStore from '@/store/useDocumentStore'

const TYPE_CONFIG = {
  pdf:  { label: 'PDF',  headerBg: '#FEF2F2', iconColor: '#EF4444', icon: '📄' },
  docx: { label: 'DOC',  headerBg: '#EFF6FF', iconColor: '#3B82F6', icon: '📝' },
  md:   { label: 'MD',   headerBg: '#F5F3FF', iconColor: '#8B5CF6', icon: '✍️' },
  txt:  { label: 'TXT',  headerBg: '#F9FAFB', iconColor: '#6B7280', icon: '📃' },
}

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function ProcessingBar() {
  const [width, setWidth] = useState(8)
  useEffect(() => {
    const id = setInterval(() => setWidth((w) => w >= 85 ? w : w + (85 - w) * 0.04), 800)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="mt-2 h-1 bg-border-2 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: 'linear-gradient(90deg, #4361EE, #7C3AED)', width: `${width}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
    </div>
  )
}

/* ── Grid Card ─────────────────────────────────────────────── */
function GridCard({ doc, isSelected, onToggle }) {
  const router = useRouter()
  const deleteDocument = useDocumentStore((s) => s.deleteDocument)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showFooter, setShowFooter] = useState(false)

  const cfg = TYPE_CONFIG[doc.file_type] ?? TYPE_CONFIG.txt

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return }
    setDeleting(true)
    try { await deleteDocument(doc.document_id) } catch {
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.10)', borderColor: '#C7D2FE' }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      onHoverStart={() => setShowFooter(true)}
      onHoverEnd={() => { setShowFooter(false); setConfirming(false) }}
      className="bg-white border border-border rounded-2xl overflow-hidden cursor-default"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)' }}
    >
      {/* Colored header */}
      <div
        className="h-20 flex items-center justify-center relative"
        style={{ backgroundColor: cfg.headerBg }}
      >
        <span className="text-3xl">{cfg.icon}</span>
        {/* Status badge — top right */}
        <div className="absolute top-2.5 right-2.5">
          <StatusBadge status={doc.status} small />
        </div>
        {/* Checkbox — top left on hover */}
        <div className="absolute top-2.5 left-2.5">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(doc.document_id)}
            onClick={(e) => e.stopPropagation()}
            className={`w-4 h-4 rounded cursor-pointer transition-opacity duration-150 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            style={{ accentColor: '#4361EE' }}
          />
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3.5">
        <p className="text-[13px] font-semibold text-fg leading-snug line-clamp-2 mb-1.5">
          {doc.original_filename}
        </p>
        <p className="text-[11px] text-fg-4">
          {formatDate(doc.created_at)} · {formatBytes(doc.file_size_bytes)}
        </p>

        {doc.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {doc.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] text-fg-3 bg-surface-2 rounded-full px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        )}

        {doc.status === 'processing' && <ProcessingBar />}
      </div>

      {/* Hover footer */}
      <AnimatePresence>
        {showFooter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="border-t border-border-2 bg-surface-2 overflow-hidden"
          >
            <div className="flex items-center px-4 py-2.5 gap-2">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => router.push('/dashboard')}
                className="flex-1 text-[12px] font-semibold text-brand cursor-pointer hover:underline text-left"
              >
                Ask about this →
              </motion.button>
              {confirming ? (
                <div className="flex items-center gap-2">
                  <button onClick={handleDelete} disabled={deleting}
                    className="text-[11px] text-danger font-semibold cursor-pointer disabled:opacity-50">
                    {deleting ? '...' : 'Confirm'}
                  </button>
                  <button onClick={() => setConfirming(false)}
                    className="text-[11px] text-fg-4 cursor-pointer">Cancel</button>
                </div>
              ) : (
                <button onClick={handleDelete}
                  className="text-[11px] text-fg-4 hover:text-danger transition-colors cursor-pointer">
                  Delete
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── List Row ──────────────────────────────────────────────── */
function ListRow({ doc, isSelected, onToggle }) {
  const router = useRouter()
  const deleteDocument = useDocumentStore((s) => s.deleteDocument)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const menuRef = useRef(null)

  const cfg = TYPE_CONFIG[doc.file_type] ?? TYPE_CONFIG.txt

  useEffect(() => {
    if (!menuOpen) return
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false); setConfirming(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return }
    setDeleting(true)
    try { await deleteDocument(doc.document_id) } catch {
      setDeleting(false); setConfirming(false)
    }
    setMenuOpen(false)
  }

  return (
    <motion.div
      whileHover={{ backgroundColor: '#F8F9FC' }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-3 px-5 h-12 group"
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(doc.document_id)}
        onClick={(e) => e.stopPropagation()}
        className={`w-3.5 h-3.5 shrink-0 cursor-pointer transition-opacity duration-150 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        style={{ accentColor: '#4361EE' }}
      />

      <span
        className="shrink-0 text-[9px] font-bold rounded px-1.5 py-0.5 leading-none"
        style={{ backgroundColor: cfg.headerBg, color: cfg.iconColor }}
      >
        {cfg.label}
      </span>

      <span className="flex-1 min-w-0 text-[13px] font-medium text-fg truncate">{doc.original_filename}</span>

      <div className="w-24 shrink-0 hidden sm:flex items-center">
        <StatusBadge status={doc.status} />
      </div>

      <span className="w-16 shrink-0 text-[11px] text-fg-4 hidden md:block">{formatDate(doc.created_at)}</span>
      <span className="w-14 shrink-0 text-[11px] text-fg-4 hidden lg:block text-right">{formatBytes(doc.file_size_bytes)}</span>

      {/* Actions */}
      <div ref={menuRef} className="w-7 shrink-0 flex justify-center relative">
        <button
          onClick={() => { setMenuOpen((v) => !v); setConfirming(false) }}
          className="w-6 h-6 flex items-center justify-center rounded text-fg-4 hover:text-fg hover:bg-border transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
          </svg>
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 4 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-full mt-1 w-44 bg-white border border-border rounded-xl overflow-hidden z-10"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
            >
              <button
                onClick={() => { router.push('/dashboard'); setMenuOpen(false) }}
                className="w-full flex items-center px-4 py-2.5 text-[13px] text-fg-2 hover:bg-surface transition-colors cursor-pointer text-left"
              >
                Ask about this
              </button>
              <div className="border-t border-border-2" />
              {confirming ? (
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <button onClick={handleDelete} disabled={deleting}
                    className="text-[12px] text-danger font-semibold disabled:opacity-50 cursor-pointer">
                    {deleting ? 'Deleting...' : 'Confirm'}
                  </button>
                  <button onClick={() => setConfirming(false)}
                    className="text-[12px] text-fg-4 cursor-pointer">Cancel</button>
                </div>
              ) : (
                <button onClick={handleDelete}
                  className="w-full flex items-center px-4 py-2.5 text-[13px] text-danger hover:bg-red-50 transition-colors cursor-pointer text-left">
                  Delete
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ── Export ────────────────────────────────────────────────── */
export default function DocumentCard({ doc, isSelected, onToggle, view = 'grid' }) {
  if (view === 'list') return <ListRow doc={doc} isSelected={isSelected} onToggle={onToggle} />
  return <GridCard doc={doc} isSelected={isSelected} onToggle={onToggle} />
}
