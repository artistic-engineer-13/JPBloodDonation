const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function DonorOverviewCards({ summary, inventory = {} }) {
  const cards = [
    { label: 'Total Requests', value: summary.totalRequests },
    { label: 'Pending', value: summary.pendingCount },
    { label: 'Approved', value: summary.approvedCount },
    { label: 'Rejected', value: summary.rejectedCount },
    { label: 'Units Requested', value: summary.totalUnits },
    { label: 'Units Approved', value: summary.approvedUnits },
  ];

  const inventoryTotal = BLOOD_GROUPS.reduce((sum, group) => sum + (Number(inventory?.[group]) || 0), 0);

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">My Inventory</h3>
          <p className="text-sm text-slate-600">Total Units: {inventoryTotal}</p>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {BLOOD_GROUPS.map((group) => (
            <article key={group} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center">
              <p className="text-xs font-semibold text-slate-500">{group}</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{Number(inventory?.[group]) || 0}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default DonorOverviewCards;
