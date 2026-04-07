import { Navigate, Route, Routes } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import HospitalLayout from '../layouts/HospitalLayout';
import DonorLayout from '../layouts/DonorLayout';
import RequesterLayout from '../layouts/RequesterLayout';

import ProtectedRoute from './ProtectedRoute';
import PublicOnlyRoute from './PublicOnlyRoute';
import RoleRoute from './RoleRoute';

import HomePage from '../pages/public/HomePage';
import AboutPage from '../pages/public/AboutPage';
import ContactPage from '../pages/public/ContactPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';

import AdminDashboardPage from '../pages/dashboard/AdminDashboardPage';
import HospitalDashboardPage from '../pages/dashboard/HospitalDashboardPage';
import DonorDashboardPage from '../pages/dashboard/DonorDashboardPage';
import RequesterDashboardPage from '../pages/dashboard/RequesterDashboardPage';
import UsersManagementPage from '../pages/admin/UsersManagementPage';
import HospitalsManagementPage from '../pages/admin/HospitalsManagementPage';
import DonorRequestsManagementPage from '../pages/admin/DonorRequestsManagementPage';
import BloodRequestsManagementPage from '../pages/admin/BloodRequestsManagementPage';
import InventoryMonitoringPage from '../pages/admin/InventoryMonitoringPage';
import DonorInventoriesPage from '../pages/admin/DonorInventoriesPage';
import AuditLogsPage from '../pages/admin/AuditLogsPage';

import ProfilePage from '../pages/shared/ProfilePage';
import NotificationsPage from '../pages/shared/NotificationsPage';
import NotFoundPage from '../pages/shared/NotFoundPage';

import { ROLES } from '../utils/roles';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<UsersManagementPage />} />
            <Route path="/admin/hospitals" element={<HospitalsManagementPage />} />
            <Route path="/admin/donor-requests" element={<DonorRequestsManagementPage />} />
            <Route path="/admin/blood-requests" element={<BloodRequestsManagementPage />} />
            <Route path="/admin/inventory" element={<InventoryMonitoringPage />} />
            <Route path="/admin/donor-inventories" element={<DonorInventoriesPage />} />
            <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={[ROLES.HOSPITAL]} />}>
          <Route element={<HospitalLayout />}>
            <Route path="/hospital" element={<HospitalDashboardPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={[ROLES.DONOR]} />}>
          <Route element={<DonorLayout />}>
            <Route path="/donor" element={<DonorDashboardPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={[ROLES.BLOOD_REQUESTER]} />}>
          <Route element={<RequesterLayout />}>
            <Route path="/requester" element={<RequesterDashboardPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
