const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function HospitalInventoryGrid({ inventory }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-semibold text-slate-900">Inventory</h2>
      <p className="mt-1 text-sm text-slate-600">All blood groups and currently available units.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {BLOOD_GROUPS.map((group) => (
          <article key={group} className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">{group}</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{Number(inventory?.[group]) || 0}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default HospitalInventoryGrid;
