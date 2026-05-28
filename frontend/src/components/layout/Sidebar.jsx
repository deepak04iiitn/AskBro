'use client'

import { useState } from 'react'
import Link from 'next/link'
import useAuthStore from '@/store/useAuthStore'
import useDocumentStore from '@/store/useDocumentStore'
import StatusBadge from '@/components/documents/StatusBadge'
import MembersPanel from '@/components/workspace/MembersPanel'

export default function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const documents = useDocumentStore((s) => s.documents)
  const [showMembers, setShowMembers] = useState(false)

  return (
    <>
    {showMembers && <MembersPanel onClose={() => setShowMembers(false)} />}
    <aside className="w-64 shrink-0 border-r border-zinc-200 bg-white flex flex-col h-full">
      {/* Workspace info */}
      <div className="px-4 py-5 border-b border-zinc-100">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-0.5">Workspace</p>
        <p className="text-sm font-semibold text-zinc-900 truncate">{user?.workspace_code ?? '—'}</p>
        <p className="text-xs text-zinc-400 truncate mt-0.5">{user?.email}</p>
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide px-1 mb-2">Documents</p>

        {documents.length === 0 && (
          <p className="text-xs text-zinc-400 px-1 py-3 text-center">No documents yet</p>
        )}

        {documents.map((doc) => (
          <div
            key={doc.document_id}
            className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-zinc-50 group"
          >
            <FileIcon type={doc.file_type} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-800 truncate">{doc.original_filename}</p>
            </div>
            <StatusBadge status={doc.status} small />
          </div>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-zinc-100 space-y-2">
        <Link
          href="/upload"
          className="flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Upload Document
        </Link>

        {/* Members — visible to all, add/remove restricted to owner inside the panel */}
        <button
          onClick={() => setShowMembers(true)}
          className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {user?.role === 'owner' ? 'Manage Members' : 'View Members'}
        </button>

        <button
          onClick={logout}
          className="w-full py-2 text-xs font-medium text-zinc-500 rounded-lg hover:bg-zinc-50 hover:text-zinc-800 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
    </>
  )
}

function FileIcon({ type }) {
  const icons = {
    pdf: { bg: 'bg-red-50', text: 'text-red-500', label: 'PDF' },
    docx: { bg: 'bg-blue-50', text: 'text-blue-500', label: 'DOC' },
    md: { bg: 'bg-purple-50', text: 'text-purple-500', label: 'MD' },
    txt: { bg: 'bg-zinc-100', text: 'text-zinc-500', label: 'TXT' },
  }
  const icon = icons[type] ?? icons.txt
  return (
    <span className={`shrink-0 w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold ${icon.bg} ${icon.text}`}>
      {icon.label}
    </span>
  )
}
