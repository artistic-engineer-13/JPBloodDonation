import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import AuthLoading from '../components/common/AuthLoading';
import { getDashboardPathByRole } from '../utils/authRouting';

function PublicOnlyRoute() {
  const { isAuthenticated, user, isCheckingAuth } = useSelector((state) => state.auth);

  if (isCheckingAuth) {
    return <AuthLoading />;
  }

  if (isAuthenticated) {
    return <Navigate to={getDashboardPathByRole(user?.role)} replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
