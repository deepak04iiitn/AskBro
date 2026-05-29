const CONFIG = {
  pending:    { label: 'Pending',    dot: '#9CA3AF', text: '#6B7280', bg: '#F9FAFB' },
  processing: { label: 'Processing', dot: '#F59E0B', text: '#D97706', bg: '#FFFBEB' },
  completed:  { label: 'Ready',      dot: '#10B981', text: '#059669', bg: '#F0FDF4' },
  failed:     { label: 'Failed',     dot: '#EF4444', text: '#DC2626', bg: '#FFF5F5' },
}

export default function StatusBadge({ status, small = false }) {
  const cfg = CONFIG[status] ?? CONFIG.pending
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${small ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1'}`}
      style={{ color: cfg.text, backgroundColor: cfg.bg }}
    >
      <span
        className={`rounded-full shrink-0 ${status === 'processing' ? 'animate-pulse' : ''}`}
        style={{ width: 6, height: 6, backgroundColor: cfg.dot, display: 'inline-block' }}
      />
      {cfg.label}
    </span>
  )
}
