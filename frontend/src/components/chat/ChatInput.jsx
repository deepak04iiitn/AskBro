'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, Loader2, FileText, X, GitBranch, Layers } from 'lucide-react'
import useDocumentStore from '@/store/useDocumentStore'
import useGitHubStore from '@/store/useGitHubStore'

const SOURCE_CONFIG = {
  documents: { icon: FileText,  label: 'Documents',  hint: 'Searching your documents' },
  github:    { icon: GitBranch, label: 'GitHub',      hint: 'Searching your repos'     },
  all:       { icon: Layers,    label: 'All sources', hint: 'Searching everything'     },
}

export default function ChatInput({ onSend, disabled }) {
  const documents   = useDocumentStore((s) => s.documents)
  const githubRepos = useGitHubStore((s) => s.repos)
  const readyRepos  = githubRepos.filter((r) => r.status === 'ready')
  const hasGitHub   = readyRepos.length > 0

  const [value, setValue]               = useState('')
  const [focused, setFocused]           = useState(false)
  const [tagged, setTagged]             = useState([])
  const [mentionQuery, setMentionQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownIndex, setDropdownIndex] = useState(0)
  const [source, setSource]             = useState('documents')
  const [showSourceMenu, setShowSourceMenu] = useState(false)

  const textareaRef  = useRef(null)
  const sourceRef    = useRef(null)

  const SOURCES = hasGitHub
    ? ['documents', 'github', 'all']
    : ['documents']

  // ── Suggestions ───────────────────────────────────────────────────────────────
  const taggedDocIds  = new Set(tagged.filter((t) => t.kind === 'doc').map((t) => t.id))
  const taggedRepoIds = new Set(tagged.filter((t) => t.kind === 'repo').map((t) => t.id))
  const q = mentionQuery.toLowerCase()

  const docSuggestions = documents
    .filter((d) => d.status === 'completed' && !taggedDocIds.has(d.document_id))
    .filter((d) => q === '' || d.original_filename.toLowerCase().includes(q))
    .slice(0, 5)
    .map((d) => ({ kind: 'doc', id: d.document_id, label: d.original_filename, fileType: d.file_type }))

  const repoSuggestions = readyRepos
    .filter((r) => !taggedRepoIds.has(r.repo_id))
    .filter((r) => q === '' || r.repo_name.toLowerCase().includes(q) || r.full_name.toLowerCase().includes(q))
    .slice(0, 4)
    .map((r) => ({ kind: 'repo', id: r.repo_id, label: r.repo_name, fullName: r.full_name }))

  const suggestions = [...docSuggestions, ...repoSuggestions]

  // ── Handlers ──────────────────────────────────────────────────────────────────
  function detectMention(text, cursorPos) {
    const match = text.slice(0, cursorPos).match(/@([^\s@]*)$/)
    return match ? match[1] : null
  }

  function handleInput(e) {
    const text = e.target.value
    setValue(text)
    const query = detectMention(text, e.target.selectionStart)
    if (query !== null) { setMentionQuery(query); setShowDropdown(true); setDropdownIndex(0) }
    else { setShowDropdown(false); setMentionQuery('') }
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 180) + 'px'
  }

  function selectItem(item) {
    const cursor = textareaRef.current?.selectionStart ?? value.length
    const before = value.slice(0, cursor).replace(/@([^\s@]*)$/, '')
    const after  = value.slice(cursor)
    setValue(before + after)
    setTagged((prev) => [...prev, item])
    setShowDropdown(false)
    setMentionQuery('')
    setDropdownIndex(0)
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(before.length, before.length)
      }
    }, 0)
  }

  function removeTagged(id) {
    setTagged((prev) => prev.filter((t) => t.id !== id))
  }

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    const docIds  = tagged.filter((t) => t.kind === 'doc').map((t) => t.id)
    const repoIds = tagged.filter((t) => t.kind === 'repo').map((t) => t.id)
    onSend(trimmed, docIds.length ? docIds : undefined, source, repoIds.length ? repoIds : undefined)
    setValue('')
    setTagged([])
    setShowDropdown(false)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e) {
    if (showDropdown && suggestions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setDropdownIndex((i) => Math.min(i + 1, suggestions.length - 1)); return }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setDropdownIndex((i) => Math.max(i - 1, 0)); return }
      if (e.key === 'Enter')     { e.preventDefault(); selectItem(suggestions[dropdownIndex]); return }
      if (e.key === 'Escape')    { setShowDropdown(false); return }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }

  const canSend = !disabled && value.trim().length > 0
  const hasTagged = tagged.length > 0
  const taggedDocCount  = tagged.filter((t) => t.kind === 'doc').length
  const taggedRepoCount = tagged.filter((t) => t.kind === 'repo').length

  const SourceIcon = SOURCE_CONFIG[source].icon

  return (
    <div className="px-6 pb-5 pt-3" style={{ backgroundColor: '#F9F9F7' }}>
      <div className="max-w-[920px] mx-auto relative">

        {/* ── @mention dropdown ────────────────────────────────── */}
        <AnimatePresence>
          {showDropdown && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden z-50"
              style={{ background: '#F9F9F7', border: '1px solid #111111', boxShadow: '4px 4px 0px 0px #111111' }}
            >
              <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #E5E5E0', backgroundColor: '#F0EDE6' }}>
                <p className="np-mono text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#CC0000' }}>
                  ★ Tag a file or repo — type to search
                </p>
              </div>

              {docSuggestions.length > 0 && (
                <div className="px-4 py-1.5" style={{ backgroundColor: '#FAFAF8', borderBottom: '1px solid #F0EDE6' }}>
                  <p className="np-mono text-[9px] font-bold uppercase tracking-widest" style={{ color: '#AEABA6' }}>Documents</p>
                </div>
              )}
              {docSuggestions.map((item, i) => {
                const isActive = i === dropdownIndex
                return (
                  <button key={item.id} type="button" onMouseDown={(e) => { e.preventDefault(); selectItem(item) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer transition-colors"
                    style={{ backgroundColor: isActive ? '#F0EDE6' : '#F9F9F7', borderBottom: '1px solid #F0EDE6' }}
                    onMouseEnter={() => setDropdownIndex(i)}
                  >
                    <div className="w-6 h-6 flex items-center justify-center shrink-0" style={{ backgroundColor: isActive ? '#CC0000' : '#E5E5E0' }}>
                      <FileText className="w-3 h-3" style={{ color: isActive ? '#F9F9F7' : '#7A7874' }} strokeWidth={2} />
                    </div>
                    <span className="flex-1 min-w-0 np-sans text-[13px] font-medium truncate" style={{ color: '#111111' }}>{item.label}</span>
                    <span className="np-mono text-[9px] font-bold px-1.5 py-0.5 shrink-0" style={{ backgroundColor: '#111111', color: '#F9F9F7' }}>
                      {item.fileType?.toUpperCase() ?? 'FILE'}
                    </span>
                  </button>
                )
              })}

              {repoSuggestions.length > 0 && (
                <div className="px-4 py-1.5" style={{ backgroundColor: '#FAFAF8', borderBottom: '1px solid #F0EDE6', borderTop: docSuggestions.length > 0 ? '1px solid #E5E5E0' : 'none' }}>
                  <p className="np-mono text-[9px] font-bold uppercase tracking-widest" style={{ color: '#AEABA6' }}>GitHub Repos</p>
                </div>
              )}
              {repoSuggestions.map((item, ri) => {
                const i = docSuggestions.length + ri
                const isActive = i === dropdownIndex
                return (
                  <button key={item.id} type="button" onMouseDown={(e) => { e.preventDefault(); selectItem(item) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer transition-colors"
                    style={{ backgroundColor: isActive ? '#F0EDE6' : '#F9F9F7', borderBottom: ri < repoSuggestions.length - 1 ? '1px solid #F0EDE6' : 'none' }}
                    onMouseEnter={() => setDropdownIndex(i)}
                  >
                    <div className="w-6 h-6 flex items-center justify-center shrink-0" style={{ backgroundColor: isActive ? '#CC0000' : '#E5E5E0' }}>
                      <GitBranch className="w-3 h-3" style={{ color: isActive ? '#F9F9F7' : '#7A7874' }} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="np-sans text-[13px] font-medium truncate" style={{ color: '#111111' }}>{item.label}</p>
                      <p className="np-mono text-[10px] truncate" style={{ color: '#AEABA6' }}>{item.fullName}</p>
                    </div>
                    <span className="np-mono text-[9px] font-bold px-1.5 py-0.5 shrink-0" style={{ backgroundColor: '#F0EDE6', color: '#CC0000' }}>REPO</span>
                  </button>
                )
              })}

              <div className="px-4 py-2" style={{ backgroundColor: '#F0EDE6', borderTop: '1px solid #E5E5E0' }}>
                <p className="np-mono text-[10px]" style={{ color: '#AEABA6' }}>↑↓ navigate · ↵ select · Esc dismiss</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Source picker dropdown ────────────────────────────── */}
        <AnimatePresence>
          {showSourceMenu && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full mb-2 overflow-hidden z-50"
              style={{ left: 0, minWidth: 180, background: '#F9F9F7', border: '1px solid #111111', boxShadow: '4px 4px 0px 0px #111111' }}
            >
              <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #E5E5E0', backgroundColor: '#F0EDE6' }}>
                <p className="np-mono text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#CC0000' }}>Search in</p>
              </div>
              {SOURCES.map((id) => {
                const cfg = SOURCE_CONFIG[id]
                const Icon = cfg.icon
                const active = source === id
                return (
                  <button
                    key={id}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); setSource(id); setShowSourceMenu(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer transition-colors"
                    style={{ backgroundColor: active ? '#F0EDE6' : '#F9F9F7', borderBottom: '1px solid #F0EDE6' }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = '#FAFAF8' }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = '#F9F9F7' }}
                  >
                    <div className="w-6 h-6 flex items-center justify-center shrink-0" style={{ backgroundColor: active ? '#111111' : '#E5E5E0' }}>
                      <Icon className="w-3 h-3" style={{ color: active ? '#F9F9F7' : '#7A7874' }} strokeWidth={2} />
                    </div>
                    <span className="np-sans text-[13px] font-medium" style={{ color: '#111111' }}>{cfg.label}</span>
                    {active && <span className="ml-auto np-mono text-[9px] font-bold" style={{ color: '#CC0000' }}>✓</span>}
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Input card ───────────────────────────────────────── */}
        <div
          className="bg-white transition-all duration-150"
          style={{
            border: focused ? '1.5px solid #111111' : '1.5px solid #E5E5E0',
            boxShadow: focused ? '4px 4px 0px 0px #111111' : '0 2px 8px rgba(0,0,0,0.06)',
            padding: hasTagged ? '10px 14px 14px' : '14px',
          }}
        >
          {/* Tagged chips */}
          {hasTagged && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {tagged.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1 np-mono text-[11px] font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: item.kind === 'repo' ? '#FEF2F2' : '#111111',
                    color: item.kind === 'repo' ? '#CC0000' : '#F9F9F7',
                    border: item.kind === 'repo' ? '1px solid #FECACA' : 'none',
                  }}
                >
                  {item.kind === 'repo'
                    ? <GitBranch className="w-3 h-3 shrink-0" strokeWidth={2} />
                    : <FileText  className="w-3 h-3 shrink-0" strokeWidth={2} />
                  }
                  <span className="max-w-[160px] truncate">{item.label}</span>
                  <button
                    type="button"
                    onClick={() => removeTagged(item.id)}
                    className="cursor-pointer transition-colors ml-0.5"
                    style={{ color: item.kind === 'repo' ? '#FECACA' : '#AEABA6' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#CC0000' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = item.kind === 'repo' ? '#FECACA' : '#AEABA6' }}
                  >
                    <X className="w-3 h-3" strokeWidth={2.5} />
                  </button>
                </span>
              ))}
              <span className="np-mono text-[11px] self-center" style={{ color: '#AEABA6' }}>
                {taggedDocCount > 0 && taggedRepoCount > 0
                  ? `${taggedDocCount} file${taggedDocCount > 1 ? 's' : ''} · ${taggedRepoCount} repo${taggedRepoCount > 1 ? 's' : ''}`
                  : taggedDocCount > 0
                  ? `Answering only from ${taggedDocCount === 1 ? 'this file' : 'these files'}`
                  : `Answering only from ${taggedRepoCount === 1 ? 'this repo' : 'these repos'}`
                }
              </span>
            </div>
          )}

          {/* Source icon + textarea + send */}
          <div className="flex items-center gap-3">

            {/* Source toggle button */}
            {hasGitHub && (
              <div className="relative shrink-0" ref={sourceRef}>
                <button
                  type="button"
                  onClick={() => setShowSourceMenu((v) => !v)}
                  onBlur={() => setTimeout(() => setShowSourceMenu(false), 150)}
                  title={`Search in: ${SOURCE_CONFIG[source].label}`}
                  className="w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
                  style={{
                    backgroundColor: showSourceMenu ? '#111111' : '#F0EDE6',
                    color: showSourceMenu ? '#F9F9F7' : '#7A7874',
                    border: '1px solid #E5E5E0',
                  }}
                  onMouseEnter={(e) => {
                    if (!showSourceMenu) { e.currentTarget.style.backgroundColor = '#E5E5E0'; e.currentTarget.style.color = '#111111' }
                  }}
                  onMouseLeave={(e) => {
                    if (!showSourceMenu) { e.currentTarget.style.backgroundColor = '#F0EDE6'; e.currentTarget.style.color = '#7A7874' }
                  }}
                >
                  <SourceIcon className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            )}

            <textarea
              ref={textareaRef}
              rows={1}
              value={value}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => { setFocused(false); setTimeout(() => setShowDropdown(false), 150) }}
              disabled={disabled}
              placeholder={
                disabled ? 'AskBro is thinking…' :
                hasTagged ? `Ask about the tagged ${taggedRepoCount > 0 && taggedDocCount === 0 ? 'repo(s)' : taggedDocCount > 0 && taggedRepoCount === 0 ? 'file(s)' : 'sources'}…` :
                hasGitHub ? 'Ask anything… type @ to tag a file or repo' :
                'Ask anything… type @ to filter by file'
              }
              className="flex-1 resize-none bg-transparent focus:outline-none py-0.5 leading-relaxed np-body"
              style={{ fontSize: '15px', color: '#111111', opacity: disabled ? 0.5 : 1 }}
            />

            <button
              onClick={submit}
              disabled={!canSend}
              aria-label="Send"
              className="shrink-0 w-10 h-10 flex items-center justify-center text-white cursor-pointer transition-all disabled:cursor-not-allowed"
              style={{ backgroundColor: canSend ? '#CC0000' : '#E5E5E0' }}
              onMouseEnter={(e) => { if (canSend) e.currentTarget.style.backgroundColor = '#AA0000' }}
              onMouseLeave={(e) => { if (canSend) e.currentTarget.style.backgroundColor = '#CC0000' }}
              onMouseDown={(e) => { if (canSend) e.currentTarget.style.transform = 'scale(0.95)' }}
              onMouseUp={(e) => { e.currentTarget.style.transform = '' }}
            >
              {disabled
                ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#AEABA6' }} strokeWidth={2.5} />
                : <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
              }
            </button>
          </div>
        </div>

        {/* Bottom hint */}
        <div className="flex items-center justify-between mt-2 px-1">
          <AnimatePresence>
            {focused && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="np-mono text-[10px]" style={{ color: '#AEABA6' }}
              >
                ↵ send · ⇧↵ new line · @ to tag
              </motion.p>
            )}
          </AnimatePresence>
          <p className="np-mono text-[10px] ml-auto" style={{ color: '#AEABA6' }}>
            {SOURCE_CONFIG[source].hint}
          </p>
        </div>
      </div>
    </div>
  )
}
