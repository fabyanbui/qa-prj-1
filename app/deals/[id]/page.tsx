'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store/auth-context';
import { MarketplaceDeal } from '@/types';

export default function DealDetailPage() {
  const { activeSession, isReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const dealId = params?.id as string;

  const [deal, setDeal] = useState<MarketplaceDeal | null>(null);
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
  }, [activeSession, isReady, router]);

  useEffect(() => {
    const loadDeal = async () => {
      if (!isReady || !activeSession || !dealId) return;

      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/deals/${dealId}?userId=${activeSession.user.id}`);
        const payload = (await response.json()) as {
          success: boolean;
          message?: string;
          data?: MarketplaceDeal;
        };

        if (!response.ok || !payload.success || !payload.data) {
          setError(payload.message ?? 'Failed to load deal');
          return;
        }

        setDeal(payload.data);
      } catch (dealError) {
        console.error('Failed to load deal detail', dealError);
        setError('Failed to load deal detail');
      } finally {
        setIsLoading(false);
      }
    };

    void loadDeal();
  }, [activeSession, dealId, isReady]);

  if (!isReady || !activeSession) return null;

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-gray-500">Loading deal...</div>;
  }

  if (error || !deal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error || 'Deal not found'}
        </div>
        <Link href="/deals" className="mt-4 inline-block text-sm font-semibold text-indigo-600">
          Back to deals
        </Link>
      </div>
    );
  }

  const currentUserIsBuyer = deal.buyerId === activeSession.user.id;
  const counterpart = currentUserIsBuyer ? deal.seller : deal.buyer;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/deals" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
        ← Back to deals
      </Link>

      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{deal.request.title}</h1>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            {deal.status}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-gray-700 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Deal summary
            </p>
            <p className="mt-2">Agreed price: ${deal.agreedPrice.toFixed(2)}</p>
            <p>Created: {new Date(deal.createdAt).toLocaleString()}</p>
            <p>Your role: {currentUserIsBuyer ? 'Buyer' : 'Seller'}</p>
            <p>Counterpart: {counterpart.name}</p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Request details
            </p>
            <p className="mt-2">Category: {deal.request.category}</p>
            <p>Location: {deal.request.location}</p>
            <p>Deadline: {new Date(deal.request.deadline).toLocaleDateString()}</p>
            <p>Request status: {deal.request.status}</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-indigo-50 p-4 text-sm text-indigo-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
            Accepted offer
          </p>
          <p className="mt-2">Delivery time: {deal.offer.deliveryTime}</p>
          <p className="mt-1">{deal.offer.message}</p>
        </div>
      </div>
    </div>
  );
}
