import { useCallback, useEffect, useState } from 'react';

import { adminApi } from '../../api/adminApi';
import AdminUsersTable from '../../components/admin/AdminUsersTable';
import DataToolbar from '../../components/common/DataToolbar';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../components/common/ToastProvider';
import { exportRowsToCsv } from '../../utils/exportUtils';

const roleOptions = ['ALL', 'ADMIN', 'HOSPITAL', 'DONOR', 'BLOOD_REQUESTER'];

function UsersManagementPage() {
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    role: 'ALL',
    search: '',
    page: 1,
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = {};
      params.page = filters.page;
      params.limit = pagination.limit;
      if (filters.role !== 'ALL') {
        params.role = filters.role;
      }
      if (filters.search.trim()) {
        params.search = filters.search.trim();
      }

      const response = await adminApi.getUsers(params);
      setUsers(response?.data?.data?.users || []);
      setPagination(response?.data?.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Failed to load users.';
      setError(message);
      showToast({ title: 'Users Error', message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [filters.page, filters.role, filters.search, pagination.limit, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (user) => {
    setIsActionLoading(true);

    try {
      await adminApi.updateUserStatus(user._id, { isActive: !user.isActive });
      showToast({
        title: 'User Updated',
        message: `${user.fullName} is now ${user.isActive ? 'inactive' : 'active'}.`,
        type: 'success',
      });
      await fetchUsers();
    } catch (requestError) {
      showToast({
        title: 'Status Update Failed',
        message: requestError?.response?.data?.message || 'Could not update user status.',
        type: 'error',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    const shouldDelete = window.confirm(`Delete user ${user.fullName}? This cannot be undone.`);
    if (!shouldDelete) {
      return;
    }

    setIsActionLoading(true);

    try {
      await adminApi.deleteUser(user._id);
      showToast({
        title: 'User Deleted',
        message: `${user.fullName} has been removed.`,
        type: 'success',
      });
      await fetchUsers();
    } catch (requestError) {
      showToast({
        title: 'Delete Failed',
        message: requestError?.response?.data?.message || 'Could not delete user.',
        type: 'error',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleExportCsv = () => {
    exportRowsToCsv({
      filename: 'users-report.csv',
      columns: [
        { label: 'Name', value: 'fullName' },
        { label: 'Email', value: 'email' },
        { label: 'Role', value: 'role' },
        { label: 'Status', value: (row) => (row.isActive ? 'ACTIVE' : 'INACTIVE') },
        { label: 'Phone', value: 'phone' },
      ],
      rows: users,
    });
  };

  return (
    <div className="space-y-4">
      <DataToolbar
        title="User Management"
        description="Search users, filter by role, activate/deactivate, and delete."
        searchValue={filters.search}
        onSearchChange={(value) => setFilters((prev) => ({ ...prev, search: value, page: 1 }))}
        searchPlaceholder="Search by name, email, phone..."
        filters={[
          {
            key: 'role',
            label: 'Role',
            value: filters.role,
            onChange: (value) => setFilters((prev) => ({ ...prev, role: value, page: 1 })),
            options: roleOptions.map((role) => ({ value: role, label: role })),
          },
        ]}
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

      {isLoading ? <LoadingSkeleton rows={8} /> : null}
      {!isLoading && error ? <ErrorState message={error} onRetry={fetchUsers} /> : null}

      {!isLoading && !error && users.length ? (
        <AdminUsersTable
          users={users}
          onToggleStatus={handleToggleStatus}
          onDeleteUser={handleDeleteUser}
          isActionLoading={isActionLoading}
        />
      ) : null}

      {!isLoading && !error && !users.length ? (
        <EmptyState title="No users found" message="Try changing role or search filters." />
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

export default UsersManagementPage;
