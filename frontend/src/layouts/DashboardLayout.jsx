import { Outlet } from 'react-router-dom';

import Navbar from '../components/navigation/Navbar';
import Sidebar from '../components/navigation/Sidebar';

function DashboardLayout({ navItems }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[16rem_1fr] lg:px-8">
        <Sidebar items={navItems} />
        <section className="space-y-4">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default DashboardLayout;
