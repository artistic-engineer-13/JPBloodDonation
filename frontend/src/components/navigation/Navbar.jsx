import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { clearAuthState } from '../../store/slices/authSlice';

function Navbar() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-40 border-b border-red-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-brand-700">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            B+
          </span>
          JP Blood Donation
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700 sm:gap-4">
          <Link to="/about" className="rounded-md px-2 py-1 hover:bg-brand-50 hover:text-brand-700">About</Link>
          <Link to="/contact" className="rounded-md px-2 py-1 hover:bg-brand-50 hover:text-brand-700">Contact</Link>

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="rounded-md px-2 py-1 hover:bg-brand-50 hover:text-brand-700">Login</Link>
              <Link
                to="/register"
                className="rounded-lg bg-brand-600 px-3 py-2 text-white shadow-soft hover:bg-brand-700"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link to="/profile" className="rounded-md px-2 py-1 hover:bg-brand-50 hover:text-brand-700">{user?.name || 'Profile'}</Link>
              <button
                type="button"
                className="rounded-lg border border-red-200 px-3 py-2 hover:bg-red-50"
                onClick={() => dispatch(clearAuthState())}
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
