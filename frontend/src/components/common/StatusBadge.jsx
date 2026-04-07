const statusClassMap = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
};

function StatusBadge({ status }) {
  const normalized = String(status || '').toUpperCase();
  const style = statusClassMap[normalized] || 'bg-slate-100 text-slate-700';

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${style}`}>
      {normalized || 'UNKNOWN'}
    </span>
  );
}

export default StatusBadge;
