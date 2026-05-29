'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

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
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  const canSend = !disabled && value.trim().length > 0

  return (
    <div className="bg-white px-6 py-4" style={{ borderTop: '1px solid #E3E1DC' }}>
      <div className="max-w-[860px] mx-auto">
        <div
          className="flex items-end gap-3 bg-white rounded-xl px-4 py-3 transition-all duration-150"
          style={{
            border: focused ? '1.5px solid #4361EE' : '1.5px solid #E3E1DC',
            boxShadow: focused ? '0 0 0 3px rgba(67,97,238,0.10)' : 'none',
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
            placeholder={disabled ? 'AskBro is thinking…' : 'Ask about your documents…'}
            className="flex-1 resize-none bg-transparent focus:outline-none py-0.5 leading-relaxed disabled:opacity-50"
            style={{ fontSize: '15px', color: '#111110' }}
          />

          <button
            onClick={submit}
            disabled={!canSend}
            aria-label="Send"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-white cursor-pointer transition-colors disabled:cursor-not-allowed"
            style={{ backgroundColor: canSend ? '#4361EE' : '#E3E1DC' }}
            onMouseEnter={(e) => { if (canSend) e.currentTarget.style.backgroundColor = '#3451D6' }}
            onMouseLeave={(e) => { if (canSend) e.currentTarget.style.backgroundColor = canSend ? '#4361EE' : '#E3E1DC' }}
            onMouseDown={(e) => { if (canSend) e.currentTarget.style.transform = 'scale(0.97)' }}
            onMouseUp={(e) => { e.currentTarget.style.transform = '' }}
          >
            <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        <AnimatePresence>
          {focused && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="mt-2 text-[11px]"
              style={{ color: '#AEABA6' }}
            >
              ↵ to send · ⇧↵ for new line
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
