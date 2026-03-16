'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store/auth-context';
import { MarketplaceNotification } from '@/types';

export default function NotificationsPage() {
  const { activeSession, isReady } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<MarketplaceNotification[]>([]);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    if (!activeSession) return;
    const response = await fetch(`/api/notifications?accountId=${encodeURIComponent(activeSession.user.id)}`);
    const payload = (await response.json()) as {
      success: boolean;
      message?: string;
      data?: MarketplaceNotification[];
    };

    if (!response.ok || !payload.success || !payload.data) {
      setError(payload.message ?? 'Failed to load notifications');
      return;
    }

    setNotifications(payload.data);
  };

  useEffect(() => {
    if (!isReady) {
      return;
    }
    if (!activeSession) {
      router.push('/login');
      return;
    }
    void loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession, isReady, router]);

  const markRead = async (notification: MarketplaceNotification) => {
    if (!activeSession) return;

    const response = await fetch(`/api/notifications/${notification.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: activeSession.user.id,
        read: true,
      }),
    });
    const payload = (await response.json()) as {
      success: boolean;
      message?: string;
    };
    if (!response.ok || !payload.success) {
      setError(payload.message ?? 'Failed to update notification');
      return;
    }
    await loadNotifications();
  };

  if (!isReady || !activeSession) return null;

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
      <p className="mt-1 text-gray-500">Event updates for offers, messages, and order changes.</p>

      {error && (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-6 space-y-3">
        {notifications.length === 0 ? (
          <p className="rounded-lg border border-gray-200 bg-white p-4 text-gray-500">
            No notifications yet.
          </p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl border p-4 shadow-sm ${
                notification.read ? 'border-gray-200 bg-white' : 'border-indigo-200 bg-indigo-50'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{notification.body}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => void markRead(notification)}
                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
