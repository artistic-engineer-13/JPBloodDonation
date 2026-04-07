const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString();
};

function NotificationList({ notifications, onMarkRead, isActionLoading }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="space-y-3">
        {notifications.map((notification) => {
          const isRead = notification.read === true;

          return (
            <article
              key={notification.id}
              className={`rounded-xl border p-4 ${isRead ? 'border-slate-200 bg-slate-50' : 'border-brand-200 bg-cyan-50'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                  <p className="mt-2 text-xs text-slate-500">{formatDateTime(notification.createdAt)}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${isRead ? 'bg-slate-200 text-slate-700' : 'bg-brand-100 text-brand-700'}`}
                  >
                    {isRead ? 'READ' : 'UNREAD'}
                  </span>

                  {!isRead ? (
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => onMarkRead(notification.id)}
                      className="rounded-md bg-brand-600 px-2 py-1 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-60"
                    >
                      Mark Read
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}

        {!notifications.length ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            No notifications yet.
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default NotificationList;
