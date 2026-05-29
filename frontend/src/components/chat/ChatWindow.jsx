'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, FileSearch, GitCompare, ListChecks, ArrowUpRight, X } from 'lucide-react'
import { streamChat } from '@/lib/stream'
import useChatStore from '@/store/useChatStore'
import useDocumentStore from '@/store/useDocumentStore'
import MessageBubble, { buildSourceId } from './MessageBubble'
import ChatInput from './ChatInput'
import { PANEL_SLIDE } from '@/lib/animations'

const SUGGESTIONS = [
  {
    Icon: BookOpen,
    label: 'Summarise',
    example: 'Summarize the key points from the latest report.',
  },
  {
    Icon: FileSearch,
    label: 'Find specific info',
    example: 'What are the main risks mentioned in the SLA?',
  },
  {
    Icon: GitCompare,
    label: 'Compare documents',
    example: 'What changed between version 1 and version 2?',
  },
  {
    Icon: ListChecks,
    label: 'Action items',
    example: 'List all action items from the meeting notes.',
  },
]

function EmptyState({ readyCount, onSuggest }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center select-none">
      <h2
        className="font-bold tracking-[-0.02em]"
        style={{ fontSize: '28px', color: '#111110' }}
      >
        What would you like to know?
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed" style={{ color: '#AEABA6' }}>
        {readyCount > 0
          ? `Your workspace has ${readyCount} document${readyCount !== 1 ? 's' : ''} indexed and ready.`
          : 'Upload documents to start asking questions.'}
      </p>

      {readyCount === 0 && (
        <Link
          href="/upload"
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium hover:underline"
          style={{ color: '#4361EE' }}
        >
          Upload your first document
          <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
        </Link>
      )}

      {readyCount > 0 && (
        <>
          <div
            className="w-full max-w-[680px] mt-10 mb-8"
            style={{ borderTop: '1px solid #E3E1DC' }}
          />
          <div className="grid grid-cols-2 gap-3 w-full max-w-[680px]">
            {SUGGESTIONS.map(({ Icon, label, example }) => (
              <button
                key={label}
                onClick={() => onSuggest(example)}
                className="bg-white rounded-xl p-5 text-left cursor-pointer transition-colors"
                style={{ border: '1px solid #E3E1DC' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F7F5F2'
                  e.currentTarget.style.borderColor = '#4361EE'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white'
                  e.currentTarget.style.borderColor = '#E3E1DC'
                }}
              >
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest mb-2"
                  style={{ color: '#AEABA6' }}
                >
                  {label}
                </p>
                <p className="text-[13px] leading-[1.6]" style={{ color: '#7A7874' }}>
                  "{example}"
                </p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function ChatWindow() {
  const messages     = useChatStore((s) => s.messages)
  const streaming    = useChatStore((s) => s.streaming)
  const addMessage   = useChatStore((s) => s.addMessage)
  const appendToken  = useChatStore((s) => s.appendToken)
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
    <div className="flex flex-col h-full bg-white">
      <div className="flex flex-1 overflow-hidden">

        {/* ── Chat column ─────────────────────────────────────── */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <div className="flex-1 overflow-y-auto py-10">
            {messages.length === 0 ? (
              <EmptyState readyCount={readyCount} onSuggest={handleSend} />
            ) : (
              <div className="max-w-[860px] mx-auto px-6 space-y-8">
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

        {/* ── Source panel ─────────────────────────────────────── */}
        <AnimatePresence>
          {activeSource && (
            <motion.div
              {...PANEL_SLIDE}
              className="w-[320px] shrink-0 flex flex-col overflow-hidden bg-white"
              style={{ borderLeft: '1px solid #E3E1DC' }}
            >
              <div className="px-5 py-4 shrink-0" style={{ borderBottom: '1px solid #E3E1DC' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: '#111110' }}>
                      {activeSource.fileName}
                    </p>
                    {activeSource.pageNumber != null && (
                      <p className="text-[11px] mt-0.5" style={{ color: '#AEABA6' }}>
                        Page {activeSource.pageNumber}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveSource(null)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors shrink-0"
                    style={{ color: '#AEABA6' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F4F3F0'
                      e.currentTarget.style.color = '#3D3C3A'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = ''
                      e.currentTarget.style.color = '#AEABA6'
                    }}
                  >
                    <X className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest mb-3"
                  style={{ color: '#AEABA6' }}
                >
                  Relevant excerpt
                </p>
                {activeSource.chunkPreview ? (
                  <div
                    className="rounded-lg px-4 py-4"
                    style={{ backgroundColor: '#FEFCE8', borderLeft: '3px solid #D97706' }}
                  >
                    <p className="text-[13px] leading-[1.7]" style={{ color: '#3D3C3A' }}>
                      {activeSource.chunkPreview}
                    </p>
                  </div>
                ) : (
                  <p className="text-[12px]" style={{ color: '#AEABA6' }}>No preview available.</p>
                )}
              </div>

              <div
                className="px-5 py-3 shrink-0 flex items-center justify-between"
                style={{ borderTop: '1px solid #E3E1DC' }}
              >
                <span className="text-[11px]" style={{ color: '#AEABA6' }}>Source document</span>
                <Link
                  href="/upload"
                  className="text-[12px] font-medium hover:underline"
                  style={{ color: '#4361EE' }}
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
