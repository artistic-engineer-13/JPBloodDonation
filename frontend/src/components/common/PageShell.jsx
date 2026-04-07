function PageShell({ title, description }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      {description ? <p className="mt-2 text-slate-600">{description}</p> : null}
    </section>
  );
}

export default PageShell;
