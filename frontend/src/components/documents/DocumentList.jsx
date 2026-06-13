'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, LayoutGrid, AlignJustify, FileX } from 'lucide-react'
import DocumentCard from './DocumentCard'
import useDocumentStore from '@/store/useDocumentStore'

const FILTERS = ['All', 'Ready', 'Processing', 'Pending', 'Failed']
const FILTER_STATUS = { All: null, Ready: 'completed', Processing: 'processing', Pending: 'pending', Failed: 'failed' }

export default function DocumentList() {
  const documents = useDocumentStore((s) => s.documents)
  const loading   = useDocumentStore((s) => s.loading)

  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [view, setView] = useState('list')
  const [selected, setSelected] = useState(new Set())

  const statusKey = FILTER_STATUS[activeFilter]
  const filtered = documents
    .filter((d) => !statusKey || d.status === statusKey)
    .filter((d) => !search.trim() || d.original_filename.toLowerCase().includes(search.toLowerCase()))

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function clearSelection() { setSelected(new Set()) }

  const deleteDocument = useDocumentStore((s) => s.deleteDocument)
  async function deleteSelected() {
    await Promise.allSettled(Array.from(selected).map((id) => deleteDocument(id)))
    clearSelection()
  }

  function countFor(f) {
    const sk = FILTER_STATUS[f]
    return sk ? documents.filter((d) => d.status === sk).length : documents.length
  }

  return (
    <div>
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">

        {/* Filter tabs — sharp newsprint style */}
        <div
          className="flex items-center gap-0"
          style={{ border: '1px solid #111111' }}
        >
          {FILTERS.map((f, i) => {
            const isActive = activeFilter === f
            return (
              <button
                key={f}
                onClick={() => { setActiveFilter(f); clearSelection() }}
                className="flex items-center gap-1.5 px-3 py-2 np-mono text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                style={{
                  backgroundColor: isActive ? '#111111' : 'transparent',
                  color: isActive ? '#F9F9F7' : '#737373',
                  borderRight: i < FILTERS.length - 1 ? '1px solid #111111' : 'none',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#F0EDE6' }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {f}
                <span
                  className="np-mono text-[10px] font-bold tabular-nums"
                  style={{ color: isActive ? '#CC0000' : '#AEABA6' }}
                >
                  {countFor(f)}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
              style={{ color: '#AEABA6' }}
              strokeWidth={2}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents…"
              className="h-9 pl-8 pr-3 np-body text-[13px] focus:outline-none transition-all"
              style={{
                width: '200px',
                backgroundColor: '#F5F0E8',
                border: '1.5px solid #E5E5E0',
                color: '#111111',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#111111'
                e.currentTarget.style.boxShadow = '2px 2px 0px 0px #111111'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E5E0'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* View toggle */}
          <div
            className="flex items-center"
            style={{ border: '1px solid #111111' }}
          >
            {[
              { id: 'grid', Icon: LayoutGrid },
              { id: 'list', Icon: AlignJustify },
            ].map(({ id, Icon }, i) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className="w-9 h-9 flex items-center justify-center transition-colors cursor-pointer"
                style={{
                  backgroundColor: view === id ? '#111111' : 'transparent',
                  color: view === id ? '#F9F9F7' : '#AEABA6',
                  borderRight: i === 0 ? '1px solid #111111' : 'none',
                }}
                onMouseEnter={(e) => { if (view !== id) e.currentTarget.style.backgroundColor = '#F0EDE6' }}
                onMouseLeave={(e) => { if (view !== id) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Loading skeletons ────────────────────────────────── */}
      {loading && (
        view === 'list' ? (
          <div className="overflow-hidden" style={{ border: '1px solid #E5E5E0' }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse"
                style={{
                  backgroundColor: i % 2 === 0 ? '#F0EDE6' : '#F9F9F7',
                  borderBottom: i < 3 ? '1px solid #E5E5E0' : 'none',
                }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="animate-pulse"
                style={{ border: '1px solid #E5E5E0', height: '140px', backgroundColor: '#F0EDE6' }}
              />
            ))}
          </div>
        )
      )}

      {/* ── Empty state ──────────────────────────────────────── */}
      {!loading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div
            className="w-12 h-12 flex items-center justify-center mb-4"
            style={{ backgroundColor: '#F5F0E8', border: '1px solid #E5E5E0' }}
          >
            <FileX className="w-5 h-5" style={{ color: '#AEABA6' }} strokeWidth={1.5} />
          </div>
          <p className="np-mono text-[12px] uppercase tracking-widest" style={{ color: '#AEABA6' }}>
            {search
              ? 'No documents match your search.'
              : activeFilter === 'All'
              ? 'No documents yet.'
              : `No ${activeFilter.toLowerCase()} documents.`}
          </p>
        </motion.div>
      )}

      {/* ── Grid view ────────────────────────────────────────── */}
      {!loading && filtered.length > 0 && view === 'grid' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.document_id}
              doc={doc}
              isSelected={selected.has(doc.document_id)}
              onToggle={toggleSelect}
              view="grid"
            />
          ))}
        </motion.div>
      )}

      {/* ── List view ────────────────────────────────────────── */}
      {!loading && filtered.length > 0 && view === 'list' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ border: '1px solid #E5E5E0', overflow: 'visible' }}
        >
          {/* Table header */}
          <div
            className="flex items-center gap-3 px-5 h-10"
            style={{ backgroundColor: '#F0EDE6', borderBottom: '1px solid #E5E5E0' }}
          >
            <div className="w-4 shrink-0" />
            <div className="w-10 shrink-0" />
            <span className="flex-1 np-mono text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#CC0000' }}>Name</span>
            <span className="w-28 shrink-0 np-mono text-[9px] font-bold uppercase tracking-[0.2em] hidden sm:block" style={{ color: '#CC0000' }}>Status</span>
            <span className="w-20 shrink-0 np-mono text-[9px] font-bold uppercase tracking-[0.2em] hidden md:block" style={{ color: '#CC0000' }}>Date</span>
            <span className="w-16 shrink-0 np-mono text-[9px] font-bold uppercase tracking-[0.2em] hidden lg:block text-right" style={{ color: '#CC0000' }}>Size</span>
            <div className="w-8 shrink-0" />
          </div>

          <div>
            {filtered.map((doc, i) => (
              <div key={doc.document_id} style={{ borderTop: i > 0 ? '1px solid #E5E5E0' : 'none' }}>
                <DocumentCard
                  doc={doc}
                  isSelected={selected.has(doc.document_id)}
                  onToggle={toggleSelect}
                  view="list"
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Bulk action bar ───────────────────────────────────── */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 px-8 py-4 flex items-center justify-between z-20"
            style={{
              backgroundColor: '#F9F9F7',
              borderTop: '2px solid #111111',
              boxShadow: '0 -4px 0px 0px #111111',
            }}
          >
            <p className="np-mono text-[12px] font-bold uppercase tracking-widest" style={{ color: '#111111' }}>
              <span style={{ color: '#CC0000' }}>{selected.size}</span> selected
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={clearSelection}
                className="np-mono text-[11px] uppercase tracking-widest transition-colors cursor-pointer"
                style={{ color: '#AEABA6' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#111111' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#AEABA6' }}
              >
                Cancel
              </button>
              <button
                onClick={deleteSelected}
                className="h-9 px-5 np-mono text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-colors"
                style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEE2E2' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FEF2F2' }}
              >
                Delete selected
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
