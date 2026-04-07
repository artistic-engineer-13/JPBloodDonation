import { useCallback, useEffect, useState } from 'react';

import { adminApi } from '../../api/adminApi';
import DataToolbar from '../../components/common/DataToolbar';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { useToast } from '../../components/common/ToastProvider';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function DonorInventoriesPage() {
  const { showToast } = useToast();
  const [donors, setDonors] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ search: '', bloodGroup: 'ALL', page: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDonorInventories = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = {
        page: filters.page,
        limit: pagination.limit,
      };

      if (filters.search.trim()) {
        params.search = filters.search.trim();
      }

      if (filters.bloodGroup !== 'ALL') {
        params.bloodGroup = filters.bloodGroup;
      }

      const response = await adminApi.getDonorInventories(params);
      setDonors(response?.data?.data?.donors || []);
      setPagination(response?.data?.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Failed to fetch donor inventories.';
      setError(message);
      showToast({ title: 'Inventory Error', message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [filters.bloodGroup, filters.page, filters.search, pagination.limit, showToast]);

  useEffect(() => {
    loadDonorInventories();
  }, [loadDonorInventories]);

  return (
    <div className="space-y-4">
      <DataToolbar
        title="Donor Inventories"
        description="Monitor donor-side inventory balances by blood group."
        searchValue={filters.search}
        onSearchChange={(value) => setFilters((prev) => ({ ...prev, search: value, page: 1 }))}
        searchPlaceholder="Search donor by name, email, phone"
        filters={[
          {
            key: 'bloodGroup',
            label: 'Blood Group',
            value: filters.bloodGroup,
            onChange: (value) => setFilters((prev) => ({ ...prev, bloodGroup: value, page: 1 })),
            options: [{ value: 'ALL', label: 'ALL' }, ...BLOOD_GROUPS.map((group) => ({ value: group, label: group }))],
          },
        ]}
      />

      {isLoading ? <LoadingSkeleton rows={8} /> : null}
      {!isLoading && error ? <ErrorState message={error} onRetry={loadDonorInventories} /> : null}

      {!isLoading && !error && donors.length ? (
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-2">Donor</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Blood Group</th>
                  <th className="px-3 py-2">Total Units</th>
                  {BLOOD_GROUPS.map((group) => (
                    <th key={group} className="px-3 py-2">{group}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {donors.map((donor) => (
                  <tr key={donor._id}>
                    <td className="px-3 py-2 font-medium">{donor.fullName || '-'}</td>
                    <td className="px-3 py-2">{donor.email || '-'}</td>
                    <td className="px-3 py-2">{donor.bloodGroup || '-'}</td>
                    <td className="px-3 py-2 font-semibold">{donor.totalUnits || 0}</td>
                    {BLOOD_GROUPS.map((group) => (
                      <td key={`${donor._id}-${group}`} className="px-3 py-2">{Number(donor?.inventory?.[group]) || 0}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!isLoading && !error && !donors.length ? (
        <EmptyState title="No donor inventory records found" message="Try different filters or add donor inventory first." />
      ) : null}

      {!isLoading && !error ? (
        <Pagination pagination={pagination} onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))} />
      ) : null}
    </div>
  );
}

export default DonorInventoriesPage;
