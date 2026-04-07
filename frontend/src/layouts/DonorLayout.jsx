import DashboardLayout from './DashboardLayout';

const navItems = [
  { to: '/donor', label: 'Donor Dashboard' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/profile', label: 'Profile' },
];

function DonorLayout() {
  return <DashboardLayout navItems={navItems} />;
}

export default DonorLayout;
