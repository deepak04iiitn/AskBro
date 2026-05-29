'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { animate } from 'framer-motion'
import { ArrowLeft, FileText, CheckCircle2, Clock, HardDrive } from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import useDocumentStore from '@/store/useDocumentStore'
import Sidebar from '@/components/layout/Sidebar'
import UploadZone from '@/components/documents/UploadZone'
import DocumentList from '@/components/documents/DocumentList'

// ── Blue theme tokens ─────────────────────────────────────────
const B = {
  navy:        '#1E3A8A',   // deep navy — header bg, primary text
  blue:        '#2563EB',   // accent — buttons, icons
  blueMid:     '#3B82F6',   // medium blue — stat icons
  lightBlue:   '#EFF6FF',   // page bg
  cardBorder:  '#BFDBFE',   // card borders
  softBlue:    '#DBEAFE',   // card bg, tints
  linkBlue:    '#93C5FD',   // muted link on dark bg
  textPrimary: '#1E3A8A',   // section headings
  textMuted:   '#6B7280',   // secondary text
  textFaint:   '#9CA3AF',   // faint labels
  divider:     '#BFDBFE',   // dividers
}

function CountUp({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const num = typeof value === 'number' ? value : parseFloat(value)
    if (isNaN(num)) { setDisplay(value); return }
    const controls = animate(0, num, {
      duration: 0.8,
      ease: 'easeOut',
      onUpdate(latest) { setDisplay(Math.round(latest * 10) / 10) },
    })
    return controls.stop
  }, [value])
  return <>{typeof value === 'number' ? display : value}</>
}

const STATS_CONFIG = [
  { key: 'total',      Icon: FileText,     label: 'Total',      unit: 'documents'   },
  { key: 'ready',      Icon: CheckCircle2, label: 'Ready',      unit: 'indexed'     },
  { key: 'processing', Icon: Clock,        label: 'Processing', unit: 'in progress' },
  { key: 'storage',    Icon: HardDrive,    label: 'Storage',    unit: 'MB used'     },
]

export default function UploadPage() {
  const router = useRouter()
  const hydrate = useAuthStore((s) => s.hydrate)
  const user = useAuthStore((s) => s.user)
  const fetchDocuments = useDocumentStore((s) => s.fetchDocuments)
  const documents = useDocumentStore((s) => s.documents)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => { hydrate(); setHydrated(true) }, [hydrate])
  useEffect(() => {
    if (!hydrated) return
    if (!user) { router.replace('/login'); return }
    fetchDocuments()
  }, [hydrated, user, router, fetchDocuments])

  if (!hydrated || !user) return null

  const totalSize = documents.reduce((acc, d) => acc + (d.file_size_bytes ?? 0), 0)
  const statsValues = {
    total:      documents.length,
    ready:      documents.filter((d) => d.status === 'completed').length,
    processing: documents.filter((d) => ['processing', 'pending'].includes(d.status)).length,
    storage:    parseFloat((totalSize / (1024 * 1024)).toFixed(1)),
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F7F5F2' }}>
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto" style={{ backgroundColor: B.lightBlue }}>

        {/* ── Top bar ─────────────────────────────────────────── */}
        <div
          className="sticky top-0 z-10 px-8 h-14 flex items-center justify-between shrink-0 bg-white"
          style={{ borderBottom: `1px solid ${B.cardBorder}` }}
        >
          <div className="flex items-center gap-3">
            <h1
              className="text-[15px] font-semibold tracking-[-0.01em]"
              style={{ color: B.navy }}
            >
              Knowledge Library
            </h1>
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: B.softBlue, color: B.blue }}
            >
              {documents.length} docs
            </span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-[13px] font-medium transition-colors"
            style={{ color: B.blue }}
            onMouseEnter={(e) => { e.currentTarget.style.color = B.navy }}
            onMouseLeave={(e) => { e.currentTarget.style.color = B.blue }}
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Back to chat
          </Link>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-10 space-y-10">

          {/* ── Stats row ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STATS_CONFIG.map(({ key, Icon, label, unit }) => (
              <div
                key={key}
                className="rounded-xl px-5 py-4 flex flex-col gap-3 bg-white"
                style={{ border: `1px solid ${B.cardBorder}` }}
              >
                <Icon className="w-4 h-4" style={{ color: B.blueMid }} strokeWidth={1.8} />
                <div>
                  <p
                    className="font-bold leading-none tabular-nums"
                    style={{ fontSize: '24px', color: B.navy }}
                  >
                    <CountUp value={statsValues[key]} />
                  </p>
                  <p className="text-[11px] font-medium mt-1.5" style={{ color: B.textMuted }}>{label}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: B.textFaint }}>{unit}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Upload section ─────────────────────────────────── */}
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <p className="text-[13px] font-semibold" style={{ color: B.textPrimary }}>
                Upload a document
              </p>
              <p className="text-[11px]" style={{ color: B.textFaint }}>
                PDF · DOCX · TXT · Markdown
              </p>
            </div>
            <UploadZone />
          </section>

          {/* ── Divider ────────────────────────────────────────── */}
          <div style={{ borderTop: `1px solid ${B.divider}` }} />

          {/* ── Document list ──────────────────────────────────── */}
          <section className="pb-20">
            <div className="flex items-baseline justify-between mb-4">
              <p className="text-[13px] font-semibold" style={{ color: B.textPrimary }}>
                All documents
              </p>
              <p className="text-[11px]" style={{ color: B.textFaint }}>
                {documents.length} total
              </p>
            </div>
            <DocumentList />
          </section>
        </div>
      </main>
    </div>
  )
}
