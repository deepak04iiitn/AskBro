'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle2, XCircle } from 'lucide-react'
import { getDocumentStatus, uploadDocumentWithProgress } from '@/lib/api'
import useDocumentStore from '@/store/useDocumentStore'

const ACCEPTED_EXTENSIONS = ['pdf', 'docx', 'md', 'txt']
const MAX_SIZE_MB = 50

const STAGE_LABELS = ['Uploading', 'Extracting text', 'Generating embeddings', 'Indexing']
const STAGE_DURATIONS = [null, 4000, 12000, 4000]

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
      className="overflow-hidden rounded-xl"
      style={{
        border: `1px solid ${isComplete ? '#BBF7D0' : isFailed ? '#FECACA' : '#E3E1DC'}`,
        backgroundColor: isComplete ? '#F0FDF4' : isFailed ? '#FEF2F2' : '#FAFAF9',
      }}
    >
      <div className="flex items-center gap-4 px-4 py-3.5">
        {/* Icon */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: isComplete ? '#DCFCE7' : isFailed ? '#FEE2E2' : '#F0EFEC' }}
        >
          {isComplete
            ? <CheckCircle2 className="w-4.5 h-4.5" style={{ color: '#16A34A' }} strokeWidth={2} />
            : isFailed
            ? <XCircle className="w-4.5 h-4.5" style={{ color: '#DC2626' }} strokeWidth={2} />
            : <FileText className="w-4.5 h-4.5" style={{ color: '#AEABA6' }} strokeWidth={1.8} />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="text-[13px] font-medium truncate" style={{ color: '#111110' }}>
              {file.name}
            </p>
            <span
              className="text-[11px] font-semibold shrink-0"
              style={{
                color: isComplete ? '#16A34A' : isFailed ? '#DC2626' : '#AEABA6',
              }}
            >
              {stageLabel}
            </span>
          </div>

          {/* Progress bar */}
          {!isComplete && !isFailed && (
            <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#E3E1DC' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: '#2563EB' }}
                animate={{ width: `${Math.max(2, overallPct)}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          )}

          {isComplete && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="h-1 rounded-full"
              style={{ backgroundColor: '#16A34A', transformOrigin: 'left' }}
            />
          )}

          {isFailed && (
            <div className="h-1 rounded-full" style={{ backgroundColor: '#FECACA' }} />
          )}
        </div>

        <span className="text-[11px] shrink-0" style={{ color: '#AEABA6' }}>
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

  const [uploads, setUploads] = useState([])
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')

  function validateFile(f) {
    const ext = getExt(f.name)
    if (!ACCEPTED_EXTENSIONS.includes(ext)) return `File type .${ext} is not supported.`
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return `File too large. Max is ${MAX_SIZE_MB} MB.`
    return null
  }

  function onDragOver(e)  { e.preventDefault(); setDragOver(true) }
  function onDragLeave()  { setDragOver(false) }
  function onDrop(e) {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) startUpload(f)
  }

  function patchUpload(id, patch) {
    setUploads((prev) => prev.map((u) => u.id === id ? { ...u, ...patch } : u))
  }

  async function startUpload(file) {
    const err = validateFile(file)
    if (err) { setError(err); return }
    setError('')

    const id = `up_${Date.now()}`
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

  return (
    <div className="space-y-3">

      {/* ── Drop zone ─────────────────────────────────────────── */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-5 cursor-pointer rounded-xl px-6 py-14 select-none transition-all duration-150"
        style={{
          border: `1.5px dashed ${dragOver ? '#2563EB' : '#BFDBFE'}`,
          backgroundColor: dragOver ? '#DBEAFE' : '#FFFFFF',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.md,.txt"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) startUpload(f) }}
        />

        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-150"
          style={{ backgroundColor: dragOver ? '#BFDBFE' : '#DBEAFE' }}
        >
          <Upload
            className="w-6 h-6 transition-colors duration-150"
            style={{ color: dragOver ? '#1D4ED8' : '#3B82F6' }}
            strokeWidth={2}
          />
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="text-[15px] font-semibold" style={{ color: dragOver ? '#1D4ED8' : '#1E3A8A' }}>
            {dragOver ? 'Drop to upload' : 'Drop your document here'}
          </p>
          <p className="text-[12px] mt-1.5" style={{ color: '#9CA3AF' }}>
            or click to browse · max {MAX_SIZE_MB} MB
          </p>
        </div>

        {/* Browse button */}
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="h-9 px-5 text-[13px] font-semibold rounded-lg transition-colors cursor-pointer"
          style={{
            backgroundColor: '#EFF6FF',
            border: '1.5px solid #BFDBFE',
            color: '#2563EB',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#DBEAFE'
            e.currentTarget.style.borderColor = '#93C5FD'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#EFF6FF'
            e.currentTarget.style.borderColor = '#BFDBFE'
          }}
        >
          Browse files
        </button>
      </div>

      {/* ── Error ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="rounded-lg px-4 py-3"
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
