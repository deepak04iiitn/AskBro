'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, FileSearch, ListChecks,
  ArrowUpRight, X, FileX, Puzzle,
} from 'lucide-react'
import { streamChat } from '@/lib/stream'
import { getChatMessages } from '@/lib/api'
import useChatStore from '@/store/useChatStore'
import useChatsStore from '@/store/useChatsStore'
import useDocumentStore from '@/store/useDocumentStore'
import MessageBubble, { buildSourceId } from './MessageBubble'
import ChatInput from './ChatInput'
import { PANEL_SLIDE } from '@/lib/animations'

// Cleans raw PDF-extracted chunk text for readable display
function cleanExcerpt(raw, maxChars = 480) {
  if (!raw) return ''
  let text = raw
    // Strip PDF glyph/icon artifacts (symbols that replace icons in extracted text)
    .replace(/[♂♀⌢⌣→←↑↓·•◦▪▫▸▹►◄◀★☆○●◆◇■□▲△▼▽⊕⊗]/g, ' ')
    // Strip icon label tokens merged into contact info (phone, envelope, globe, github, linkedin…)
    .replace(/\b(phone|envel|gl\w{0,4}be|github|linkedin|twitter|instagram)\b/gi, ' ')
    // Remove URL path fragments like /deepak/github or /portfolio/deepak
    .replace(/\/[a-z0-9_%-]+(\/[a-z0-9_%-]+)*/gi, ' ')
    // Fix PDF split capital: "T echnology" → "Technology"
    .replace(/\b([A-Z])\s+(?=[a-z]{2,})/g, '$1')
    // Insert space at merged word boundaries ("NagpurNov" → "Nagpur Nov")
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Collapse tabs and multiple spaces
    .replace(/[ \t]+/g, ' ')
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    // Collapse 3+ newlines into paragraph break
    .replace(/\n{3,}/g, '\n\n')
    // Mid-sentence PDF line-wrap: lowercase–newline–lowercase → space
    .replace(/([a-z,;:])\n([a-z])/g, '$1 $2')
    // Clean up leftover stray punctuation runs
    .replace(/\s+([.,;:])/g, '$1')
    .replace(/([/\\])\s+/g, ' ')
    .trim()

  if (text.length <= maxChars) return text

  const truncated = text.slice(0, maxChars)
  const lastStop = Math.max(
    truncated.lastIndexOf('. '),
    truncated.lastIndexOf('.\n'),
    truncated.lastIndexOf('! '),
    truncated.lastIndexOf('? '),
  )
  return (lastStop > maxChars * 0.55 ? truncated.slice(0, lastStop + 1) : truncated) + '…'
}

const SUGGESTIONS = [
  {
    Icon: BookOpen,
    label: 'Summarise',
    example: 'Summarize the key points from the latest report.',
    iconColor: '#CC0000',
    iconBg: '#FEF2F2',
  },
  {
    Icon: FileSearch,
    label: 'Find specific info',
    example: 'What are the main risks mentioned in the SLA?',
    iconColor: '#16A34A',
    iconBg: '#F0FDF4',
  },
  {
    Icon: Puzzle,
    label: 'From Notion',
    example: 'What does my Notion roadmap say about upcoming features?',
    iconColor: '#D97706',
    iconBg: '#FFF7ED',
  },
  {
    Icon: ListChecks,
    label: 'Action items',
    example: 'List all action items from the meeting notes.',
    iconColor: '#111111',
    iconBg: '#F5F0E8',
  },
]

function EmptyState({ readyCount, onSuggest }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 text-center select-none py-6">

      {/* Logo */}
      <div className="mb-1 -mt-4">
        <img
          src="/AskBro_Logo.png"
          alt="AskBro"
          className="h-28 w-auto mix-blend-multiply mx-auto"
        />
      </div>

      {/* Heading */}
      <h2
        className="np-serif font-black tracking-tight mb-2"
        style={{ fontSize: '30px', color: '#111111', lineHeight: 0.95 }}
      >
        What would you like to know?
      </h2>
      {readyCount === 0 && (
        <p className="np-body text-[14px] leading-relaxed max-w-sm mt-3" style={{ color: '#737373' }}>
          Upload a document or connect Notion to start asking questions.
        </p>
      )}

      {readyCount === 0 && (
        <div className="flex items-center gap-3 mt-6">
          <Link href="/upload" className="btn-ink inline-flex items-center gap-1.5 px-5 h-10">
            Upload a document
            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </Link>
          <Link href="/integrations" className="btn-outline-ink inline-flex items-center gap-1.5 px-5 h-10">
            <Puzzle className="w-3.5 h-3.5" strokeWidth={2} />
            Connect Notion
          </Link>
        </div>
      )}

      {readyCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 gap-3 w-full max-w-[700px] mt-8"
        >
          {SUGGESTIONS.map(({ Icon, label, example, iconColor, iconBg }, i) => (
            <motion.button
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 + i * 0.06 }}
              onClick={() => onSuggest(example)}
              className="text-left cursor-pointer p-5 bg-white transition-all hard-shadow-hover"
              style={{ border: '1px solid #111111' }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center mb-3"
                style={{ backgroundColor: iconBg, border: '1px solid #E5E5E0' }}
              >
                <Icon className="w-5 h-5" style={{ color: iconColor }} strokeWidth={1.8} />
              </div>
              <p
                className="np-mono text-[9px] font-bold uppercase tracking-[0.2em] mb-2"
                style={{ color: '#CC0000' }}
              >
                {label}
              </p>
              <p className="np-body text-[13px] leading-[1.65]" style={{ color: '#4A4845' }}>
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

  useEffect(() => {
    if (!chatId) return
    if (storeChatId === chatId) return
    setChatId(chatId)
    getChatMessages(chatId)
      .then((msgs) => loadMessages(msgs))
      .catch(() => {})
  }, [chatId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(query, docIds, source, repoIds) {
    if (streaming) return

    let activeChatId = chatId || storeChatId
    if (!activeChatId) {
      try {
        const newChat = await createNewChat()
        activeChatId = newChat.id
        setChatId(activeChatId)
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
      for await (const event of streamChat(query, activeChatId, docIds, source, repoIds)) {
        if (event.error) appendToken('\n\n⚠ ' + event.error)
        else if (event.done && event.citations !== undefined) setCitations(event.citations)
        else if (event.token) appendToken(event.token)
      }
    } catch {
      appendToken('\n\n⚠ Something went wrong. Please try again.')
      setCitations([])
    } finally {
      bumpChat(activeChatId)
      if (messages.length === 0) {
        updateChatTitle(activeChatId, query.slice(0, 60) + (query.length > 60 ? '…' : ''))
      }
    }
  }

  function handleOpenSource(citation) {
    const id = buildSourceId(citation)
    setActiveSource((prev) => (prev?.id === id ? null : { id, ...citation }))
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F9F9F7' }}>
      <div className="flex flex-1 overflow-hidden">

        {/* ── Chat column ─────────────────────────────────────── */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <div className="flex-1 overflow-y-auto py-10">
            {messages.length === 0 ? (
              <EmptyState readyCount={readyCount} onSuggest={handleSend} />
            ) : (
              <div className="max-w-[920px] mx-auto px-6 space-y-8">
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
              className="w-[340px] shrink-0 flex flex-col overflow-hidden"
              style={{ backgroundColor: '#F9F9F7', borderLeft: '2px solid #111111' }}
            >
              {/* Header */}
              <div
                className="px-6 pt-5 pb-4 shrink-0"
                style={{ borderBottom: '1px solid #E5E5E0' }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span
                    className="np-mono text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-1"
                    style={{ backgroundColor: '#CC0000', color: '#F9F9F7' }}
                  >
                    ★ Source
                  </span>
                  <button
                    onClick={() => setActiveSource(null)}
                    className="w-7 h-7 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                    style={{ color: '#AEABA6' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E5E5E0'; e.currentTarget.style.color = '#111111' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '#AEABA6' }}
                  >
                    <X className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>
                <p className="np-sans text-[14px] font-bold leading-snug" style={{ color: '#111111' }}>
                  {activeSource.fileName}
                </p>
                {activeSource.pageNumber != null && (
                  <p className="np-mono text-[10px] mt-1.5 uppercase tracking-widest" style={{ color: '#AEABA6' }}>
                    Page {activeSource.pageNumber}
                  </p>
                )}
              </div>

              {/* Excerpt */}
              <div
                className="flex-1 px-6 py-5"
                style={{ overflowY: 'auto', overflowX: 'hidden' }}
              >
                <p className="np-mono text-[9px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#AEABA6' }}>
                  Relevant excerpt
                </p>

                {activeSource.chunkPreview ? (() => {
                  const paras = cleanExcerpt(activeSource.chunkPreview).split('\n\n').filter(Boolean)
                  return (
                    <div className="space-y-4" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      {paras.map((para, i) => (
                        <p
                          key={i}
                          className="np-body text-[13.5px] leading-[1.8]"
                          style={{ color: '#3D3C3A' }}
                        >
                          {para.trim()}
                        </p>
                      ))}
                    </div>
                  )
                })() : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <FileX className="w-8 h-8 mb-3" style={{ color: '#D9D7D2' }} strokeWidth={1.5} />
                    <p className="np-mono text-[12px]" style={{ color: '#AEABA6' }}>No preview available.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                className="px-6 py-3 shrink-0"
                style={{ borderTop: '1px solid #E5E5E0' }}
              >
                <span className="np-mono text-[10px] uppercase tracking-widest" style={{ color: '#AEABA6' }}>
                  {activeSource.pageNumber != null ? `p. ${activeSource.pageNumber}` : 'excerpt'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
