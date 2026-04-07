function AdminAnalyticsCards({ analytics }) {
  const cards = [
    { label: 'Total Users', value: analytics.totalUsers || 0 },
    { label: 'Total Donors', value: analytics.totalDonors || 0 },
    { label: 'Total Requesters', value: analytics.totalRequesters || 0 },
    { label: 'Total Hospitals', value: analytics.totalHospitals || 0 },
    { label: 'Total Donation Requests', value: analytics.totalDonationRequests || 0 },
    { label: 'Total Blood Requests', value: analytics.totalBloodRequests || 0 },
    { label: 'Approved Count', value: analytics.approvedCount || 0 },
    { label: 'Pending Count', value: analytics.pendingCount || 0 },
    { label: 'Rejected Count', value: analytics.rejectedCount || 0 },
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

export default AdminAnalyticsCards;
