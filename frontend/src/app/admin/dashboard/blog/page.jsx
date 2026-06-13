'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Loader2,
  BookOpen, X, Check, AlertTriangle, ExternalLink,
} from 'lucide-react'
import {
  adminFetchPosts, adminFetchPost,
  adminCreatePost, adminUpdatePost, adminDeletePost,
} from '@/lib/adminApi'

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function estimateReadingTime(content) {
  const words = content.trim().split(/\s+/).length
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min read`
}

const EMPTY_FORM = {
  title: '', slug: '', description: '', content: '',
  date: new Date().toISOString().slice(0, 10),
  reading_time: '5 min read', tags: '', author: 'AskBro Team', status: 'draft',
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const published = status === 'published'
  return (
    <span
      className="inline-flex items-center gap-1 np-mono text-[9px] font-bold uppercase tracking-widest px-2 py-1"
      style={{
        backgroundColor: published ? '#F0FDF4' : '#F5F0E8',
        color: published ? '#16A34A' : '#D97706',
        border: `1px solid ${published ? '#BBF7D0' : '#FDE68A'}`,
      }}
    >
      {published ? <Eye className="w-2.5 h-2.5" strokeWidth={2.5} /> : <EyeOff className="w-2.5 h-2.5" strokeWidth={2.5} />}
      {published ? 'Published' : 'Draft'}
    </span>
  )
}

// ── Editor panel ──────────────────────────────────────────────────────────────

function EditorPanel({ post, onClose, onSaved }) {
  const [form, setForm]       = useState(post
    ? { ...post, tags: (post.tags ?? []).join(', ') }
    : EMPTY_FORM,
  )
  const [tab, setTab]         = useState('write')  // 'write' | 'preview'
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const isEdit = !!post?.id

  function set(key, val) {
    setForm((f) => {
      const next = { ...f, [key]: val }
      if (key === 'title' && !isEdit) next.slug = slugify(val)
      if (key === 'content') next.reading_time = estimateReadingTime(val)
      return next
    })
  }

  async function handleSave(status) {
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      setError('Title, slug and content are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        status,
      }
      delete payload.id
      delete payload.created_at
      delete payload.updated_at

      if (isEdit) await adminUpdatePost(post.id, payload)
      else        await adminCreatePost(payload)
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full np-body text-[13px] focus:outline-none transition-all'
  const inputStyle = {
    padding: '9px 12px',
    backgroundColor: '#F9F9F7',
    border: '1.5px solid #E5E5E0',
    color: '#111111',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full"
      style={{ width: 680, borderLeft: '2px solid #111111', backgroundColor: '#F9F9F7' }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 shrink-0 flex items-center justify-between"
        style={{ borderBottom: '1px solid #E5E5E0', backgroundColor: '#F0EDE6' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: '#111111' }}>
            <BookOpen className="w-4 h-4" style={{ color: '#CC0000' }} strokeWidth={2} />
          </div>
          <div>
            <p className="np-mono text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#CC0000' }}>★ Blog Editor</p>
            <p className="np-sans text-[13px] font-semibold" style={{ color: '#111111' }}>
              {isEdit ? 'Edit post' : 'New post'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center cursor-pointer transition-colors"
          style={{ color: '#AEABA6' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E5E5E0'; e.currentTarget.style.color = '#111111' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '#AEABA6' }}
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

        {/* Title */}
        <div>
          <label className="np-mono text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: '#737373' }}>Title *</label>
          <input
            className={inputCls}
            style={{ ...inputStyle, fontSize: '15px', fontWeight: 700 }}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Your post title…"
            onFocus={(e) => { e.currentTarget.style.borderColor = '#111111'; e.currentTarget.style.boxShadow = '2px 2px 0 #111111' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5E0'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        {/* Slug + Date row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="np-mono text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: '#737373' }}>Slug *</label>
            <input
              className={inputCls}
              style={{ ...inputStyle, fontFamily: 'var(--font-np-mono, monospace)', fontSize: '12px' }}
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder="my-post-slug"
              onFocus={(e) => { e.currentTarget.style.borderColor = '#111111'; e.currentTarget.style.boxShadow = '2px 2px 0 #111111' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5E0'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>
          <div>
            <label className="np-mono text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: '#737373' }}>Date</label>
            <input
              type="date"
              className={inputCls}
              style={inputStyle}
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#111111'; e.currentTarget.style.boxShadow = '2px 2px 0 #111111' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5E0'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="np-mono text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: '#737373' }}>Description (SEO)</label>
          <textarea
            className={inputCls}
            style={{ ...inputStyle, resize: 'none' }}
            rows={2}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Short description shown in search results and on the blog index…"
            onFocus={(e) => { e.currentTarget.style.borderColor = '#111111'; e.currentTarget.style.boxShadow = '2px 2px 0 #111111' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5E0'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        {/* Tags + Author row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="np-mono text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: '#737373' }}>Tags (comma-separated)</label>
            <input
              className={inputCls}
              style={inputStyle}
              value={form.tags}
              onChange={(e) => set('tags', e.target.value)}
              placeholder="AI tools, PDF Q&A, study tips"
              onFocus={(e) => { e.currentTarget.style.borderColor = '#111111'; e.currentTarget.style.boxShadow = '2px 2px 0 #111111' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5E0'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>
          <div>
            <label className="np-mono text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: '#737373' }}>Author</label>
            <input
              className={inputCls}
              style={inputStyle}
              value={form.author}
              onChange={(e) => set('author', e.target.value)}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#111111'; e.currentTarget.style.boxShadow = '2px 2px 0 #111111' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5E0'; e.currentTarget.style.boxShadow = 'none' }}
            />
          </div>
        </div>

        {/* Content — write / preview tab */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="np-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: '#737373' }}>
              Content (Markdown) * &nbsp;
              <span style={{ color: '#AEABA6', fontWeight: 400 }}>{form.reading_time}</span>
            </label>
            <div className="flex" style={{ border: '1px solid #E5E5E0' }}>
              {['write', 'preview'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="np-mono text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 cursor-pointer transition-all"
                  style={{
                    backgroundColor: tab === t ? '#111111' : 'transparent',
                    color: tab === t ? '#F9F9F7' : '#737373',
                    borderRight: t === 'write' ? '1px solid #E5E5E0' : 'none',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {tab === 'write' ? (
            <textarea
              className={inputCls}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-np-mono, monospace)', fontSize: '12px', lineHeight: '1.7', minHeight: 320 }}
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              placeholder={'# Your heading\n\nWrite your post in **Markdown**...\n\n## Section\n\nParagraph here.'}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#111111'; e.currentTarget.style.boxShadow = '2px 2px 0 #111111' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5E0'; e.currentTarget.style.boxShadow = 'none' }}
            />
          ) : (
            <div
              className="np-body text-[13px] leading-relaxed overflow-y-auto"
              style={{ ...inputStyle, minHeight: 320, whiteSpace: 'pre-wrap', color: '#404040' }}
            >
              {form.content || <span style={{ color: '#AEABA6' }}>Nothing to preview yet.</span>}
            </div>
          )}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-3"
              style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: '#DC2626' }} strokeWidth={2} />
              <p className="np-mono text-[11px] uppercase tracking-wide" style={{ color: '#DC2626' }}>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer actions */}
      <div className="px-6 py-4 shrink-0 flex items-center gap-3" style={{ borderTop: '1px solid #E5E5E0', backgroundColor: '#F0EDE6' }}>
        <button
          onClick={() => handleSave('draft')}
          disabled={saving}
          className="btn-outline-ink h-10 px-5 flex items-center gap-2 cursor-pointer disabled:opacity-40"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <EyeOff className="w-3.5 h-3.5" strokeWidth={2} />}
          Save draft
        </button>
        <button
          onClick={() => handleSave('published')}
          disabled={saving}
          className="btn-ink h-10 px-5 flex items-center gap-2 cursor-pointer disabled:opacity-40"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" strokeWidth={2} />}
          Publish
        </button>
        {form.slug && (
          <a
            href={`/blog/${form.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto np-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
            style={{ color: '#CC0000' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#AA0000' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#CC0000' }}
          >
            Preview <ExternalLink className="w-3 h-3" strokeWidth={2.5} />
          </a>
        )}
      </div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminBlogPage() {
  const [posts,       setPosts]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [editPost,    setEditPost]    = useState(null)  // null = closed, false = new, object = edit
  const [deleting,    setDeleting]    = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [togglingId,  setTogglingId]  = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setPosts(await adminFetchPosts()) }
    catch { /* handle silently */ }
    finally { setLoading(false) }
  }

  async function handleSaved() {
    setEditPost(null)
    await load()
  }

  async function handleToggleStatus(post) {
    setTogglingId(post.id)
    try {
      await adminUpdatePost(post.id, {
        status: post.status === 'published' ? 'draft' : 'published',
      })
      await load()
    } finally { setTogglingId(null) }
  }

  async function handleDelete(id) {
    setDeleting(id)
    try { await adminDeletePost(id); await load() }
    finally { setDeleting(null); setDeleteConfirm(null) }
  }

  async function handleEdit(post) {
    const full = await adminFetchPost(post.id)
    setEditPost(full)
  }

  const published = posts.filter((p) => p.status === 'published').length
  const drafts    = posts.length - published

  return (
    <div className="flex h-full overflow-hidden" style={{ backgroundColor: '#F9F9F7' }}>

      {/* ── Main list ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top bar */}
        <div
          className="px-8 h-14 flex items-center justify-between shrink-0"
          style={{ borderBottom: '1px solid #111111', backgroundColor: '#F9F9F7' }}
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4" style={{ color: '#CC0000' }} strokeWidth={2} />
            <h1 className="np-serif font-black text-[16px]" style={{ color: '#111111' }}>Blog Posts</h1>
            <span
              className="np-mono text-[10px] font-bold uppercase tracking-widest px-2 py-0.5"
              style={{ backgroundColor: '#111111', color: '#F9F9F7' }}
            >
              {posts.length}
            </span>
          </div>
          <button
            onClick={() => setEditPost(false)}
            className="btn-ink h-9 px-4 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            New post
          </button>
        </div>

        {/* Stats strip */}
        <div
          className="px-8 py-4 flex items-center gap-6 shrink-0"
          style={{ borderBottom: '1px solid #E5E5E0', backgroundColor: '#F0EDE6' }}
        >
          {[
            { label: 'Total', value: posts.length, color: '#111111' },
            { label: 'Published', value: published, color: '#16A34A' },
            { label: 'Drafts', value: drafts, color: '#D97706' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="np-serif font-black text-[22px] tabular-nums" style={{ color }}>{value}</span>
              <span className="np-mono text-[10px] uppercase tracking-widest" style={{ color: '#737373' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#D9D7D2' }} />
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <BookOpen className="w-10 h-10" style={{ color: '#D9D7D2' }} strokeWidth={1.5} />
              <p className="np-body text-[14px]" style={{ color: '#AEABA6' }}>No posts yet. Create your first one.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#F0EDE6', borderBottom: '1px solid #E5E5E0' }}>
                  {['Title', 'Status', 'Date', 'Tags', 'Actions'].map((col) => (
                    <th
                      key={col}
                      className="px-6 py-3 text-left np-mono text-[9px] font-bold uppercase tracking-[0.18em]"
                      style={{ color: '#CC0000' }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid #E5E5E0' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F0E8' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                  >
                    <td className="px-6 py-3.5">
                      <p className="np-sans text-[13px] font-semibold" style={{ color: '#111111' }}>{post.title}</p>
                      <p className="np-mono text-[10px] mt-0.5" style={{ color: '#AEABA6' }}>/blog/{post.slug}</p>
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-6 py-3.5 np-mono text-[11px]" style={{ color: '#737373' }}>
                      {post.date}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(post.tags ?? []).slice(0, 3).map((t) => (
                          <span key={t} className="np-mono text-[9px] px-1.5 py-0.5" style={{ backgroundColor: '#F5F0E8', color: '#737373', border: '1px solid #E5E5E0' }}>
                            {t}
                          </span>
                        ))}
                        {post.tags?.length > 3 && (
                          <span className="np-mono text-[9px]" style={{ color: '#AEABA6' }}>+{post.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        {/* Edit */}
                        <button
                          onClick={() => handleEdit(post)}
                          className="w-7 h-7 flex items-center justify-center cursor-pointer transition-colors"
                          style={{ color: '#AEABA6' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E5E5E0'; e.currentTarget.style.color = '#111111' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '#AEABA6' }}
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>

                        {/* Toggle publish */}
                        <button
                          onClick={() => handleToggleStatus(post)}
                          disabled={togglingId === post.id}
                          className="w-7 h-7 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40"
                          style={{ color: post.status === 'published' ? '#D97706' : '#16A34A' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E5E5E0' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                          title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {togglingId === post.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : post.status === 'published'
                              ? <EyeOff className="w-3.5 h-3.5" strokeWidth={2} />
                              : <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                          }
                        </button>

                        {/* Open preview */}
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-7 h-7 flex items-center justify-center cursor-pointer transition-colors"
                          style={{ color: '#AEABA6' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E5E5E0'; e.currentTarget.style.color = '#CC0000' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '#AEABA6' }}
                          title="Open post"
                        >
                          <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                        </a>

                        {/* Delete */}
                        {deleteConfirm === post.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(post.id)}
                              disabled={deleting === post.id}
                              className="w-7 h-7 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40"
                              style={{ backgroundColor: '#DC2626', color: '#fff' }}
                              title="Confirm delete"
                            >
                              {deleting === post.id
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <Check className="w-3 h-3" strokeWidth={3} />
                              }
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="w-7 h-7 flex items-center justify-center cursor-pointer transition-colors"
                              style={{ color: '#737373' }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E5E5E0' }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                            >
                              <X className="w-3 h-3" strokeWidth={2.5} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(post.id)}
                            className="w-7 h-7 flex items-center justify-center cursor-pointer transition-colors"
                            style={{ color: '#AEABA6' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEF2F2'; e.currentTarget.style.color = '#DC2626' }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '#AEABA6' }}
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Editor panel (slides in from right) ──────────────── */}
      <AnimatePresence>
        {editPost !== null && (
          <EditorPanel
            post={editPost || null}
            onClose={() => setEditPost(null)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
