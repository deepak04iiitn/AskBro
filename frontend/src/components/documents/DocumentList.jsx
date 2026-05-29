'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DocumentCard from './DocumentCard'
import useDocumentStore from '@/store/useDocumentStore'
import { PAGE_ANIM, ITEM_ANIM } from '@/lib/animations'

const FILTERS = ['All', 'Ready', 'Processing', 'Pending', 'Failed']
const FILTER_STATUS = { All: null, Ready: 'completed', Processing: 'processing', Pending: 'pending', Failed: 'failed' }

export default function DocumentList() {
  const documents = useDocumentStore((s) => s.documents)
  const loading   = useDocumentStore((s) => s.loading)
  const [activeFilter, setActiveFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [view, setView] = useState('grid')
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
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        {/* Filter tabs */}
        <div className="flex items-center gap-5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setActiveFilter(f); clearSelection() }}
              className={`flex items-center gap-1.5 text-[13px] pb-1.5 border-b-2 transition-all duration-150 cursor-pointer ${
                activeFilter === f
                  ? 'text-brand font-semibold border-brand'
                  : 'text-fg-3 border-transparent hover:text-fg-2'
              }`}
            >
              {f}
              <span className={`text-[11px] ${activeFilter === f ? 'text-brand' : 'text-fg-4'}`}>
                {countFor(f)}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-44 h-9 px-3 bg-white border border-border rounded-lg text-[13px] text-fg placeholder:text-fg-4 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-border transition-all"
          />

          {/* View toggle */}
          <div className="flex items-center bg-surface-2 border border-border rounded-lg p-0.5">
            {[
              { id: 'grid', label: '⊞' },
              { id: 'list', label: '≡' },
            ].map((v) => (
              <motion.button
                key={v.id}
                onClick={() => setView(v.id)}
                whileTap={{ scale: 0.9 }}
                className={`w-8 h-7 flex items-center justify-center rounded-md text-[14px] transition-colors cursor-pointer ${
                  view === v.id ? 'bg-white shadow-sm text-brand' : 'text-fg-4 hover:text-fg-2'
                }`}
              >
                {v.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        view === 'grid' ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-border">
                <div className="h-20 bg-surface-2 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-border rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-border rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden divide-y divide-border-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 shimmer" />
            ))}
          </div>
        )
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center mb-4 text-2xl">
            📭
          </div>
          <p className="text-[14px] font-medium text-fg-3">
            {search ? 'No documents match your search.' : activeFilter === 'All' ? 'No documents yet.' : `No ${activeFilter.toLowerCase()} documents.`}
          </p>
        </motion.div>
      )}

      {/* Grid view */}
      {!loading && filtered.length > 0 && view === 'grid' && (
        <motion.div
          {...PAGE_ANIM}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {filtered.map((doc) => (
              <motion.div key={doc.document_id} {...ITEM_ANIM} layout>
                <DocumentCard
                  doc={doc}
                  isSelected={selected.has(doc.document_id)}
                  onToggle={toggleSelect}
                  view="grid"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* List view */}
      {!loading && filtered.length > 0 && view === 'list' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white border border-border rounded-xl overflow-hidden"
        >
          {/* Table header */}
          <div className="flex items-center gap-3 px-5 h-10 bg-surface border-b border-border">
            <div className="w-3.5 shrink-0" />
            <div className="w-10 shrink-0" />
            <span className="flex-1 text-[11px] font-semibold text-fg-4 uppercase tracking-widest">Name</span>
            <span className="w-24 shrink-0 text-[11px] font-semibold text-fg-4 uppercase tracking-widest hidden sm:block">Status</span>
            <span className="w-16 shrink-0 text-[11px] font-semibold text-fg-4 uppercase tracking-widest hidden md:block">Date</span>
            <span className="w-14 shrink-0 text-[11px] font-semibold text-fg-4 uppercase tracking-widest hidden lg:block text-right">Size</span>
            <div className="w-7 shrink-0" />
          </div>

          <div className="divide-y divide-border-2">
            {filtered.map((doc) => (
              <DocumentCard
                key={doc.document_id}
                doc={doc}
                isSelected={selected.has(doc.document_id)}
                onToggle={toggleSelect}
                view="list"
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Bulk action bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-8 py-4 flex items-center justify-between z-20"
            style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.08)' }}
          >
            <p className="text-[13px] font-medium text-fg">
              <span className="font-bold text-brand">{selected.size}</span> selected
            </p>
            <div className="flex items-center gap-4">
              <button onClick={clearSelection}
                className="text-[13px] text-fg-3 hover:text-fg transition-colors cursor-pointer">
                Cancel
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={deleteSelected}
                className="h-9 px-5 bg-red-50 border border-red-200 text-[13px] font-semibold text-danger rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
              >
                Delete selected
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
