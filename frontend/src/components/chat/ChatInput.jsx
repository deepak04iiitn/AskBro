'use client'

import { useRef, useState } from 'react'

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    // Reset height
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
    // Auto-grow up to 160px
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  return (
    <div className="border-t border-zinc-200 bg-white px-4 py-3">
      <div className="flex items-end gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-zinc-900 focus-within:border-transparent transition">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          placeholder={disabled ? 'AskBro is thinking…' : 'Ask a question about your documents…'}
          className="flex-1 resize-none bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:opacity-50 py-0.5"
        />

        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Send"
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-900 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <p className="text-center text-[10px] text-zinc-400 mt-2">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}
