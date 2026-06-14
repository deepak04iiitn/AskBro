'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Check, X, Trash2, Loader2, AlertTriangle,
} from 'lucide-react'
import {
  adminFetchTestimonials,
  adminUpdateTestimonialStatus,
  adminDeleteTestimonial,
} from '@/lib/adminApi'

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLE = {
  pending:  { bg: '#F5F0E8', color: '#D97706', border: '#FDE68A', label: 'Pending'  },
  approved: { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0', label: 'Approved' },
  rejected: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', label: 'Rejected' },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending
  return (
    <span
      className="inline-flex np-mono text-[9px] font-bold uppercase tracking-widest px-2 py-1"
      style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  )
}

// ── Star display ──────────────────────────────────────────────────────────────

function Stars({ count }) {
  return (
    <span style={{ color: '#CC0000', letterSpacing: '2px', fontSize: '12px' }}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </span>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminTestimonialsPage() {
  const [items,         setItems]         = useState([])
  const [loading,       setLoading]       = useState(true)
  const [updatingId,    setUpdatingId]    = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deletingId,    setDeletingId]    = useState(null)
  const [error,         setError]         = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setItems(await adminFetchTestimonials()) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  async function handleStatus(id, status) {
    setUpdatingId(id)
    try { await adminUpdateTestimonialStatus(id, status); await load() }
    catch (err) { setError(err.message) }
    finally { setUpdatingId(null) }
  }

  async function handleDelete(id) {
    setDeletingId(id)
    try { await adminDeleteTestimonial(id); await load() }
    catch (err) { setError(err.message) }
    finally { setDeletingId(null); setDeleteConfirm(null) }
  }

  const pending  = items.filter((i) => i.status === 'pending').length
  const approved = items.filter((i) => i.status === 'approved').length
  const rejected = items.filter((i) => i.status === 'rejected').length

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: '#F9F9F7' }}>

      {/* Top bar */}
      <div
        className="px-8 h-14 flex items-center gap-3 shrink-0"
        style={{ borderBottom: '1px solid #111111', backgroundColor: '#F9F9F7' }}
      >
        <MessageSquare className="w-4 h-4" style={{ color: '#CC0000' }} strokeWidth={2} />
        <h1 className="np-serif font-black text-[16px]" style={{ color: '#111111' }}>Testimonials</h1>
        <span className="np-mono text-[10px] font-bold uppercase tracking-widest px-2 py-0.5" style={{ backgroundColor: '#111111', color: '#F9F9F7' }}>
          {items.length}
        </span>
      </div>

      {/* Stats strip */}
      <div className="px-8 py-4 flex items-center gap-6 shrink-0" style={{ borderBottom: '1px solid #E5E5E0', backgroundColor: '#F0EDE6' }}>
        {[
          { label: 'Pending',  value: pending,  color: '#D97706' },
          { label: 'Approved', value: approved, color: '#16A34A' },
          { label: 'Rejected', value: rejected, color: '#DC2626' },
          { label: 'Total',    value: items.length, color: '#111111' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="np-serif font-black text-[22px] tabular-nums" style={{ color }}>{value}</span>
            <span className="np-mono text-[10px] uppercase tracking-widest" style={{ color: '#737373' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mx-8 mt-4 flex items-center gap-2 px-4 py-3"
            style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}
          >
            <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: '#DC2626' }} strokeWidth={2} />
            <p className="np-mono text-[11px] uppercase tracking-wide" style={{ color: '#DC2626' }}>{error}</p>
            <button onClick={() => setError('')} className="ml-auto cursor-pointer" style={{ color: '#DC2626' }}>
              <X className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#D9D7D2' }} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <MessageSquare className="w-10 h-10" style={{ color: '#D9D7D2' }} strokeWidth={1.5} />
            <p className="np-body text-[14px]" style={{ color: '#AEABA6' }}>No testimonials submitted yet.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F0EDE6', borderBottom: '1px solid #E5E5E0' }}>
                {['Author', 'Quote', 'Stars', 'Status', 'Submitted', 'Actions'].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left np-mono text-[9px] font-bold uppercase tracking-[0.18em]"
                    style={{ color: '#CC0000' }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid #E5E5E0' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F0E8' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                >
                  {/* Author */}
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 shrink-0 flex items-center justify-center np-sans text-[11px] font-bold"
                        style={{ backgroundColor: '#111111', color: '#F9F9F7' }}
                      >
                        {item.initials}
                      </div>
                      <div>
                        <p className="np-sans text-[13px] font-semibold" style={{ color: '#111111' }}>{item.name}</p>
                        <p className="np-mono text-[10px] mt-0.5" style={{ color: '#AEABA6' }}>{item.role}</p>
                      </div>
                    </div>
                  </td>

                  {/* Quote */}
                  <td className="px-6 py-3.5 max-w-xs">
                    <p className="np-body text-[12px] leading-relaxed" style={{ color: '#404040' }}>
                      "{item.quote.length > 120 ? item.quote.slice(0, 120) + '…' : item.quote}"
                    </p>
                  </td>

                  {/* Stars */}
                  <td className="px-6 py-3.5">
                    <Stars count={item.stars} />
                  </td>

                  {/* Status */}
                  <td className="px-6 py-3.5">
                    <StatusBadge status={item.status} />
                  </td>

                  {/* Date */}
                  <td className="px-6 py-3.5 np-mono text-[11px]" style={{ color: '#737373' }}>
                    {new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {/* Approve */}
                      <button
                        onClick={() => handleStatus(item.id, 'approved')}
                        disabled={updatingId === item.id || item.status === 'approved'}
                        title="Approve"
                        className="w-7 h-7 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-30"
                        style={{ color: '#16A34A' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F0FDF4' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                      >
                        {updatingId === item.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                        }
                      </button>

                      {/* Reject */}
                      <button
                        onClick={() => handleStatus(item.id, 'rejected')}
                        disabled={updatingId === item.id || item.status === 'rejected'}
                        title="Reject"
                        className="w-7 h-7 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-30"
                        style={{ color: '#D97706' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFFBEB' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </button>

                      {/* Delete with confirm */}
                      {deleteConfirm === item.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="w-7 h-7 flex items-center justify-center cursor-pointer disabled:opacity-40"
                            style={{ backgroundColor: '#DC2626', color: '#fff' }}
                            title="Confirm delete"
                          >
                            {deletingId === item.id
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <Check className="w-3 h-3" strokeWidth={3} />
                            }
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="w-7 h-7 flex items-center justify-center cursor-pointer transition-colors"
                            style={{ color: '#737373' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E5E5E0' }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                          >
                            <X className="w-3 h-3" strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          title="Delete"
                          className="w-7 h-7 flex items-center justify-center cursor-pointer transition-colors"
                          style={{ color: '#AEABA6' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEF2F2'; e.currentTarget.style.color = '#DC2626' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '#AEABA6' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
