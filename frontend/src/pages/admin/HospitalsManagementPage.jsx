import { useCallback, useEffect, useState } from 'react';

import { adminApi } from '../../api/adminApi';
import DataToolbar from '../../components/common/DataToolbar';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../components/common/ToastProvider';
import { exportRowsToCsv } from '../../utils/exportUtils';

const sumInventory = (inventory = {}) => Object.values(inventory).reduce((sum, unit) => sum + (Number(unit) || 0), 0);

function HospitalsManagementPage() {
  const { showToast } = useToast();
  const [hospitals, setHospitals] = useState([]);
  const [activityMap, setActivityMap] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ search: '', page: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHospitals = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await adminApi.getHospitals({
        page: filters.page,
        limit: pagination.limit,
        search: filters.search.trim() || undefined,
      });
      setHospitals(response?.data?.data?.hospitals || []);
      setPagination(response?.data?.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (error) {
      setError(error?.response?.data?.message || 'Failed to fetch hospitals.');
      showToast({
        title: 'Hospitals Error',
        message: error?.response?.data?.message || 'Failed to fetch hospitals.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters.page, filters.search, pagination.limit, showToast]);

  useEffect(() => {
    loadHospitals();
  }, [loadHospitals]);

  const handleViewActivity = async (hospitalId) => {
    try {
      const response = await adminApi.getHospitalActivity(hospitalId);
      setActivityMap((prev) => ({ ...prev, [hospitalId]: response?.data?.data?.activity || null }));
    } catch (error) {
      showToast({
        title: 'Activity Error',
        message: error?.response?.data?.message || 'Failed to fetch hospital activity.',
        type: 'error',
      });
    }
  };

  const handleExportCsv = () => {
    exportRowsToCsv({
      filename: 'hospitals-report.csv',
      columns: [
        { label: 'Hospital', value: 'name' },
        { label: 'Code', value: 'code' },
        { label: 'Status', value: (row) => (row.isActive ? 'ACTIVE' : 'INACTIVE') },
        { label: 'Total Inventory', value: (row) => sumInventory(row.inventory) },
      ],
      rows: hospitals,
    });
  };

  return (
    <div className="space-y-4">
      <DataToolbar
        title="Hospital Management"
        description="View all hospitals, inventory totals, and request activity."
        searchValue={filters.search}
        onSearchChange={(value) => setFilters((prev) => ({ ...prev, search: value, page: 1 }))}
        searchPlaceholder="Search by hospital name, code, registration number"
        actions={
          <button
            type="button"
            onClick={handleExportCsv}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Export CSV
          </button>
        }
      />

      {isLoading ? <LoadingSkeleton rows={7} /> : null}
      {!isLoading && error ? <ErrorState message={error} onRetry={loadHospitals} /> : null}

      {!isLoading && !error && hospitals.length ? (
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-2">Hospital</th>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Total Inventory</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {hospitals.map((hospital) => {
                  const activity = activityMap[hospital._id];

                  return (
                    <tr key={hospital._id}>
                      <td className="px-3 py-2 font-medium">{hospital.name}</td>
                      <td className="px-3 py-2">{hospital.code || '-'}</td>
                      <td className="px-3 py-2">{hospital.isActive ? 'ACTIVE' : 'INACTIVE'}</td>
                      <td className="px-3 py-2">{sumInventory(hospital.inventory)}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => handleViewActivity(hospital._id)}
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-100"
                        >
                          View Activity
                        </button>

                        {activity ? (
                          <div className="mt-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                            Donor: {activity?.donationRequests?.total || 0} | Blood: {activity?.bloodRequests?.total || 0}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!isLoading && !error && !hospitals.length ? (
        <EmptyState title="No hospitals found" message="Try changing the search filter." />
      ) : null}

      {!isLoading && !error ? (
        <Pagination
          pagination={pagination}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        />
      ) : null}
    </div>
  );
}

export default HospitalsManagementPage;
