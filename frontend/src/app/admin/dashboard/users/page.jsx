'use client'

import { useState, useMemo } from 'react'
import { useMetrics } from '../layout'
import {
  BarChart, Bar, Cell, PieChart, Pie,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LabelList,
} from 'recharts'
import { Users, Crown, UserCheck } from 'lucide-react'

const BAR_PALETTE = ['#4361EE','#7C3AED','#16A34A','#D97706','#DC2626','#0EA5E9','#EC4899','#0D9488']
const PAGE_SZ = 10

// â”€â”€ Beautiful custom tooltip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: e.color ?? e.fill }} />
            <span className="text-[13px] font-bold" style={{ color: '#111110' }}>{e.value.toLocaleString()}</span>
            <span className="text-[11px]" style={{ color: '#AEABA6' }}>{e.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// â”€â”€ Chart card with accent top stripe â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

export default function UsersPage() {
  const { metrics, loading } = useMetrics()
  const [search, setSearch]           = useState('')
  const [roleFilter, setRoleFilter]   = useState('all')
  const [sortKey, setSortKey]         = useState('created_at')
  const [sortDir, setSortDir]         = useState('desc')
  const [page, setPage]               = useState(1)

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
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" style={{ border: '1px solid #E3E1DC' }} />)}
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
        <h1 className="font-bold tracking-[-0.02em]" style={{ fontSize: '24px', color: '#111110' }}>Users</h1>
        <p className="text-[13px] mt-1" style={{ color: '#7A7874' }}>{totalUsers.toLocaleString()} total users across all workspaces</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard Icon={Users}     iconBg="#EEF1FD" iconColor="#4361EE" label="Total Users"  value={totalUsers.toLocaleString()} />
        <StatCard Icon={Crown}     iconBg="#F5F3FF" iconColor="#7C3AED" label="Owners"       value={ownerCount.toLocaleString()} />
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
                  <stop offset="0%" stopColor="#4361EE" /><stop offset="100%" stopColor="#7C3AED" />
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

      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E3E1DC', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ backgroundColor: '#F7F5F2', borderBottom: '1px solid #E3E1DC' }}>
                {[['email','Email'],['role','Role'],['workspace_name','Workspace'],['workspace_code','Code'],['created_at','Joined']].map(([k,l]) => (
                  <th key={k} className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest cursor-pointer"
                    style={{ color: '#7A7874' }} onClick={() => { if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(k); setSortDir('asc') } }}>
                    {l} {sortKey === k ? (sortDir === 'asc' ? 'â†‘' : 'â†“') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < paginated.length - 1 ? '1px solid #F4F3F0' : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F7F5F2' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}>
                  <td className="px-5 py-3.5 font-medium" style={{ color: '#111110' }}>{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize"
                      style={{ backgroundColor: u.role === 'owner' ? '#EEF1FD' : '#F4F3F0', color: u.role === 'owner' ? '#4361EE' : '#7A7874' }}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: '#4A4845' }}>{u.workspace_name}</td>
                  <td className="px-5 py-3.5"><span className="font-mono text-[11px] px-2 py-0.5 rounded" style={{ backgroundColor: '#F4F3F0', color: '#7A7874' }}>{u.workspace_code}</span></td>
                  <td className="px-5 py-3.5" style={{ color: '#7A7874' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid #E3E1DC', backgroundColor: '#F7F5F2' }}>
          <span className="text-[12px]" style={{ color: '#AEABA6' }}>{filtered.length.toLocaleString()} results Â· Page {page} of {totalPages}</span>
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

