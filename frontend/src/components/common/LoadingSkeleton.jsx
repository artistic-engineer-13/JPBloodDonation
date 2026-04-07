function LoadingSkeleton({ rows = 4 }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="animate-pulse space-y-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="h-10 rounded-lg bg-slate-100" />
        ))}
      </div>
    </section>
  );
}

export default LoadingSkeleton;
