'use client'

import { FileText } from 'lucide-react'

export default function CitationCard({ citation, onOpen, isActive }) {
  const ext = citation.fileName?.split('.').pop()?.toUpperCase() ?? 'FILE'
  const page = citation.pageNumber != null ? `p.${citation.pageNumber}` : null

  return (
    <button
      onClick={() => onOpen?.(citation)}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-left cursor-pointer transition-all"
      style={{
        backgroundColor: isActive ? '#111111' : '#F5F0E8',
        border: `1px solid ${isActive ? '#111111' : '#E5E5E0'}`,
        boxShadow: isActive ? '2px 2px 0px 0px #CC0000' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = '#F0EDE6'
          e.currentTarget.style.borderColor = '#111111'
          e.currentTarget.style.boxShadow = '2px 2px 0px 0px #111111'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = '#F5F0E8'
          e.currentTarget.style.borderColor = '#E5E5E0'
          e.currentTarget.style.boxShadow = 'none'
        }
      }}
    >
      <FileText className="w-3 h-3 shrink-0" style={{ color: isActive ? '#F9F9F7' : '#AEABA6' }} strokeWidth={2} />
      <span className="np-mono text-[9px] font-bold uppercase shrink-0" style={{ color: isActive ? '#F9F9F7' : '#CC0000' }}>
        {ext}
      </span>
      <span className="np-sans text-[12px] truncate max-w-[120px]" style={{ color: isActive ? '#F9F9F7' : '#3D3C3A' }}>
        {citation.fileName ?? 'Unknown file'}
      </span>
      {page && (
        <span className="np-mono text-[11px] shrink-0" style={{ color: isActive ? '#D9D7D2' : '#AEABA6' }}>{page}</span>
      )}
    </button>
  )
}
