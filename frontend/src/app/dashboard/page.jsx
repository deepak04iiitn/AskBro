'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/store/useAuthStore'
import useDocumentStore from '@/store/useDocumentStore'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import ChatWindow from '@/components/chat/ChatWindow'

export default function DashboardPage() {
  const router = useRouter()
  const hydrate = useAuthStore((s) => s.hydrate)
  const user = useAuthStore((s) => s.user)
  const fetchDocuments = useDocumentStore((s) => s.fetchDocuments)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    hydrate()
    setHydrated(true)
  }, [hydrate])

  useEffect(() => {
    if (!hydrated) return
    if (!user) {
      router.replace('/login')
      return
    }
    fetchDocuments()
  }, [hydrated, user, router, fetchDocuments])

  // Wait until hydration has run before deciding to redirect
  if (!hydrated || !user) return null

  return (
    <div className="flex flex-col h-screen bg-zinc-50 overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Left — sidebar (hidden on mobile, shown on md+) */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Centre — chat */}
        <main className="flex-1 flex flex-col min-w-0 bg-zinc-50">
          <ChatWindow />
        </main>
      </div>
    </div>
  )
}
