'use client'

import { FileText } from 'lucide-react'

export default function CitationCard({ citation, onOpen, isActive }) {
  const ext = citation.fileName?.split('.').pop()?.toUpperCase() ?? 'FILE'
  const page = citation.pageNumber != null ? `p.${citation.pageNumber}` : null

  return (
    <button
      onClick={() => onOpen?.(citation)}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-left cursor-pointer transition-colors"
      style={{
        backgroundColor: isActive ? '#EEF1FD' : '#F4F3F0',
        border: `1px solid ${isActive ? '#4361EE' : '#E3E1DC'}`,
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = '#EEECEA'
          e.currentTarget.style.borderColor = '#4361EE'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = '#F4F3F0'
          e.currentTarget.style.borderColor = '#E3E1DC'
        }
      }}
    >
      <FileText className="w-3 h-3 shrink-0" style={{ color: '#AEABA6' }} strokeWidth={2} />
      <span className="text-[9px] font-semibold uppercase shrink-0" style={{ color: '#AEABA6' }}>
        {ext}
      </span>
      <span className="text-[12px] truncate max-w-[120px]" style={{ color: '#3D3C3A' }}>
        {citation.fileName ?? 'Unknown file'}
      </span>
      {page && (
        <span className="text-[11px] shrink-0" style={{ color: '#AEABA6' }}>{page}</span>
      )}
    </button>
  )
}
