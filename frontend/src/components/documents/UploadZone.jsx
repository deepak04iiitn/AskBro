'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getDocumentStatus, uploadDocumentWithProgress } from '@/lib/api'
import useDocumentStore from '@/store/useDocumentStore'

const ACCEPTED_EXTENSIONS = ['pdf', 'docx', 'md', 'txt']
const MAX_SIZE_MB = 50

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getExt(filename) {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

// ── Processing stages shown after upload finishes ─────────────────────────────
const STAGES = [
  { id: 'upload',   label: 'Uploading file',        duration: null }, // driven by XHR
  { id: 'extract',  label: 'Extracting text',        duration: 4000 },
  { id: 'embed',    label: 'Generating embeddings',  duration: 12000 },
  { id: 'index',    label: 'Indexing to vector store', duration: 4000 },
]

// ── Animated progress bar ──────────────────────────────────────────────────────
function ProgressBar({ value, animated = false, color = 'bg-zinc-900' }) {
  return (
    <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${color} ${animated ? 'animate-pulse' : ''}`}
        style={{ width: `${Math.min(100, Math.max(2, value))}%` }}
      />
    </div>
  )
}

// ── Stage icon ─────────────────────────────────────────────────────────────────
function StageIcon({ status }) {
  if (status === 'done') return (
    <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  )
  if (status === 'active') return (
    <div className="w-5 h-5 rounded-full border-2 border-zinc-900 flex items-center justify-center shrink-0">
      <span className="w-2 h-2 rounded-full bg-zinc-900 animate-ping" />
    </div>
  )
  return (
    <div className="w-5 h-5 rounded-full border-2 border-zinc-200 shrink-0" />
  )
}

// ── Main progress tracker (shown during upload + processing) ──────────────────
function ProgressTracker({ uploadPct, processingStage, filename }) {
  // uploadPct: 0-100  |  processingStage: 0=uploading, 1-3=active processing, >=4=all done
  // Overall: upload occupies 0-25%, the 3 processing stages split 25-100%
  // Progress only advances when a stage is COMPLETED, not when it starts.
  const overallPct = processingStage === 0
    ? uploadPct * 0.25
    : processingStage >= STAGES.length
      ? 100
      : 25 + ((processingStage - 1) / (STAGES.length - 1)) * 75

  return (
    <div className="w-full space-y-6">
      {/* Filename */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 truncate">{filename}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{Math.round(overallPct)}% complete</p>
        </div>
      </div>

      {/* Overall bar */}
      <ProgressBar value={overallPct} color="bg-zinc-900" />

      {/* Stage list */}
      <div className="space-y-3">
        {STAGES.map((stage, i) => {
          const status =
            i < processingStage ? 'done' :
            i === processingStage ? 'active' :
            'waiting'

          return (
            <div key={stage.id} className="flex items-center gap-3">
              <StageIcon status={status} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${
                  status === 'done' ? 'text-zinc-400 line-through' :
                  status === 'active' ? 'text-zinc-900' :
                  'text-zinc-300'
                }`}>
                  {stage.label}
                </p>
                {/* Per-stage bar for active upload stage */}
                {status === 'active' && stage.id === 'upload' && (
                  <div className="mt-1.5">
                    <ProgressBar value={uploadPct} color="bg-zinc-600" />
                  </div>
                )}
                {/* Indeterminate bar for active processing stages */}
                {status === 'active' && stage.id !== 'upload' && (
                  <div className="mt-1.5">
                    <ProgressBar value={60} animated color="bg-zinc-400" />
                  </div>
                )}
              </div>
              {status === 'done' && (
                <span className="text-[10px] text-zinc-300 shrink-0">done</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function UploadZone() {
  const router = useRouter()
  const inputRef = useRef(null)
  const addDocument = useDocumentStore((s) => s.addDocument)
  const updateDocument = useDocumentStore((s) => s.updateDocument)
  const startPolling = useDocumentStore((s) => s.startPolling)

  const [file, setFile] = useState(null)
  const [tags, setTags] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [phase, setPhase] = useState('idle') // idle | selected | active | completed | failed
  const [error, setError] = useState('')
  const [uploadPct, setUploadPct] = useState(0)
  const [processingStage, setProcessingStage] = useState(0) // 0=upload, 1=extract, 2=embed, 3=index
  const [result, setResult] = useState(null)

  // Advance through fake processing stages after upload completes
  useEffect(() => {
    if (phase !== 'active') return
    if (processingStage === 0) return // still uploading, driven by XHR

    let stageIdx = processingStage
    const advance = () => {
      stageIdx++
      if (stageIdx < STAGES.length) {
        setProcessingStage(stageIdx)
      }
    }

    // Schedule advances based on stage durations, but stop if real status resolves first
    const timers = []
    let elapsed = 0
    for (let i = processingStage; i < STAGES.length - 1; i++) {
      elapsed += STAGES[i].duration ?? 0
      timers.push(setTimeout(() => setProcessingStage(i + 1), elapsed))
    }
    return () => timers.forEach(clearTimeout)
  }, [phase, processingStage])

  // ── File validation ────────────────────────────────────────────────────────
  function validateFile(f) {
    const ext = getExt(f.name)
    if (!ACCEPTED_EXTENSIONS.includes(ext))
      return `File type .${ext} is not supported. Accepted: ${ACCEPTED_EXTENSIONS.join(', ')}`
    if (f.size > MAX_SIZE_MB * 1024 * 1024)
      return `File too large (${formatBytes(f.size)}). Max is ${MAX_SIZE_MB} MB.`
    return null
  }

  function selectFile(f) {
    const err = validateFile(f)
    if (err) { setError(err); return }
    setError('')
    setFile(f)
    setPhase('selected')
  }

  function onDragOver(e) { e.preventDefault(); setDragOver(true) }
  function onDragLeave() { setDragOver(false) }
  function onDrop(e) {
    e.preventDefault(); setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) selectFile(dropped)
  }

  // ── Upload ────────────────────────────────────────────────────────────────
  async function handleUpload() {
    if (!file || phase === 'active') return
    setPhase('active')
    setError('')
    setUploadPct(0)
    setProcessingStage(0)

    const parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean)

    try {
      const data = await uploadDocumentWithProgress(file, parsedTags, (pct) => {
        setUploadPct(pct)
      })
      const docId = data.document_id

      addDocument({
        document_id: docId,
        original_filename: file.name,
        file_type: getExt(file.name),
        file_size_bytes: file.size,
        tags: parsedTags,
        status: 'processing',
        chunk_count: null,
        created_at: new Date().toISOString(),
      })

      // Move to processing stage 1
      setUploadPct(100)
      setProcessingStage(1)
      setResult({ document_id: docId })
      startPolling(docId)

      // Poll for real completion
      const interval = setInterval(async () => {
        try {
          const status = await getDocumentStatus(docId)
          if (status.status === 'completed') {
            clearInterval(interval)
            setResult({ document_id: docId, chunk_count: status.chunk_count })
            setProcessingStage(STAGES.length) // all done
            updateDocument(docId, { status: 'completed', chunk_count: status.chunk_count })
            setTimeout(() => setPhase('completed'), 600)
          } else if (status.status === 'failed') {
            clearInterval(interval)
            setError(status.error_message || 'Processing failed.')
            updateDocument(docId, { status: 'failed', error_message: status.error_message })
            setPhase('failed')
          }
        } catch { /* keep polling */ }
      }, 3000)

    } catch (err) {
      setError(err.message || 'Upload failed.')
      setPhase('failed')
    }
  }

  // ── Completed ─────────────────────────────────────────────────────────────
  if (phase === 'completed') {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-base font-semibold text-zinc-900">Document ready</p>
        {result?.chunk_count != null && (
          <p className="text-sm text-zinc-500 mt-1">{result.chunk_count} chunks indexed</p>
        )}
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => { setFile(null); setPhase('idle'); setResult(null); setTags(''); setUploadPct(0); setProcessingStage(0) }}
            className="px-4 py-2 text-sm font-medium border border-zinc-200 rounded-lg text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Upload another
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-sm font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── Active (uploading / processing) ───────────────────────────────────────
  if (phase === 'active') {
    return (
      <div className="bg-white border border-zinc-200 rounded-2xl px-6 py-8">
        <ProgressTracker
          uploadPct={uploadPct}
          processingStage={processingStage}
          filename={file?.name ?? ''}
        />
      </div>
    )
  }

  // ── Idle / selected ───────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => phase === 'idle' && inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-3
          border-2 border-dashed rounded-2xl px-6 py-14 transition-colors select-none
          ${phase === 'idle' ? 'cursor-pointer' : ''}
          ${dragOver ? 'border-zinc-500 bg-zinc-50' : 'border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.md,.txt"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) selectFile(f) }}
        />

        <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>

        {phase === 'idle' && (
          <>
            <div className="text-center">
              <p className="text-sm font-semibold text-zinc-800">
                {dragOver ? 'Drop to upload' : 'Drag & drop your file here'}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">or click to browse</p>
            </div>
            <p className="text-[11px] text-zinc-400">PDF, DOCX, MD, TXT · max {MAX_SIZE_MB} MB</p>
          </>
        )}

        {phase === 'selected' && file && (
          <div className="text-center">
            <p className="text-sm font-semibold text-zinc-800">{file.name}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{formatBytes(file.size)}</p>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); setPhase('idle') }}
              className="mt-2 text-xs text-zinc-400 hover:text-zinc-700 underline"
            >
              Remove
            </button>
          </div>
        )}

        {phase === 'failed' && (
          <div className="text-center">
            <p className="text-sm font-semibold text-red-600">Upload failed</p>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); setPhase('idle'); setError('') }}
              className="mt-2 text-xs text-zinc-500 underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="mt-0.5">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {phase === 'selected' && (
        <div>
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wide mb-1.5">
            Tags <span className="normal-case font-normal text-zinc-400">(comma-separated, optional)</span>
          </label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="deployment, kubernetes, onboarding"
            className="w-full px-3 py-2.5 text-sm border border-zinc-300 rounded-lg bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition"
          />
        </div>
      )}

      {phase === 'selected' && (
        <button
          onClick={handleUpload}
          className="w-full py-2.5 text-sm font-semibold bg-zinc-900 text-white rounded-xl hover:bg-zinc-700 transition-colors"
        >
          Upload document
        </button>
      )}
    </div>
  )
}
