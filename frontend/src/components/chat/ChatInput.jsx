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

  // ── Document suggestions ──────────────────────────────────────
  const suggestions = documents
    .filter((d) => d.status === 'completed')
    .filter((d) => !taggedDocs.some((t) => t.document_id === d.document_id))
    .filter((d) =>
      mentionQuery === '' ||
      d.original_filename.toLowerCase().includes(mentionQuery.toLowerCase())
    )
    .slice(0, 6)

  // ── @mention detection ────────────────────────────────────────
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
    <div className="px-6 pb-5 pt-3" style={{ backgroundColor: '#F7F5F2' }}>
      <div className="max-w-[860px] mx-auto relative">

        {/* ── @mention dropdown — appears above the input ────────── */}
        <AnimatePresence>
          {showDropdown && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl overflow-hidden z-50"
              style={{ border: '1.5px solid #E3E1DC', boxShadow: '0 8px 28px rgba(0,0,0,0.12)' }}
            >
              {/* Header */}
              <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #F0EFEC', backgroundColor: '#F7F5F2' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#AEABA6' }}>
                  Filter by document — type to search
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
                      backgroundColor: i === dropdownIndex ? '#EEF1FD' : 'white',
                      borderBottom: i < suggestions.length - 1 ? '1px solid #F4F3F0' : 'none',
                    }}
                    onMouseEnter={() => setDropdownIndex(i)}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: i === dropdownIndex ? '#C7D2FE' : '#F0EFEC' }}
                    >
                      <FileText className="w-3.5 h-3.5" style={{ color: i === dropdownIndex ? '#4361EE' : '#AEABA6' }} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate" style={{ color: '#111110' }}>
                        {doc.original_filename}
                      </p>
                    </div>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                      style={{ backgroundColor: '#F0EFEC', color: '#7A7874' }}
                    >
                      {ext}
                    </span>
                  </button>
                )
              })}

              {/* Footer hint */}
              <div className="px-4 py-2" style={{ backgroundColor: '#F7F5F2', borderTop: '1px solid #F0EFEC' }}>
                <p className="text-[10px]" style={{ color: '#AEABA6' }}>
                  ↑↓ navigate · ↵ select · Esc dismiss
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Input card ─────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl px-4 transition-all duration-150"
          style={{
            boxShadow: focused
              ? '0 0 0 2px #4361EE, 0 8px 32px rgba(0,0,0,0.10)'
              : '0 4px 20px rgba(0,0,0,0.08), 0 0 0 1.5px #E3E1DC',
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
                  className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-lg text-[12px] font-semibold"
                  style={{ backgroundColor: '#EEF1FD', color: '#4361EE', border: '1px solid #C7D2FE' }}
                >
                  <FileText className="w-3 h-3 shrink-0" strokeWidth={2} />
                  <span className="max-w-[160px] truncate">{doc.original_filename}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(doc.document_id)}
                    className="cursor-pointer rounded transition-colors ml-0.5"
                    style={{ color: '#7C9AEE' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#DC2626' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#7C9AEE' }}
                  >
                    <X className="w-3 h-3" strokeWidth={2.5} />
                  </button>
                </span>
              ))}
              <span className="text-[11px] self-center" style={{ color: '#AEABA6' }}>
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
              className="flex-1 resize-none bg-transparent focus:outline-none py-0.5 leading-relaxed"
              style={{ fontSize: '15px', color: '#111110', opacity: disabled ? 0.5 : 1 }}
            />

            <button
              onClick={submit}
              disabled={!canSend}
              aria-label="Send"
              className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-white cursor-pointer transition-all disabled:cursor-not-allowed"
              style={{
                backgroundColor: canSend ? '#4361EE' : '#E3E1DC',
                boxShadow: canSend ? '0 4px 12px rgba(67,97,238,0.30)' : 'none',
              }}
              onMouseEnter={(e) => { if (canSend) e.currentTarget.style.backgroundColor = '#3451D6' }}
              onMouseLeave={(e) => { if (canSend) e.currentTarget.style.backgroundColor = canSend ? '#4361EE' : '#E3E1DC' }}
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
                className="text-[11px]" style={{ color: '#AEABA6' }}
              >
                ↵ send · ⇧↵ new line · @ to tag a file
              </motion.p>
            )}
          </AnimatePresence>
          <p className="text-[11px] ml-auto" style={{ color: '#AEABA6' }}>
            Answers grounded in your uploaded documents
          </p>
        </div>
      </div>
    </div>
  )
}
