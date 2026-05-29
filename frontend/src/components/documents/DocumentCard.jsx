'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, MessageSquare, Trash2 } from 'lucide-react'
import StatusBadge from './StatusBadge'
import useDocumentStore from '@/store/useDocumentStore'

const TYPE_CONFIG = {
  pdf:  { label: 'PDF' },
  docx: { label: 'DOC' },
  md:   { label: 'MD'  },
  txt:  { label: 'TXT' },
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
    const id = setInterval(() => setWidth((w) => (w >= 85 ? w : w + (85 - w) * 0.04)), 800)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="mt-2 h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: '#E3E1DC' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ width: `${width}%`, backgroundColor: '#4361EE' }}
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
    <div
      className="bg-white rounded-xl overflow-hidden cursor-default transition-shadow"
      style={{ border: '1px solid #E3E1DC' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
        e.currentTarget.style.borderColor = '#4361EE'
        setShowFooter(true)
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = '#E3E1DC'
        setShowFooter(false)
        setConfirming(false)
      }}
    >
      {/* Header */}
      <div
        className="h-20 flex items-center justify-center relative"
        style={{ backgroundColor: '#F4F3F0' }}
      >
        <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#AEABA6' }}>
          {cfg.label}
        </span>
        <div className="absolute top-2.5 right-2.5">
          <StatusBadge status={doc.status} small />
        </div>
        <div className="absolute top-2.5 left-2.5">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(doc.document_id)}
            onClick={(e) => e.stopPropagation()}
            className={`w-4 h-4 rounded cursor-pointer transition-opacity duration-150 ${isSelected ? 'opacity-100' : 'opacity-0'}`}
            style={{ accentColor: '#4361EE' }}
          />
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3.5">
        <p className="text-[13px] font-semibold leading-snug line-clamp-2 mb-1.5" style={{ color: '#111110' }}>
          {doc.original_filename}
        </p>
        <p className="text-[11px]" style={{ color: '#AEABA6' }}>
          {formatDate(doc.created_at)} · {formatBytes(doc.file_size_bytes)}
        </p>
        {doc.status === 'processing' && <ProcessingBar />}
      </div>

      {/* Hover footer */}
      <AnimatePresence>
        {showFooter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
            style={{ borderTop: '1px solid #E3E1DC', backgroundColor: '#F7F5F2' }}
          >
            <div className="flex items-center px-4 py-2.5 gap-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 text-[12px] font-semibold cursor-pointer hover:underline text-left"
                style={{ color: '#4361EE' }}
              >
                Ask about this →
              </button>
              {confirming ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-[11px] font-semibold cursor-pointer disabled:opacity-50"
                    style={{ color: '#DC2626' }}
                  >
                    {deleting ? '…' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="text-[11px] cursor-pointer"
                    style={{ color: '#AEABA6' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleDelete}
                  className="text-[11px] transition-colors cursor-pointer"
                  style={{ color: '#AEABA6' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#DC2626' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#AEABA6' }}
                >
                  Delete
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
        setMenuOpen(false)
        setConfirming(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return }
    setDeleting(true)
    try { await deleteDocument(doc.document_id) } catch {
      setDeleting(false)
      setConfirming(false)
    }
    setMenuOpen(false)
  }

  return (
    <div
      className="flex items-center gap-3 px-5 h-14 group transition-colors"
      style={{ backgroundColor: 'transparent' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F7F5F2' }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(doc.document_id)}
        onClick={(e) => e.stopPropagation()}
        className={`w-4 h-4 shrink-0 cursor-pointer transition-opacity duration-150 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        style={{ accentColor: '#4361EE' }}
      />

      {/* Type label */}
      <span
        className="shrink-0 text-[9px] font-bold uppercase w-10 tracking-wide"
        style={{ color: '#AEABA6' }}
      >
        {cfg.label}
      </span>

      {/* Filename */}
      <span className="flex-1 min-w-0 text-[13px] font-medium truncate" style={{ color: '#111110' }}>
        {doc.original_filename}
      </span>

      {/* Status */}
      <div className="w-28 shrink-0 hidden sm:flex items-center">
        <StatusBadge status={doc.status} />
      </div>

      {/* Date */}
      <span className="w-20 shrink-0 text-[12px] hidden md:block" style={{ color: '#AEABA6' }}>
        {formatDate(doc.created_at)}
      </span>

      {/* Size */}
      <span className="w-16 shrink-0 text-[12px] hidden lg:block text-right" style={{ color: '#AEABA6' }}>
        {formatBytes(doc.file_size_bytes)}
      </span>

      {/* Actions menu */}
      <div ref={menuRef} className="w-8 shrink-0 flex justify-center relative">
        <button
          onClick={() => { setMenuOpen((v) => !v); setConfirming(false) }}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
          style={{ color: '#AEABA6' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#E3E1DC'
            e.currentTarget.style.color = '#3D3C3A'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#AEABA6'
          }}
        >
          <MoreHorizontal className="w-4 h-4" strokeWidth={2} />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 4 }}
              transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl overflow-hidden z-10"
              style={{ border: '1px solid #E3E1DC', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
            >
              <button
                onClick={() => { router.push('/dashboard'); setMenuOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] cursor-pointer transition-colors text-left"
                style={{ color: '#3D3C3A' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F7F5F2' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" style={{ color: '#AEABA6' }} strokeWidth={1.8} />
                Ask about this
              </button>
              <div style={{ borderTop: '1px solid #E3E1DC' }} />
              {confirming ? (
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-[12px] font-semibold disabled:opacity-50 cursor-pointer"
                    style={{ color: '#DC2626' }}
                  >
                    {deleting ? 'Deleting…' : 'Confirm delete'}
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="text-[12px] cursor-pointer"
                    style={{ color: '#AEABA6' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] cursor-pointer transition-colors text-left"
                  style={{ color: '#DC2626' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEF2F2' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
                  Delete
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ── Export ────────────────────────────────────────────────── */
export default function DocumentCard({ doc, isSelected, onToggle, view = 'grid' }) {
  if (view === 'list') return <ListRow doc={doc} isSelected={isSelected} onToggle={onToggle} />
  return <GridCard doc={doc} isSelected={isSelected} onToggle={onToggle} />
}
