const processSteps = [
  {
    title: 'Submit Request',
    text: 'Donors and blood requesters submit forms with hospital selection and required details.',
  },
  {
    title: 'Admin Verification',
    text: 'Admin reviews requests and approves or rejects based on policy and availability.',
  },
  {
    title: 'Inventory Sync',
    text: 'Approved donor requests add stock and approved blood requests deduct stock safely.',
  },
  {
    title: 'Status Transparency',
    text: 'All stakeholders track status and notifications across their own dashboards.',
  },
];

function AboutPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-red-100 sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">About JP Blood Donation</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
          A Unified Platform For Faster Blood Coordination
        </h1>
        <p className="mt-4 max-w-3xl text-sm text-slate-600 sm:text-base">
          We built this platform to reduce delays between blood donation, blood requests, and hospital
          response. By connecting roles with clear workflows and secure approval systems, we make critical
          blood support more reliable.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-red-100">
          <h2 className="font-display text-2xl font-bold text-slate-900">Our Mission</h2>
          <p className="mt-3 text-sm text-slate-600">
            Create a transparent and accountable blood management ecosystem where every approved action is
            traceable and every unit movement is synchronized.
          </p>
        </article>

        <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-red-100">
          <h2 className="font-display text-2xl font-bold text-slate-900">Our Vision</h2>
          <p className="mt-3 text-sm text-slate-600">
            A future where no urgent patient waits due to process inefficiency, and every donor contribution
            is routed quickly and safely.
          </p>
        </article>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-red-100 sm:p-8">
        <h2 className="font-display text-2xl font-bold text-slate-900">How The Platform Works</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {processSteps.map((step, index) => (
            <article key={step.title} className="rounded-xl bg-red-50 p-4 ring-1 ring-red-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Step {index + 1}</p>
              <h3 className="mt-1 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
