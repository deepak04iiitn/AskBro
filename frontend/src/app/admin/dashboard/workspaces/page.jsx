'use client'

import { useMemo, useState } from 'react'
import { useMetrics } from '../AdminDashboardShell'
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, ReferenceLine } from 'recharts'
import { Building2, Users, FileText, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { adminDeleteWorkspace } from '@/lib/adminApi'

const BAR_PALETTE = ['#CC0000','#111111','#16A34A','#D97706','#DC2626','#0EA5E9','#EC4899','#0D9488']

// ── Confirm delete dialog ─────────────────────────────────────────────────────
function ConfirmDeleteDialog({ workspace, onCancel, onConfirm, busy }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(17,17,17,0.6)', backdropFilter: 'blur(3px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !busy) onCancel() }}
    >
      <div
        className="w-full max-w-sm"
        style={{ background: '#F9F9F7', border: '3px solid #111111', boxShadow: '6px 6px 0 #111111' }}
      >
        {/* Header */}
        <div className="px-5 py-3" style={{ background: '#111111', borderBottom: '2px solid #CC0000' }}>
          <p className="np-mono text-[10px] tracking-widest uppercase" style={{ color: '#CC0000' }}>
            ◆ Confirm Deletion
          </p>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 shrink-0 flex items-center justify-center" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
              <AlertTriangle className="w-4 h-4" style={{ color: '#DC2626' }} strokeWidth={2} />
            </div>
            <div>
              <p className="np-sans text-[13px] font-semibold mb-1" style={{ color: '#111111' }}>
                Delete workspace <span style={{ color: '#CC0000' }}>"{workspace.name}"</span>?
              </p>
              <p className="np-body text-[12px]" style={{ color: '#737373' }}>
                This is <strong style={{ color: '#111111' }}>irreversible</strong>. All members, documents, chats, messages, and integrations belonging to this workspace will be permanently deleted.
              </p>
            </div>
          </div>

          {/* Cascade summary */}
          <div className="px-3 py-2.5" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <p className="np-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: '#DC2626' }}>Will permanently delete:</p>
            <ul className="space-y-0.5">
              {[
                `${workspace.member_count} member${workspace.member_count !== 1 ? 's' : ''}`,
                `${workspace.document_count} document${workspace.document_count !== 1 ? 's' : ''}`,
                `${workspace.chat_count} chat${workspace.chat_count !== 1 ? 's' : ''}`,
                'All messages, chunks & vector embeddings',
                'Notion & GitHub integrations',
              ].map((item) => (
                <li key={item} className="np-mono text-[10px] flex items-center gap-1.5" style={{ color: '#737373' }}>
                  <span style={{ color: '#DC2626' }}>×</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3" style={{ borderTop: '1px solid #E5E5E0' }}>
          <button
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 np-mono text-[11px] font-bold uppercase tracking-widest cursor-pointer disabled:opacity-40"
            style={{ border: '1px solid #E5E5E0', color: '#737373' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="px-4 py-2 np-mono text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-pointer disabled:opacity-50"
            style={{ background: '#CC0000', color: '#F9F9F7', border: '1px solid #CC0000' }}
          >
            {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            {busy ? 'Deleting…' : 'Delete Everything'}
          </button>
        </div>
      </div>
    </div>
  )
}

function formatBytes(b) {
  if (!b) return '0 B'
  if (b < 1024**2) return `${(b/1024).toFixed(1)} KB`
  if (b < 1024**3) return `${(b/1024**2).toFixed(1)} MB`
  return `${(b/1024**3).toFixed(2)} GB`
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="overflow-hidden" style={{ minWidth: 140, border: '1px solid #111111', boxShadow: '4px 4px 0px 0px #111111', backgroundColor: '#F9F9F7' }}>
      <div className="px-4 py-2.5" style={{ backgroundColor: '#F0EDE6', borderBottom: '1px solid #E5E5E0' }}>
        <p className="np-mono text-[11px] font-bold uppercase tracking-widest" style={{ color: '#111111' }}>{label}</p>
      </div>
      <div className="px-4 py-3">
        {payload.map((e, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5" style={{ backgroundColor: e.color ?? e.fill }} />
            <span className="np-sans text-[13px] font-bold" style={{ color: '#111111' }}>{e.value.toLocaleString()}</span>
            <span className="np-mono text-[11px]" style={{ color: '#AEABA6' }}>{e.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChartCard({ title, sub, accent = '#CC0000', children }) {
  return (
    <div style={{ border: '1px solid #E5E5E0', backgroundColor: '#F9F9F7' }}>
      <div className="px-6 pt-4 pb-3" style={{ borderBottom: '1px solid #E5E5E0', backgroundColor: '#F0EDE6' }}>
        <p className="np-mono text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#CC0000' }}>★ {title}</p>
        {sub && <p className="np-body text-[12px] mt-0.5" style={{ color: '#737373' }}>{sub}</p>}
      </div>
      <div className="px-6 pb-6 pt-4">{children}</div>
    </div>
  )
}

function StatCard({ Icon, iconBg, iconColor, label, value }) {
  return (
    <div className="p-6 flex items-center gap-4" style={{ border: '1px solid #E5E5E0', backgroundColor: '#F9F9F7' }}>
      <div className="w-12 h-12 flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg, border: '1px solid #E5E5E0' }}>
        <Icon className="w-5 h-5" style={{ color: iconColor }} strokeWidth={1.8} />
      </div>
      <div>
        <p className="np-serif font-black leading-none tabular-nums" style={{ fontSize: '28px', color: '#111111' }}>{value}</p>
        <p className="np-mono text-[11px] uppercase tracking-widest font-bold mt-1.5" style={{ color: '#737373' }}>{label}</p>
      </div>
    </div>
  )
}

export default function WorkspacesPage() {
  const { metrics, loading, refetch } = useMetrics()
  const [confirmWs, setConfirmWs]     = useState(null)
  const [deleting, setDeleting]       = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function handleDeleteConfirm() {
    setDeleting(true)
    setDeleteError('')
    try {
      await adminDeleteWorkspace(confirmWs.id)
      setConfirmWs(null)
      await refetch()
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const avgMembers = useMemo(() => {
    if (!metrics?.workspaces.length) return 0
    return +(metrics.workspaces.reduce((s, w) => s + w.member_count, 0) / metrics.workspaces.length).toFixed(1)
  }, [metrics])

  const avgDocs = useMemo(() => {
    if (!metrics?.workspaces.length) return 0
    return +(metrics.workspaces.reduce((s, w) => s + w.document_count, 0) / metrics.workspaces.length).toFixed(1)
  }, [metrics])

  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)
  const PAGE_SZ = 10

  const docsChart    = useMemo(() => metrics?.workspaces.map((w) => ({ name: w.name, docs: w.document_count })) ?? [], [metrics])
  const membersChart = useMemo(() => metrics?.workspaces.map((w) => ({ name: w.name, members: w.member_count })) ?? [], [metrics])

  const filteredWs = useMemo(() => {
    if (!metrics) return []
    const q = search.toLowerCase()
    if (!q) return metrics.workspaces
    return metrics.workspaces.filter((w) =>
      w.name.toLowerCase().includes(q) ||
      w.code.toLowerCase().includes(q) ||
      w.owner_email.toLowerCase().includes(q)
    )
  }, [metrics, search])

  const totalPages  = Math.max(1, Math.ceil(filteredWs.length / PAGE_SZ))
  const paginated   = filteredWs.slice((page - 1) * PAGE_SZ, page * PAGE_SZ)

  if (loading || !metrics) return (
    <div className="p-8 space-y-5">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 animate-pulse" style={{ border: '1px solid #E5E5E0', backgroundColor: '#F5F0E8' }} />)}
    </div>
  )

  const gradDefs = (prefix) => BAR_PALETTE.map((c, i) => (
    <linearGradient key={i} id={`${prefix}${i}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={c} stopOpacity={1} />
      <stop offset="100%" stopColor={c} stopOpacity={0.6} />
    </linearGradient>
  ))

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="np-serif font-black" style={{ fontSize: '24px', color: '#111111' }}>Workspaces</h1>
        <p className="np-body text-[13px] mt-1" style={{ color: '#737373' }}>{metrics.total_workspaces.toLocaleString()} workspaces registered</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard Icon={Building2} iconBg="#F5F0E8" iconColor="#111111" label="Total Workspaces"       value={metrics.total_workspaces.toLocaleString()} />
        <StatCard Icon={Users}     iconBg="#FEF2F2" iconColor="#CC0000" label="Avg Members / Workspace" value={avgMembers} />
        <StatCard Icon={FileText}  iconBg="#FFF7ED" iconColor="#D97706" label="Avg Docs / Workspace"    value={avgDocs} />
      </div>

      {/* Documents per workspace */}
      <ChartCard title="Documents per Workspace" sub="Total documents uploaded in each workspace" accent="#D97706">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={docsChart} margin={{ top: 24, right: 8, left: -16, bottom: 40 }}>
            <defs>{gradDefs('dws')}</defs>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4A4845' }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 10, fill: '#AEABA6' }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={avgDocs} stroke="#E3E1DC" strokeDasharray="4 4" label={{ value: `avg ${avgDocs}`, fill: '#AEABA6', fontSize: 10, position: 'right' }} />
            <Bar dataKey="docs" radius={[8,8,0,0]} maxBarSize={52} name="Documents">
              {docsChart.map((_, i) => <Cell key={i} fill={`url(#dws${i % BAR_PALETTE.length})`} />)}
              <LabelList dataKey="docs" position="top" style={{ fontSize: 11, fontWeight: 700, fill: '#4A4845' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Members per workspace */}
      <ChartCard title="Members per Workspace" sub="Team size of each workspace" accent="#4361EE">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={membersChart} margin={{ top: 24, right: 8, left: -16, bottom: 40 }}>
            <defs>{gradDefs('mws')}</defs>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4A4845' }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 10, fill: '#AEABA6' }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={avgMembers} stroke="#E3E1DC" strokeDasharray="4 4" label={{ value: `avg ${avgMembers}`, fill: '#AEABA6', fontSize: 10, position: 'right' }} />
            <Bar dataKey="members" radius={[8,8,0,0]} maxBarSize={52} name="Members">
              {membersChart.map((_, i) => <Cell key={i} fill={`url(#mws${i % BAR_PALETTE.length})`} />)}
              <LabelList dataKey="members" position="top" style={{ fontSize: 11, fontWeight: 700, fill: '#4A4845' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        placeholder="Search by name, code or owner…"
        className="auth-input"
        style={{ maxWidth: 340, height: 40, fontSize: 13 }}
      />

      {/* Table */}
      <div className="overflow-hidden" style={{ border: '1px solid #E5E5E0', backgroundColor: '#F9F9F7' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ backgroundColor: '#F0EDE6', borderBottom: '1px solid #E5E5E0' }}>
                {['Workspace','Code','Owner','Members','Documents','Storage','Chats','Created','Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 np-mono text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#CC0000' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center np-mono text-[12px] uppercase tracking-widest" style={{ color: '#AEABA6' }}>No workspaces match your search.</td></tr>
              ) : paginated.map((w, i) => (
                <tr key={w.id} style={{ borderBottom: i < paginated.length - 1 ? '1px solid #E5E5E0' : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F0E8' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}>
                  <td className="px-5 py-3.5 np-sans font-semibold" style={{ color: '#111111' }}>{w.name}</td>
                  <td className="px-5 py-3.5"><span className="np-mono text-[11px] px-2 py-0.5" style={{ backgroundColor: '#F0EDE6', color: '#111111' }}>{w.code}</span></td>
                  <td className="px-5 py-3.5 np-body" style={{ color: '#4A4845' }}>{w.owner_email}</td>
                  <td className="px-5 py-3.5 text-center np-mono font-bold" style={{ color: '#CC0000' }}>{w.member_count}</td>
                  <td className="px-5 py-3.5 text-center np-mono font-bold" style={{ color: '#D97706' }}>{w.document_count}</td>
                  <td className="px-5 py-3.5 np-mono text-[12px]" style={{ color: '#737373' }}>{formatBytes(w.total_size_bytes)}</td>
                  <td className="px-5 py-3.5 text-center np-mono font-bold" style={{ color: '#111111' }}>{w.chat_count}</td>
                  <td className="px-5 py-3.5 np-mono text-[12px]" style={{ color: '#AEABA6' }}>{new Date(w.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => { setDeleteError(''); setConfirmWs(w) }}
                      className="w-7 h-7 flex items-center justify-center cursor-pointer transition-colors"
                      style={{ border: '1px solid #FECACA', color: '#DC2626' }}
                      title={`Delete workspace ${w.name}`}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid #E5E5E0', backgroundColor: '#F0EDE6' }}>
          <span className="np-mono text-[11px]" style={{ color: '#AEABA6' }}>{filteredWs.length.toLocaleString()} results · Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            {['Previous','Next'].map((label, idx) => (
              <button key={label} onClick={() => setPage((p) => idx === 0 ? Math.max(1,p-1) : Math.min(totalPages,p+1))}
                disabled={idx === 0 ? page === 1 : page === totalPages}
                className="px-3 py-1.5 np-mono text-[11px] font-bold uppercase tracking-widest transition-colors disabled:opacity-30 cursor-pointer"
                style={{ border: '1px solid #111111', color: '#CC0000', backgroundColor: 'transparent' }}>{label}</button>
            ))}
          </div>
        </div>
      </div>
      {confirmWs && (
        <ConfirmDeleteDialog
          workspace={confirmWs}
          busy={deleting}
          onCancel={() => setConfirmWs(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {deleteError && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3"
          style={{ background: '#111111', border: '2px solid #CC0000', zIndex: 60, minWidth: 320 }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: '#CC0000' }} strokeWidth={2} />
          <p className="np-sans text-[13px]" style={{ color: '#F9F9F7' }}>{deleteError}</p>
          <button onClick={() => setDeleteError('')} className="ml-auto np-mono text-[10px] uppercase" style={{ color: '#737373' }}>✕</button>
        </div>
      )}
    </div>
  )
}
