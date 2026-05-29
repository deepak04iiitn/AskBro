'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { streamChat } from '@/lib/stream'
import useChatStore from '@/store/useChatStore'
import useDocumentStore from '@/store/useDocumentStore'
import MessageBubble, { buildSourceId } from './MessageBubble'
import ChatInput from './ChatInput'
import { PAGE_ANIM, ITEM_ANIM, PANEL_SLIDE } from '@/lib/animations'

const SUGGESTIONS = [
  {
    icon: '📊',
    title: 'Summarize a document',
    example: 'Summarize the key points from the latest report.',
    color: '#EFF6FF',
  },
  {
    icon: '🔍',
    title: 'Find specific info',
    example: 'What are the main risks mentioned in the SLA?',
    color: '#F0FDF4',
  },
  {
    icon: '⚖️',
    title: 'Compare documents',
    example: 'What changed between version 1 and version 2?',
    color: '#FFF7ED',
  },
  {
    icon: '✅',
    title: 'Extract action items',
    example: 'List all action items from the meeting notes.',
    color: '#F5F3FF',
  },
]

function EmptyState({ readyCount, onSuggest }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center select-none">
      {/* Floating logo */}
      <img
        src="/AskBro_Logo.png"
        alt="AskBro"
        className="w-16 h-16 object-contain mb-6 animate-float"
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <h2 className="text-[1.75rem] font-bold text-fg tracking-tight mb-2">
          Ask anything
        </h2>
        <p className="text-[14px] text-fg-3 max-w-sm leading-relaxed mb-8">
          {readyCount > 0
            ? `Your workspace has ${readyCount} document${readyCount !== 1 ? 's' : ''} indexed and ready to search.`
            : 'Upload some documents to start asking questions.'}
        </p>
      </motion.div>

      {readyCount > 0 && (
        <motion.div
          {...PAGE_ANIM}
          className="grid grid-cols-2 gap-3 w-full max-w-[520px]"
        >
          {SUGGESTIONS.map((s) => (
            <motion.button
              key={s.title}
              {...ITEM_ANIM}
              whileHover={{
                y: -4,
                boxShadow: '0 16px 32px rgba(0,0,0,0.09)',
                borderColor: '#4361EE',
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onClick={() => onSuggest(s.example)}
              className="bg-white border border-border rounded-2xl px-5 py-4 text-left cursor-pointer"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                style={{ backgroundColor: s.color }}
              >
                {s.icon}
              </div>
              <p className="text-[13px] font-semibold text-fg mb-1">{s.title}</p>
              <p className="text-[12px] text-fg-3 leading-relaxed">"{s.example}"</p>
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default function ChatWindow() {
  const messages    = useChatStore((s) => s.messages)
  const streaming   = useChatStore((s) => s.streaming)
  const addMessage  = useChatStore((s) => s.addMessage)
  const appendToken = useChatStore((s) => s.appendToken)
  const setCitations = useChatStore((s) => s.setCitations)
  const setStreaming  = useChatStore((s) => s.setStreaming)
  const documents    = useDocumentStore((s) => s.documents)

  const [activeSource, setActiveSource] = useState(null)
  const bottomRef = useRef(null)

  const readyCount = documents.filter((d) => d.status === 'completed').length

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(query) {
    if (streaming) return
    addMessage({ role: 'user', content: query })
    addMessage({ role: 'assistant', content: '', streaming: true })
    setStreaming(true)
    try {
      for await (const event of streamChat(query)) {
        if (event.error) appendToken('\n\n⚠ ' + event.error)
        else if (event.done && event.citations !== undefined) setCitations(event.citations)
        else if (event.token) appendToken(event.token)
      }
    } catch {
      appendToken('\n\n⚠ Something went wrong. Please try again.')
      setCitations([])
    }
  }

  function handleOpenSource(citation) {
    const id = buildSourceId(citation)
    setActiveSource((prev) => (prev?.id === id ? null : { id, ...citation }))
  }

  return (
    <div className="flex flex-col h-full bg-surface">

      {/* Top bar */}
      <div className="h-14 shrink-0 border-b border-border bg-white flex items-center justify-between px-6">
        <span className="text-[15px] font-semibold text-fg">
          {messages.length === 0
            ? <span className="text-fg-4">New conversation</span>
            : 'Chat'}
        </span>
        <div className="flex items-center gap-5">
          {readyCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-brand"
                style={{ backgroundColor: '#EEF2FF' }}
              >
                {readyCount}
              </span>
              <span className="text-[12px] text-fg-3">docs indexed</span>
            </div>
          )}
          <Link
            href="/upload"
            className="text-[13px] font-medium text-brand hover:opacity-75 transition-opacity"
          >
            Upload →
          </Link>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">

        {/* Chat column */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-8">
            {messages.length === 0 ? (
              <EmptyState readyCount={readyCount} onSuggest={handleSend} />
            ) : (
              <div className="max-w-[760px] mx-auto px-6 space-y-8">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    activeSourceId={activeSource?.id}
                    onOpenSource={handleOpenSource}
                  />
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <ChatInput onSend={handleSend} disabled={streaming} />
        </div>

        {/* Source panel */}
        <AnimatePresence>
          {activeSource && (
            <motion.div
              {...PANEL_SLIDE}
              className="w-80 shrink-0 border-l border-border bg-white flex flex-col overflow-hidden"
            >
              {/* Panel header */}
              <div className="px-5 py-4 border-b border-border shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-fg truncate">{activeSource.fileName}</p>
                    {activeSource.pageNumber != null && (
                      <p className="text-[11px] text-fg-4 mt-0.5">Page {activeSource.pageNumber}</p>
                    )}
                  </div>
                  <motion.button
                    onClick={() => setActiveSource(null)}
                    whileHover={{ backgroundColor: '#F1F3F9' }}
                    whileTap={{ scale: 0.9 }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-fg-4 hover:text-fg transition-colors cursor-pointer shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
              </div>

              {/* Excerpt with animated highlight */}
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <p className="text-[11px] font-semibold text-fg-4 uppercase tracking-widest mb-3">
                  Relevant excerpt
                </p>
                {activeSource.chunkPreview ? (
                  <div className="relative rounded-lg overflow-hidden">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="absolute inset-0"
                      style={{ transformOrigin: 'left', backgroundColor: '#FEFCE8', zIndex: 0 }}
                    />
                    <p className="relative text-[13px] text-fg-2 leading-relaxed px-3 py-3" style={{ zIndex: 1 }}>
                      {activeSource.chunkPreview}
                    </p>
                  </div>
                ) : (
                  <p className="text-[12px] text-fg-4">No preview available.</p>
                )}
              </div>

              {/* Panel footer */}
              <div className="px-5 py-3 border-t border-border shrink-0 flex items-center justify-between">
                <span className="text-[11px] text-fg-4">Source document</span>
                <Link
                  href="/upload"
                  className="text-[12px] text-brand hover:underline font-medium"
                >
                  View all docs →
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
