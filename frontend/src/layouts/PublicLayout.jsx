import { Outlet } from 'react-router-dom';

import Footer from '../components/navigation/Footer';
import Navbar from '../components/navigation/Navbar';

function PublicLayout() {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
