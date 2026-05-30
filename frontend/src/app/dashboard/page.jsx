'use client'

import { useEffect } from 'react'
import useChatStore from '@/store/useChatStore'
import ChatWindow from '@/components/chat/ChatWindow'

export default function DashboardPage() {
  const clearMessages = useChatStore((s) => s.clearMessages)

  // Clear messages when landing on the blank new-chat page
  useEffect(() => { clearMessages() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <ChatWindow chatId={null} />
}
