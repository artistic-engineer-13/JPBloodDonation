import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import AuthLoading from '../components/common/AuthLoading';
import { getDashboardPathByRole } from '../utils/authRouting';

function RoleRoute({ allowedRoles }) {
  const { user, isAuthenticated, isCheckingAuth } = useSelector((state) => state.auth);

  if (isCheckingAuth) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to={getDashboardPathByRole(user?.role)} replace />;
  }

  return <Outlet />;
}

export default RoleRoute;
