import { useCallback, useEffect, useState } from 'react';

import { adminApi } from '../../api/adminApi';
import StatusBadge from '../../components/common/StatusBadge';
import RequestActionButtons from '../../components/admin/RequestActionButtons';
import DataToolbar from '../../components/common/DataToolbar';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../components/common/ToastProvider';
import { exportRowsToCsv } from '../../utils/exportUtils';

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return date.toLocaleDateString();
};

function BloodRequestsManagementPage() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: 'ALL', search: '', page: 1 });

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = {};
      params.page = filters.page;
      params.limit = pagination.limit;
      if (filters.status !== 'ALL') {
        params.status = filters.status;
      }
      if (filters.search.trim()) {
        params.search = filters.search.trim();
      }

      const response = await adminApi.getBloodRequests(params);
      setRequests(response?.data?.data?.requests || []);
      setPagination(response?.data?.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (error) {
      setError(error?.response?.data?.message || 'Failed to fetch blood requests.');
      showToast({
        title: 'Blood Requests Error',
        message: error?.response?.data?.message || 'Failed to fetch blood requests.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters.page, filters.search, filters.status, pagination.limit, showToast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const onApprove = async (id) => {
    setIsActionLoading(true);
    try {
      await adminApi.approveBloodRequest(id);
      showToast({ title: 'Request Approved', message: 'Blood request approved.', type: 'success' });
      await fetchRequests();
    } catch (error) {
      showToast({
        title: 'Approval Failed',
        message: error?.response?.data?.message || 'Failed to approve blood request.',
        type: 'error',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const onReject = async (id) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason || !reason.trim()) {
      showToast({ title: 'Reason Required', message: 'Rejection reason is required.', type: 'info' });
      return;
    }

    setIsActionLoading(true);
    try {
      await adminApi.rejectBloodRequest(id, { reason: reason.trim() });
      showToast({ title: 'Request Rejected', message: 'Blood request rejected.', type: 'success' });
      await fetchRequests();
    } catch (error) {
      showToast({
        title: 'Rejection Failed',
        message: error?.response?.data?.message || 'Failed to reject blood request.',
        type: 'error',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const onExportCsv = () => {
    exportRowsToCsv({
      filename: 'blood-requests-report.csv',
      columns: [
        { label: 'Requester', value: (row) => row.requesterName || row?.requester?.fullName || '-' },
        { label: 'Blood Group', value: 'bloodGroup' },
        { label: 'Units', value: 'units' },
        { label: 'Hospital', value: (row) => row?.hospital?.name || '-' },
        { label: 'Urgency', value: 'urgency' },
        { label: 'Status', value: 'status' },
      ],
      rows: requests,
    });
  };

  return (
    <div className="space-y-4">
      <DataToolbar
        title="Blood Requests Management"
        description="Review and process blood requests with quick filter and export options."
        searchValue={filters.search}
        onSearchChange={(value) => setFilters((prev) => ({ ...prev, search: value, page: 1 }))}
        searchPlaceholder="Search by requester, blood group, hospital"
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: filters.status,
            onChange: (value) => setFilters((prev) => ({ ...prev, status: value, page: 1 })),
            options: [
              { value: 'ALL', label: 'ALL' },
              { value: 'PENDING', label: 'PENDING' },
              { value: 'APPROVED', label: 'APPROVED' },
              { value: 'REJECTED', label: 'REJECTED' },
            ],
          },
        ]}
        actions={
          <button
            type="button"
            onClick={onExportCsv}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Export CSV
          </button>
        }
      />

      {isLoading ? <LoadingSkeleton rows={9} /> : null}
      {!isLoading && error ? <ErrorState message={error} onRetry={fetchRequests} /> : null}

      {!isLoading && !error && requests.length ? (
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-2">Requester</th>
                  <th className="px-3 py-2">Blood Group</th>
                  <th className="px-3 py-2">Units</th>
                  <th className="px-3 py-2">Hospital</th>
                  <th className="px-3 py-2">Urgency</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Note</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td className="px-3 py-2 font-medium">{request.requesterName || request?.requester?.fullName || '-'}</td>
                    <td className="px-3 py-2">{request.bloodGroup}</td>
                    <td className="px-3 py-2">{request.units}</td>
                    <td className="px-3 py-2">{request?.hospital?.name || '-'}</td>
                    <td className="px-3 py-2">{request.urgency || '-'}</td>
                    <td className="px-3 py-2">{formatDate(request.requiredOn)}</td>
                    <td className="px-3 py-2"><StatusBadge status={request.status} /></td>
                    <td className="px-3 py-2">{request.reason || '-'}</td>
                    <td className="px-3 py-2">
                      {request.status === 'PENDING' ? (
                        <RequestActionButtons
                          rowId={request._id}
                          onApprove={onApprove}
                          onReject={onReject}
                          isActionLoading={isActionLoading}
                        />
                      ) : (
                        <span className="text-xs text-slate-500">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!isLoading && !error && !requests.length ? (
        <EmptyState title="No blood requests found" message="Try changing status or search filters." />
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

export default BloodRequestsManagementPage;
