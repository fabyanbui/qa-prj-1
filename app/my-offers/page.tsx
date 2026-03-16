'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store/auth-context';
import { MarketplaceOffer, OfferStatus } from '@/types';

export default function MyOffersPage() {
  const { activeSession, isReady } = useAuth();
  const router = useRouter();
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [statusFilter, setStatusFilter] = useState<OfferStatus | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!activeSession) {
      router.push('/login');
    }
  }, [activeSession, isReady, router]);

  const loadMyOffers = useCallback(async () => {
    if (!isReady || !activeSession) return;

    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ accountId: activeSession.user.id });
      if (statusFilter !== 'ALL') params.set('status', statusFilter);

      const response = await fetch(`/api/my-offers?${params.toString()}`);
      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
        data: MarketplaceOffer[];
      };

      if (!response.ok || !payload.success) {
        setError(payload.message ?? 'Failed to load offers');
        return;
      }

      setOffers(payload.data);
    } catch (offerError) {
      console.error('Failed to load offers', offerError);
      setError('Failed to load offers');
    } finally {
      setIsLoading(false);
    }
  }, [activeSession, isReady, statusFilter]);

  useEffect(() => {
    void loadMyOffers();
  }, [loadMyOffers]);

  const withdrawOffer = async (offerId: string) => {
    if (!activeSession) return;

    setActionMessage('');
    const response = await fetch(`/api/offers/${offerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: activeSession.user.id,
        status: 'WITHDRAWN',
      }),
    });
    const payload = (await response.json()) as {
      success: boolean;
      message?: string;
    };

    if (!response.ok || !payload.success) {
      setActionMessage(payload.message ?? 'Failed to withdraw offer');
      return;
    }

    setActionMessage('Offer withdrawn.');
    await loadMyOffers();
  };

  if (!isReady || !activeSession) return null;

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">My Offers</h1>
      <p className="mt-1 text-gray-500">Track and manage all offers you submitted.</p>

      <div className="my-4 flex flex-wrap gap-2">
        {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              statusFilter === status
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {actionMessage && (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          {actionMessage}
        </p>
      )}

      {isLoading ? (
        <p className="rounded-lg border border-gray-200 bg-white p-4 text-gray-500">
          Loading your offers...
        </p>
      ) : error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</p>
      ) : offers.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-white p-4 text-gray-500">
          No offers found in this status.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {offers.map((offer) => (
            <div key={offer.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-lg font-semibold text-gray-900">{offer.request?.title ?? 'Request'}</h2>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  {offer.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{offer.message}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                <span className="rounded bg-amber-50 px-2 py-1 text-amber-700">
                  ${offer.price.toFixed(2)}
                </span>
                <span className="rounded bg-gray-100 px-2 py-1">
                  {offer.estimatedDeliveryDays} day(s)
                </span>
                <span className="rounded bg-gray-100 px-2 py-1">
                  Buyer {offer.request?.buyer.profile.displayName ?? 'Unknown'}
                </span>
                <span className="rounded bg-gray-100 px-2 py-1">
                  Request status {offer.request?.status ?? 'UNKNOWN'}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/requests/${offer.requestId}`}
                  className="rounded-md border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                >
                  Open request details
                </Link>
                {offer.status === 'PENDING' && (
                  <button
                    onClick={() => void withdrawOffer(offer.id)}
                    className="rounded-md bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-600"
                  >
                    Withdraw offer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
