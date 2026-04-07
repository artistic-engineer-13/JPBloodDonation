function HospitalOverviewCards({ overview }) {
  const cards = [
    { label: 'Total Blood Inventory', value: overview.totalBloodInventory || 0 },
    { label: 'Total Donor Requests', value: overview.totalDonorRequests || 0 },
    { label: 'Total Blood Requests', value: overview.totalBloodRequests || 0 },
    { label: 'Approved Requests', value: overview.approvedRequests || 0 },
    { label: 'Pending Requests', value: overview.pendingRequests || 0 },
    { label: 'Rejected Requests', value: overview.rejectedRequests || 0 },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <article key={card.label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
        </article>
      ))}
    </section>
  );
}

export default HospitalOverviewCards;
