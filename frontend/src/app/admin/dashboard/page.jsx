'use client'

import { useMetrics } from './AdminDashboardShell'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Users, Building2, FileText, MessageSquare,
  HardDrive, Zap, TrendingUp,
} from 'lucide-react'

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}

function timeAgo(ts) {
  const m = Math.floor((Date.now() - ts * 1000) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

const TOOLTIP_STYLE = {
  contentStyle: {
    fontSize: 12,
    borderRadius: 0,
    border: '1px solid #111111',
    boxShadow: '4px 4px 0px 0px #111111',
    padding: '10px 14px',
    backgroundColor: '#F9F9F7',
  },
  labelStyle: { color: '#111111', fontWeight: 700, marginBottom: 4 },
  itemStyle: { color: '#4A4845' },
  cursor: { stroke: '#E5E5E0', strokeWidth: 1 },
}

function Skeleton() {
  return (
    <div className="p-6 animate-pulse" style={{ border: '1px solid #E5E5E0', backgroundColor: '#F9F9F7' }}>
      <div className="w-10 h-10 mb-4" style={{ backgroundColor: '#E5E5E0' }} />
      <div className="h-7 w-16 mb-2" style={{ backgroundColor: '#E5E5E0' }} />
      <div className="h-3 w-24" style={{ backgroundColor: '#E5E5E0' }} />
    </div>
  )
}

function MetricCard({ label, value, Icon, iconBg, iconColor, sub, pulse }) {
  return (
    <div
      className="p-6 transition-all"
      style={{ border: '1px solid #E5E5E0', backgroundColor: '#F9F9F7', boxShadow: 'none' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '4px 4px 0px 0px #111111'; e.currentTarget.style.borderColor = '#111111' }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E5E5E0' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 flex items-center justify-center"
          style={{ backgroundColor: iconBg, border: '1px solid #E5E5E0' }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor }} strokeWidth={1.8} />
        </div>
        {pulse && (
          <span className="relative flex h-2.5 w-2.5 mt-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#16A34A' }} />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: '#16A34A' }} />
          </span>
        )}
      </div>
      <p
        className="np-serif font-black leading-none tabular-nums mb-1.5"
        style={{ fontSize: '30px', color: '#111111' }}
      >
        {value}
      </p>
      <p className="np-sans text-[13px] font-semibold" style={{ color: '#4A4845' }}>{label}</p>
      {sub && <p className="np-mono text-[10px] uppercase tracking-widest mt-0.5" style={{ color: '#AEABA6' }}>{sub}</p>}
    </div>
  )
}

function SectionHeading({ title, sub }) {
  return (
    <div className="mb-5">
      <p className="np-mono text-[9px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#CC0000' }}>★ Analytics</p>
      <h2 className="np-serif text-[16px] font-black" style={{ color: '#111111' }}>{title}</h2>
      {sub && <p className="np-body text-[12px] mt-0.5" style={{ color: '#737373' }}>{sub}</p>}
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div
      className="p-6"
      style={{ border: '1px solid #E5E5E0', backgroundColor: '#F9F9F7', boxShadow: 'none' }}
    >
      <p className="np-mono text-[10px] font-bold uppercase tracking-widest mb-5" style={{ color: '#CC0000' }}>★ {title}</p>
      {children}
    </div>
  )
}

export default function AdminOverviewPage() {
  const { metrics, loading } = useMetrics()

  if (loading || !metrics) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="h-7 w-48 animate-pulse mb-8" style={{ backgroundColor: '#E5E5E0' }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
        </div>
      </div>
    )
  }

  const METRIC_CARDS = [
    { label: 'Total Users',      value: metrics.total_users.toLocaleString(),        Icon: Users,         iconBg: '#FEF2F2', iconColor: '#CC0000'  },
    { label: 'Active Right Now', value: metrics.active_users_count.toLocaleString(), Icon: Zap,           iconBg: '#F0FDF4', iconColor: '#16A34A', pulse: true },
    { label: 'Workspaces',       value: metrics.total_workspaces.toLocaleString(),   Icon: Building2,     iconBg: '#F5F0E8', iconColor: '#111111'  },
    { label: 'Documents',        value: metrics.total_documents.toLocaleString(),    Icon: FileText,      iconBg: '#FFF7ED', iconColor: '#D97706'  },
    { label: 'Chats',            value: metrics.total_chats.toLocaleString(),        Icon: MessageSquare, iconBg: '#F5F0E8', iconColor: '#111111'  },
    { label: 'Messages',         value: metrics.total_messages.toLocaleString(),     Icon: TrendingUp,    iconBg: '#FEF2F2', iconColor: '#CC0000'  },
    { label: 'Storage Used',     value: formatBytes(metrics.total_storage_bytes),    Icon: HardDrive,     iconBg: '#FFF7ED', iconColor: '#D97706'  },
    { label: 'Active (15 min)',  value: metrics.active_users_count.toLocaleString(), Icon: Users,         iconBg: '#F0FDF4', iconColor: '#16A34A', pulse: true },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <p className="np-mono text-[9px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#CC0000' }}>★ Admin</p>
        <h1
          className="np-serif font-black"
          style={{ fontSize: '28px', color: '#111111', lineHeight: 0.95 }}
        >
          Dashboard Overview
        </h1>
        <p className="np-body text-[13px] mt-3" style={{ color: '#737373' }}>
          Platform-wide metrics at a glance
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {METRIC_CARDS.map((c) => <MetricCard key={c.label} {...c} />)}
      </div>

      {/* Charts */}
      <SectionHeading title="Trends" sub="Activity over the last 14 days" />
      <div className="grid grid-cols-1 gap-5 mb-10">

        {/* Users area chart */}
        <ChartCard title="New Users">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={metrics.users_over_time} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#CC0000" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#CC0000" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E5E5E0" strokeDasharray="0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#AEABA6', fontFamily: 'JetBrains Mono, monospace' }}
                tickFormatter={(v) => v.slice(5)}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#AEABA6', fontFamily: 'JetBrains Mono, monospace' }}
                width={28} allowDecimals={false}
                axisLine={false} tickLine={false}
              />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area
                type="monotone" dataKey="count"
                stroke="#CC0000" strokeWidth={2.5}
                fill="url(#userGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#CC0000', stroke: '#F9F9F7', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Docs bar chart — keep amber */}
        <ChartCard title="Documents Uploaded">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={metrics.docs_over_time} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="docGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D97706" stopOpacity={1} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E5E5E0" strokeDasharray="0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#AEABA6', fontFamily: 'JetBrains Mono, monospace' }}
                tickFormatter={(v) => v.slice(5)}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#AEABA6', fontFamily: 'JetBrains Mono, monospace' }}
                width={28} allowDecimals={false}
                axisLine={false} tickLine={false}
              />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="url(#docGrad)" radius={[0, 0, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chats area chart */}
        <ChartCard title="Chats Started">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={metrics.chats_over_time} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="chatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111111" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#111111" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E5E5E0" strokeDasharray="0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#AEABA6', fontFamily: 'JetBrains Mono, monospace' }}
                tickFormatter={(v) => v.slice(5)}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#AEABA6', fontFamily: 'JetBrains Mono, monospace' }}
                width={28} allowDecimals={false}
                axisLine={false} tickLine={false}
              />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area
                type="monotone" dataKey="count"
                stroke="#111111" strokeWidth={2.5}
                fill="url(#chatGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#111111', stroke: '#F9F9F7', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>

      {/* Active users */}
      <SectionHeading title="Active Users" sub="Users who made a request in the last 15 minutes" />
      <div
        className="overflow-hidden"
        style={{ border: '1px solid #E5E5E0', backgroundColor: '#F9F9F7' }}
      >
        {metrics.active_users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 flex items-center justify-center mb-3" style={{ backgroundColor: '#F5F0E8', border: '1px solid #E5E5E0' }}>
              <Zap className="w-5 h-5" style={{ color: '#AEABA6' }} strokeWidth={1.5} />
            </div>
            <p className="np-mono text-[12px] uppercase tracking-widest" style={{ color: '#AEABA6' }}>No users active in the last 15 minutes.</p>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ backgroundColor: '#F0EDE6', borderBottom: '1px solid #E5E5E0' }}>
                <th className="text-left px-6 py-3 np-mono text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#CC0000' }}>Email</th>
                <th className="text-left px-6 py-3 np-mono text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#CC0000' }}>Last Seen</th>
                <th className="text-left px-6 py-3 np-mono text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#CC0000' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics.active_users.map((u, i) => (
                <tr
                  key={u.user_id || i}
                  style={{ borderBottom: i < metrics.active_users.length - 1 ? '1px solid #E5E5E0' : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F0E8' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                >
                  <td className="px-6 py-3.5 np-sans font-medium" style={{ color: '#111111' }}>{u.email}</td>
                  <td className="px-6 py-3.5 np-mono text-[12px]" style={{ color: '#737373' }}>{timeAgo(u.last_seen)}</td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center gap-1.5 np-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1" style={{ backgroundColor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#16A34A' }} />
                      Online
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
