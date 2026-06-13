'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, Loader2, FileText, X } from 'lucide-react'
import useDocumentStore from '@/store/useDocumentStore'

export default function ChatInput({ onSend, disabled }) {
  const documents = useDocumentStore((s) => s.documents)

  const [value, setValue]             = useState('')
  const [focused, setFocused]         = useState(false)
  const [taggedDocs, setTaggedDocs]   = useState([])
  const [mentionQuery, setMentionQuery]       = useState('')
  const [showDropdown, setShowDropdown]       = useState(false)
  const [dropdownIndex, setDropdownIndex]     = useState(0)

  const textareaRef = useRef(null)

  const suggestions = documents
    .filter((d) => d.status === 'completed')
    .filter((d) => !taggedDocs.some((t) => t.document_id === d.document_id))
    .filter((d) =>
      mentionQuery === '' ||
      d.original_filename.toLowerCase().includes(mentionQuery.toLowerCase())
    )
    .slice(0, 6)

  function detectMention(text, cursorPos) {
    const before = text.slice(0, cursorPos)
    const match = before.match(/@([^\s@]*)$/)
    return match ? match[1] : null
  }

  function handleInput(e) {
    const text = e.target.value
    setValue(text)
    const cursor = e.target.selectionStart
    const query = detectMention(text, cursor)
    if (query !== null) {
      setMentionQuery(query)
      setShowDropdown(true)
      setDropdownIndex(0)
    } else {
      setShowDropdown(false)
      setMentionQuery('')
    }
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 180) + 'px'
  }

  function selectDoc(doc) {
    const cursor = textareaRef.current?.selectionStart ?? value.length
    const before = value.slice(0, cursor).replace(/@([^\s@]*)$/, '')
    const after  = value.slice(cursor)
    setValue(before + after)
    setTaggedDocs((prev) => [...prev, { document_id: doc.document_id, original_filename: doc.original_filename, file_type: doc.file_type }])
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

  function removeTag(id) {
    setTaggedDocs((prev) => prev.filter((d) => d.document_id !== id))
  }

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    const docIds = taggedDocs.length > 0 ? taggedDocs.map((d) => d.document_id) : undefined
    onSend(trimmed, docIds)
    setValue('')
    setTaggedDocs([])
    setShowDropdown(false)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e) {
    if (showDropdown && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setDropdownIndex((i) => Math.min(i + 1, suggestions.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setDropdownIndex((i) => Math.max(i - 1, 0))
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        selectDoc(suggestions[dropdownIndex])
        return
      }
      if (e.key === 'Escape') {
        setShowDropdown(false)
        return
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const canSend = !disabled && value.trim().length > 0

  return (
    <div className="px-6 pb-5 pt-3" style={{ backgroundColor: '#F9F9F7' }}>
      <div className="max-w-[920px] mx-auto relative">

        {/* ── @mention dropdown ─────────────────────────────────── */}
        <AnimatePresence>
          {showDropdown && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden z-50"
              style={{ background: '#F9F9F7', border: '1px solid #111111', boxShadow: '4px 4px 0px 0px #111111' }}
            >
              {/* Header */}
              <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #E5E5E0', backgroundColor: '#F0EDE6' }}>
                <p className="np-mono text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#CC0000' }}>
                  ★ Filter by document — type to search
                </p>
              </div>

              {/* Suggestions */}
              {suggestions.map((doc, i) => {
                const ext = doc.file_type?.toUpperCase() ?? 'FILE'
                return (
                  <button
                    key={doc.document_id}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); selectDoc(doc) }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer transition-colors"
                    style={{
                      backgroundColor: i === dropdownIndex ? '#F0EDE6' : '#F9F9F7',
                      borderBottom: i < suggestions.length - 1 ? '1px solid #E5E5E0' : 'none',
                    }}
                    onMouseEnter={() => setDropdownIndex(i)}
                  >
                    <div
                      className="w-7 h-7 flex items-center justify-center shrink-0"
                      style={{ backgroundColor: i === dropdownIndex ? '#CC0000' : '#E5E5E0' }}
                    >
                      <FileText className="w-3.5 h-3.5" style={{ color: i === dropdownIndex ? '#F9F9F7' : '#7A7874' }} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="np-sans text-[13px] font-medium truncate" style={{ color: '#111111' }}>
                        {doc.original_filename}
                      </p>
                    </div>
                    <span
                      className="np-mono text-[9px] font-bold px-1.5 py-0.5 shrink-0"
                      style={{ backgroundColor: '#111111', color: '#F9F9F7' }}
                    >
                      {ext}
                    </span>
                  </button>
                )
              })}

              {/* Footer hint */}
              <div className="px-4 py-2" style={{ backgroundColor: '#F0EDE6', borderTop: '1px solid #E5E5E0' }}>
                <p className="np-mono text-[10px]" style={{ color: '#AEABA6' }}>
                  ↑↓ navigate · ↵ select · Esc dismiss
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Input card ─────────────────────────────────────────── */}
        <div
          className="bg-white px-4 transition-all duration-150"
          style={{
            border: focused ? '1.5px solid #111111' : '1.5px solid #E5E5E0',
            boxShadow: focused ? '4px 4px 0px 0px #111111' : '0 2px 8px rgba(0,0,0,0.06)',
            paddingTop: taggedDocs.length > 0 ? '10px' : '14px',
            paddingBottom: '14px',
          }}
        >
          {/* Tagged file chips */}
          {taggedDocs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {taggedDocs.map((doc) => (
                <span
                  key={doc.document_id}
                  className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1 np-mono text-[11px] font-bold uppercase tracking-wide"
                  style={{ backgroundColor: '#111111', color: '#F9F9F7' }}
                >
                  <FileText className="w-3 h-3 shrink-0" strokeWidth={2} />
                  <span className="max-w-[160px] truncate">{doc.original_filename}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(doc.document_id)}
                    className="cursor-pointer transition-colors ml-0.5"
                    style={{ color: '#AEABA6' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#CC0000' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#AEABA6' }}
                  >
                    <X className="w-3 h-3" strokeWidth={2.5} />
                  </button>
                </span>
              ))}
              <span className="np-mono text-[11px] self-center" style={{ color: '#AEABA6' }}>
                Answering only from {taggedDocs.length === 1 ? 'this file' : 'these files'}
              </span>
            </div>
          )}

          {/* Textarea + send button */}
          <div className="flex items-center gap-3">
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
                taggedDocs.length > 0 ? 'Ask about the tagged file(s)…' :
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
              style={{
                backgroundColor: canSend ? '#CC0000' : '#E5E5E0',
              }}
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

        {/* Bottom hint row */}
        <div className="flex items-center justify-between mt-2 px-1">
          <AnimatePresence>
            {focused && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="np-mono text-[10px]" style={{ color: '#AEABA6' }}
              >
                ↵ send · ⇧↵ new line · @ to tag a file
              </motion.p>
            )}
          </AnimatePresence>
          <p className="np-mono text-[10px] ml-auto" style={{ color: '#AEABA6' }}>
            Answers grounded in your uploaded documents
          </p>
        </div>
      </div>
    </div>
  )
}
