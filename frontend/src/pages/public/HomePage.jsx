import { Link } from 'react-router-dom';

const bloodGroups = [
  { type: 'A+', canDonateTo: 'A+, AB+', canReceiveFrom: 'A+, A-, O+, O-' },
  { type: 'A-', canDonateTo: 'A+, A-, AB+, AB-', canReceiveFrom: 'A-, O-' },
  { type: 'B+', canDonateTo: 'B+, AB+', canReceiveFrom: 'B+, B-, O+, O-' },
  { type: 'B-', canDonateTo: 'B+, B-, AB+, AB-', canReceiveFrom: 'B-, O-' },
  { type: 'AB+', canDonateTo: 'AB+', canReceiveFrom: 'All groups' },
  { type: 'AB-', canDonateTo: 'AB+, AB-', canReceiveFrom: 'AB-, A-, B-, O-' },
  { type: 'O+', canDonateTo: 'O+, A+, B+, AB+', canReceiveFrom: 'O+, O-' },
  { type: 'O-', canDonateTo: 'All groups', canReceiveFrom: 'O-' },
];

const features = [
  {
    title: 'Role-Based Dashboards',
    text: 'Separate portals for donor, requester, hospital, and admin with focused workflows.',
  },
  {
    title: 'Safe Approval Workflow',
    text: 'Only admin can approve or reject requests, keeping inventory movement controlled.',
  },
  {
    title: 'Live Inventory Visibility',
    text: 'Hospital and admin see synced stock levels by blood group in real-time views.',
  },
  {
    title: 'Instant Notifications',
    text: 'Automatic updates when requests are submitted, approved, or rejected.',
  },
];

const reasons = [
  'Every 2 seconds, someone needs blood support during emergency treatment.',
  'One donor can help multiple patients through separated blood components.',
  'Regular voluntary donations keep hospitals prepared for critical shortages.',
];

function HomePage() {
  return (
    <div className="space-y-8 pb-4">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-6 py-14 text-white shadow-soft sm:px-10">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 left-10 h-44 w-44 rounded-full bg-white/10" />

        <div className="relative max-w-3xl">
          <p className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            Save Lives Together
          </p>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Donate Blood, Share Hope, Build a Stronger Lifeline Network
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-red-50 sm:text-base">
            JP Blood Donation connects donors, requesters, hospitals, and admins into one trusted platform
            for faster, safer blood coordination.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-700 hover:bg-red-50"
            >
              Become a Donor
            </Link>
            <Link
              to="/about"
              className="rounded-xl border border-white/60 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-red-100 sm:p-8">
        <h2 className="font-display text-2xl font-bold text-slate-900">Why Donate Blood?</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {reasons.map((reason) => (
            <article key={reason} className="rounded-xl bg-red-50 p-4 ring-1 ring-red-100">
              <p className="text-sm text-slate-700">{reason}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-red-100 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold text-slate-900">Blood Group Information</h2>
          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-brand-700">Compatibility Guide</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-red-100 text-sm">
            <thead className="bg-red-50 text-left text-xs uppercase tracking-wide text-brand-700">
              <tr>
                <th className="px-3 py-2">Blood Group</th>
                <th className="px-3 py-2">Can Donate To</th>
                <th className="px-3 py-2">Can Receive From</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {bloodGroups.map((group) => (
                <tr key={group.type}>
                  <td className="px-3 py-2 font-semibold text-brand-700">{group.type}</td>
                  <td className="px-3 py-2">{group.canDonateTo}</td>
                  <td className="px-3 py-2">{group.canReceiveFrom}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-red-100 sm:p-8">
        <h2 className="font-display text-2xl font-bold text-slate-900">Platform Features</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-xl bg-gradient-to-br from-red-50 to-white p-4 ring-1 ring-red-100">
              <h3 className="font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-slate-900 px-6 py-10 text-white shadow-soft sm:px-10">
        <h2 className="font-display text-3xl font-bold">Ready To Make a Difference?</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
          Join the network today and help hospitals respond faster to urgent blood needs.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/register" className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-500">
            Register Now
          </Link>
          <Link to="/contact" className="rounded-xl border border-slate-500 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-800">
            Contact Team
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
