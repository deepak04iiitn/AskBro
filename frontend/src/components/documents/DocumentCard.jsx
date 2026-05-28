'use client'

import { useState } from 'react'
import StatusBadge from './StatusBadge'
import useDocumentStore from '@/store/useDocumentStore'

const FILE_ICONS = {
  pdf:  { label: 'PDF',  bg: 'bg-red-50',    text: 'text-red-500' },
  docx: { label: 'DOC',  bg: 'bg-blue-50',   text: 'text-blue-500' },
  md:   { label: 'MD',   bg: 'bg-purple-50', text: 'text-purple-500' },
  txt:  { label: 'TXT',  bg: 'bg-zinc-100',  text: 'text-zinc-500' },
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function DocumentCard({ doc }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const deleteDocument = useDocumentStore((s) => s.deleteDocument)

  const icon = FILE_ICONS[doc.file_type] ?? FILE_ICONS.txt

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return }
    setDeleting(true)
    try {
      await deleteDocument(doc.document_id)
    } catch {
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl px-4 py-4 flex items-start gap-4 hover:border-zinc-300 transition-colors">
      {/* File type chip */}
      <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold ${icon.bg} ${icon.text}`}>
        {icon.label}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Filename + status */}
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-zinc-900 truncate">{doc.original_filename}</p>
          <StatusBadge status={doc.status} />
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-zinc-400">
          <span>{formatBytes(doc.file_size_bytes)}</span>
          <span>·</span>
          <span>{formatDate(doc.created_at)}</span>
          {doc.chunk_count != null && (
            <>
              <span>·</span>
              <span>{doc.chunk_count} chunks</span>
            </>
          )}
        </div>

        {/* Tags */}
        {doc.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {doc.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[10px] font-medium bg-zinc-100 text-zinc-600 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Error message */}
        {doc.status === 'failed' && doc.error_message && (
          <p className="mt-2 text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
            {doc.error_message}
          </p>
        )}
      </div>

      {/* Delete button */}
      <div className="shrink-0">
        {confirming ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Confirm'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs text-zinc-400 hover:text-zinc-600"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleDelete}
            aria-label="Delete document"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
