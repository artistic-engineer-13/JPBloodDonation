import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import AppRoutes from '../routes/AppRoutes';
import { initializeAuth } from '../store/slices/authSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return <AppRoutes />;
}

export default App;
