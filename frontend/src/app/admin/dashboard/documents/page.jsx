'use client'

import { useMemo } from 'react'
import { useMetrics } from '../layout'
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LabelList,
} from 'recharts'
import { FileText, HardDrive } from 'lucide-react'

const PIE_COLORS = ['#4361EE','#7C3AED','#16A34A','#D97706','#DC2626','#0EA5E9']
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
            <span className="text-[13px] font-bold" style={{ color: '#111110' }}>{typeof e.value === 'number' ? e.value.toLocaleString() : e.value}</span>
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

export default function DocumentsPage() {
  const { metrics, loading } = useMetrics()

  const docsPerWs   = useMemo(() => metrics?.storage_by_workspace.map((s) => ({ name: s.workspace_name, docs: s.docs })) ?? [], [metrics])
  const storageData = useMemo(() => metrics?.storage_by_workspace.map((s) => ({ name: s.workspace_name, mb: s.size_mb })) ?? [], [metrics])

  if (loading || !metrics) return (
    <div className="p-8 space-y-5">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" style={{ border: '1px solid #E3E1DC' }} />)}
    </div>
  )

  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, file_type }) => {
    const R = Math.PI / 180
    const r = innerRadius + (outerRadius - innerRadius) * 0.55
    const x = cx + r * Math.cos(-midAngle * R)
    const y = cy + r * Math.sin(-midAngle * R)
    if (percent < 0.06) return null
    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>{`${(percent*100).toFixed(0)}%`}</text>
  }

  const gradDefs = (prefix) => BAR_PALETTE.map((c, i) => (
    <linearGradient key={i} id={`${prefix}${i}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={c} stopOpacity={1} />
      <stop offset="100%" stopColor={c} stopOpacity={0.6} />
    </linearGradient>
  ))

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-bold tracking-[-0.02em]" style={{ fontSize: '24px', color: '#111110' }}>Documents</h1>
        <p className="text-[13px] mt-1" style={{ color: '#7A7874' }}>{metrics.total_documents.toLocaleString()} documents &nbsp;·&nbsp; {formatBytes(metrics.total_storage_bytes)} total storage</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard Icon={FileText}  iconBg="#FFF7ED" iconColor="#D97706" label="Total Documents"    value={metrics.total_documents.toLocaleString()} />
        <StatCard Icon={HardDrive} iconBg="#FEF2F2" iconColor="#DC2626" label="Total Storage Used" value={formatBytes(metrics.total_storage_bytes)} />
      </div>

      {/* File type donut */}
      <ChartCard title="Documents by File Type" sub="Breakdown of uploaded document formats with percentage labels" accent="#4361EE">
        <ResponsiveContainer width="100%" height={340}>
          <PieChart>
            <defs>
              {PIE_COLORS.map((c, i) => (
                <linearGradient key={i} id={`ftpie${i}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={c} stopOpacity={1} />
                  <stop offset="100%" stopColor={c} stopOpacity={0.75} />
                </linearGradient>
              ))}
            </defs>
            <Pie data={metrics.docs_by_type} cx="50%" cy="46%" innerRadius={80} outerRadius={130}
              dataKey="count" nameKey="file_type" paddingAngle={4} labelLine={false} label={renderPieLabel}>
              {metrics.docs_by_type.map((_, i) => <Cell key={i} fill={`url(#ftpie${i % PIE_COLORS.length})`} stroke="white" strokeWidth={3} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 13, paddingTop: 20, fontWeight: 600 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Docs per workspace */}
      <ChartCard title="Documents per Workspace" sub="How many files each workspace has uploaded" accent="#D97706">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={docsPerWs} margin={{ top: 24, right: 8, left: -16, bottom: 40 }}>
            <defs>{gradDefs('dpw')}</defs>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4A4845' }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 10, fill: '#AEABA6' }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="docs" radius={[8,8,0,0]} maxBarSize={52} name="Documents">
              {docsPerWs.map((_, i) => <Cell key={i} fill={`url(#dpw${i % BAR_PALETTE.length})`} />)}
              <LabelList dataKey="docs" position="top" style={{ fontSize: 11, fontWeight: 700, fill: '#4A4845' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Storage per workspace */}
      <ChartCard title="Storage per Workspace (MB)" sub="Disk space consumed by each workspace's documents" accent="#DC2626">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={storageData} margin={{ top: 24, right: 8, left: -16, bottom: 40 }}>
            <defs>{gradDefs('spw')}</defs>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4A4845' }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 10, fill: '#AEABA6' }} axisLine={false} tickLine={false} width={28} />
            <Tooltip content={<CustomTooltip />} formatter={(v) => [`${v} MB`, 'Storage']} />
            <Bar dataKey="mb" radius={[8,8,0,0]} maxBarSize={52} name="Storage (MB)">
              {storageData.map((_, i) => <Cell key={i} fill={`url(#spw${i % BAR_PALETTE.length})`} />)}
              <LabelList dataKey="mb" position="top" style={{ fontSize: 11, fontWeight: 700, fill: '#4A4845' }} formatter={(v) => `${v}MB`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

