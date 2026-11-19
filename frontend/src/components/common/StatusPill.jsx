export const StatusPill = ({ status, size = 'sm', className = '' }) => {
  const norm = String(status || '').toUpperCase().trim();

  let styles = 'bg-gray-100 text-gray-700 border-gray-200';

  // Green statuses
  if (['ON THE WAY', 'ACCEPTED', 'OK', 'VERIFIED', 'ACTIVE', 'FULFILLED', 'ELIGIBLE NOW', 'APPROVED', 'COMPLETED', 'CONFIRMED'].includes(norm)) {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-200/60 font-semibold';
  }
  // Red / Critical / Live / Low statuses
  else if (['LIVE', 'CRITICAL', 'LOW', 'EMERGENCY', 'EMERGENCY · CRITICAL'].includes(norm)) {
    styles = 'bg-red-50 text-[#B81D24] border-red-200 font-bold';
  }
  // Amber / Watch / Pending / Expired
  else if (['WATCH', 'PENDING', 'AWAITING REPLY', 'AWAITING CONFIRMATION', 'EXPIRED', 'IN PROGRESS'].includes(norm)) {
    styles = 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
  }
  // Urgent
  else if (['URGENT'].includes(norm)) {
    styles = 'bg-orange-50 text-orange-800 border-orange-200 font-semibold';
  }
  // Muted / Declined / Suspended / Closed / Changes Requested
  else if (['CHANGES REQUESTED', 'DECLINED', 'SUSPENDED', 'CANCELLED BY YOU', 'CLOSED', 'STANDARD'].includes(norm)) {
    styles = 'bg-stone-100 text-stone-600 border-stone-200';
  }

  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase ${sizeClass} ${styles} ${className}`}
    >
      {norm === 'LIVE' && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#B81D24] animate-pulse" />
      )}
      {norm === 'IN PROGRESS' && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      )}
      {status}
    </span>
  );
};

export default StatusPill;
