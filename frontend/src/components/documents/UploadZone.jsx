'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getDocumentStatus, uploadDocumentWithProgress } from '@/lib/api'
import useDocumentStore from '@/store/useDocumentStore'

const ACCEPTED_EXTENSIONS = ['pdf', 'docx', 'md', 'txt']
const MAX_SIZE_MB = 50

const TYPE_CONFIG = {
  pdf:  { label: 'PDF', bg: '#FEF2F2', color: '#EF4444', icon: '📄' },
  docx: { label: 'DOC', bg: '#EFF6FF', color: '#3B82F6', icon: '📝' },
  md:   { label: 'MD',  bg: '#F5F3FF', color: '#8B5CF6', icon: '✍️' },
  txt:  { label: 'TXT', bg: '#F9FAFB', color: '#6B7280', icon: '📃' },
}

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
  const ext = getExt(file.name)
  const cfg = TYPE_CONFIG[ext] ?? TYPE_CONFIG.txt
  const isComplete = phase === 'completed'
  const isFailed   = phase === 'failed'

  const overallPct = processingStage === 0
    ? uploadPct * 0.25
    : processingStage >= STAGE_LABELS.length
      ? 100
      : 25 + ((processingStage - 1) / (STAGE_LABELS.length - 1)) * 75

  const stageLabel = isComplete ? 'Ready!' : isFailed ? 'Failed'
    : STAGE_LABELS[Math.min(processingStage, STAGE_LABELS.length - 1)] + '...'

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -12, height: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="bg-white border rounded-2xl overflow-hidden"
      style={{
        borderColor: isComplete ? '#86EFAC' : isFailed ? '#FCA5A5' : '#E4E7EF',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      <div className="flex items-center gap-4 p-4">
        {/* File type icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: cfg.bg }}
        >
          {cfg.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[13px] font-semibold text-fg truncate">{file.name}</p>
            <span
              className={`text-[12px] font-medium shrink-0 ml-3 ${
                isComplete ? 'text-success' : isFailed ? 'text-danger' : 'text-fg-3'
              }`}
            >
              {isComplete ? '✓ Ready' : isFailed ? '✗ Failed' : stageLabel}
            </span>
          </div>

          {!isComplete && !isFailed && (
            <div className="h-1.5 bg-border-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #4361EE, #7C3AED)' }}
                animate={{ width: `${Math.max(2, overallPct)}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          )}

          {isComplete && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="h-1.5 rounded-full bg-success"
              style={{ transformOrigin: 'left' }}
            />
          )}
        </div>
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
    <div className="space-y-4">
      {/* Drop zone */}
      <motion.div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        animate={{
          borderColor: dragOver ? '#4361EE' : '#C7D2FE',
          backgroundColor: dragOver ? '#EEF2FF' : '#FFFFFF',
          scale: dragOver ? 1.008 : 1,
        }}
        transition={{ duration: 0.18 }}
        className="flex flex-col items-center justify-center gap-4 cursor-pointer border-2 border-dashed rounded-2xl px-6 py-12 select-none"
        style={{ borderColor: '#C7D2FE' }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.md,.txt"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) startUpload(f) }}
        />

        <motion.div
          animate={{ scale: dragOver ? 1.12 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <svg className="w-12 h-12 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </motion.div>

        <div className="text-center">
          <p className="text-[15px] font-semibold text-fg">
            {dragOver ? 'Drop to upload' : 'Drop your document here'}
          </p>
          <p className="text-[12px] text-fg-4 mt-1">
            PDF, DOCX, TXT, Markdown · max {MAX_SIZE_MB} MB
          </p>
        </div>

        <motion.button
          type="button"
          onClick={(e) => e.stopPropagation()}
          whileHover={{ backgroundColor: '#E0E7FF' }}
          whileTap={{ scale: 0.97 }}
          className="h-9 px-5 bg-brand-light border border-brand-border text-brand text-[13px] font-semibold rounded-lg transition-colors"
        >
          Browse files
        </motion.button>
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[13px] text-danger"
        >
          {error}
        </motion.p>
      )}

      {/* Upload progress cards */}
      <AnimatePresence>
        {uploads.map((u) => (
          <UploadProgressCard key={u.id} upload={u} />
        ))}
      </AnimatePresence>
    </div>
  )
}
