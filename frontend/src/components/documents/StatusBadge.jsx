const CONFIG = {
  pending:    { label: 'Pending',    classes: 'bg-zinc-100 text-zinc-500' },
  processing: { label: 'Processing', classes: 'bg-amber-50 text-amber-600' },
  completed:  { label: 'Done',       classes: 'bg-emerald-50 text-emerald-700' },
  failed:     { label: 'Failed',     classes: 'bg-red-50 text-red-600' },
}

export default function StatusBadge({ status, small = false }) {
  const cfg = CONFIG[status] ?? CONFIG.pending

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium rounded-full
        ${small ? 'text-[9px] px-1.5 py-0.5' : 'text-xs px-2.5 py-1'}
        ${cfg.classes}
      `}
    >
      {status === 'processing' && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
      )}
      {cfg.label}
    </span>
  )
}
