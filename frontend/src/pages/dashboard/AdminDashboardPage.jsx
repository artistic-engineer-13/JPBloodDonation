import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { adminApi } from '../../api/adminApi';
import AdminAnalyticsCards from '../../components/admin/AdminAnalyticsCards';
import AdminRequestChart from '../../components/admin/AdminRequestChart';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import { useToast } from '../../components/common/ToastProvider';

const initialAnalytics = {
  totalUsers: 0,
  totalDonors: 0,
  totalRequesters: 0,
  totalHospitals: 0,
  totalDonationRequests: 0,
  totalBloodRequests: 0,
  approvedCount: 0,
  pendingCount: 0,
  rejectedCount: 0,
};

const shortcuts = [
  { to: '/admin/users', label: 'Manage Users' },
  { to: '/admin/hospitals', label: 'Manage Hospitals' },
  { to: '/admin/donor-requests', label: 'Donor Requests' },
  { to: '/admin/blood-requests', label: 'Blood Requests' },
  { to: '/admin/inventory', label: 'Inventory Monitoring' },
  { to: '/admin/donor-inventories', label: 'Donor Inventories' },
];

function AdminDashboardPage() {
  const { showToast } = useToast();
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await adminApi.getDashboard();
      setAnalytics(response?.data?.data || initialAnalytics);
    } catch (error) {
      setError(error?.response?.data?.message || 'Failed to fetch dashboard analytics.');
      showToast({
        title: 'Dashboard Error',
        message: error?.response?.data?.message || 'Failed to fetch dashboard analytics.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-xl font-semibold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">System analytics and quick actions.</p>
      </section>

      {isLoading ? <LoadingSkeleton rows={5} /> : null}
      {!isLoading && error ? <ErrorState message={error} onRetry={loadDashboard} /> : null}

      {!isLoading && !error ? (
        <>
        <AdminAnalyticsCards analytics={analytics} />
        <AdminRequestChart analytics={analytics} />
        </>
      ) : null}

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Admin Sections</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {shortcuts.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardPage;
