function UserInfoCard({ user }) {
  const fields = [
    { label: 'Name', value: user?.name || '-' },
    { label: 'Email', value: user?.email || '-' },
    { label: 'Phone', value: user?.phone || '-' },
    { label: 'Role', value: user?.role || '-' },
    { label: 'Address', value: user?.address || '-' },
    { label: 'Blood Group', value: user?.bloodGroup || '-' },
    { label: 'Needed Blood Group', value: user?.neededBloodGroup || '-' },
    { label: 'Gender', value: user?.gender || '-' },
    { label: 'Age', value: user?.age ?? '-' },
    { label: 'Active', value: user?.isActive ? 'Yes' : 'No' },
  ];

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h1 className="text-xl font-semibold text-slate-900">My Profile</h1>
      <p className="mt-1 text-sm text-slate-600">Current authenticated user details.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <article key={field.label} className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{field.label}</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{field.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default UserInfoCard;
