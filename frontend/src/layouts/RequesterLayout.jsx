import DashboardLayout from './DashboardLayout';

const navItems = [
  { to: '/requester', label: 'Requester Dashboard' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/profile', label: 'Profile' },
];

function RequesterLayout() {
  return <DashboardLayout navItems={navItems} />;
}

export default RequesterLayout;
