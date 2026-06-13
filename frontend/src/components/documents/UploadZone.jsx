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

const STEPS = [
  { label: 'Uploading your file',       detail: 'Sending to our servers securely' },
  { label: 'Reading your document',     detail: 'Extracting all the text and structure' },
  { label: 'Understanding the content', detail: 'Analysing topics, facts and context' },
  { label: 'Making it searchable',      detail: 'Your document will be ready to answer questions' },
]

const STAGE_DURATIONS = [null, 4000, 12000, 4000]

const FORMAT_PILLS = [
  { label: 'PDF',  bg: '#FEF2F2', color: '#DC2626' },
  { label: 'DOCX', bg: '#F5F0E8', color: '#111111' },
  { label: 'MD',   bg: '#F5F3FF', color: '#7C3AED' },
  { label: 'TXT',  bg: '#F5F0E8', color: '#737373' },
]

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getExt(filename) {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

function ShimmerBar() {
  return (
    <div className="relative h-1 overflow-hidden" style={{ backgroundColor: '#E5E5E0' }}>
      <motion.div
        className="absolute top-0 bottom-0"
        style={{ backgroundColor: '#CC0000', width: '40%' }}
        animate={{ left: ['-40%', '100%'] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

function ProgressBar({ pct }) {
  return (
    <div className="h-1 overflow-hidden" style={{ backgroundColor: '#E5E5E0' }}>
      <motion.div
        className="h-full"
        style={{ backgroundColor: '#CC0000' }}
        animate={{ width: `${Math.max(2, pct)}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </div>
  )
}

function StepRow({ step, index, isDone, isActive, isFailed, uploadPct }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="flex flex-col gap-1.5"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-6 h-6 flex items-center justify-center shrink-0 np-mono text-[11px] font-bold transition-all duration-300"
          style={{
            backgroundColor: isDone ? '#DCFCE7' : isFailed ? '#FEE2E2' : isActive ? '#F5F0E8' : '#F0EDE6',
            color: isDone ? '#16A34A' : isFailed ? '#DC2626' : isActive ? '#CC0000' : '#AEABA6',
            border: isActive ? '1px solid #CC0000' : '1px solid transparent',
          }}
        >
          {isDone ? <Check className="w-3 h-3" strokeWidth={3} /> : index + 1}
        </div>

        <div className="flex-1 min-w-0 relative">
          <span
            className="np-body text-[13px] transition-all duration-300"
            style={{
              color: isDone ? '#AEABA6' : isFailed ? '#DC2626' : isActive ? '#111111' : '#AEABA6',
              textDecorationLine: isDone ? 'line-through' : 'none',
              textDecorationColor: isDone ? '#16A34A' : 'transparent',
            }}
          >
            {step.label}
          </span>
        </div>

        {isDone && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 np-mono text-[10px] font-bold uppercase tracking-widest px-2 py-0.5"
            style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}
          >
            Done ✓
          </motion.span>
        )}
        {isActive && (
          <span className="shrink-0 np-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#CC0000' }}>
            In progress…
          </span>
        )}
        {isFailed && (
          <span className="shrink-0 np-mono text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#DC2626' }}>
            Failed
          </span>
        )}
      </div>

      {isActive && (
        <div className="ml-9">
          {index === 0
            ? <ProgressBar pct={uploadPct ?? 0} />
            : <ShimmerBar />
          }
          <p className="np-body text-[11px] mt-1" style={{ color: '#737373' }}>
            {step.detail}
          </p>
        </div>
      )}
    </motion.div>
  )
}

function FileUploadProgress({ upload }) {
  const { file, uploadPct, processingStage, phase } = upload
  const isComplete = phase === 'completed'
  const isFailed   = phase === 'failed'

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 flex items-center justify-center shrink-0"
          style={{
            backgroundColor: isComplete ? '#DCFCE7' : isFailed ? '#FEE2E2' : '#F5F0E8',
            border: '1px solid #E5E5E0',
          }}
        >
          {isComplete
            ? <CheckCircle2 className="w-5 h-5" style={{ color: '#16A34A' }} strokeWidth={2} />
            : isFailed
            ? <XCircle className="w-5 h-5" style={{ color: '#DC2626' }} strokeWidth={2} />
            : <FileText className="w-5 h-5" style={{ color: '#CC0000' }} strokeWidth={1.8} />
          }
        </div>
        <div className="min-w-0">
          <p className="np-sans text-[14px] font-semibold truncate" style={{ color: '#111111' }}>
            {file.name}
          </p>
          <p className="np-mono text-[12px]" style={{ color: '#737373' }}>
            {formatBytes(file.size)}
            {isComplete && <span className="ml-2 font-semibold" style={{ color: '#16A34A' }}>· Ready to use!</span>}
            {isFailed && <span className="ml-2 font-semibold" style={{ color: '#DC2626' }}>· Upload failed</span>}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const isDone   = isComplete || processingStage > i
          const isActive = !isComplete && !isFailed && processingStage === i
          const stepFailed = isFailed && processingStage === i
          return (
            <StepRow
              key={i} step={step} index={i}
              isDone={isDone} isActive={isActive} isFailed={stepFailed}
              uploadPct={uploadPct}
            />
          )
        })}
      </div>

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="px-4 py-3 text-center"
          style={{ backgroundColor: '#F0FDF4', borderLeft: '3px solid #16A34A' }}
        >
          <p className="np-sans text-[13px] font-semibold" style={{ color: '#15803D' }}>
            🎉 Your document is ready! You can now ask questions about it.
          </p>
        </motion.div>
      )}
    </div>
  )
}

const STEP_SHORT = ['Uploading…', 'Reading…', 'Analysing…', 'Finishing up…']

function MultiFileProgress({ uploads }) {
  const total     = uploads.length
  const doneCount = uploads.filter((u) => u.phase === 'completed').length
  const failCount = uploads.filter((u) => u.phase === 'failed').length
  const allDone   = doneCount + failCount === total
  const pct       = Math.round((doneCount / total) * 100)

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <p className="np-serif font-black mb-1" style={{ fontSize: '18px', color: '#111111' }}>
          {allDone
            ? `${total} file${total > 1 ? 's' : ''} processed`
            : `Processing ${total} files…`}
        </p>
        <p className="np-body text-[13px]" style={{ color: '#737373' }}>
          {doneCount} of {total} complete{failCount > 0 ? ` · ${failCount} failed` : ''}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="np-mono text-[11px] font-bold" style={{ color: '#CC0000' }}>{pct}%</span>
          <span className="np-mono text-[11px]" style={{ color: '#AEABA6' }}>{doneCount}/{total} files</span>
        </div>
        <div className="h-1.5 overflow-hidden" style={{ backgroundColor: '#E5E5E0' }}>
          <motion.div
            className="h-full"
            style={{ backgroundColor: '#CC0000' }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {uploads.map((u) => {
          const done   = u.phase === 'completed'
          const failed = u.phase === 'failed'
          const shortLabel = done ? 'Ready' : failed ? 'Failed' : STEP_SHORT[Math.min(u.processingStage, STEP_SHORT.length - 1)]
          return (
            <div
              key={u.id}
              className="flex items-center gap-3 px-4 py-3"
              style={{
                backgroundColor: done ? '#F0FDF4' : failed ? '#FEF2F2' : '#F5F0E8',
                border: `1px solid ${done ? '#BBF7D0' : failed ? '#FECACA' : '#E5E5E0'}`,
                borderLeft: `3px solid ${done ? '#16A34A' : failed ? '#DC2626' : '#CC0000'}`,
              }}
            >
              <div
                className="w-7 h-7 flex items-center justify-center shrink-0"
                style={{ backgroundColor: done ? '#DCFCE7' : failed ? '#FEE2E2' : '#F0EDE6' }}
              >
                {done
                  ? <CheckCircle2 className="w-4 h-4" style={{ color: '#16A34A' }} strokeWidth={2} />
                  : failed
                  ? <XCircle className="w-4 h-4" style={{ color: '#DC2626' }} strokeWidth={2} />
                  : <FileText className="w-4 h-4" style={{ color: '#CC0000' }} strokeWidth={1.8} />
                }
              </div>
              <span className="flex-1 min-w-0 np-body text-[13px] font-medium truncate" style={{ color: '#111111' }}>
                {u.file.name}
              </span>
              <span
                className="shrink-0 np-mono text-[11px] font-bold uppercase tracking-widest"
                style={{ color: done ? '#16A34A' : failed ? '#DC2626' : '#CC0000' }}
              >
                {shortLabel}
              </span>
            </div>
          )
        })}
      </div>

      {allDone && doneCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="px-4 py-3 text-center"
          style={{ backgroundColor: '#F0FDF4', borderLeft: '3px solid #16A34A' }}
        >
          <p className="np-sans text-[13px] font-semibold" style={{ color: '#15803D' }}>
            🎉 {doneCount} file{doneCount > 1 ? 's are' : ' is'} ready! You can now ask questions about {doneCount > 1 ? 'them' : 'it'}.
          </p>
        </motion.div>
      )}
    </div>
  )
}

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
    <div className="overflow-hidden" style={{ border: '1px solid #E5E5E0' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer transition-colors"
        style={{ backgroundColor: open ? '#F0EDE6' : '#F5F0E8' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F0EDE6' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = open ? '#F0EDE6' : '#F5F0E8' }}
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5" style={{ color: '#CC0000' }} strokeWidth={2} />
          <span className="np-mono text-[11px] font-bold uppercase tracking-widest" style={{ color: '#111111' }}>
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
            style={{ overflow: 'hidden', backgroundColor: '#F9F9F7', borderTop: '1px solid #E5E5E0' }}
          >
            <div className="px-4 py-3 space-y-2">
              {steps.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span
                    className="w-5 h-5 flex items-center justify-center shrink-0 np-mono text-[10px] font-bold mt-0.5"
                    style={{ backgroundColor: '#111111', color: '#F9F9F7', lineHeight: 1 }}
                  >
                    {i + 1}
                  </span>
                  <p className="np-body text-[12px] leading-[1.55]" style={{ color: '#4A4845' }}>{s}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function UploadZone() {
  const inputRef = useRef(null)
  const addDocument    = useDocumentStore((s) => s.addDocument)
  const updateDocument = useDocumentStore((s) => s.updateDocument)
  const startPolling   = useDocumentStore((s) => s.startPolling)

  const [uploads, setUploads]   = useState([])
  const [dragOver, setDragOver] = useState(false)
  const [error, setError]       = useState('')

  const [mode, setMode]                 = useState('file')
  const [pasteName, setPasteName]       = useState('')
  const [pasteContent, setPasteContent] = useState('')
  const [pasteExt, setPasteExt]         = useState('md')
  const [pasteError, setPasteError]     = useState('')

  const [notionConnected, setNotionConnected]           = useState(null)
  const [notionUrl, setNotionUrl]                       = useState('')
  const [notionFileName, setNotionFileName]             = useState('')
  const [notionImporting, setNotionImporting]           = useState(false)
  const [notionError, setNotionError]                   = useState('')
  const [showIntegrationsPanel, setShowIntegrationsPanel] = useState(false)

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

      {/* ── Mode switcher ──────────────────────────────────────── */}
      {!showProgress && (
        <div
          className="flex items-center gap-0 self-start"
          style={{ border: '1px solid #111111' }}
        >
          {[
            { id: 'file',   Icon: UploadCloud, label: 'Upload files' },
            { id: 'paste',  Icon: Pencil,      label: 'Paste text'   },
            { id: 'notion', Icon: BookOpen,    label: 'Notion'        },
          ].map(({ id, Icon, label }, i, arr) => {
            const active = mode === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => { setMode(id); setError(''); setPasteError(''); setNotionError('') }}
                className="flex items-center gap-2 px-4 py-2.5 np-mono text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                style={{
                  backgroundColor: active ? '#111111' : 'transparent',
                  color: active ? '#F9F9F7' : '#737373',
                  borderRight: i < arr.length - 1 ? '1px solid #111111' : 'none',
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
            className="flex flex-col p-6"
            style={{ border: '1px solid #E5E5E0', backgroundColor: '#F9F9F7' }}
          >
            {notionConnected === null ? (
              <div className="flex-1 flex items-center justify-center py-16">
                <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#D9D7D2' }} strokeWidth={2} />
              </div>
            ) : !notionConnected ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-4 py-12">
                <div
                  className="w-16 h-16 flex items-center justify-center"
                  style={{ backgroundColor: '#F5F0E8', border: '1px solid #E5E5E0' }}
                >
                  <Puzzle className="w-8 h-8" style={{ color: '#AEABA6' }} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="np-serif font-black text-[16px] mb-2" style={{ color: '#111111' }}>
                    Connect Notion first
                  </p>
                  <p className="np-body text-[13px] leading-relaxed" style={{ color: '#737373' }}>
                    Connect your Notion workspace to import pages directly as documents.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIntegrationsPanel(true)}
                  className="btn-ink flex items-center gap-2 h-11 px-6 cursor-pointer"
                >
                  <Puzzle className="w-4 h-4" strokeWidth={2} />
                  Connect Notion
                </button>
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
              <form onSubmit={handleNotionImport} className="flex-1 flex flex-col gap-4">
                <div>
                  <label className="block np-mono text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#111111' }}>
                    Notion Page URL
                  </label>
                  <input
                    type="url"
                    value={notionUrl}
                    onChange={(e) => { setNotionUrl(e.target.value); setNotionError('') }}
                    placeholder="https://www.notion.so/My-Page-abc123def456"
                    className="auth-input"
                  />
                </div>

                <div>
                  <label className="block np-mono text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#111111' }}>
                    File name
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={notionFileName}
                      onChange={(e) => setNotionFileName(e.target.value)}
                      placeholder="e.g. my-notion-page"
                      required
                      className="auth-input flex-1"
                    />
                    <span className="np-mono text-[13px] font-semibold shrink-0" style={{ color: '#7A7874' }}>.md</span>
                  </div>
                </div>

                {notionError && (
                  <div className="px-4 py-3" style={{ borderLeft: '3px solid #CC0000' }}>
                    <p className="np-mono text-[12px] uppercase tracking-wide" style={{ color: '#CC0000' }}>{notionError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={notionImporting || !notionUrl.trim() || !notionFileName.trim()}
                  className="btn-ink h-11 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {notionImporting
                    ? <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> Importing...</>
                    : <>Import from Notion <ArrowRight className="w-4 h-4" strokeWidth={2.5} /></>
                  }
                </button>

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
            className="flex-1 flex flex-col gap-4 p-6"
            style={{ border: '1px solid #E5E5E0', backgroundColor: '#F9F9F7', minHeight: '420px' }}
          >
            <div>
              <label className="block np-mono text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#111111' }}>
                File name
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pasteName}
                  onChange={(e) => setPasteName(e.target.value)}
                  placeholder="e.g. meeting-notes"
                  className="auth-input flex-1"
                />
                {/* Extension switcher */}
                <div
                  className="flex items-center gap-0 shrink-0"
                  style={{ border: '1px solid #111111' }}
                >
                  {['md', 'txt'].map((ext, i) => (
                    <button
                      key={ext}
                      type="button"
                      onClick={() => setPasteExt(ext)}
                      className="px-3 py-2 np-mono text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                      style={{
                        backgroundColor: pasteExt === ext ? '#111111' : 'transparent',
                        color: pasteExt === ext ? '#F9F9F7' : '#737373',
                        borderRight: i === 0 ? '1px solid #111111' : 'none',
                      }}
                    >
                      .{ext}
                    </button>
                  ))}
                </div>
                {pasteName.trim() && (
                  <span className="np-mono text-[12px] shrink-0" style={{ color: '#AEABA6' }}>
                    → {pasteName.trim().replace(/\.(md|txt)$/i, '')}.{pasteExt}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block np-mono text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#111111' }}>
                Content
              </label>
              <textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder={pasteExt === 'md' ? '# Heading\n\nPaste your markdown, notes, or documentation here…' : 'Paste your plain text, logs, or any content here…'}
                className="flex-1 px-4 py-3 np-body text-[13px] leading-relaxed resize-none focus:outline-none transition-all"
                style={{
                  border: '1.5px solid #E5E5E0',
                  backgroundColor: '#FDFCFA',
                  color: '#111111',
                  minHeight: '220px',
                  fontFamily: pasteExt === 'md' ? 'var(--font-jetbrains), monospace' : 'inherit',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#111111'; e.currentTarget.style.boxShadow = '2px 2px 0px 0px #111111' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5E0'; e.currentTarget.style.boxShadow = 'none' }}
              />
              <p className="np-mono text-[11px] mt-1.5 text-right" style={{ color: '#AEABA6' }}>
                {pasteContent.length > 0 ? `${pasteContent.length.toLocaleString()} characters` : 'No content yet'}
              </p>
            </div>

            {pasteError && (
              <p className="np-mono text-[12px] uppercase tracking-wide" style={{ color: '#CC0000' }}>{pasteError}</p>
            )}

            <button
              type="submit"
              disabled={!pasteName.trim() || !pasteContent.trim()}
              className="btn-ink h-11 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              Submit this content
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </motion.form>
        ) : !showProgress ? (
          /* ── Drop zone ──────────────────────────────────────── */
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{
              opacity: 1,
              scale: dragOver ? 1.005 : 1,
              borderColor: dragOver ? '#CC0000' : '#E5E5E0',
              backgroundColor: dragOver ? '#FEF9F0' : '#FAFAF8',
            }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className="flex-1 flex flex-col items-center justify-center gap-6 cursor-pointer px-8 select-none"
            style={{ minHeight: '320px', border: '2px dashed #E5E5E0' }}
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
                className="w-20 h-20 flex items-center justify-center"
                style={{
                  backgroundColor: dragOver ? '#FEF2F2' : '#F0EDE6',
                  border: `1px solid ${dragOver ? '#FECACA' : '#E5E5E0'}`,
                }}
              >
                <UploadCloud className="w-9 h-9" style={{ color: dragOver ? '#CC0000' : '#AEABA6' }} strokeWidth={1.8} />
              </div>
            </motion.div>

            <div className="text-center">
              <p className="np-serif font-black tracking-tight" style={{ fontSize: '18px', color: dragOver ? '#CC0000' : '#111111' }}>
                {dragOver ? 'Release to upload' : 'Drop files here'}
              </p>
              <p className="np-body text-[13px] mt-1.5" style={{ color: '#737373' }}>
                Drag & drop multiple files or click to browse · max {MAX_SIZE_MB} MB each
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
              className="btn-ink h-10 px-6 cursor-pointer"
            >
              Browse files
            </button>

            <div className="flex items-center gap-2">
              {FORMAT_PILLS.map(({ label, bg, color }) => (
                <span key={label} className="np-mono text-[10px] font-bold px-2.5 py-1" style={{ backgroundColor: bg, color }}>
                  {label}
                </span>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ── Progress view ─────────────────────────────────── */
          <motion.div
            key="progress"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="flex-1 px-8 py-8 overflow-y-auto"
            style={{ border: '1px solid #E5E5E0', backgroundColor: '#F9F9F7' }}
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
            className="px-4 py-3"
            style={{ borderLeft: '3px solid #CC0000' }}
          >
            <p className="np-mono text-[12px] uppercase tracking-wide" style={{ color: '#CC0000' }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
