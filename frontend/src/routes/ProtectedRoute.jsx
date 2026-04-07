import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import AuthLoading from '../components/common/AuthLoading';

function ProtectedRoute() {
  const { isAuthenticated, isCheckingAuth } = useSelector((state) => state.auth);

  if (isCheckingAuth) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
