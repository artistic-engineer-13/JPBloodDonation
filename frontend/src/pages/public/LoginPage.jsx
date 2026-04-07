import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { clearAuthError, loginUser } from '../../store/slices/authSlice';
import { getDashboardPathByRole } from '../../utils/authRouting';

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [localError, setLocalError] = useState('');

  const onChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));

    setLocalError('');
    dispatch(clearAuthError());
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      setLocalError('Email and password are required.');
      return;
    }

    try {
      const payload = await dispatch(
        loginUser({
          email: form.email.trim(),
          password: form.password,
        })
      ).unwrap();

      navigate(getDashboardPathByRole(payload?.user?.role), { replace: true });
    } catch (requestError) {
      // Error state is managed by Redux for consistent UI messaging.
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
      <h1 className="text-2xl font-semibold text-slate-900">Login</h1>
      <p className="mt-2 text-sm text-slate-600">Access your role-based dashboard securely.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-300 focus:ring"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-300 focus:ring"
            placeholder="Enter your password"
          />
        </label>

        {localError ? <p className="text-sm text-red-600">{localError}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        New user?{' '}
        <Link to="/register" className="font-medium text-brand-700 hover:underline">
          Create an account
        </Link>
      </p>
    </section>
  );
}

export default LoginPage;
