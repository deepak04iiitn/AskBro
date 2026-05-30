'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, FileSearch, GitCompare, ListChecks,
  ArrowUpRight, X, FileX,
} from 'lucide-react'
import { streamChat } from '@/lib/stream'
import { getChatMessages } from '@/lib/api'
import useChatStore from '@/store/useChatStore'
import useChatsStore from '@/store/useChatsStore'
import useDocumentStore from '@/store/useDocumentStore'
import MessageBubble, { buildSourceId } from './MessageBubble'
import ChatInput from './ChatInput'
import { PANEL_SLIDE } from '@/lib/animations'

const SUGGESTIONS = [
  {
    Icon: BookOpen,
    label: 'Summarise',
    example: 'Summarize the key points from the latest report.',
    iconColor: '#4361EE',
    iconBg: '#EEF1FD',
  },
  {
    Icon: FileSearch,
    label: 'Find specific info',
    example: 'What are the main risks mentioned in the SLA?',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4',
  },
  {
    Icon: GitCompare,
    label: 'Compare documents',
    example: 'What changed between version 1 and version 2?',
    iconColor: '#D97706',
    iconBg: '#FFF7ED',
  },
  {
    Icon: ListChecks,
    label: 'Action items',
    example: 'List all action items from the meeting notes.',
    iconColor: '#7C3AED',
    iconBg: '#F5F3FF',
  },
]

function EmptyState({ readyCount, onSuggest }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center select-none py-10">

      {/* Logo */}
      <div className="mb-6">
        <img
          src="/AskBro_Logo.png"
          alt="AskBro"
          className="h-32 w-auto mix-blend-multiply mx-auto"
        />
      </div>

      {/* Heading */}
      <h2
        className="font-bold tracking-[-0.02em] mb-2"
        style={{ fontSize: '30px', color: '#111110' }}
      >
        What would you like to know?
      </h2>
      <p className="text-[14px] leading-relaxed max-w-sm" style={{ color: '#7A7874' }}>
        {readyCount > 0
          ? `Your workspace has ${readyCount} document${readyCount !== 1 ? 's' : ''} indexed and ready.`
          : 'Upload documents to start asking questions.'}
      </p>

      {readyCount === 0 && (
        <Link
          href="/upload"
          className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors"
          style={{ backgroundColor: '#EEF1FD', color: '#4361EE', border: '1px solid #C7D2FE' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#DDE7FC' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#EEF1FD' }}
        >
          Upload your first document
          <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} />
        </Link>
      )}

      {readyCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 gap-3 w-full max-w-[700px] mt-10"
        >
          {SUGGESTIONS.map(({ Icon, label, example, iconColor, iconBg }, i) => (
            <motion.button
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 + i * 0.06 }}
              onClick={() => onSuggest(example)}
              className="text-left cursor-pointer rounded-2xl p-5 bg-white transition-all"
              style={{ border: '1.5px solid #E3E1DC', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.09)'
                e.currentTarget.style.borderColor = iconColor
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
                e.currentTarget.style.borderColor = '#E3E1DC'
                e.currentTarget.style.transform = ''
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: iconBg }}
              >
                <Icon className="w-5 h-5" style={{ color: iconColor }} strokeWidth={1.8} />
              </div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{ color: '#AEABA6' }}
              >
                {label}
              </p>
              <p className="text-[13px] leading-[1.65]" style={{ color: '#4A4845' }}>
                "{example}"
              </p>
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default function ChatWindow({ chatId }) {
  const router = useRouter()

  const messages     = useChatStore((s) => s.messages)
  const streaming    = useChatStore((s) => s.streaming)
  const addMessage   = useChatStore((s) => s.addMessage)
  const appendToken  = useChatStore((s) => s.appendToken)
  const setCitations = useChatStore((s) => s.setCitations)
  const setStreaming  = useChatStore((s) => s.setStreaming)
  const loadMessages = useChatStore((s) => s.loadMessages)
  const setChatId    = useChatStore((s) => s.setChatId)
  const storeChatId  = useChatStore((s) => s.chatId)

  const createNewChat = useChatsStore((s) => s.createNewChat)
  const bumpChat      = useChatsStore((s) => s.bumpChat)
  const updateChatTitle = useChatsStore((s) => s.updateChatTitle)

  const documents    = useDocumentStore((s) => s.documents)

  const [activeSource, setActiveSource] = useState(null)
  const bottomRef = useRef(null)

  const readyCount = documents.filter((d) => d.status === 'completed').length

  // Load messages when navigating to an existing chat
  useEffect(() => {
    if (!chatId) return
    // Only fetch if we're switching to a different chat
    if (storeChatId === chatId) return
    setChatId(chatId)
    getChatMessages(chatId)
      .then((msgs) => loadMessages(msgs))
      .catch(() => {/* silently ignore — chat may be empty or invalid */})
  }, [chatId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(query) {
    if (streaming) return

    // Resolve the chat ID — create one if this is a new chat
    let activeChatId = chatId || storeChatId
    if (!activeChatId) {
      try {
        const newChat = await createNewChat()
        activeChatId = newChat.id
        setChatId(activeChatId)
        // Navigate to the new chat URL (push so back button works)
        router.push(`/dashboard/${activeChatId}`)
      } catch {
        appendToken('\n\n⚠ Could not create chat session. Please try again.')
        return
      }
    }

    addMessage({ role: 'user', content: query })
    addMessage({ role: 'assistant', content: '', streaming: true })
    setStreaming(true)

    try {
      for await (const event of streamChat(query, activeChatId)) {
        if (event.error) appendToken('\n\n⚠ ' + event.error)
        else if (event.done && event.citations !== undefined) setCitations(event.citations)
        else if (event.token) appendToken(event.token)
      }
    } catch {
      appendToken('\n\n⚠ Something went wrong. Please try again.')
      setCitations([])
    } finally {
      // Move chat to top of sidebar list
      bumpChat(activeChatId)
      // Update title in sidebar from first message
      if (messages.length === 0) {
        // first message — the backend auto-sets the title, sync it
        updateChatTitle(activeChatId, query.slice(0, 60) + (query.length > 60 ? '…' : ''))
      }
    }
  }

  function handleOpenSource(citation) {
    const id = buildSourceId(citation)
    setActiveSource((prev) => (prev?.id === id ? null : { id, ...citation }))
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F7F5F2' }}>
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
              className="w-[320px] shrink-0 flex flex-col overflow-hidden"
              style={{ backgroundColor: '#FFFFFF', borderLeft: '1px solid #E3E1DC' }}
            >
              {/* Header */}
              <div
                className="px-5 py-4 shrink-0 flex items-start justify-between gap-3"
                style={{ borderBottom: '1px solid #E3E1DC', backgroundColor: '#F7F5F2' }}
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#AEABA6' }}>
                    Source
                  </p>
                  <p className="text-[13px] font-semibold truncate" style={{ color: '#111110' }}>
                    {activeSource.fileName}
                  </p>
                  {activeSource.pageNumber != null && (
                    <p className="text-[11px] mt-0.5" style={{ color: '#7A7874' }}>
                      Page {activeSource.pageNumber}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setActiveSource(null)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors shrink-0 mt-0.5"
                  style={{ color: '#AEABA6' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E3E1DC'
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

              {/* Excerpt */}
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#AEABA6' }}>
                  Relevant excerpt
                </p>
                {activeSource.chunkPreview ? (
                  <div
                    className="rounded-xl px-4 py-4"
                    style={{ backgroundColor: '#FEFCE8', borderLeft: '3px solid #D97706' }}
                  >
                    <p className="text-[13px] leading-[1.75]" style={{ color: '#3D3C3A' }}>
                      {activeSource.chunkPreview}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <FileX className="w-8 h-8 mb-3" style={{ color: '#D9D7D2' }} strokeWidth={1.5} />
                    <p className="text-[12px]" style={{ color: '#AEABA6' }}>No preview available.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                className="px-5 py-3 shrink-0 flex items-center justify-between"
                style={{ borderTop: '1px solid #E3E1DC', backgroundColor: '#F7F5F2' }}
              >
                <span className="text-[11px] font-medium" style={{ color: '#7A7874' }}>Source document</span>
                <Link
                  href="/upload"
                  className="text-[12px] font-semibold hover:underline"
                  style={{ color: '#4361EE' }}
                >
                  View all →
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
