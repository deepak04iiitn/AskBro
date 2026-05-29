const CONFIG = {
  pending:    { label: 'Pending',    dot: '#AEABA6', text: '#7A7874', bg: '#F4F3F0' },
  processing: { label: 'Processing', dot: '#D97706', text: '#D97706', bg: '#FFFBEB' },
  completed:  { label: 'Ready',      dot: '#16A34A', text: '#16A34A', bg: '#F0FDF4' },
  failed:     { label: 'Failed',     dot: '#DC2626', text: '#DC2626', bg: '#FEF2F2' },
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
        style={{ width: 5, height: 5, backgroundColor: cfg.dot, display: 'inline-block' }}
      />
      {cfg.label}
    </span>
  )
}
