'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadDocument } from '@/lib/api'
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

// ── States ────────────────────────────────────────────────────────────────────
// idle | selected | uploading | processing | completed | failed

export default function UploadZone() {
  const router = useRouter()
  const inputRef = useRef(null)
  const addDocument = useDocumentStore((s) => s.addDocument)
  const updateDocument = useDocumentStore((s) => s.updateDocument)
  const startPolling = useDocumentStore((s) => s.startPolling)

  const [file, setFile] = useState(null)
  const [tags, setTags] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [phase, setPhase] = useState('idle') // idle | selected | uploading | processing | completed | failed
  const [error, setError] = useState('')
  const [result, setResult] = useState(null) // { document_id, chunk_count }

  // ── File validation ──────────────────────────────────────────────────────────
  function validateFile(f) {
    const ext = getExt(f.name)
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      return `File type .${ext} is not supported. Accepted: ${ACCEPTED_EXTENSIONS.join(', ')}`
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File is too large (${formatBytes(f.size)}). Max size is ${MAX_SIZE_MB} MB.`
    }
    return null
  }

  function selectFile(f) {
    const err = validateFile(f)
    if (err) { setError(err); return }
    setError('')
    setFile(f)
    setPhase('selected')
  }

  // ── Drag events ──────────────────────────────────────────────────────────────
  function onDragOver(e) { e.preventDefault(); setDragOver(true) }
  function onDragLeave() { setDragOver(false) }
  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) selectFile(dropped)
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function handleUpload() {
    if (!file || phase === 'uploading') return
    setPhase('uploading')
    setError('')

    const parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean)

    try {
      const data = await uploadDocument(file, parsedTags)
      const docId = data.document_id

      // Optimistically add to store
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

      setPhase('processing')
      setResult({ document_id: docId })

      // Poll until done/failed
      startPolling(docId)

      // Listen via polling — check every 3s ourselves here for UI feedback
      const interval = setInterval(async () => {
        const { getDocumentStatus } = await import('@/lib/api')
        try {
          const status = await getDocumentStatus(docId)
          if (status.status === 'completed') {
            clearInterval(interval)
            setResult({ document_id: docId, chunk_count: status.chunk_count })
            setPhase('completed')
            updateDocument(docId, { status: 'completed', chunk_count: status.chunk_count })
          } else if (status.status === 'failed') {
            clearInterval(interval)
            setError(status.error_message || 'Processing failed.')
            setPhase('failed')
            updateDocument(docId, { status: 'failed', error_message: status.error_message })
          }
        } catch { /* keep polling */ }
      }, 3000)

    } catch (err) {
      setError(err.message || 'Upload failed.')
      setPhase('failed')
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

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
            onClick={() => { setFile(null); setPhase('idle'); setResult(null); setTags('') }}
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
          border-2 border-dashed rounded-2xl px-6 py-14 cursor-pointer
          transition-colors select-none
          ${dragOver ? 'border-zinc-500 bg-zinc-50' : 'border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50'}
          ${phase !== 'idle' && phase !== 'selected' ? 'cursor-default' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.md,.txt"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) selectFile(f) }}
        />

        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center">
          {phase === 'uploading' || phase === 'processing' ? (
            <svg className="w-6 h-6 text-zinc-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          )}
        </div>

        {/* Copy */}
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

        {/* Selected file info */}
        {(phase === 'selected') && file && (
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

        {/* Uploading / processing */}
        {phase === 'uploading' && (
          <p className="text-sm font-medium text-zinc-700">Uploading…</p>
        )}
        {phase === 'processing' && (
          <div className="text-center">
            <p className="text-sm font-semibold text-zinc-800">Processing</p>
            <p className="text-xs text-zinc-400 mt-0.5">Chunking and indexing your document…</p>
          </div>
        )}

        {/* Failed overlay */}
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

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="mt-0.5">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Tags input — only show when file selected */}
      {(phase === 'selected') && (
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

      {/* Upload button */}
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
