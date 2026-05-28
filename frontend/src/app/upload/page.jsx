'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useAuthStore from '@/store/useAuthStore'
import useDocumentStore from '@/store/useDocumentStore'
import UploadZone from '@/components/documents/UploadZone'
import DocumentList from '@/components/documents/DocumentList'
import Header from '@/components/layout/Header'

export default function UploadPage() {
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
    <div className="flex flex-col h-screen bg-zinc-50 overflow-hidden">
      <Header />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-900">Documents</h1>
              <p className="text-sm text-zinc-500 mt-0.5">Upload files to index them for Q&A</p>
            </div>
            <Link
              href="/dashboard"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to chat
            </Link>
          </div>

          {/* Upload zone */}
          <section>
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-4">New upload</h2>
            <UploadZone />
          </section>

          {/* Divider */}
          <div className="border-t border-zinc-200" />

          {/* Document list */}
          <section>
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-4">All documents</h2>
            <DocumentList />
          </section>
        </div>
      </main>
    </div>
  )
}
