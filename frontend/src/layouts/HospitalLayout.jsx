import DashboardLayout from './DashboardLayout';

const navItems = [
  { to: '/hospital', label: 'Hospital Dashboard' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/profile', label: 'Profile' },
];

function HospitalLayout() {
  return <DashboardLayout navItems={navItems} />;
}

export default HospitalLayout;
