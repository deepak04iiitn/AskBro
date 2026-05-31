'use client'

import { useMemo, useState } from 'react'
import { useMetrics } from '../layout'
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, ReferenceLine } from 'recharts'
import { Building2, Users, FileText } from 'lucide-react'

const BAR_PALETTE = ['#4361EE','#7C3AED','#16A34A','#D97706','#DC2626','#0EA5E9','#EC4899','#0D9488']

function formatBytes(b) {
  if (!b) return '0 B'
  if (b < 1024**2) return `${(b/1024).toFixed(1)} KB`
  if (b < 1024**3) return `${(b/1024**2).toFixed(1)} MB`
  return `${(b/1024**3).toFixed(2)} GB`
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl overflow-hidden" style={{ minWidth: 140, boxShadow: '0 12px 36px rgba(0,0,0,0.16), 0 0 0 1px #E3E1DC', backgroundColor: 'white' }}>
      <div className="px-4 py-2.5" style={{ backgroundColor: '#F7F5F2', borderBottom: '1px solid #E3E1DC' }}>
        <p className="text-[12px] font-bold" style={{ color: '#111110' }}>{label}</p>
      </div>
      <div className="px-4 py-3">
        {payload.map((e, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color ?? e.fill }} />
            <span className="text-[13px] font-bold" style={{ color: '#111110' }}>{e.value.toLocaleString()}</span>
            <span className="text-[11px]" style={{ color: '#AEABA6' }}>{e.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChartCard({ title, sub, accent = '#4361EE', children }) {
  return (
    <div className="bg-white rounded-2xl" style={{ border: '1px solid #E3E1DC', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      <div className="px-6 pt-5 pb-2">
        <p className="text-[15px] font-bold" style={{ color: '#111110' }}>{title}</p>
        {sub && <p className="text-[12px] mt-0.5" style={{ color: '#7A7874' }}>{sub}</p>}
      </div>
      <div className="px-6 pb-6">{children}</div>
    </div>
  )
}

function StatCard({ Icon, iconBg, iconColor, label, value }) {
  return (
    <div className="bg-white rounded-2xl p-6 flex items-center gap-4" style={{ border: '1px solid #E3E1DC', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
        <Icon className="w-5 h-5" style={{ color: iconColor }} strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-[28px] font-bold leading-none tabular-nums" style={{ color: '#111110' }}>{value}</p>
        <p className="text-[12px] font-medium mt-1.5" style={{ color: '#7A7874' }}>{label}</p>
      </div>
    </div>
  )
}

export default function WorkspacesPage() {
  const { metrics, loading } = useMetrics()

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
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" style={{ border: '1px solid #E3E1DC' }} />)}
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
        <h1 className="font-bold tracking-[-0.02em]" style={{ fontSize: '24px', color: '#111110' }}>Workspaces</h1>
        <p className="text-[13px] mt-1" style={{ color: '#7A7874' }}>{metrics.total_workspaces.toLocaleString()} workspaces registered</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard Icon={Building2} iconBg="#F5F3FF" iconColor="#7C3AED" label="Total Workspaces"       value={metrics.total_workspaces.toLocaleString()} />
        <StatCard Icon={Users}     iconBg="#EEF1FD" iconColor="#4361EE" label="Avg Members / Workspace" value={avgMembers} />
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
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E3E1DC', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ backgroundColor: '#F7F5F2', borderBottom: '1px solid #E3E1DC' }}>
                {['Workspace','Code','Owner','Members','Documents','Storage','Chats','Created'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest" style={{ color: '#7A7874' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-[13px]" style={{ color: '#AEABA6' }}>No workspaces match your search.</td></tr>
              ) : paginated.map((w, i) => (
                <tr key={w.id} style={{ borderBottom: i < paginated.length - 1 ? '1px solid #F4F3F0' : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F7F5F2' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: '#111110' }}>{w.name}</td>
                  <td className="px-5 py-3.5"><span className="font-mono text-[11px] px-2 py-0.5 rounded" style={{ backgroundColor: '#F4F3F0', color: '#7A7874' }}>{w.code}</span></td>
                  <td className="px-5 py-3.5" style={{ color: '#4A4845' }}>{w.owner_email}</td>
                  <td className="px-5 py-3.5 text-center font-bold" style={{ color: '#4361EE' }}>{w.member_count}</td>
                  <td className="px-5 py-3.5 text-center font-bold" style={{ color: '#D97706' }}>{w.document_count}</td>
                  <td className="px-5 py-3.5" style={{ color: '#7A7874' }}>{formatBytes(w.total_size_bytes)}</td>
                  <td className="px-5 py-3.5 text-center font-bold" style={{ color: '#7C3AED' }}>{w.chat_count}</td>
                  <td className="px-5 py-3.5" style={{ color: '#AEABA6' }}>{new Date(w.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid #E3E1DC', backgroundColor: '#F7F5F2' }}>
          <span className="text-[12px]" style={{ color: '#AEABA6' }}>{filteredWs.length.toLocaleString()} results · Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            {['Previous','Next'].map((label, idx) => (
              <button key={label} onClick={() => setPage((p) => idx === 0 ? Math.max(1,p-1) : Math.min(totalPages,p+1))}
                disabled={idx === 0 ? page === 1 : page === totalPages}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-30 cursor-pointer"
                style={{ border: '1px solid #E3E1DC', color: '#4361EE', backgroundColor: 'white' }}>{label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

