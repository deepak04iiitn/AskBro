'use client'

import { useEffect, useRef } from 'react'
import { streamChat } from '@/lib/stream'
import useChatStore from '@/store/useChatStore'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'

export default function ChatWindow() {
  const messages = useChatStore((s) => s.messages)
  const streaming = useChatStore((s) => s.streaming)
  const addMessage = useChatStore((s) => s.addMessage)
  const appendToken = useChatStore((s) => s.appendToken)
  const setCitations = useChatStore((s) => s.setCitations)
  const setStreaming = useChatStore((s) => s.setStreaming)

  const bottomRef = useRef(null)

  // Auto-scroll to bottom on new messages / tokens
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(query) {
    if (streaming) return

    // Add user message
    addMessage({ role: 'user', content: query })

    // Add empty assistant message that will fill token by token
    addMessage({ role: 'assistant', content: '', streaming: true })
    setStreaming(true)

    try {
      for await (const event of streamChat(query)) {
        if (event.error) {
          appendToken('\n\n⚠ ' + event.error)
        } else if (event.done && event.citations !== undefined) {
          setCitations(event.citations)
        } else if (event.token) {
          appendToken(event.token)
        }
      }
    } catch (err) {
      appendToken('\n\n⚠ Something went wrong. Please try again.')
      setCitations([])
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Message history */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center select-none">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-700">Ask anything about your documents</p>
            <p className="text-xs text-zinc-400 mt-1">AskBro will cite its sources automatically</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={streaming} />
    </div>
  )
}
