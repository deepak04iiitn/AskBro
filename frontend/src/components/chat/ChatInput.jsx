'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, Loader2 } from 'lucide-react'

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef(null)

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function handleInput(e) {
    setValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 180) + 'px'
  }

  const canSend = !disabled && value.trim().length > 0

  return (
    <div
      className="px-6 pb-5 pt-3"
      style={{ backgroundColor: '#F7F5F2' }}
    >
      <div className="max-w-[860px] mx-auto">

        {/* Input card — floating style */}
        <div
          className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 transition-all duration-150"
          style={{
            boxShadow: focused
              ? '0 0 0 2px #4361EE, 0 8px 32px rgba(0,0,0,0.10)'
              : '0 4px 20px rgba(0,0,0,0.08), 0 0 0 1.5px #E3E1DC',
          }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            placeholder={disabled ? 'AskBro is thinking…' : 'Ask anything about your documents…'}
            className="flex-1 resize-none bg-transparent focus:outline-none py-0.5 leading-relaxed"
            style={{
              fontSize: '15px',
              color: '#111110',
              opacity: disabled ? 0.5 : 1,
            }}
          />

          {/* Send / Loading button */}
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
            onMouseLeave={(e) => { if (canSend) e.currentTarget.style.backgroundColor = '#4361EE' }}
            onMouseDown={(e) => { if (canSend) e.currentTarget.style.transform = 'scale(0.95)' }}
            onMouseUp={(e) => { e.currentTarget.style.transform = '' }}
          >
            {disabled
              ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#AEABA6' }} strokeWidth={2.5} />
              : <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
            }
          </button>
        </div>

        {/* Bottom row: shortcut hint + disclaimer */}
        <div className="flex items-center justify-between mt-2 px-1">
          <AnimatePresence>
            {focused && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-[11px]"
                style={{ color: '#AEABA6' }}
              >
                ↵ send · ⇧↵ new line
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
