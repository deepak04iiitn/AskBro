'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { animate, AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft, FileText, CheckCircle2, Clock,
  HardDrive, BookOpen, UploadCloud, Files,
} from 'lucide-react'
import useAuthStore from '@/store/useAuthStore'
import useDocumentStore from '@/store/useDocumentStore'
import Sidebar from '@/components/layout/Sidebar'
import UploadZone from '@/components/documents/UploadZone'
import DocumentList from '@/components/documents/DocumentList'

const B = {
  navy:       '#1E3A8A',
  blue:       '#2563EB',
  lightBlue:  '#EFF6FF',
  softBlue:   '#DBEAFE',
  cardBorder: '#BFDBFE',
  divider:    '#BFDBFE',
  textMuted:  '#6B7280',
  textFaint:  '#9CA3AF',
}

function CountUp({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const num = typeof value === 'number' ? value : parseFloat(value)
    if (isNaN(num)) { setDisplay(value); return }
    const controls = animate(0, num, {
      duration: 0.7, ease: 'easeOut',
      onUpdate(v) { setDisplay(Math.round(v * 10) / 10) },
    })
    return controls.stop
  }, [value])
  return <>{typeof value === 'number' ? display : value}</>
}

const STATS = [
  { key: 'total',      Icon: FileText,     label: 'Total',       unit: 'files uploaded',      color: B.blue    },
  { key: 'ready',      Icon: CheckCircle2, label: 'Ready',       unit: 'ready to ask about',  color: '#16A34A' },
  { key: 'processing', Icon: Clock,        label: 'Working on',  unit: 'being prepared',       color: '#D97706' },
  { key: 'storage',    Icon: HardDrive,    label: 'Storage',     unit: 'MB used',              color: '#7C3AED' },
]

export default function UploadPage() {
  const router = useRouter()
  const hydrate = useAuthStore((s) => s.hydrate)
  const user = useAuthStore((s) => s.user)
  const fetchDocuments = useDocumentStore((s) => s.fetchDocuments)
  const documents = useDocumentStore((s) => s.documents)
  const [hydrated, setHydrated] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')
  const prevTab = useRef('upload')

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

        {/* ── Sticky top bar ──────────────────────────────────── */}
        <div
          className="sticky top-0 z-10 bg-white px-8 h-14 flex items-center justify-between shrink-0"
          style={{ borderBottom: `1px solid ${B.cardBorder}` }}
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4" style={{ color: B.blue }} strokeWidth={2} />
            <h1 className="text-[15px] font-bold" style={{ color: B.navy }}>
              Knowledge Library
            </h1>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: B.softBlue, color: B.blue }}
            >
              {documents.length} docs
            </span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-[13px] font-semibold transition-colors"
            style={{ color: B.blue }}
            onMouseEnter={(e) => { e.currentTarget.style.color = B.navy }}
            onMouseLeave={(e) => { e.currentTarget.style.color = B.blue }}
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
            Back to chat
          </Link>
        </div>

        {/* ── Page content ────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">

          {/* ── Stats bar — 4 metrics in one card ───────────────── */}
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${B.cardBorder}` }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x" style={{ borderColor: B.cardBorder }}>
              {STATS.map(({ key, Icon, label, unit, color }) => (
                <div key={key} className="px-6 py-5 flex flex-col gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${color}18` }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} strokeWidth={2} />
                  </div>
                  <div>
                    <p
                      className="font-bold leading-none tabular-nums"
                      style={{ fontSize: '28px', color: B.navy }}
                    >
                      <CountUp value={statsValues[key]} />
                    </p>
                    <p className="text-[12px] font-semibold mt-1.5" style={{ color: B.textMuted }}>{label}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: B.textFaint }}>{unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Tab switcher ─────────────────────────────────────── */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl self-start w-fit"
            style={{ backgroundColor: '#DBEAFE', border: `1px solid ${B.cardBorder}` }}
          >
            {[
              { id: 'upload',    Icon: UploadCloud, label: 'Upload'        },
              { id: 'documents', Icon: Files,       label: 'All documents' },
            ].map(({ id, Icon, label }) => {
              const isActive = activeTab === id
              return (
                <button
                  key={id}
                  onClick={() => {
                    prevTab.current = activeTab
                    setActiveTab(id)
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer"
                  style={{
                    backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                    color: isActive ? B.navy : '#6B7280',
                    boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                  {label}
                  {id === 'documents' && documents.length > 0 && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: isActive ? B.softBlue : '#E5E7EB', color: isActive ? B.blue : '#6B7280' }}
                    >
                      {documents.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* ── Tab content with slide transition ───────────────── */}
          <div className="relative overflow-hidden pb-24" style={{ minHeight: '380px' }}>
            <AnimatePresence mode="wait" custom={activeTab === 'documents' ? 1 : -1}>
              {activeTab === 'upload' ? (
                <motion.div
                  key="upload"
                  custom={-1}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div className="flex items-baseline justify-between mb-4">
                    <p className="text-[14px] font-bold" style={{ color: B.navy }}>Upload a document</p>
                    <p className="text-[11px]" style={{ color: B.textFaint }}>
                      PDF · DOCX · Markdown · TXT · max 50 MB
                    </p>
                  </div>
                  <UploadZone />
                </motion.div>
              ) : (
                <motion.div
                  key="documents"
                  custom={1}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div className="flex items-center gap-2.5 mb-5">
                    <p className="text-[14px] font-bold" style={{ color: B.navy }}>All documents</p>
                    {documents.length > 0 && (
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: B.softBlue, color: B.blue }}
                      >
                        {documents.length}
                      </span>
                    )}
                  </div>
                  <DocumentList />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>
    </div>
  )
}
