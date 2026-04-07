import DashboardLayout from './DashboardLayout';

const navItems = [
  { to: '/admin', label: 'Admin Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/hospitals', label: 'Hospitals' },
  { to: '/admin/donor-requests', label: 'Donor Requests' },
  { to: '/admin/blood-requests', label: 'Blood Requests' },
  { to: '/admin/inventory', label: 'Inventory' },
  { to: '/admin/donor-inventories', label: 'Donor Inventories' },
  { to: '/admin/audit-logs', label: 'Audit Logs' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/profile', label: 'Profile' },
];

function AdminLayout() {
  return <DashboardLayout navItems={navItems} />;
}

export default AdminLayout;
