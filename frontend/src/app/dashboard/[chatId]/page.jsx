import ChatPageClient from './ChatPageClient'

export const metadata = {
  title: 'Chat',
  description: 'Continue your conversation with AskBro — AI-powered answers from your team\'s documents.',
  robots: { index: false, follow: false },
}

export default function ChatPage() {
  return <ChatPageClient />
}
