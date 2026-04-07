import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { authApi } from '../../api/authApi';
import UserInfoCard from '../../components/profile/UserInfoCard';
import { useToast } from '../../components/common/ToastProvider';
import { setAuthState } from '../../store/slices/authSlice';

function ProfilePage() {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { user: authUser, token } = useSelector((state) => state.auth);

  const [user, setUser] = useState(authUser);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.me();
      const currentUser = response?.data?.data?.user || null;

      if (!currentUser) {
        throw new Error('User profile payload not found');
      }

      setUser(currentUser);

      if (token) {
        dispatch(setAuthState({ user: currentUser, token }));
      }
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Failed to load profile.';
      setError(message);
      showToast({ title: 'Profile Error', message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, showToast, token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (isLoading) {
    return (
      <section className="rounded-2xl bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
        Loading profile...
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={loadProfile}
          className="mt-3 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Retry
        </button>
      </section>
    );
  }

  return <UserInfoCard user={user} />;
}

export default ProfilePage;
