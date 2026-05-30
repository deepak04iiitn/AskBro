'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, FileText, CheckCircle2, XCircle, Pencil, ArrowRight } from 'lucide-react'
import { getDocumentStatus, uploadDocumentWithProgress } from '@/lib/api'
import useDocumentStore from '@/store/useDocumentStore'

const ACCEPTED_EXTENSIONS = ['pdf', 'docx', 'md', 'txt']
const MAX_SIZE_MB = 50

const STAGE_LABELS = ['Uploading', 'Extracting text', 'Generating embeddings', 'Indexing']
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

function UploadProgressCard({ upload }) {
  const { file, uploadPct, processingStage, phase } = upload
  const isComplete = phase === 'completed'
  const isFailed   = phase === 'failed'

  const overallPct = processingStage === 0
    ? uploadPct * 0.25
    : processingStage >= STAGE_LABELS.length
      ? 100
      : 25 + ((processingStage - 1) / (STAGE_LABELS.length - 1)) * 75

  const stageLabel = isComplete ? 'Ready'
    : isFailed ? 'Failed'
    : STAGE_LABELS[Math.min(processingStage, STAGE_LABELS.length - 1)] + '…'

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="overflow-hidden rounded-2xl"
      style={{
        border: `1px solid ${isComplete ? '#BBF7D0' : isFailed ? '#FECACA' : '#BFDBFE'}`,
        backgroundColor: isComplete ? '#F0FDF4' : isFailed ? '#FEF2F2' : '#EFF6FF',
      }}
    >
      <div className="flex items-center gap-4 px-5 py-4">
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

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <p className="text-[13px] font-semibold truncate" style={{ color: '#1E3A8A' }}>
              {file.name}
            </p>
            <span className="text-[11px] font-bold shrink-0" style={{ color: isComplete ? '#16A34A' : isFailed ? '#DC2626' : '#2563EB' }}>
              {stageLabel}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: isComplete ? '#BBF7D0' : isFailed ? '#FECACA' : '#BFDBFE' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: isComplete ? '#16A34A' : isFailed ? '#DC2626' : '#2563EB', transformOrigin: 'left' }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isComplete || isFailed ? 1 : Math.max(0.02, overallPct / 100) }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        <span className="text-[11px] font-medium shrink-0" style={{ color: '#6B7280' }}>
          {formatBytes(file.size)}
        </span>
      </div>
    </motion.div>
  )
}

export default function UploadZone() {
  const inputRef = useRef(null)
  const addDocument    = useDocumentStore((s) => s.addDocument)
  const updateDocument = useDocumentStore((s) => s.updateDocument)
  const startPolling   = useDocumentStore((s) => s.startPolling)

  // shared state
  const [uploads, setUploads] = useState([])
  const [error, setError]     = useState('')

  // mode: 'file' | 'paste'
  const [mode, setMode]           = useState('file')
  const [dragOver, setDragOver]   = useState(false)

  // paste mode state
  const [pasteName, setPasteName]       = useState('')
  const [pasteContent, setPasteContent] = useState('')
  const [pasteExt, setPasteExt]         = useState('md')
  const [pasteError, setPasteError]     = useState('')

  function validateFile(f) {
    const ext = getExt(f.name)
    if (!ACCEPTED_EXTENSIONS.includes(ext)) return `File type .${ext} is not supported.`
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return `File too large. Max is ${MAX_SIZE_MB} MB.`
    return null
  }

  function startFiles(fileList) {
    const files = Array.from(fileList)
    const invalid = files.find((f) => validateFile(f))
    if (invalid) { setError(validateFile(invalid)); return }
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
      for (let i = 1; i < STAGE_LABELS.length - 1; i++) {
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
            patchUpload(id, { processingStage: STAGE_LABELS.length, phase: 'completed' })
          } else if (status.status === 'failed') {
            clearInterval(interval)
            timers.forEach(clearTimeout)
            updateDocument(docId, { status: 'failed', error_message: status.error_message })
            patchUpload(id, { phase: 'failed' })
          }
        } catch { /* keep polling */ }
      }, 3000)
    } catch (err) {
      setError(err.message || 'Upload failed.')
      patchUpload(id, { phase: 'failed' })
    }
  }

  // ── Paste text → File conversion ────────────────────────────
  function handlePasteSubmit(e) {
    e.preventDefault()
    setPasteError('')

    if (!pasteName.trim()) { setPasteError('Please enter a filename.'); return }
    if (!pasteContent.trim()) { setPasteError('Please paste some content.'); return }

    const safeName = pasteName.trim().replace(/\.(md|txt)$/i, '')
    const filename = `${safeName}.${pasteExt}`
    const blob = new Blob([pasteContent], { type: 'text/plain' })
    const file = new File([blob], filename, { type: 'text/plain', lastModified: Date.now() })

    startUpload(file)
    setPasteName('')
    setPasteContent('')
    setPasteError('')
    setMode('file')
  }

  const charCount = pasteContent.length

  return (
    <div className="space-y-3 h-full flex flex-col">

      {/* ── Mode switcher ─────────────────────────────────────── */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl self-start"
        style={{ backgroundColor: '#DBEAFE', border: '1px solid #BFDBFE' }}
      >
        {[
          { id: 'file',  Icon: UploadCloud, label: 'Upload files' },
          { id: 'paste', Icon: Pencil,      label: 'Paste text'   },
        ].map(({ id, Icon, label }) => {
          const active = mode === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => { setMode(id); setError(''); setPasteError('') }}
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

      {/* ── File upload zone ──────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {mode === 'file' && (
          <motion.div
            key="file"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="flex-1 flex flex-col"
          >
            <motion.div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              animate={{
                borderColor: dragOver ? '#2563EB' : '#BFDBFE',
                backgroundColor: dragOver ? '#DBEAFE' : '#FFFFFF',
                scale: dragOver ? 1.005 : 1,
              }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col items-center justify-center gap-6 cursor-pointer rounded-2xl px-8 select-none"
              style={{ minHeight: '300px', border: '2px dashed #BFDBFE', backgroundColor: '#FFFFFF' }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.md,.txt"
                multiple
                className="hidden"
                onChange={(e) => { if (e.target.files?.length) { startFiles(e.target.files); e.target.value = '' } }}
              />

              <motion.div
                animate={{ scale: dragOver ? 1.12 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
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
                onClick={(e) => e.stopPropagation()}
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
          </motion.div>
        )}

        {/* ── Paste text form ─────────────────────────────────── */}
        {mode === 'paste' && (
          <motion.form
            key="paste"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            onSubmit={handlePasteSubmit}
            className="flex-1 flex flex-col gap-4 bg-white rounded-2xl p-6"
            style={{ border: '2px solid #BFDBFE', minHeight: '300px' }}
          >
            {/* Filename row */}
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
                  className="flex-1 h-10 rounded-xl px-3 text-[13px] transition-all focus:outline-none"
                  style={{ border: '1.5px solid #BFDBFE', backgroundColor: '#EFF6FF', color: '#1E3A8A' }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563EB'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#BFDBFE'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />

                {/* Extension toggle */}
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

                {/* Preview of full filename */}
                {pasteName.trim() && (
                  <span className="text-[12px] font-medium shrink-0" style={{ color: '#9CA3AF' }}>
                    → {pasteName.trim().replace(/\.(md|txt)$/i, '')}.{pasteExt}
                  </span>
                )}
              </div>
            </div>

            {/* Content textarea */}
            <div className="flex-1 flex flex-col">
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: '#1E3A8A' }}>
                Content
              </label>
              <textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder={pasteExt === 'md'
                  ? '# Heading\n\nPaste your markdown, notes, or documentation here…'
                  : 'Paste your plain text, logs, or any content here…'
                }
                className="flex-1 rounded-xl px-4 py-3 text-[13px] leading-relaxed resize-none focus:outline-none transition-all"
                style={{
                  border: '1.5px solid #BFDBFE',
                  backgroundColor: '#F8FAFF',
                  color: '#1E3A8A',
                  minHeight: '180px',
                  fontFamily: pasteExt === 'md' ? 'var(--font-jetbrains), monospace' : 'inherit',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#2563EB'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.10)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#BFDBFE'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <p className="text-[11px] mt-1.5 text-right" style={{ color: '#9CA3AF' }}>
                {charCount > 0 ? `${charCount.toLocaleString()} character${charCount !== 1 ? 's' : ''}` : 'No content yet'}
              </p>
            </div>

            {/* Error */}
            <AnimatePresence>
              {pasteError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-[13px]"
                  style={{ color: '#DC2626' }}
                >
                  {pasteError}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={!pasteName.trim() || !pasteContent.trim()}
              className="h-11 flex items-center justify-center gap-2 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#2563EB' }}
              onMouseEnter={(e) => { if (pasteName.trim() && pasteContent.trim()) e.currentTarget.style.backgroundColor = '#1D4ED8' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#2563EB' }}
            >
              Index this text
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ── File upload error ─────────────────────────────────── */}
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

      {/* ── Upload progress cards ─────────────────────────────── */}
      <AnimatePresence>
        {uploads.map((u) => (
          <UploadProgressCard key={u.id} upload={u} />
        ))}
      </AnimatePresence>
    </div>
  )
}
