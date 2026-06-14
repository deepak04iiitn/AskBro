'use client'

import { FileText, GitCommitHorizontal, CircleDot, GitPullRequest } from 'lucide-react'

const SOURCE_TYPE_META = {
  file:         { Icon: FileText,            label: 'FILE' },
  commit:       { Icon: GitCommitHorizontal, label: 'COMMIT' },
  issue:        { Icon: CircleDot,           label: 'ISSUE' },
  pull_request: { Icon: GitPullRequest,      label: 'PR' },
}

function getGitHubDisplay(citation) {
  const type = citation.sourceType ?? 'file'
  const meta = SOURCE_TYPE_META[type] ?? SOURCE_TYPE_META.file
  let name = ''

  if (type === 'file') {
    // Show just the filename portion of the path
    const parts = (citation.filePath ?? '').split('/')
    name = parts[parts.length - 1] || citation.repoFullName || 'Unknown file'
  } else if (type === 'commit') {
    name = citation.repoFullName ?? 'Unknown repo'
  } else if (type === 'issue') {
    name = citation.repoFullName ?? 'Unknown repo'
  } else if (type === 'pull_request') {
    name = citation.repoFullName ?? 'Unknown repo'
  }

  return { ...meta, name }
}

export default function CitationCard({ citation, onOpen, isActive }) {
  const isGitHub = citation.isGitHub === true

  let Icon, label, name, page

  if (isGitHub) {
    const d = getGitHubDisplay(citation)
    Icon  = d.Icon
    label = d.label
    name  = d.name
    page  = null
  } else {
    const ext = citation.fileName?.split('.').pop()?.toUpperCase() ?? 'FILE'
    Icon  = FileText
    label = ext
    name  = citation.fileName ?? 'Unknown file'
    page  = citation.pageNumber != null ? `p.${citation.pageNumber}` : null
  }

  const accentColor = isGitHub ? '#1A4F8A' : '#CC0000'
  const activeBg    = isGitHub ? '#1A4F8A' : '#111111'

  return (
    <button
      onClick={() => onOpen?.(citation)}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-left cursor-pointer transition-all"
      style={{
        backgroundColor: isActive ? activeBg : '#F5F0E8',
        border: `1px solid ${isActive ? activeBg : '#E5E5E0'}`,
        boxShadow: isActive ? `2px 2px 0px 0px ${accentColor}` : 'none',
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
      <Icon className="w-3 h-3 shrink-0" style={{ color: isActive ? '#F9F9F7' : '#AEABA6' }} strokeWidth={2} />
      <span className="np-mono text-[9px] font-bold uppercase shrink-0" style={{ color: isActive ? '#F9F9F7' : accentColor }}>
        {label}
      </span>
      <span className="np-sans text-[12px] truncate max-w-35" style={{ color: isActive ? '#F9F9F7' : '#3D3C3A' }}>
        {name}
      </span>
      {page && (
        <span className="np-mono text-[11px] shrink-0" style={{ color: isActive ? '#D9D7D2' : '#AEABA6' }}>{page}</span>
      )}
    </button>
  )
}
