'use client'

import { useMetrics } from '../layout'
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts'
import { Zap, TrendingUp, MessageSquare, FileText } from 'lucide-react'

function timeAgo(ts) {
  const m = Math.floor((Date.now() - ts * 1000) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
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
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.stroke || e.fill }} />
            <span className="text-[13px] font-bold" style={{ color: '#111110' }}>{e.value.toLocaleString()}</span>
            <span className="text-[11px]" style={{ color: '#AEABA6' }}>{e.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChartCard({ title, sub, accent, Icon, iconColor, stat, statLabel, children }) {
  return (
    <div className="bg-white rounded-2xl" style={{ border: '1px solid #E3E1DC', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      <div className="px-6 pt-5 pb-2 flex items-start justify-between">
        <div>
          <p className="text-[15px] font-bold" style={{ color: '#111110' }}>{title}</p>
          {sub && <p className="text-[12px] mt-0.5" style={{ color: '#7A7874' }}>{sub}</p>}
        </div>
        {stat !== undefined && (
          <div className="text-right">
            <p className="text-[22px] font-bold tabular-nums" style={{ color: iconColor }}>{stat}</p>
            <p className="text-[11px]" style={{ color: '#AEABA6' }}>{statLabel}</p>
          </div>
        )}
      </div>
      <div className="px-6 pb-6">{children}</div>
    </div>
  )
}

const AXIS_PROPS = {
  tick: { fontSize: 11, fill: '#AEABA6' },
  axisLine: false,
  tickLine: false,
}

function avg(arr, key) {
  if (!arr.length) return 0
  return +(arr.reduce((s, x) => s + x[key], 0) / arr.length).toFixed(1)
}

export default function ActivityPage() {
  const { metrics, loading } = useMetrics()

  if (loading || !metrics) return (
    <div className="p-8 space-y-5">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" style={{ border: '1px solid #E3E1DC' }} />)}
    </div>
  )

  const chatAvg = avg(metrics.chats_over_time, 'count')
  const userAvg = avg(metrics.users_over_time, 'count')
  const docAvg  = avg(metrics.docs_over_time,  'count')

  const totalChats14 = metrics.chats_over_time.reduce((s, x) => s + x.count, 0)
  const totalUsers14 = metrics.users_over_time.reduce((s, x) => s + x.count, 0)
  const totalDocs14  = metrics.docs_over_time.reduce((s, x) => s + x.count, 0)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-bold tracking-[-0.02em]" style={{ fontSize: '24px', color: '#111110' }}>Activity</h1>
        <p className="text-[13px] mt-1" style={{ color: '#7A7874' }}>Platform usage trends â€” last 14 days</p>
      </div>

      {/* Chat activity */}
      <ChartCard title="Chat Activity" sub="Chats started per day" accent="#7C3AED" iconColor="#7C3AED" stat={totalChats14} statLabel="chats in 14 days">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={metrics.chats_over_time} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="chatActGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#7C3AED" stopOpacity={0.25} />
                <stop offset="60%"  stopColor="#7C3AED" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#F4F3F0" />
            <XAxis dataKey="date" {...AXIS_PROPS} tickFormatter={(v) => v.slice(5)} />
            <YAxis {...AXIS_PROPS} width={28} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            {chatAvg > 0 && <ReferenceLine y={chatAvg} stroke="#C4B5FD" strokeDasharray="5 4" label={{ value: `avg ${chatAvg}`, fill: '#AEABA6', fontSize: 10, position: 'right' }} />}
            <Area type="monotone" dataKey="count" name="Chats" stroke="#7C3AED" strokeWidth={3}
              fill="url(#chatActGrad)" dot={false}
              activeDot={{ r: 6, fill: '#7C3AED', stroke: '#fff', strokeWidth: 2.5, filter: 'drop-shadow(0 2px 6px rgba(124,58,237,0.4))' }} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* New users */}
      <ChartCard title="New Users" sub="Registrations per day" accent="#4361EE" iconColor="#4361EE" stat={totalUsers14} statLabel="new users in 14 days">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={metrics.users_over_time} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="userActGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#4361EE" stopOpacity={0.25} />
                <stop offset="60%"  stopColor="#4361EE" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#4361EE" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#F4F3F0" />
            <XAxis dataKey="date" {...AXIS_PROPS} tickFormatter={(v) => v.slice(5)} />
            <YAxis {...AXIS_PROPS} width={28} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            {userAvg > 0 && <ReferenceLine y={userAvg} stroke="#93A8F8" strokeDasharray="5 4" label={{ value: `avg ${userAvg}`, fill: '#AEABA6', fontSize: 10, position: 'right' }} />}
            <Area type="monotone" dataKey="count" name="New Users" stroke="#4361EE" strokeWidth={3}
              fill="url(#userActGrad)" dot={false}
              activeDot={{ r: 6, fill: '#4361EE', stroke: '#fff', strokeWidth: 2.5, filter: 'drop-shadow(0 2px 6px rgba(67,97,238,0.4))' }} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Documents */}
      <ChartCard title="Documents Uploaded" sub="Files added per day" accent="#D97706" iconColor="#D97706" stat={totalDocs14} statLabel="docs uploaded in 14 days">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={metrics.docs_over_time} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#F4F3F0" />
            <XAxis dataKey="date" {...AXIS_PROPS} tickFormatter={(v) => v.slice(5)} />
            <YAxis {...AXIS_PROPS} width={28} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            {docAvg > 0 && <ReferenceLine y={docAvg} stroke="#FCD34D" strokeDasharray="5 4" label={{ value: `avg ${docAvg}`, fill: '#AEABA6', fontSize: 10, position: 'right' }} />}
            <Line type="monotone" dataKey="count" name="Documents" stroke="#D97706" strokeWidth={3}
              dot={{ r: 4, fill: '#D97706', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#D97706', stroke: '#fff', strokeWidth: 2.5, filter: 'drop-shadow(0 2px 8px rgba(217,119,6,0.4))' }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Active users now */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #E3E1DC', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid #E3E1DC' }}>
          <div>
            <p className="text-[15px] font-bold" style={{ color: '#111110' }}>Active Right Now</p>
            <p className="text-[12px] mt-0.5" style={{ color: '#7A7874' }}>Users who made a request in the last 15 minutes</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold"
            style={{ backgroundColor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#16A34A' }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#16A34A' }} />
            </span>
            {metrics.active_users_count} online
          </span>
        </div>

        {metrics.active_users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: '#F4F3F0' }}>
              <Zap className="w-5 h-5" style={{ color: '#AEABA6' }} strokeWidth={1.5} />
            </div>
            <p className="text-[13px]" style={{ color: '#AEABA6' }}>No users active right now.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#F4F3F0' }}>
            {metrics.active_users.map((u, i) => (
              <div key={u.user_id || i} className="flex items-center justify-between px-6 py-4 transition-colors"
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F7F5F2' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-bold text-white"
                    style={{ backgroundColor: '#4361EE' }}>
                    {u.email[0].toUpperCase()}
                  </div>
                  <span className="text-[13px] font-medium" style={{ color: '#111110' }}>{u.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[12px]" style={{ color: '#AEABA6' }}>{timeAgo(u.last_seen)}</span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#16A34A' }} /> Online
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

