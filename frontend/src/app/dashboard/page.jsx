'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/store/useAuthStore'
import useDocumentStore from '@/store/useDocumentStore'
import Sidebar from '@/components/layout/Sidebar'
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
    if (!user) { router.replace('/login'); return }
    fetchDocuments()
  }, [hydrated, user, router, fetchDocuments])

  if (!hydrated || !user) return null

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F7F5F2' }}>
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ChatWindow />
      </main>
    </div>
  )
}
