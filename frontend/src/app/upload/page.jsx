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
  { key: 'total',      Icon: FileText,     label: 'Total',      unit: 'files uploaded',     color: '#111111' },
  { key: 'ready',      Icon: CheckCircle2, label: 'Ready',      unit: 'ready to ask about', color: '#16A34A' },
  { key: 'processing', Icon: Clock,        label: 'Working on', unit: 'being prepared',      color: '#D97706' },
  { key: 'storage',    Icon: HardDrive,    label: 'Storage',    unit: 'MB used',             color: '#CC0000' },
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
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F9F9F7' }}>
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto newsprint-bg" style={{ backgroundColor: '#F9F9F7' }}>

        {/* ── Sticky top bar ──────────────────────────────────── */}
        <div
          className="sticky top-0 z-10 px-8 h-14 flex items-center justify-between shrink-0"
          style={{ backgroundColor: '#F9F9F7', borderBottom: '1px solid #111111' }}
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4" style={{ color: '#CC0000' }} strokeWidth={2} />
            <h1 className="np-serif font-black text-[16px]" style={{ color: '#111111' }}>
              Knowledge Library
            </h1>
            <span
              className="np-mono text-[10px] font-bold uppercase tracking-widest px-2 py-0.5"
              style={{ backgroundColor: '#111111', color: '#F9F9F7' }}
            >
              {documents.length} docs
            </span>
          </div>
          <Link
            href="/dashboard"
            className="np-mono flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest transition-colors"
            style={{ color: '#CC0000' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#AA0000' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#CC0000' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
            Back to chat
          </Link>
        </div>

        {/* ── Page content ────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">

          {/* ── Stats bar ───────────────────────────────────────── */}
          <div
            className="overflow-hidden"
            style={{ border: '1px solid #111111', boxShadow: '4px 4px 0px 0px #111111', backgroundColor: '#F9F9F7' }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x" style={{ borderColor: '#E5E5E0' }}>
              {STATS.map(({ key, Icon, label, unit, color }, idx) => (
                <div
                  key={key}
                  className="px-6 py-5 flex flex-col gap-3"
                  style={{ borderRight: idx < 3 ? '1px solid #E5E5E0' : 'none' }}
                >
                  <div
                    className="w-8 h-8 flex items-center justify-center"
                    style={{ backgroundColor: '#F0EDE6', border: '1px solid #E5E5E0' }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} strokeWidth={2} />
                  </div>
                  <div>
                    <p
                      className="np-serif font-black leading-none tabular-nums"
                      style={{ fontSize: '28px', color: '#111111' }}
                    >
                      <CountUp value={statsValues[key]} />
                    </p>
                    <p className="np-mono text-[11px] font-bold uppercase tracking-widest mt-2" style={{ color: '#737373' }}>{label}</p>
                    <p className="np-body text-[10px] mt-0.5" style={{ color: '#AEABA6' }}>{unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Tab switcher ─────────────────────────────────────── */}
          <div
            className="flex items-center gap-0 self-start w-fit"
            style={{ border: '1px solid #111111' }}
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
                  className="flex items-center gap-2 px-5 py-2.5 np-mono text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                  style={{
                    backgroundColor: isActive ? '#111111' : 'transparent',
                    color: isActive ? '#F9F9F7' : '#737373',
                    borderRight: id === 'upload' ? '1px solid #111111' : 'none',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                  {label}
                  {id === 'documents' && documents.length > 0 && (
                    <span
                      className="np-mono text-[9px] font-bold px-1.5 py-0.5"
                      style={{
                        backgroundColor: isActive ? '#CC0000' : '#111111',
                        color: '#F9F9F7',
                      }}
                    >
                      {documents.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* ── Tab content ─────────────────────────────────────── */}
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
                    <p className="np-serif font-bold text-[16px]" style={{ color: '#111111' }}>Upload a document</p>
                    <p className="np-mono text-[10px] uppercase tracking-widest" style={{ color: '#AEABA6' }}>
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
                  <div className="flex items-center gap-3 mb-5">
                    <p className="np-serif font-bold text-[16px]" style={{ color: '#111111' }}>All documents</p>
                    {documents.length > 0 && (
                      <span
                        className="np-mono text-[10px] font-bold uppercase tracking-widest px-2 py-0.5"
                        style={{ backgroundColor: '#111111', color: '#F9F9F7' }}
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
