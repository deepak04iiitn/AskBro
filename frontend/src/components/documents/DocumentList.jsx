'use client'

import { useState } from 'react'
import Link from 'next/link'
import DocumentCard from './DocumentCard'
import useDocumentStore from '@/store/useDocumentStore'

const FILTERS = ['All', 'Pending', 'Processing', 'Completed', 'Failed']

export default function DocumentList() {
  const documents = useDocumentStore((s) => s.documents)
  const loading = useDocumentStore((s) => s.loading)
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = activeFilter === 'All'
    ? documents
    : documents.filter((d) => d.status === activeFilter.toLowerCase())

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex items-center gap-1 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`
              px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
              ${activeFilter === f
                ? 'bg-zinc-900 text-white'
                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }
            `}
          >
            {f}
            {f !== 'All' && (
              <span className={`ml-1.5 ${activeFilter === f ? 'text-zinc-300' : 'text-zinc-400'}`}>
                {documents.filter((d) => d.status === f.toLowerCase()).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-zinc-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-zinc-600">
            {activeFilter === 'All' ? 'No documents yet' : `No ${activeFilter.toLowerCase()} documents`}
          </p>
          {activeFilter === 'All' && (
            <Link
              href="/upload"
              className="mt-3 text-xs font-semibold text-zinc-900 underline underline-offset-2"
            >
              Upload your first document →
            </Link>
          )}
        </div>
      )}

      {/* Document cards */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((doc) => (
            <DocumentCard key={doc.document_id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  )
}
