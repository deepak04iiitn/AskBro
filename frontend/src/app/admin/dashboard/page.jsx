'use client'

import { useMetrics } from './layout'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Users, Building2, FileText, MessageSquare, MessagesSquare,
  HardDrive, Zap, TrendingUp,
} from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────
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
    fontSize: 12, borderRadius: 12,
    border: 'none',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px #E3E1DC',
    padding: '10px 14px',
    backgroundColor: '#FFFFFF',
  },
  labelStyle: { color: '#111110', fontWeight: 700, marginBottom: 4 },
  itemStyle: { color: '#4A4845' },
  cursor: { stroke: '#E3E1DC', strokeWidth: 1 },
}

// ── Skeleton ──────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 animate-pulse" style={{ border: '1px solid #E3E1DC' }}>
      <div className="w-10 h-10 rounded-xl mb-4" style={{ backgroundColor: '#F4F3F0' }} />
      <div className="h-7 w-16 rounded mb-2" style={{ backgroundColor: '#F4F3F0' }} />
      <div className="h-3 w-24 rounded" style={{ backgroundColor: '#F4F3F0' }} />
    </div>
  )
}

// ── Metric card ───────────────────────────────────────────────
function MetricCard({ label, value, Icon, iconBg, iconColor, sub, pulse }) {
  return (
    <div
      className="bg-white rounded-2xl p-6 transition-shadow hover:shadow-md"
      style={{ border: '1px solid #E3E1DC', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
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
        className="font-bold leading-none tabular-nums tracking-tight mb-1.5"
        style={{ fontSize: '30px', color: '#111110' }}
      >
        {value}
      </p>
      <p className="text-[13px] font-semibold" style={{ color: '#4A4845' }}>{label}</p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: '#AEABA6' }}>{sub}</p>}
    </div>
  )
}

// ── Section heading ───────────────────────────────────────────
function SectionHeading({ title, sub }) {
  return (
    <div className="mb-5">
      <h2 className="text-[15px] font-bold tracking-[-0.01em]" style={{ color: '#111110' }}>{title}</h2>
      {sub && <p className="text-[12px] mt-0.5" style={{ color: '#7A7874' }}>{sub}</p>}
    </div>
  )
}

// ── Chart card ────────────────────────────────────────────────
function ChartCard({ title, children }) {
  return (
    <div
      className="bg-white rounded-2xl p-6"
      style={{ border: '1px solid #E3E1DC', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
    >
      <p className="text-[13px] font-semibold mb-5" style={{ color: '#111110' }}>{title}</p>
      {children}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function AdminOverviewPage() {
  const { metrics, loading } = useMetrics()

  if (loading || !metrics) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="h-7 w-48 rounded animate-pulse mb-8" style={{ backgroundColor: '#F4F3F0' }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
        </div>
      </div>
    )
  }

  const METRIC_CARDS = [
    { label: 'Total Users',      value: metrics.total_users.toLocaleString(),        Icon: Users,          iconBg: '#EEF1FD', iconColor: '#4361EE'  },
    { label: 'Active Right Now', value: metrics.active_users_count.toLocaleString(), Icon: Zap,            iconBg: '#F0FDF4', iconColor: '#16A34A', pulse: true },
    { label: 'Workspaces',       value: metrics.total_workspaces.toLocaleString(),   Icon: Building2,      iconBg: '#F5F3FF', iconColor: '#7C3AED'  },
    { label: 'Documents',        value: metrics.total_documents.toLocaleString(),    Icon: FileText,       iconBg: '#FFF7ED', iconColor: '#D97706'  },
    { label: 'Chats',            value: metrics.total_chats.toLocaleString(),        Icon: MessageSquare,  iconBg: '#EFF6FF', iconColor: '#2563EB'  },
    { label: 'Messages',         value: metrics.total_messages.toLocaleString(),     Icon: TrendingUp,     iconBg: '#FFF1F2', iconColor: '#EC4899'  },
    { label: 'Storage Used',     value: formatBytes(metrics.total_storage_bytes),    Icon: HardDrive,      iconBg: '#FEF2F2', iconColor: '#DC2626'  },
    { label: 'Active (15 min)',  value: metrics.active_users_count.toLocaleString(), Icon: Users,          iconBg: '#F0FDF4', iconColor: '#16A34A', pulse: true },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1
          className="font-bold tracking-[-0.02em]"
          style={{ fontSize: '24px', color: '#111110' }}
        >
          Dashboard Overview
        </h1>
        <p className="text-[13px] mt-1" style={{ color: '#7A7874' }}>
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

        {/* Users line chart */}
        <ChartCard title="New Users">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={metrics.users_over_time} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4361EE" stopOpacity={0.20} />
                  <stop offset="100%" stopColor="#4361EE" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#F4F3F0" strokeDasharray="0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#AEABA6' }}
                tickFormatter={(v) => v.slice(5)}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#AEABA6' }}
                width={28} allowDecimals={false}
                axisLine={false} tickLine={false}
              />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area
                type="monotone" dataKey="count"
                stroke="#4361EE" strokeWidth={2.5}
                fill="url(#userGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#4361EE', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Docs bar chart */}
        <ChartCard title="Documents Uploaded">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={metrics.docs_over_time} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="docGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D97706" stopOpacity={1} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#F4F3F0" strokeDasharray="0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#AEABA6' }}
                tickFormatter={(v) => v.slice(5)}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#AEABA6' }}
                width={28} allowDecimals={false}
                axisLine={false} tickLine={false}
              />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="url(#docGrad)" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chats area chart */}
        <ChartCard title="Chats Started">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={metrics.chats_over_time} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="chatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.20} />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#F4F3F0" strokeDasharray="0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#AEABA6' }}
                tickFormatter={(v) => v.slice(5)}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#AEABA6' }}
                width={28} allowDecimals={false}
                axisLine={false} tickLine={false}
              />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area
                type="monotone" dataKey="count"
                stroke="#7C3AED" strokeWidth={2.5}
                fill="url(#chatGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#7C3AED', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>

      {/* Active users */}
      <SectionHeading title="Active Users" sub="Users who made a request in the last 15 minutes" />
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ border: '1px solid #E3E1DC', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
      >
        {metrics.active_users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: '#F4F3F0' }}>
              <Zap className="w-5 h-5" style={{ color: '#AEABA6' }} strokeWidth={1.5} />
            </div>
            <p className="text-[13px]" style={{ color: '#AEABA6' }}>No users active in the last 15 minutes.</p>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ backgroundColor: '#F7F5F2', borderBottom: '1px solid #E3E1DC' }}>
                <th className="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: '#7A7874' }}>Email</th>
                <th className="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: '#7A7874' }}>Last Seen</th>
                <th className="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: '#7A7874' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {metrics.active_users.map((u, i) => (
                <tr
                  key={u.user_id || i}
                  style={{ borderBottom: i < metrics.active_users.length - 1 ? '1px solid #F4F3F0' : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F7F5F2' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                >
                  <td className="px-6 py-3.5 font-medium" style={{ color: '#111110' }}>{u.email}</td>
                  <td className="px-6 py-3.5" style={{ color: '#7A7874' }}>{timeAgo(u.last_seen)}</td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
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
