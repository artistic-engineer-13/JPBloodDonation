function DataToolbar({
  title,
  description,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  actions = null,
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      {title ? <h1 className="text-xl font-semibold text-slate-900">{title}</h1> : null}
      {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}

      <div className="mt-4 grid gap-3 md:grid-cols-12">
        <label className="md:col-span-5">
          <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Search</span>
          <input
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-300 focus:ring"
          />
        </label>

        {filters.map((filter) => (
          <label key={filter.key} className="md:col-span-3">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">{filter.label}</span>
            <select
              value={filter.value}
              onChange={(event) => filter.onChange(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-brand-300 focus:ring"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}

        {actions ? <div className="md:col-span-4 flex items-end gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}

export default DataToolbar;
