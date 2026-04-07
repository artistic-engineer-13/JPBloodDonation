import { useCallback, useEffect, useState } from 'react';

import { hospitalApi } from '../../api/hospitalApi';
import { useToast } from '../../components/common/ToastProvider';
import HospitalOverviewCards from '../../components/hospital/HospitalOverviewCards';
import HospitalInventoryGrid from '../../components/hospital/HospitalInventoryGrid';
import HospitalDonorRequestsTable from '../../components/hospital/HospitalDonorRequestsTable';
import HospitalBloodRequestsTable from '../../components/hospital/HospitalBloodRequestsTable';
import HospitalRequestChart from '../../components/hospital/HospitalRequestChart';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';

const initialOverview = {
  totalBloodInventory: 0,
  totalDonorRequests: 0,
  totalBloodRequests: 0,
  approvedRequests: 0,
  pendingRequests: 0,
  rejectedRequests: 0,
};

function HospitalDashboardPage() {
  const { showToast } = useToast();

  const [overview, setOverview] = useState(initialOverview);
  const [inventory, setInventory] = useState({});
  const [donorRequests, setDonorRequests] = useState([]);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHospitalDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [dashboardResponse, inventoryResponse, requestsResponse] = await Promise.all([
        hospitalApi.getDashboard(),
        hospitalApi.getInventory(),
        hospitalApi.getRequests(),
      ]);

      setOverview(dashboardResponse?.data?.data?.overview || initialOverview);
      setInventory(inventoryResponse?.data?.data?.inventory || {});
      setDonorRequests(requestsResponse?.data?.data?.donorRequests || []);
      setBloodRequests(requestsResponse?.data?.data?.bloodRequests || []);
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Failed to load hospital dashboard data.';
      setError(message);
      showToast({
        title: 'Hospital Dashboard Error',
        message,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadHospitalDashboard();
  }, [loadHospitalDashboard]);

  if (isLoading) {
    return <LoadingSkeleton rows={7} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadHospitalDashboard} />;
  }

  return (
    <div className="space-y-5">
      <HospitalOverviewCards overview={overview} />
      <HospitalRequestChart overview={overview} />
      <HospitalInventoryGrid inventory={inventory} />
      <HospitalDonorRequestsTable requests={donorRequests} />
      <HospitalBloodRequestsTable requests={bloodRequests} />
    </div>
  );
}

export default HospitalDashboardPage;
