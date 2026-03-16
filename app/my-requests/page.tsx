'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store/auth-context';
import { MarketplaceRequest, RequestStatus } from '@/types';

export default function MyRequestsPage() {
  const { activeSession, isReady } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<MarketplaceRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!activeSession) {
      router.push('/login');
      return;
    }
    if (!activeSession.user.roles.includes('BUYER')) {
      router.push('/');
    }
  }, [activeSession, isReady, router]);

  useEffect(() => {
    const loadMyRequests = async () => {
      if (!isReady || !activeSession) return;

      setIsLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ buyerId: activeSession.user.id });
        if (statusFilter !== 'ALL') params.set('status', statusFilter);

        const response = await fetch(`/api/my-requests?${params.toString()}`);
        const payload = (await response.json()) as {
          success: boolean;
          message?: string;
          data: MarketplaceRequest[];
        };

        if (!response.ok || !payload.success) {
          setError(payload.message ?? 'Failed to load requests');
          return;
        }

        setRequests(payload.data);
      } catch (requestError) {
        console.error('Failed to load my requests', requestError);
        setError('Failed to load requests');
      } finally {
        setIsLoading(false);
      }
    };

    void loadMyRequests();
  }, [activeSession, isReady, statusFilter]);

  if (!isReady || !activeSession) return null;

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
          <p className="mt-1 text-gray-500">Track offers and accept the best one.</p>
        </div>
        <Link
          href="/requests/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          New request
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(['ALL', 'OPEN', 'FULFILLED', 'CLOSED', 'EXPIRED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              statusFilter === status
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="rounded-lg border border-gray-200 bg-white p-4 text-gray-500">
          Loading your requests...
        </p>
      ) : error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</p>
      ) : requests.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-white p-4 text-gray-500">
          You have no requests in this status.
        </p>
      ) : (
        <div className="space-y-4">
          {requests.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-xl font-semibold text-gray-900">{item.title}</h2>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  {item.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{item.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className="rounded bg-indigo-50 px-2 py-1 text-indigo-700">
                  Budget ${item.budget.toFixed(2)}
                </span>
                <span className="rounded bg-gray-100 px-2 py-1">{item.category}</span>
                <span className="rounded bg-gray-100 px-2 py-1">{item.location}</span>
                <span className="rounded bg-gray-100 px-2 py-1">
                  {item._count?.offers ?? 0} offers
                </span>
              </div>
              <div className="mt-4">
                <Link
                  href={`/requests/${item.id}`}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  View request details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
