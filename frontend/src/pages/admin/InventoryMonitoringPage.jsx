import { useCallback, useEffect, useState } from 'react';

import { adminApi } from '../../api/adminApi';
import DataToolbar from '../../components/common/DataToolbar';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../components/common/ToastProvider';
import { exportRowsToCsv } from '../../utils/exportUtils';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function InventoryMonitoringPage() {
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ search: '', page: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInventory = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await adminApi.getInventory({
        page: filters.page,
        limit: pagination.limit,
        search: filters.search.trim() || undefined,
      });
      setRows(response?.data?.data?.hospitals || []);
      setPagination(response?.data?.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (error) {
      setError(error?.response?.data?.message || 'Failed to fetch inventory data.');
      showToast({
        title: 'Inventory Error',
        message: error?.response?.data?.message || 'Failed to fetch inventory data.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters.page, filters.search, pagination.limit, showToast]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleExportCsv = () => {
    exportRowsToCsv({
      filename: 'inventory-monitoring.csv',
      columns: [
        { label: 'Hospital', value: (row) => `${row.name || '-'} ${row.code ? `(${row.code})` : ''}`.trim() },
        ...BLOOD_GROUPS.map((group) => ({
          label: group,
          value: (row) => Number(row?.inventory?.[group]) || 0,
        })),
      ],
      rows,
    });
  };

  return (
    <div className="space-y-4">
      <DataToolbar
        title="Inventory Monitoring"
        description="Live inventory snapshots for all hospitals."
        searchValue={filters.search}
        onSearchChange={(value) => setFilters((prev) => ({ ...prev, search: value, page: 1 }))}
        searchPlaceholder="Search by hospital name or code"
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

      {isLoading ? <LoadingSkeleton rows={6} /> : null}
      {!isLoading && error ? <ErrorState message={error} onRetry={loadInventory} /> : null}

      {!isLoading && !error && rows.length ? (
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-2">Hospital</th>
                  {BLOOD_GROUPS.map((group) => (
                    <th key={group} className="px-3 py-2">
                      {group}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {rows.map((row) => (
                  <tr key={row._id}>
                    <td className="px-3 py-2 font-medium">
                      {row.name} {row.code ? `(${row.code})` : ''}
                    </td>
                    {BLOOD_GROUPS.map((group) => (
                      <td key={`${row._id}-${group}`} className="px-3 py-2">
                        {Number(row?.inventory?.[group]) || 0}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!isLoading && !error && !rows.length ? (
        <EmptyState title="No inventory data found" message="Try changing the search filter." />
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

export default InventoryMonitoringPage;
