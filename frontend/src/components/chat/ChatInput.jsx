'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

  return (
    <div className="border-t border-border bg-white px-6 py-4">
      <div className="max-w-[760px] mx-auto">

        <motion.div
          animate={{
            borderColor: focused ? '#4361EE' : '#E4E7EF',
            boxShadow: focused
              ? '0 0 0 3px rgba(67,97,238,0.1), 0 2px 8px rgba(0,0,0,0.06)'
              : '0 2px 8px rgba(0,0,0,0.04)',
          }}
          transition={{ duration: 0.18 }}
          className="flex items-end gap-3 bg-white border rounded-2xl px-4 py-3"
          style={{ borderColor: '#E4E7EF' }}
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
            className="flex-1 resize-none bg-transparent text-[15px] text-fg placeholder:text-fg-4 focus:outline-none disabled:opacity-50 py-0.5 leading-relaxed"
          />

          <motion.button
            onClick={submit}
            disabled={disabled || !value.trim()}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            aria-label="Send"
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-white cursor-pointer"
            style={{
              background: (disabled || !value.trim())
                ? '#E4E7EF'
                : 'linear-gradient(135deg, #4361EE 0%, #7C3AED 100%)',
              boxShadow: (disabled || !value.trim()) ? 'none' : '0 4px 16px rgba(67,97,238,0.35)',
              transition: 'background 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {focused && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="mt-2 text-[11px] text-fg-4"
            >
              ↵ to send · ⇧↵ for new line
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
