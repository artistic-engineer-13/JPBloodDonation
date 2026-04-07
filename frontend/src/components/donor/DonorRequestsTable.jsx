const statusStyles = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return '-';
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString();
};

function DonorRequestsTable({ requests }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">My Donation Requests</h2>
        <span className="text-sm text-slate-500">{requests.length} records</span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-2">Blood Group</th>
              <th className="px-3 py-2">Units</th>
              <th className="px-3 py-2">Hospital</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {requests.map((request) => (
              <tr key={request._id}>
                <td className="px-3 py-2 font-medium">{request.bloodGroup}</td>
                <td className="px-3 py-2">{request.units}</td>
                <td className="px-3 py-2">
                  {request.hospital?.name || 'Unknown'}
                  {request.hospital?.code ? ` (${request.hospital.code})` : ''}
                </td>
                <td className="px-3 py-2">{formatDate(request.preferredDonationDate)}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[request.status] || 'bg-slate-100 text-slate-700'}`}
                  >
                    {request.status}
                  </span>
                </td>
                <td className="px-3 py-2">{request.notes || '-'}</td>
              </tr>
            ))}

            {!requests.length ? (
              <tr>
                <td className="px-3 py-6 text-center text-slate-500" colSpan={6}>
                  No donation requests found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default DonorRequestsTable;
