'use client'

import { useState } from 'react'

export default function CitationCard({ citation }) {
  const [expanded, setExpanded] = useState(false)

  const page = citation.pageNumber != null ? `Page ${citation.pageNumber}` : null

  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden text-xs">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-100 transition-colors text-left"
      >
        {/* File icon dot */}
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />

        <div className="flex-1 min-w-0">
          <span className="font-medium text-zinc-700 truncate block">{citation.fileName ?? 'Unknown file'}</span>
          {page && <span className="text-zinc-400">{page}</span>}
        </div>

        {/* Expand chevron */}
        <svg
          className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded preview */}
      {expanded && citation.chunkPreview && (
        <div className="px-3 pb-3 pt-1 border-t border-zinc-200">
          <p className="text-zinc-500 leading-relaxed line-clamp-6">{citation.chunkPreview}</p>
        </div>
      )}
    </div>
  )
}
