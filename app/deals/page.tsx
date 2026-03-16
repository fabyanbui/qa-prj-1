'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store/auth-context';
import { DealStatus, MarketplaceDeal } from '@/types';

export default function DealsPage() {
  const { activeSession, isReady } = useAuth();
  const router = useRouter();
  const [deals, setDeals] = useState<MarketplaceDeal[]>([]);
  const [statusFilter, setStatusFilter] = useState<DealStatus | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!activeSession) {
      router.push('/login');
    }
  }, [activeSession, isReady, router]);

  useEffect(() => {
    const loadDeals = async () => {
      if (!isReady || !activeSession) return;

      setIsLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ userId: activeSession.user.id });
        if (statusFilter !== 'ALL') params.set('status', statusFilter);

        const response = await fetch(`/api/deals?${params.toString()}`);
        const payload = (await response.json()) as {
          success: boolean;
          message?: string;
          data: MarketplaceDeal[];
        };

        if (!response.ok || !payload.success) {
          setError(payload.message ?? 'Failed to load deals');
          return;
        }

        setDeals(payload.data);
      } catch (dealError) {
        console.error('Failed to load deals', dealError);
        setError('Failed to load deals');
      } finally {
        setIsLoading(false);
      }
    };

    void loadDeals();
  }, [activeSession, isReady, statusFilter]);

  if (!isReady || !activeSession) return null;

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Deals</h1>
      <p className="mt-1 text-gray-500">
        Deals are created when a buyer accepts an offer.
      </p>

      <div className="my-4 flex flex-wrap gap-2">
        {(['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const).map((status) => (
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
          Loading deals...
        </p>
      ) : error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</p>
      ) : deals.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-white p-4 text-gray-500">
          No deals found in this status.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {deals.map((deal) => {
            const roleLabel = deal.buyerId === activeSession.user.id ? 'Buyer' : 'Seller';
            const counterpart =
              deal.buyerId === activeSession.user.id ? deal.seller.name : deal.buyer.name;

            return (
              <Link
                key={deal.id}
                href={`/deals/${deal.id}`}
                className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">{deal.request.title}</h2>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {deal.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="rounded bg-indigo-50 px-2 py-1 text-indigo-700">
                    ${deal.agreedPrice.toFixed(2)}
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-1">You: {roleLabel}</span>
                  <span className="rounded bg-gray-100 px-2 py-1">Counterpart: {counterpart}</span>
                  <span className="rounded bg-gray-100 px-2 py-1">
                    {new Date(deal.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
