'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { animate } from 'framer-motion'
import useAuthStore from '@/store/useAuthStore'
import useDocumentStore from '@/store/useDocumentStore'
import Sidebar from '@/components/layout/Sidebar'
import UploadZone from '@/components/documents/UploadZone'
import DocumentList from '@/components/documents/DocumentList'
import { PAGE_ANIM, ITEM_ANIM } from '@/lib/animations'

function CountUp({ value }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const num = typeof value === 'number' ? value : parseFloat(value)
    if (isNaN(num)) { setDisplay(value); return }

    const controls = animate(0, num, {
      duration: 0.9,
      ease: 'easeOut',
      onUpdate(latest) { setDisplay(Math.round(latest * 10) / 10) },
    })
    return controls.stop
  }, [value])

  return <>{typeof value === 'number' ? display : value}</>
}

export default function UploadPage() {
  const router = useRouter()
  const hydrate = useAuthStore((s) => s.hydrate)
  const user = useAuthStore((s) => s.user)
  const fetchDocuments = useDocumentStore((s) => s.fetchDocuments)
  const documents = useDocumentStore((s) => s.documents)
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

  const totalSize = documents.reduce((acc, d) => acc + (d.file_size_bytes ?? 0), 0)
  const stats = [
    { label: 'Total',       value: documents.length,                                          unit: 'docs' },
    { label: 'Ready',       value: documents.filter((d) => d.status === 'completed').length,  unit: 'indexed' },
    { label: 'Processing',  value: documents.filter((d) => ['processing','pending'].includes(d.status)).length, unit: 'in progress' },
    { label: 'Storage',     value: parseFloat((totalSize / (1024 * 1024)).toFixed(1)),        unit: 'MB used' },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto">
        {/* ── Hero header ──────────────────────────────────── */}
        <div className="bg-white border-b border-border px-8 py-7">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-[1.625rem] font-bold text-fg tracking-tight">Knowledge Library</h1>
                <p className="text-[13px] text-fg-3 mt-1">
                  {documents.length} document{documents.length !== 1 ? 's' : ''} in your workspace
                </p>
              </div>
              <Link
                href="/dashboard"
                className="text-[13px] font-medium text-brand hover:opacity-75 transition-opacity mt-1"
              >
                ← Back to chat
              </Link>
            </div>

            {/* Stat cards */}
            <motion.div {...PAGE_ANIM} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((s) => (
                <motion.div
                  key={s.label}
                  {...ITEM_ANIM}
                  className="bg-surface border border-border rounded-xl px-5 py-4"
                >
                  <p className="text-[26px] font-bold text-fg leading-none">
                    <CountUp value={s.value} />
                  </p>
                  <p className="text-[11px] text-fg-4 mt-1.5">{s.label}</p>
                  <p className="text-[10px] text-fg-4 opacity-70">{s.unit}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ── Content ──────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-8 py-8 space-y-10">

          {/* Upload */}
          <section>
            <p className="text-[13px] font-semibold text-fg-2 mb-3">Upload a document</p>
            <UploadZone />
          </section>

          <div className="border-t border-border" />

          {/* Library */}
          <section className="pb-20">
            <p className="text-[13px] font-semibold text-fg-2 mb-4">All documents</p>
            <DocumentList />
          </section>
        </div>
      </main>
    </div>
  )
}
