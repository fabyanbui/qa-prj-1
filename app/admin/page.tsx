'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store/auth-context';

interface AdminUser {
  id: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED';
  isAdmin: boolean;
  profile?: {
    displayName: string;
  } | null;
}

interface AdminRequest {
  id: string;
  title: string;
  status: string;
  buyer: {
    profile?: {
      displayName: string;
    } | null;
  };
}

interface AdminReview {
  id: string;
  rating: number;
  comment?: string | null;
  reviewer: {
    profile?: {
      displayName: string;
    } | null;
  };
  reviewee: {
    profile?: {
      displayName: string;
    } | null;
  };
}

export default function AdminPage() {
  const { activeSession, isReady } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [error, setError] = useState('');

  const loadAdminData = async () => {
    if (!activeSession) return;
    const adminId = activeSession.user.id;
    const [usersRes, requestsRes, reviewsRes] = await Promise.all([
      fetch(`/api/admin/users?adminId=${encodeURIComponent(adminId)}`),
      fetch(`/api/admin/requests?adminId=${encodeURIComponent(adminId)}`),
      fetch(`/api/admin/reviews?adminId=${encodeURIComponent(adminId)}`),
    ]);

    const usersPayload = (await usersRes.json()) as {
      success: boolean;
      message?: string;
      data?: AdminUser[];
    };
    const requestsPayload = (await requestsRes.json()) as {
      success: boolean;
      message?: string;
      data?: AdminRequest[];
    };
    const reviewsPayload = (await reviewsRes.json()) as {
      success: boolean;
      message?: string;
      data?: AdminReview[];
    };

    if (!usersRes.ok || !usersPayload.success || !usersPayload.data) {
      setError(usersPayload.message ?? 'Failed to load admin users');
      return;
    }
    if (!requestsRes.ok || !requestsPayload.success || !requestsPayload.data) {
      setError(requestsPayload.message ?? 'Failed to load admin requests');
      return;
    }
    if (!reviewsRes.ok || !reviewsPayload.success || !reviewsPayload.data) {
      setError(reviewsPayload.message ?? 'Failed to load admin reviews');
      return;
    }

    setUsers(usersPayload.data);
    setRequests(requestsPayload.data);
    setReviews(reviewsPayload.data);
  };

  useEffect(() => {
    if (!isReady) {
      return;
    }
    if (!activeSession) {
      router.push('/login');
      return;
    }
    if (!activeSession.user.isAdmin) {
      router.push('/');
      return;
    }

    void loadAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession, isReady, router]);

  const toggleSuspend = async (user: AdminUser) => {
    if (!activeSession) return;
    const targetStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const response = await fetch(`/api/admin/users/${user.id}/suspend`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminId: activeSession.user.id,
        status: targetStatus,
      }),
    });
    const payload = (await response.json()) as {
      success: boolean;
      message?: string;
    };
    if (!response.ok || !payload.success) {
      setError(payload.message ?? 'Failed to update account status');
      return;
    }
    await loadAdminData();
  };

  const moderateRequest = async (requestId: string) => {
    if (!activeSession) return;
    const response = await fetch(`/api/admin/requests/${requestId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminId: activeSession.user.id,
      }),
    });
    const payload = (await response.json()) as {
      success: boolean;
      message?: string;
    };
    if (!response.ok || !payload.success) {
      setError(payload.message ?? 'Failed to moderate request');
      return;
    }
    await loadAdminData();
  };

  const deleteReview = async (reviewId: string) => {
    if (!activeSession) return;
    const response = await fetch(`/api/admin/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminId: activeSession.user.id,
      }),
    });
    const payload = (await response.json()) as {
      success: boolean;
      message?: string;
    };
    if (!response.ok || !payload.success) {
      setError(payload.message ?? 'Failed to remove review');
      return;
    }
    await loadAdminData();
  };

  if (!isReady || !activeSession) return null;

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="mt-1 text-gray-500">Moderate users, requests, and reviews.</p>

      {error && (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Accounts</h2>
        <div className="mt-3 space-y-2">
          {users.map((user) => (
            <div key={user.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-gray-200 p-3 text-sm">
              <div>
                <p className="font-semibold">{user.profile?.displayName ?? user.email}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={() => void toggleSuspend(user)}
                disabled={user.isAdmin}
                className="rounded-md bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-600 disabled:opacity-50"
              >
                {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Requests</h2>
        <div className="mt-3 space-y-2">
          {requests.map((request) => (
            <div key={request.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-gray-200 p-3 text-sm">
              <div>
                <p className="font-semibold">{request.title}</p>
                <p className="text-xs text-gray-500">
                  {request.buyer.profile?.displayName ?? 'Unknown buyer'} · {request.status}
                </p>
              </div>
              <button
                onClick={() => void moderateRequest(request.id)}
                className="rounded-md bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-600"
              >
                Remove / Cancel
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Reviews</h2>
        <div className="mt-3 space-y-2">
          {reviews.map((review) => (
            <div key={review.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-gray-200 p-3 text-sm">
              <div>
                <p className="font-semibold">
                  {review.reviewer.profile?.displayName ?? 'Unknown'} →{' '}
                  {review.reviewee.profile?.displayName ?? 'Unknown'} ({review.rating}/5)
                </p>
                <p className="text-xs text-gray-500">{review.comment || 'No comment'}</p>
              </div>
              <button
                onClick={() => void deleteReview(review.id)}
                className="rounded-md bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-600"
              >
                Delete review
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
