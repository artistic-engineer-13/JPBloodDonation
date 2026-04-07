function ContactPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-red-100 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">Contact Us</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-slate-900">We Are Here To Help</h1>
        <p className="mt-3 text-sm text-slate-600">
          Reach us for emergency support, onboarding help, partnership, or technical assistance.
        </p>

        <div className="mt-5 space-y-3 text-sm text-slate-700">
          <article className="rounded-xl bg-red-50 p-3 ring-1 ring-red-100">
            <p className="font-semibold">Emergency Helpline</p>
            <p>+91 90000 00000</p>
          </article>
          <article className="rounded-xl bg-red-50 p-3 ring-1 ring-red-100">
            <p className="font-semibold">Email Support</p>
            <p>support@jpblood.org</p>
          </article>
          <article className="rounded-xl bg-red-50 p-3 ring-1 ring-red-100">
            <p className="font-semibold">Address</p>
            <p>JP Blood Coordination Center, New Delhi, India</p>
          </article>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-red-100 sm:p-8">
        <h2 className="font-display text-2xl font-bold text-slate-900">Send a Message</h2>
        <p className="mt-2 text-sm text-slate-600">This form is currently informational and will be wired next.</p>

        <form className="mt-5 grid gap-4">
          <label>
            <span className="mb-1 block text-sm font-medium text-slate-700">Full Name</span>
            <input
              type="text"
              placeholder="Your full name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-300 focus:ring"
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-300 focus:ring"
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-medium text-slate-700">Subject</span>
            <input
              type="text"
              placeholder="How can we help?"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-300 focus:ring"
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-medium text-slate-700">Message</span>
            <textarea
              rows={5}
              placeholder="Write your message"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-300 focus:ring"
            />
          </label>

          <button
            type="button"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-brand-700"
          >
            Send Message
          </button>
        </form>
      </section>
    </div>
  );
}

export default ContactPage;
