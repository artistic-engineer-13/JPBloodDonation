import StatusBadge from '../common/StatusBadge';

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return date.toLocaleDateString();
};

function HospitalDonorRequestsTable({ requests }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Donor Requests</h2>
        <span className="text-sm text-slate-500">{requests.length} records</span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-2">Donor Name</th>
              <th className="px-3 py-2">Blood Group</th>
              <th className="px-3 py-2">Units</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-3 py-2 font-medium">{request.donorName || '-'}</td>
                <td className="px-3 py-2">{request.bloodGroup || '-'}</td>
                <td className="px-3 py-2">{request.units ?? '-'}</td>
                <td className="px-3 py-2">{formatDate(request.date)}</td>
                <td className="px-3 py-2"><StatusBadge status={request.status} /></td>
                <td className="px-3 py-2">{request.note || '-'}</td>
              </tr>
            ))}

            {!requests.length ? (
              <tr>
                <td className="px-3 py-6 text-center text-slate-500" colSpan={6}>
                  No donor requests found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default HospitalDonorRequestsTable;
