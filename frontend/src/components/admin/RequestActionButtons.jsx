function RequestActionButtons({ rowId, onApprove, onReject, isActionLoading }) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onApprove(rowId)}
        disabled={isActionLoading}
        className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        Approve
      </button>
      <button
        type="button"
        onClick={() => onReject(rowId)}
        disabled={isActionLoading}
        className="rounded-md bg-rose-600 px-2 py-1 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-60"
      >
        Reject
      </button>
    </div>
  );
}

export default RequestActionButtons;
