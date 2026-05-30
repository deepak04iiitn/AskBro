'use client'

import { useParams } from 'next/navigation'
import ChatWindow from '@/components/chat/ChatWindow'

export default function ChatPage() {
  const { chatId } = useParams()
  return <ChatWindow chatId={chatId} />
}
