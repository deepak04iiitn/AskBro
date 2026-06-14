'use client'

import { useState, useMemo } from 'react'
import { useMetrics } from '../AdminDashboardShell'
import {
  BarChart, Bar, Cell, PieChart, Pie,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LabelList,
} from 'recharts'
import { Users, Crown, UserCheck, ChevronUp, ChevronDown, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { adminDeleteUser } from '@/lib/adminApi'

const BAR_PALETTE = ['#CC0000','#111111','#16A34A','#D97706','#DC2626','#0EA5E9','#EC4899','#0D9488']

// ── Confirm delete dialog ─────────────────────────────────────────────────────
function ConfirmDeleteDialog({ user, onCancel, onConfirm, busy }) {
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
                Delete this user?
              </p>
              <p className="np-body text-[12px]" style={{ color: '#737373' }}>
                <span className="font-semibold" style={{ color: '#111111' }}>{user.email}</span>
                {' '}will be permanently removed. Their workspace remains intact.
              </p>
            </div>
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
            {busy ? 'Deleting…' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  )
}
const SortAsc  = () => <ChevronUp   style={{ width:12, height:12, display:'inline', marginLeft:4 }} strokeWidth={2.5} />
const SortDesc = () => <ChevronDown style={{ width:12, height:12, display:'inline', marginLeft:4 }} strokeWidth={2.5} />
const PAGE_SZ = 10

// â”€â”€ Beautiful custom tooltip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
            <span className="w-2.5 h-2.5 shrink-0" style={{ backgroundColor: e.color ?? e.fill }} />
            <span className="np-sans text-[13px] font-bold" style={{ color: '#111111' }}>{e.value.toLocaleString()}</span>
            <span className="np-mono text-[11px]" style={{ color: '#AEABA6' }}>{e.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// â”€â”€ Chart card with accent top stripe â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

export default function UsersPage() {
  const { metrics, loading, refetch } = useMetrics()
  const [search, setSearch]           = useState('')
  const [roleFilter, setRoleFilter]   = useState('all')
  const [sortKey, setSortKey]         = useState('created_at')
  const [sortDir, setSortDir]         = useState('desc')
  const [page, setPage]               = useState(1)
  const [confirmUser, setConfirmUser] = useState(null)   // user object being confirmed
  const [deleting, setDeleting]       = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function handleDeleteConfirm() {
    setDeleting(true)
    setDeleteError('')
    try {
      await adminDeleteUser(confirmUser.id)
      setConfirmUser(null)
      await refetch()
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const filtered = useMemo(() => {
    if (!metrics) return []
    return metrics.users
      .filter((u) => {
        const q = search.toLowerCase()
        return (!q || u.email.toLowerCase().includes(q) || u.workspace_name.toLowerCase().includes(q))
          && (roleFilter === 'all' || u.role === roleFilter)
      })
      .sort((a, b) => {
        let av = a[sortKey] ?? '', bv = b[sortKey] ?? ''
        if (sortKey === 'created_at') { av = new Date(av); bv = new Date(bv) }
        return av < bv ? (sortDir === 'asc' ? -1 : 1) : av > bv ? (sortDir === 'asc' ? 1 : -1) : 0
      })
  }, [metrics, search, roleFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SZ))
  const paginated  = filtered.slice((page - 1) * PAGE_SZ, page * PAGE_SZ)

  const membersByWs = useMemo(() => {
    if (!metrics) return []
    const m = {}
    metrics.users.forEach((u) => { m[u.workspace_name || 'Unknown'] = (m[u.workspace_name || 'Unknown'] || 0) + 1 })
    return Object.entries(m).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
  }, [metrics])

  const roleData = useMemo(() => {
    if (!metrics) return []
    const m = {}
    metrics.users.forEach((u) => { m[u.role] = (m[u.role] || 0) + 1 })
    return Object.entries(m).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
  }, [metrics])

  const ownerCount  = metrics?.users.filter((u) => u.role === 'owner').length ?? 0
  const memberCount = metrics?.users.filter((u) => u.role === 'member').length ?? 0
  const totalUsers  = metrics?.total_users ?? 0

  if (loading || !metrics) return (
    <div className="p-8 space-y-5">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 animate-pulse" style={{ border: '1px solid #E5E5E0', backgroundColor: '#F5F0E8' }} />)}
    </div>
  )

  // In-slice label renderer for pie
  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const R = Math.PI / 180
    const r = innerRadius + (outerRadius - innerRadius) * 0.55
    const x = cx + r * Math.cos(-midAngle * R)
    const y = cy + r * Math.sin(-midAngle * R)
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
        fontSize={13} fontWeight={700}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="np-serif font-black" style={{ fontSize: '24px', color: '#111111' }}>Users</h1>
        <p className="np-body text-[13px] mt-1" style={{ color: '#737373' }}>{totalUsers.toLocaleString()} total users across all workspaces</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard Icon={Users}     iconBg="#FEF2F2" iconColor="#CC0000" label="Total Users"  value={totalUsers.toLocaleString()} />
        <StatCard Icon={Crown}     iconBg="#F5F0E8" iconColor="#111111" label="Owners"       value={ownerCount.toLocaleString()} />
        <StatCard Icon={UserCheck} iconBg="#F0FDF4" iconColor="#16A34A" label="Members"      value={memberCount.toLocaleString()} />
      </div>

      {/* Members per workspace â€” coloured bars with labels */}
      <ChartCard title="Members per Workspace" sub="Each bar represents one workspace â€” coloured for visual distinction" accent="#4361EE">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={membersByWs} margin={{ top: 24, right: 8, left: -16, bottom: 40 }}>
            <defs>
              {BAR_PALETTE.map((c, i) => (
                <linearGradient key={i} id={`mwGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c} stopOpacity={1} />
                  <stop offset="100%" stopColor={c} stopOpacity={0.65} />
                </linearGradient>
              ))}
            </defs>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4A4845' }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 10, fill: '#AEABA6' }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={52} name="Members">
              {membersByWs.map((_, i) => <Cell key={i} fill={`url(#mwGrad${i % BAR_PALETTE.length})`} />)}
              <LabelList dataKey="count" position="top" style={{ fontSize: 11, fontWeight: 700, fill: '#4A4845' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Role distribution â€” beautiful donut */}
      <ChartCard title="Role Distribution" sub="Proportion of workspace owners vs members" accent="#7C3AED">
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <defs>
                <linearGradient id="ownerGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#CC0000" /><stop offset="100%" stopColor="#AA0000" />
                </linearGradient>
                <linearGradient id="memberGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#16A34A" /><stop offset="100%" stopColor="#0D9488" />
                </linearGradient>
              </defs>
              <Pie data={roleData} cx="50%" cy="46%" innerRadius={85} outerRadius={130}
                dataKey="value" nameKey="name" paddingAngle={4}
                labelLine={false} label={renderPieLabel}>
                <Cell fill="url(#ownerGrad)" stroke="white" strokeWidth={3} />
                <Cell fill="url(#memberGrad)" stroke="white" strokeWidth={3} />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 13, paddingTop: 20, fontWeight: 600 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Filters + table */}
      <div className="flex gap-3 flex-wrap">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search by email or workspaceâ€¦" className="auth-input flex-1"
          style={{ maxWidth: 320, height: 40, fontSize: 13 }} />
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
          className="auth-input" style={{ width: 140, height: 40, fontSize: 13 }}>
          <option value="all">All roles</option>
          <option value="owner">Owner</option>
          <option value="member">Member</option>
        </select>
      </div>

      <div className="overflow-hidden" style={{ border: '1px solid #E5E5E0', backgroundColor: '#F9F9F7' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ backgroundColor: '#F0EDE6', borderBottom: '1px solid #E5E5E0' }}>
                {[['email','Email'],['role','Role'],['workspace_name','Workspace'],['workspace_code','Code'],['created_at','Joined']].map(([k,l]) => (
                  <th key={k} className="text-left px-5 py-3 np-mono text-[9px] font-bold uppercase tracking-[0.2em] cursor-pointer"
                    style={{ color: '#CC0000' }} onClick={() => { if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(k); setSortDir('asc') } }}>
                    {l}{sortKey === k && (sortDir.length === 3 ? <SortAsc /> : <SortDesc />)}
                  </th>
                ))}
                <th className="text-left px-5 py-3 np-mono text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#CC0000' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < paginated.length - 1 ? '1px solid #E5E5E0' : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F0E8' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}>
                  <td className="px-5 py-3.5 np-sans font-medium" style={{ color: '#111111' }}>{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 np-mono text-[10px] font-bold uppercase tracking-widest"
                      style={{ backgroundColor: u.role === 'owner' ? '#111111' : '#F5F0E8', color: u.role === 'owner' ? '#F9F9F7' : '#737373' }}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 np-body" style={{ color: '#4A4845' }}>{u.workspace_name}</td>
                  <td className="px-5 py-3.5"><span className="np-mono text-[11px] px-2 py-0.5" style={{ backgroundColor: '#F0EDE6', color: '#111111' }}>{u.workspace_code}</span></td>
                  <td className="px-5 py-3.5 np-mono text-[12px]" style={{ color: '#737373' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => { setDeleteError(''); setConfirmUser(u) }}
                      className="w-7 h-7 flex items-center justify-center cursor-pointer transition-colors"
                      style={{ border: '1px solid #FECACA', color: '#DC2626' }}
                      title={`Delete ${u.email}`}
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
          <span className="np-mono text-[11px]" style={{ color: '#AEABA6' }}>{filtered.length.toLocaleString()} results · Page {page} of {totalPages}</span>
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
      {confirmUser && (
        <ConfirmDeleteDialog
          user={confirmUser}
          busy={deleting}
          onCancel={() => setConfirmUser(null)}
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
