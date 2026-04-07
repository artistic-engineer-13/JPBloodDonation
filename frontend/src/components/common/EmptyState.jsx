function EmptyState({ title = 'No data found', message = 'Try changing filters or come back later.' }) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{message}</p>
    </section>
  );
}

export default EmptyState;
