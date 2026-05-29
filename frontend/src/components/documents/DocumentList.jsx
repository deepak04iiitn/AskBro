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

        {/* Filter pills */}
        <div
          className="flex items-center gap-1 p-1 rounded-lg"
          style={{ backgroundColor: '#F4F3F0' }}
        >
          {FILTERS.map((f) => {
            const isActive = activeFilter === f
            return (
              <button
                key={f}
                onClick={() => { setActiveFilter(f); clearSelection() }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors cursor-pointer"
                style={{
                  backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? '#111110' : '#7A7874',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#3D3C3A' }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '#7A7874' }}
              >
                {f}
                <span
                  className="text-[10px] font-semibold tabular-nums"
                  style={{ color: isActive ? '#4361EE' : '#AEABA6' }}
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
              className="h-9 pl-8 pr-3 rounded-lg text-[13px] focus:outline-none transition-all"
              style={{
                width: '200px',
                backgroundColor: '#F4F3F0',
                border: '1.5px solid #E3E1DC',
                color: '#111110',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#4361EE'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(67,97,238,0.10)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E3E1DC'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* View toggle */}
          <div
            className="flex items-center p-0.5 rounded-lg"
            style={{ backgroundColor: '#F4F3F0', border: '1.5px solid #E3E1DC' }}
          >
            {[
              { id: 'grid', Icon: LayoutGrid },
              { id: 'list', Icon: AlignJustify },
            ].map(({ id, Icon }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className="w-8 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer"
                style={{
                  backgroundColor: view === id ? '#FFFFFF' : 'transparent',
                  color: view === id ? '#4361EE' : '#AEABA6',
                  boxShadow: view === id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
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
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E3E1DC' }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse"
                style={{
                  backgroundColor: i % 2 === 0 ? '#F7F5F2' : '#FAFAF9',
                  borderBottom: i < 3 ? '1px solid #E3E1DC' : 'none',
                }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden animate-pulse"
                style={{ border: '1px solid #E3E1DC', height: '140px', backgroundColor: '#F4F3F0' }}
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
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ backgroundColor: '#F4F3F0' }}
          >
            <FileX className="w-5 h-5" style={{ color: '#AEABA6' }} strokeWidth={1.5} />
          </div>
          <p className="text-[14px] font-medium" style={{ color: '#7A7874' }}>
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
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid #E3E1DC' }}
        >
          {/* Table header */}
          <div
            className="flex items-center gap-3 px-5 h-10"
            style={{ backgroundColor: '#F7F5F2', borderBottom: '1px solid #E3E1DC' }}
          >
            <div className="w-4 shrink-0" />
            <div className="w-10 shrink-0" />
            <span className="flex-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#AEABA6' }}>Name</span>
            <span className="w-28 shrink-0 text-[10px] font-semibold uppercase tracking-widest hidden sm:block" style={{ color: '#AEABA6' }}>Status</span>
            <span className="w-20 shrink-0 text-[10px] font-semibold uppercase tracking-widest hidden md:block" style={{ color: '#AEABA6' }}>Date</span>
            <span className="w-16 shrink-0 text-[10px] font-semibold uppercase tracking-widest hidden lg:block text-right" style={{ color: '#AEABA6' }}>Size</span>
            <div className="w-8 shrink-0" />
          </div>

          <div>
            {filtered.map((doc, i) => (
              <div key={doc.document_id} style={{ borderTop: i > 0 ? '1px solid #F0EFEC' : 'none' }}>
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
            className="fixed bottom-0 left-0 right-0 bg-white px-8 py-4 flex items-center justify-between z-20"
            style={{ borderTop: '1px solid #E3E1DC', boxShadow: '0 -4px 24px rgba(0,0,0,0.06)' }}
          >
            <p className="text-[13px] font-medium" style={{ color: '#3D3C3A' }}>
              <span className="font-bold" style={{ color: '#4361EE' }}>{selected.size}</span> selected
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={clearSelection}
                className="text-[13px] transition-colors cursor-pointer"
                style={{ color: '#AEABA6' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#3D3C3A' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#AEABA6' }}
              >
                Cancel
              </button>
              <button
                onClick={deleteSelected}
                className="h-9 px-5 text-[13px] font-semibold rounded-lg cursor-pointer transition-colors"
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
