import { useCallback, useEffect, useState } from 'react';

import { notificationApi } from '../../api/notificationApi';
import { useToast } from '../../components/common/ToastProvider';
import NotificationList from '../../components/notifications/NotificationList';

function NotificationsPage() {
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await notificationApi.getNotifications();
      setNotifications(response?.data?.data?.notifications || []);
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Failed to fetch notifications.';
      setError(message);
      showToast({ title: 'Notifications Error', message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (notificationId) => {
    setIsActionLoading(true);

    try {
      await notificationApi.markAsRead(notificationId);

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notificationId
            ? {
                ...item,
                read: true,
              }
            : item
        )
      );

      showToast({ title: 'Updated', message: 'Notification marked as read.', type: 'success' });
    } catch (requestError) {
      showToast({
        title: 'Update Failed',
        message: requestError?.response?.data?.message || 'Could not update notification.',
        type: 'error',
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-xl font-semibold text-slate-900">Notifications</h1>
        <p className="mt-1 text-sm text-slate-600">Track request updates and system alerts.</p>
      </section>

      {isLoading ? (
        <section className="rounded-2xl bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
          Loading notifications...
        </section>
      ) : null}

      {error && !isLoading ? (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={loadNotifications}
            className="mt-3 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Retry
          </button>
        </section>
      ) : null}

      {!isLoading && !error ? (
        <NotificationList
          notifications={notifications}
          onMarkRead={handleMarkRead}
          isActionLoading={isActionLoading}
        />
      ) : null}
    </div>
  );
}

export default NotificationsPage;
