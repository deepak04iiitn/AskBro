'use client'

import { motion } from 'framer-motion'

const EXT_CONFIG = {
  PDF:  { bg: '#FEF2F2', color: '#EF4444' },
  DOC:  { bg: '#EFF6FF', color: '#3B82F6' },
  DOCX: { bg: '#EFF6FF', color: '#3B82F6' },
  MD:   { bg: '#F5F3FF', color: '#8B5CF6' },
  TXT:  { bg: '#F9FAFB', color: '#6B7280' },
}

export default function CitationCard({ citation, onOpen, isActive }) {
  const ext = citation.fileName?.split('.').pop()?.toUpperCase() ?? 'FILE'
  const page = citation.pageNumber != null ? `p.${citation.pageNumber}` : null
  const cfg = EXT_CONFIG[ext] ?? EXT_CONFIG.TXT

  return (
    <motion.button
      onClick={() => onOpen?.(citation)}
      whileHover={{ scale: 1.02, backgroundColor: isActive ? '#EEF2FF' : '#F8F9FC' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-left cursor-pointer transition-colors"
      style={{
        borderColor: isActive ? '#4361EE' : '#E4E7EF',
        backgroundColor: isActive ? '#EEF2FF' : 'white',
      }}
    >
      <span
        className="text-[9px] font-bold rounded px-1.5 py-0.5 shrink-0 leading-none"
        style={{ backgroundColor: cfg.bg, color: cfg.color }}
      >
        {ext}
      </span>
      <span className="text-[12px] text-fg-2 truncate max-w-[130px]">
        {citation.fileName ?? 'Unknown file'}
      </span>
      {page && (
        <span className="text-[11px] text-fg-4 shrink-0">{page}</span>
      )}
    </motion.button>
  )
}
