import { useCallback, useEffect, useState } from 'react';

import { adminApi } from '../../api/adminApi';
import DataToolbar from '../../components/common/DataToolbar';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../components/common/ToastProvider';

const ACTION_OPTIONS = [
  { value: 'ALL', label: 'ALL' },
  { value: 'CREATE', label: 'CREATE' },
  { value: 'UPDATE', label: 'UPDATE' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'APPROVE_DONATION', label: 'APPROVE_DONATION' },
  { value: 'REJECT_DONATION', label: 'REJECT_DONATION' },
  { value: 'APPROVE_BLOOD_REQUEST', label: 'APPROVE_BLOOD_REQUEST' },
  { value: 'REJECT_BLOOD_REQUEST', label: 'REJECT_BLOOD_REQUEST' },
];

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return date.toLocaleString();
};

function AuditLogsPage() {
  const { showToast } = useToast();

  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ search: '', action: 'ALL', page: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = useCallback(async () => {
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
      if (filters.action !== 'ALL') {
        params.action = filters.action;
      }

      const response = await adminApi.getAuditLogs(params);
      setLogs(response?.data?.data?.logs || []);
      setPagination(response?.data?.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Failed to load audit logs.';
      setError(message);
      showToast({ title: 'Audit Logs Error', message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [filters.action, filters.page, filters.search, pagination.limit, showToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-4">
      <DataToolbar
        title="Audit Logs"
        description="Track sensitive admin actions and processing history."
        searchValue={filters.search}
        onSearchChange={(value) => setFilters((prev) => ({ ...prev, search: value, page: 1 }))}
        searchPlaceholder="Search by description, entity type, request id"
        filters={[
          {
            key: 'action',
            label: 'Action',
            value: filters.action,
            onChange: (value) => setFilters((prev) => ({ ...prev, action: value, page: 1 })),
            options: ACTION_OPTIONS,
          },
        ]}
      />

      {isLoading ? <LoadingSkeleton rows={8} /> : null}
      {!isLoading && error ? <ErrorState message={error} onRetry={fetchLogs} /> : null}

      {!isLoading && !error && logs.length ? (
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Action</th>
                  <th className="px-3 py-2">Actor</th>
                  <th className="px-3 py-2">Entity</th>
                  <th className="px-3 py-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td className="px-3 py-2">{formatDateTime(log.createdAt)}</td>
                    <td className="px-3 py-2 font-medium">{log.action}</td>
                    <td className="px-3 py-2">{log?.actor?.fullName || log?.actor?.email || 'System'}</td>
                    <td className="px-3 py-2">{log.entityType}</td>
                    <td className="px-3 py-2">{log.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!isLoading && !error && !logs.length ? (
        <EmptyState title="No audit logs found" message="Try adjusting the action filter or search term." />
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

export default AuditLogsPage;
