import { NavLink } from 'react-router-dom';

const baseLink =
  'block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-brand-50 hover:text-brand-700';

function Sidebar({ items }) {
  return (
    <aside className="w-full rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 lg:w-64">
      <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Dashboard</p>
      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${baseLink} ${isActive ? 'bg-brand-100 text-brand-800' : 'text-slate-700'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
