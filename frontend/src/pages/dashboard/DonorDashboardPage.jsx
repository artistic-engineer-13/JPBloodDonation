import { useCallback, useEffect, useMemo, useState } from 'react';

import { donorApi } from '../../api/donorApi';
import DonorOverviewCards from '../../components/donor/DonorOverviewCards';
import DonorRequestForm from '../../components/donor/DonorRequestForm';
import DonorRequestsTable from '../../components/donor/DonorRequestsTable';
import { useToast } from '../../components/common/ToastProvider';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

function DonorDashboardPage() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [inventory, setInventory] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);

    try {
      const [requestsResponse, hospitalsResponse, inventoryResponse] = await Promise.all([
        donorApi.getMyRequests(),
        donorApi.getHospitals(),
        donorApi.getMyInventory(),
      ]);
      setRequests(requestsResponse?.data?.data?.requests || []);
      setHospitals(hospitalsResponse?.data?.data?.hospitals || []);
      setInventory(inventoryResponse?.data?.data?.inventory || {});
    } catch (error) {
      showToast({
        title: 'Failed to load requests',
        message: error?.response?.data?.message || 'Unable to fetch donor requests.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const summary = useMemo(() => {
    return requests.reduce(
      (acc, item) => {
        acc.totalRequests += 1;
        acc.totalUnits += Number(item.units) || 0;

        if (item.status === 'PENDING') {
          acc.pendingCount += 1;
        }

        if (item.status === 'APPROVED') {
          acc.approvedCount += 1;
          acc.approvedUnits += Number(item.units) || 0;
        }

        if (item.status === 'REJECTED') {
          acc.rejectedCount += 1;
        }

        return acc;
      },
      {
        totalRequests: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        totalUnits: 0,
        approvedUnits: 0,
      }
    );
  }, [requests]);

  const hospitalOptions = useMemo(() => {
    const map = new Map();

    hospitals.forEach((hospital) => {
      if (!hospital?._id || !hospital?.name) {
        return;
      }

      map.set(hospital._id, {
        id: hospital._id,
        name: hospital.name,
        code: hospital.code || '',
      });
    });

    requests.forEach((item) => {
      const id = item?.hospital?._id;
      if (!id) {
        return;
      }

      if (!map.has(id)) {
        map.set(id, {
          id,
          name: item?.hospital?.name || 'Unknown',
          code: item?.hospital?.code || '',
        });
      }
    });

    return Array.from(map.values());
  }, [hospitals, requests]);

  const submitDonationRequest = async (payload) => {
    setIsSubmitting(true);

    try {
      await donorApi.createRequest(payload);

      showToast({
        title: 'Request Submitted',
        message: 'Your donation request was created and is now pending admin review.',
        type: 'success',
      });

      await loadRequests();
      return true;
    } catch (error) {
      showToast({
        title: 'Submission Failed',
        message: error?.response?.data?.message || 'Unable to create donation request.',
        type: 'error',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <DonorOverviewCards summary={summary} inventory={inventory} />

      <DonorRequestForm
        isSubmitting={isSubmitting}
        onSubmit={submitDonationRequest}
        previousHospitals={hospitalOptions}
      />

      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : (
        <DonorRequestsTable requests={requests} />
      )}
    </div>
  );
}

export default DonorDashboardPage;
