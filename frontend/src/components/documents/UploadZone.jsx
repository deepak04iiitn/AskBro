'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, CheckCircle2, XCircle, Check, FileText, Pencil, ArrowRight, BookOpen, AlertCircle, Loader2, Puzzle } from 'lucide-react'
import { getDocumentStatus, uploadDocumentWithProgress } from '@/lib/api'
import { getNotionStatus, importNotionPage } from '@/lib/integrationsApi'
import useDocumentStore from '@/store/useDocumentStore'
import IntegrationsPanel from '@/components/integrations/IntegrationsPanel'

const ACCEPTED_EXTENSIONS = ['pdf', 'docx', 'md', 'txt']
const MAX_SIZE_MB = 50

// ── User-friendly step labels ─────────────────────────────────
const STEPS = [
  {
    label: 'Uploading your file',
    detail: 'Sending to our servers securely',
  },
  {
    label: 'Reading your document',
    detail: 'Extracting all the text and structure',
  },
  {
    label: 'Understanding the content',
    detail: 'Analysing topics, facts and context',
  },
  {
    label: 'Making it searchable',
    detail: 'Your document will be ready to answer questions',
  },
]

// Durations for simulated stage progress animation (ms)
const STAGE_DURATIONS = [null, 4000, 12000, 4000]

const FORMAT_PILLS = [
  { label: 'PDF',  bg: '#FEF2F2', color: '#DC2626' },
  { label: 'DOCX', bg: '#EFF6FF', color: '#2563EB' },
  { label: 'MD',   bg: '#F5F3FF', color: '#7C3AED' },
  { label: 'TXT',  bg: '#F8FAFC', color: '#64748B' },
]

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getExt(filename) {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

// ── Indeterminate shimmer bar for processing stages ───────────
function ShimmerBar() {
  return (
    <div className="relative h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#DBEAFE' }}>
      <motion.div
        className="absolute top-0 bottom-0 rounded-full"
        style={{ backgroundColor: '#2563EB', width: '40%' }}
        animate={{ left: ['-40%', '100%'] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

// ── Upload progress bar (for stage 0) ────────────────────────
function ProgressBar({ pct }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#DBEAFE' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: '#2563EB' }}
        animate={{ width: `${Math.max(2, pct)}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </div>
  )
}

// ── Single step row ───────────────────────────────────────────
function StepRow({ step, index, isDone, isActive, isFailed, uploadPct }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="flex flex-col gap-1.5"
    >
      <div className="flex items-center gap-3">
        {/* Circle indicator */}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold transition-all duration-300"
          style={{
            backgroundColor: isDone ? '#DCFCE7' : isFailed ? '#FEE2E2' : isActive ? '#DBEAFE' : '#F4F3F0',
            color: isDone ? '#16A34A' : isFailed ? '#DC2626' : isActive ? '#2563EB' : '#AEABA6',
          }}
        >
          {isDone ? <Check className="w-3 h-3" strokeWidth={3} /> : index + 1}
        </div>

        {/* Label with animated strikethrough */}
        <div className="flex-1 min-w-0 relative">
          <span
            className="text-[13px] font-medium transition-all duration-300"
            style={{
              color: isDone ? '#AEABA6' : isFailed ? '#DC2626' : isActive ? '#1E3A8A' : '#9CA3AF',
              textDecorationLine: isDone ? 'line-through' : 'none',
              textDecorationColor: isDone ? '#16A34A' : 'transparent',
            }}
          >
            {step.label}
          </span>
        </div>

        {/* Right badge */}
        {isDone && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}
          >
            Done ✓
          </motion.span>
        )}
        {isActive && (
          <span className="shrink-0 text-[11px] font-semibold" style={{ color: '#2563EB' }}>
            In progress…
          </span>
        )}
        {isFailed && (
          <span className="shrink-0 text-[11px] font-semibold" style={{ color: '#DC2626' }}>
            Failed
          </span>
        )}
      </div>

      {/* Progress bar — active step only */}
      {isActive && (
        <div className="ml-9">
          {index === 0
            ? <ProgressBar pct={uploadPct ?? 0} />
            : <ShimmerBar />
          }
          <p className="text-[11px] mt-1" style={{ color: '#6B7280' }}>
            {step.detail}
          </p>
        </div>
      )}
    </motion.div>
  )
}

// ── Progress view for one file upload ────────────────────────
function FileUploadProgress({ upload }) {
  const { file, uploadPct, processingStage, phase } = upload
  const isComplete = phase === 'completed'
  const isFailed   = phase === 'failed'

  return (
    <div className="space-y-5">
      {/* File header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: isComplete ? '#DCFCE7' : isFailed ? '#FEE2E2' : '#DBEAFE' }}
        >
          {isComplete
            ? <CheckCircle2 className="w-5 h-5" style={{ color: '#16A34A' }} strokeWidth={2} />
            : isFailed
            ? <XCircle className="w-5 h-5" style={{ color: '#DC2626' }} strokeWidth={2} />
            : <FileText className="w-5 h-5" style={{ color: '#2563EB' }} strokeWidth={1.8} />
          }
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold truncate" style={{ color: '#1E3A8A' }}>
            {file.name}
          </p>
          <p className="text-[12px]" style={{ color: '#6B7280' }}>
            {formatBytes(file.size)}
            {isComplete && <span className="ml-2 font-semibold" style={{ color: '#16A34A' }}>· Ready to use!</span>}
            {isFailed && <span className="ml-2 font-semibold" style={{ color: '#DC2626' }}>· Upload failed</span>}
          </p>
        </div>
      </div>

      {/* Step list */}
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const isDone = isComplete || processingStage > i
          const isActive = !isComplete && !isFailed && processingStage === i
          const stepFailed = isFailed && processingStage === i
          return (
            <StepRow
              key={i}
              step={step}
              index={i}
              isDone={isDone}
              isActive={isActive}
              isFailed={stepFailed}
              uploadPct={uploadPct}
            />
          )
        })}
      </div>

      {/* Completion message */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl px-4 py-3 text-center"
          style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}
        >
          <p className="text-[13px] font-semibold" style={{ color: '#15803D' }}>
            🎉 Your document is ready! You can now ask questions about it.
          </p>
        </motion.div>
      )}
    </div>
  )
}

// ── Short step label for multi-file compact view ─────────────
const STEP_SHORT = ['Uploading…', 'Reading…', 'Analysing…', 'Finishing up…']

// ── Multi-file overview ───────────────────────────────────────
function MultiFileProgress({ uploads }) {
  const total     = uploads.length
  const doneCount = uploads.filter((u) => u.phase === 'completed').length
  const failCount = uploads.filter((u) => u.phase === 'failed').length
  const allDone   = doneCount + failCount === total
  const pct       = Math.round((doneCount / total) * 100)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <p className="font-bold tracking-[-0.01em] mb-1" style={{ fontSize: '18px', color: '#1E3A8A' }}>
          {allDone
            ? `${total} file${total > 1 ? 's' : ''} processed`
            : `Processing ${total} files…`}
        </p>
        <p className="text-[13px]" style={{ color: '#6B7280' }}>
          {doneCount} of {total} complete{failCount > 0 ? ` · ${failCount} failed` : ''}
        </p>
      </div>

      {/* Overall progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold" style={{ color: '#2563EB' }}>
            {pct}%
          </span>
          <span className="text-[11px]" style={{ color: '#9CA3AF' }}>
            {doneCount}/{total} files
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#DBEAFE' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: '#2563EB' }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Per-file compact rows */}
      <div className="space-y-2">
        {uploads.map((u) => {
          const done    = u.phase === 'completed'
          const failed  = u.phase === 'failed'
          const active  = !done && !failed
          const shortLabel = done ? 'Ready' : failed ? 'Failed' : STEP_SHORT[Math.min(u.processingStage, STEP_SHORT.length - 1)]
          return (
            <div
              key={u.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: done ? '#F0FDF4' : failed ? '#FEF2F2' : '#EFF6FF', border: `1px solid ${done ? '#BBF7D0' : failed ? '#FECACA' : '#BFDBFE'}` }}
            >
              {/* Icon */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: done ? '#DCFCE7' : failed ? '#FEE2E2' : '#DBEAFE' }}
              >
                {done
                  ? <CheckCircle2 className="w-4 h-4" style={{ color: '#16A34A' }} strokeWidth={2} />
                  : failed
                  ? <XCircle className="w-4 h-4" style={{ color: '#DC2626' }} strokeWidth={2} />
                  : <FileText className="w-4 h-4" style={{ color: '#2563EB' }} strokeWidth={1.8} />
                }
              </div>

              {/* Filename */}
              <span className="flex-1 min-w-0 text-[13px] font-medium truncate" style={{ color: '#1E3A8A' }}>
                {u.file.name}
              </span>

              {/* Status label */}
              <span
                className="shrink-0 text-[11px] font-semibold"
                style={{ color: done ? '#16A34A' : failed ? '#DC2626' : '#2563EB' }}
              >
                {shortLabel}
              </span>
            </div>
          )
        })}
      </div>

      {/* All done banner */}
      {allDone && doneCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl px-4 py-3 text-center"
          style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}
        >
          <p className="text-[13px] font-semibold" style={{ color: '#15803D' }}>
            🎉 {doneCount} file{doneCount > 1 ? 's are' : ' is'} ready! You can now ask questions about {doneCount > 1 ? 'them' : 'it'}.
          </p>
        </motion.div>
      )}
    </div>
  )
}

// ── Notion steps expandable hint ─────────────────────────────
function NotionStepsHint() {
  const [open, setOpen] = useState(false)
  const steps = [
    'Open the Notion page you want to import',
    'Click the ... (three dots) menu in the top-right',
    'Click "Add connections"',
    'Search for and select your AskBro integration',
    'Paste the page URL above and click Import',
  ]
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E3E1DC' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer transition-colors"
        style={{ backgroundColor: open ? '#F0EFEC' : '#F7F5F2' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F0EFEC' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = open ? '#F0EFEC' : '#F7F5F2' }}
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5" style={{ color: '#7A7874' }} strokeWidth={2} />
          <span className="text-[12px] font-semibold" style={{ color: '#4A4845' }}>
            How to share a page with your integration
          </span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#AEABA6" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden', backgroundColor: '#FFFFFF', borderTop: '1px solid #E3E1DC' }}
          >
            <div className="px-4 py-3 space-y-2">
              {steps.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5"
                    style={{ backgroundColor: '#EEF1FD', color: '#4361EE' }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-[12px] leading-[1.55]" style={{ color: '#4A4845' }}>{s}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main UploadZone component ─────────────────────────────────
export default function UploadZone() {
  const inputRef = useRef(null)
  const addDocument    = useDocumentStore((s) => s.addDocument)
  const updateDocument = useDocumentStore((s) => s.updateDocument)
  const startPolling   = useDocumentStore((s) => s.startPolling)

  const [uploads, setUploads] = useState([])
  const [dragOver, setDragOver] = useState(false)
  const [error, setError]       = useState('')

  // Paste text mode
  const [mode, setMode]             = useState('file') // 'file' | 'paste' | 'notion'
  const [pasteName, setPasteName]   = useState('')
  const [pasteContent, setPasteContent] = useState('')
  const [pasteExt, setPasteExt]     = useState('md')
  const [pasteError, setPasteError] = useState('')

  // Notion mode
  const [notionConnected, setNotionConnected]   = useState(null) // null = loading
  const [notionUrl, setNotionUrl]               = useState('')
  const [notionFileName, setNotionFileName]     = useState('')
  const [notionImporting, setNotionImporting]   = useState(false)
  const [notionError, setNotionError]           = useState('')
  const [showIntegrationsPanel, setShowIntegrationsPanel] = useState(false)

  // Check Notion status when Notion tab is first opened
  useEffect(() => {
    if (mode !== 'notion' || notionConnected !== null) return
    getNotionStatus()
      .then((s) => setNotionConnected(s.connected))
      .catch(() => setNotionConnected(false))
  }, [mode, notionConnected])

  async function handleNotionImport(e) {
    e.preventDefault()
    setNotionError('')
    if (!notionUrl.trim()) { setNotionError('Please enter a Notion page URL.'); return }
    setNotionImporting(true)
    try {
      const safeName = notionFileName.trim() || 'notion-page'
      const result = await importNotionPage(notionUrl.trim(), safeName)
      const blob = new Blob([result.content], { type: 'text/plain' })
      const file = new File([blob], result.file_name, { type: 'text/plain', lastModified: Date.now() })
      startUpload(file)
      setNotionUrl(''); setNotionFileName(''); setNotionError('')
      setMode('file')
    } catch (err) {
      setNotionError(err.message)
    } finally {
      setNotionImporting(false)
    }
  }

  function handlePasteSubmit(e) {
    e.preventDefault()
    setPasteError('')
    if (!pasteName.trim()) { setPasteError('Please enter a file name.'); return }
    if (!pasteContent.trim()) { setPasteError('Please paste some content.'); return }
    const safeName = pasteName.trim().replace(/\.(md|txt)$/i, '')
    const filename = `${safeName}.${pasteExt}`
    const blob = new Blob([pasteContent], { type: 'text/plain' })
    const file = new File([blob], filename, { type: 'text/plain', lastModified: Date.now() })
    startUpload(file)
    setPasteName(''); setPasteContent(''); setPasteError('')
    setMode('file')
  }

  // Auto-clear completed uploads after 3 s so drop zone returns
  useEffect(() => {
    if (uploads.length === 0) return
    const allSettled = uploads.every((u) => u.phase === 'completed' || u.phase === 'failed')
    if (!allSettled) return
    const timer = setTimeout(() => setUploads([]), 3000)
    return () => clearTimeout(timer)
  }, [uploads])

  function validateFile(f) {
    const ext = getExt(f.name)
    if (!ACCEPTED_EXTENSIONS.includes(ext)) return `${f.name} — file type .${ext} is not supported.`
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return `${f.name} is too large. Max is ${MAX_SIZE_MB} MB.`
    return null
  }

  function startFiles(fileList) {
    const files = Array.from(fileList)
    const firstInvalid = files.find((f) => validateFile(f))
    if (firstInvalid) { setError(validateFile(firstInvalid)); return }
    setError('')
    files.forEach((f) => startUpload(f))
  }

  function onDragOver(e)  { e.preventDefault(); setDragOver(true) }
  function onDragLeave()  { setDragOver(false) }
  function onDrop(e) {
    e.preventDefault(); setDragOver(false)
    if (e.dataTransfer.files.length) startFiles(e.dataTransfer.files)
  }

  function patchUpload(id, patch) {
    setUploads((prev) => prev.map((u) => u.id === id ? { ...u, ...patch } : u))
  }

  async function startUpload(file) {
    const err = validateFile(file)
    if (err) { setError(err); return }
    setError('')

    const id = `up_${Date.now()}_${Math.random().toString(36).slice(2)}`
    setUploads((prev) => [...prev, { id, file, uploadPct: 0, processingStage: 0, phase: 'active' }])
    const ext = getExt(file.name)

    try {
      const data = await uploadDocumentWithProgress(file, [], (pct) => {
        patchUpload(id, { uploadPct: pct })
      })
      const docId = data.document_id

      addDocument({
        document_id: docId,
        original_filename: file.name,
        file_type: ext,
        file_size_bytes: file.size,
        tags: [],
        status: 'processing',
        chunk_count: null,
        created_at: new Date().toISOString(),
      })

      patchUpload(id, { uploadPct: 100, processingStage: 1 })
      startPolling(docId)

      const timers = []
      let elapsed = 0
      for (let i = 1; i < STEPS.length - 1; i++) {
        elapsed += STAGE_DURATIONS[i] ?? 0
        timers.push(setTimeout(() => patchUpload(id, { processingStage: i + 1 }), elapsed))
      }

      const interval = setInterval(async () => {
        try {
          const status = await getDocumentStatus(docId)
          if (status.status === 'completed') {
            clearInterval(interval)
            timers.forEach(clearTimeout)
            updateDocument(docId, { status: 'completed', chunk_count: status.chunk_count })
            patchUpload(id, { processingStage: STEPS.length, phase: 'completed' })
          } else if (status.status === 'failed') {
            clearInterval(interval)
            timers.forEach(clearTimeout)
            updateDocument(docId, { status: 'failed', error_message: status.error_message })
            patchUpload(id, { phase: 'failed' })
          }
        } catch { /* keep polling */ }
      }, 3000)
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
      patchUpload(id, { phase: 'failed' })
    }
  }

  const showProgress = uploads.length > 0

  return (
    <div className="h-full flex flex-col gap-3">

      {/* ── Mode switcher (hidden while uploading) ─────────────── */}
      {!showProgress && (
        <div
          className="flex items-center gap-1 p-1 rounded-xl self-start"
          style={{ backgroundColor: '#DBEAFE', border: '1px solid #BFDBFE' }}
        >
          {[
            { id: 'file',   Icon: UploadCloud, label: 'Upload files' },
            { id: 'paste',  Icon: Pencil,       label: 'Paste text'   },
            { id: 'notion', Icon: BookOpen,     label: 'Notion'        },
          ].map(({ id, Icon, label }) => {
            const active = mode === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => { setMode(id); setError(''); setPasteError(''); setNotionError('') }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer"
                style={{
                  backgroundColor: active ? '#FFFFFF' : 'transparent',
                  color: active ? '#1E3A8A' : '#6B7280',
                  boxShadow: active ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
                }}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                {label}
              </button>
            )
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        {!showProgress && mode === 'notion' ? (
          /* ── Notion import form ──────────────────────────────── */
          <motion.div
            key="notion"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="flex flex-col bg-white rounded-2xl p-6"
            style={{ border: '2px solid #E3E1DC' }}
          >
            {notionConnected === null ? (
              /* Loading */
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#D9D7D2' }} strokeWidth={2} />
              </div>
            ) : !notionConnected ? (
              /* Not connected */
              <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: '#F4F3F0' }}
                >
                  <Puzzle className="w-8 h-8" style={{ color: '#AEABA6' }} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-bold text-[16px] mb-2" style={{ color: '#111110' }}>
                    Connect Notion first
                  </p>
                  <p className="text-[13px] leading-relaxed" style={{ color: '#7A7874' }}>
                    Connect your Notion workspace to import pages directly as documents.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIntegrationsPanel(true)}
                  className="flex items-center gap-2 h-11 px-6 text-[13px] font-semibold rounded-xl cursor-pointer transition-colors"
                  style={{ backgroundColor: '#4361EE', color: '#FFFFFF' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#3451D6' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#4361EE' }}
                >
                  <Puzzle className="w-4 h-4" strokeWidth={2} />
                  Connect Notion
                </button>
                {/* Integrations panel overlay */}
                <AnimatePresence>
                  {showIntegrationsPanel && (
                    <IntegrationsPanel
                      onClose={() => setShowIntegrationsPanel(false)}
                      onNotionStatusChange={(connected) => {
                        if (connected) { setNotionConnected(true); setShowIntegrationsPanel(false) }
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Connected — show import form */
              <form onSubmit={handleNotionImport} className="flex-1 flex flex-col gap-4">
                <div>
                  <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#3D3C3A' }}>
                    Notion Page URL
                  </label>
                  <input
                    type="url"
                    value={notionUrl}
                    onChange={(e) => { setNotionUrl(e.target.value); setNotionError('') }}
                    placeholder="https://www.notion.so/My-Page-abc123def456"
                    className="w-full h-11 rounded-xl px-3 text-[13px] focus:outline-none transition-all"
                    style={{ border: '1.5px solid #E3E1DC', backgroundColor: '#F7F5F2', color: '#111110', boxSizing: 'border-box' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#4361EE'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(67,97,238,0.10)' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#E3E1DC'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#3D3C3A' }}>
                    File name
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={notionFileName}
                      onChange={(e) => setNotionFileName(e.target.value)}
                      placeholder="e.g. my-notion-page"
                      required
                      className="flex-1 h-11 rounded-xl px-3 text-[13px] focus:outline-none transition-all"
                      style={{ border: '1.5px solid #E3E1DC', backgroundColor: '#F7F5F2', color: '#111110' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#4361EE'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(67,97,238,0.10)' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#E3E1DC'; e.currentTarget.style.boxShadow = 'none' }}
                    />
                    <span className="text-[13px] font-semibold shrink-0" style={{ color: '#7A7874' }}>.md</span>
                  </div>
                </div>

                {notionError && (
                  <div
                    className="flex items-start gap-2 rounded-xl px-4 py-3"
                    style={{ backgroundColor: '#FEF2F2', borderLeft: '3px solid #DC2626' }}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#DC2626' }} strokeWidth={2} />
                    <p className="text-[13px]" style={{ color: '#DC2626' }}>{notionError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={notionImporting || !notionUrl.trim() || !notionFileName.trim()}
                  className="h-11 flex items-center justify-center gap-2 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-40"
                  style={{ backgroundColor: '#4361EE' }}
                  onMouseEnter={(e) => { if (!notionImporting && notionUrl.trim()) e.currentTarget.style.backgroundColor = '#3451D6' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#4361EE' }}
                >
                  {notionImporting
                    ? <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> Importing...</>
                    : <>Import from Notion <ArrowRight className="w-4 h-4" strokeWidth={2.5} /></>
                  }
                </button>

                {/* Steps toggle */}
                <NotionStepsHint />
              </form>
            )}
          </motion.div>
        ) : !showProgress && mode === 'paste' ? (
          /* ── Paste text form ─────────────────────────────────── */
          <motion.form
            key="paste"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            onSubmit={handlePasteSubmit}
            className="flex-1 flex flex-col gap-4 bg-white rounded-2xl p-6"
            style={{ border: '2px solid #BFDBFE', minHeight: '420px' }}
          >
            {/* Filename */}
            <div>
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#1E3A8A' }}>
                File name
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pasteName}
                  onChange={(e) => setPasteName(e.target.value)}
                  placeholder="e.g. meeting-notes"
                  className="flex-1 h-10 rounded-xl px-3 text-[13px] focus:outline-none transition-all"
                  style={{ border: '1.5px solid #BFDBFE', backgroundColor: '#EFF6FF', color: '#1E3A8A' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#BFDBFE'; e.currentTarget.style.boxShadow = 'none' }}
                />
                <div
                  className="flex items-center gap-0.5 p-0.5 rounded-lg shrink-0"
                  style={{ backgroundColor: '#DBEAFE', border: '1px solid #BFDBFE' }}
                >
                  {['md', 'txt'].map((ext) => (
                    <button
                      key={ext}
                      type="button"
                      onClick={() => setPasteExt(ext)}
                      className="px-3 py-1.5 rounded-md text-[12px] font-bold uppercase transition-all cursor-pointer"
                      style={{
                        backgroundColor: pasteExt === ext ? '#FFFFFF' : 'transparent',
                        color: pasteExt === ext ? '#1E3A8A' : '#6B7280',
                        boxShadow: pasteExt === ext ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      }}
                    >
                      .{ext}
                    </button>
                  ))}
                </div>
                {pasteName.trim() && (
                  <span className="text-[12px] shrink-0" style={{ color: '#9CA3AF' }}>
                    → {pasteName.trim().replace(/\.(md|txt)$/i, '')}.{pasteExt}
                  </span>
                )}
              </div>
            </div>

            {/* Textarea */}
            <div className="flex-1 flex flex-col">
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#1E3A8A' }}>
                Content
              </label>
              <textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder={pasteExt === 'md' ? '# Heading\n\nPaste your markdown, notes, or documentation here…' : 'Paste your plain text, logs, or any content here…'}
                className="flex-1 rounded-xl px-4 py-3 text-[13px] leading-relaxed resize-none focus:outline-none transition-all"
                style={{
                  border: '1.5px solid #BFDBFE', backgroundColor: '#F8FAFF', color: '#1E3A8A',
                  minHeight: '220px',
                  fontFamily: pasteExt === 'md' ? 'var(--font-jetbrains), monospace' : 'inherit',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.10)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#BFDBFE'; e.currentTarget.style.boxShadow = 'none' }}
              />
              <p className="text-[11px] mt-1.5 text-right" style={{ color: '#9CA3AF' }}>
                {pasteContent.length > 0 ? `${pasteContent.length.toLocaleString()} characters` : 'No content yet'}
              </p>
            </div>

            {pasteError && (
              <p className="text-[13px]" style={{ color: '#DC2626' }}>{pasteError}</p>
            )}

            <button
              type="submit"
              disabled={!pasteName.trim() || !pasteContent.trim()}
              className="h-11 flex items-center justify-center gap-2 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-40"
              style={{ backgroundColor: '#2563EB' }}
              onMouseEnter={(e) => { if (pasteName.trim() && pasteContent.trim()) e.currentTarget.style.backgroundColor = '#1D4ED8' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2563EB' }}
            >
              Submit this content
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </motion.form>
        ) : !showProgress ? (
          /* ── Drop zone ─────────────────────────────────────── */
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{
              opacity: 1,
              scale: dragOver ? 1.005 : 1,
              borderColor: dragOver ? '#2563EB' : '#BFDBFE',
              backgroundColor: dragOver ? '#DBEAFE' : '#FFFFFF',
            }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className="flex-1 flex flex-col items-center justify-center gap-6 cursor-pointer rounded-2xl px-8 select-none"
            style={{ minHeight: '420px', border: '2px dashed #BFDBFE' }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,.md,.txt"
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files?.length) { startFiles(e.target.files); e.target.value = '' } }}
            />

            <motion.div animate={{ scale: dragOver ? 1.1 : 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: dragOver ? '#BFDBFE' : '#EFF6FF' }}
              >
                <UploadCloud className="w-9 h-9" style={{ color: dragOver ? '#1D4ED8' : '#3B82F6' }} strokeWidth={1.8} />
              </div>
            </motion.div>

            <div className="text-center">
              <p className="font-bold tracking-[-0.01em]" style={{ fontSize: '18px', color: dragOver ? '#1D4ED8' : '#1E3A8A' }}>
                {dragOver ? 'Release to upload' : 'Drop files here'}
              </p>
              <p className="text-[13px] mt-1.5" style={{ color: '#6B7280' }}>
                Drag & drop multiple files or click to browse · max {MAX_SIZE_MB} MB each
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
              className="h-10 px-6 text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
              style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1D4ED8' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2563EB' }}
            >
              Browse files
            </button>

            <div className="flex items-center gap-2">
              {FORMAT_PILLS.map(({ label, bg, color }) => (
                <span key={label} className="text-[11px] font-bold px-2.5 py-1 rounded-lg" style={{ backgroundColor: bg, color }}>
                  {label}
                </span>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ── Progress view ────────────────────────────────── */
          <motion.div
            key="progress"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="flex-1 rounded-2xl px-8 py-8 overflow-y-auto"
            style={{ border: '2px solid #BFDBFE', backgroundColor: '#FFFFFF' }}
          >
            {uploads.length === 1
              ? <FileUploadProgress upload={uploads[0]} />
              : <MultiFileProgress uploads={uploads} />
            }
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="rounded-xl px-4 py-3"
            style={{ backgroundColor: '#FEF2F2', borderLeft: '3px solid #DC2626' }}
          >
            <p className="text-[13px]" style={{ color: '#DC2626' }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
