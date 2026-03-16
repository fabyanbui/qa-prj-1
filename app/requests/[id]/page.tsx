'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/store/auth-context';
import { MarketplaceOffer, MarketplaceRequest } from '@/types';

type OfferSort = 'newest' | 'lowest-price' | 'fastest-delivery';

interface RequestDetail extends MarketplaceRequest {
  buyer: {
    id: string;
    name: string;
    email: string;
  };
}

export default function RequestDetailPage() {
  const { activeSession, isReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const requestId = params?.id as string;

  const [requestData, setRequestData] = useState<RequestDetail | null>(null);
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [offerSort, setOfferSort] = useState<OfferSort>('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [isAcceptingOfferId, setIsAcceptingOfferId] = useState<string | null>(null);

  const [price, setPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!activeSession) {
      router.push('/login');
    }
  }, [activeSession, isReady, router]);

  const loadRequest = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [requestResponse, offersResponse] = await Promise.all([
        fetch(`/api/requests/${requestId}`),
        fetch(`/api/requests/${requestId}/offers?sort=${offerSort}`),
      ]);

      const requestPayload = (await requestResponse.json()) as {
        success: boolean;
        message?: string;
        data?: RequestDetail;
      };
      const offersPayload = (await offersResponse.json()) as {
        success: boolean;
        message?: string;
        data?: MarketplaceOffer[];
      };

      if (!requestResponse.ok || !requestPayload.success || !requestPayload.data) {
        setError(requestPayload.message ?? 'Failed to load request');
        return;
      }

      if (!offersResponse.ok || !offersPayload.success || !offersPayload.data) {
        setError(offersPayload.message ?? 'Failed to load offers');
        return;
      }

      setRequestData(requestPayload.data);
      setOffers(offersPayload.data);
    } catch (loadError) {
      console.error('Failed to load request detail', loadError);
      setError('Failed to load request detail');
    } finally {
      setIsLoading(false);
    }
  }, [offerSort, requestId]);

  useEffect(() => {
    if (!isReady || !activeSession || !requestId) return;
    void loadRequest();
  }, [activeSession, isReady, requestId, loadRequest]);

  const isBuyerOwner = useMemo(() => {
    if (!activeSession || !requestData) return false;
    return activeSession.user.id === requestData.buyerId;
  }, [activeSession, requestData]);

  const canSubmitOffer = useMemo(() => {
    if (!activeSession || !requestData) return false;
    const isSeller = activeSession.user.roles.includes('SELLER');
    return isSeller && requestData.status === 'OPEN' && requestData.buyerId !== activeSession.user.id;
  }, [activeSession, requestData]);

  const submitOffer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeSession || !requestData) return;

    setActionError('');
    setIsSubmittingOffer(true);
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: requestData.id,
          sellerId: activeSession.user.id,
          price,
          deliveryTime,
          message,
        }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !payload.success) {
        setActionError(payload.message ?? 'Failed to submit offer');
        return;
      }

      setPrice('');
      setDeliveryTime('');
      setMessage('');
      await loadRequest();
    } catch (submitError) {
      console.error('Failed to submit offer', submitError);
      setActionError('Failed to submit offer');
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  const acceptOffer = async (offerId: string) => {
    if (!activeSession) return;

    setActionError('');
    setIsAcceptingOfferId(offerId);
    try {
      const response = await fetch(`/api/offers/${offerId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId: activeSession.user.id }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !payload.success) {
        setActionError(payload.message ?? 'Failed to accept offer');
        return;
      }

      await loadRequest();
    } catch (acceptError) {
      console.error('Failed to accept offer', acceptError);
      setActionError('Failed to accept offer');
    } finally {
      setIsAcceptingOfferId(null);
    }
  };

  if (!isReady || !activeSession) return null;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-gray-500">Loading request details...</div>
    );
  }

  if (error || !requestData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error || 'Request not found'}
        </div>
        <Link href="/requests" className="mt-4 inline-block text-sm font-semibold text-indigo-600">
          Back to requests
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{requestData.title}</h1>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            {requestData.status}
          </span>
        </div>
        <p className="mt-3 text-sm text-gray-600">{requestData.description}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
          <span className="rounded bg-indigo-50 px-2 py-1 text-indigo-700">
            Budget ${requestData.budget.toFixed(2)}
          </span>
          <span className="rounded bg-gray-100 px-2 py-1">{requestData.category}</span>
          <span className="rounded bg-gray-100 px-2 py-1">{requestData.location}</span>
          <span className="rounded bg-gray-100 px-2 py-1">
            Deadline {new Date(requestData.deadline).toLocaleDateString()}
          </span>
          <span className="rounded bg-gray-100 px-2 py-1">Buyer {requestData.buyer.name}</span>
        </div>
      </div>

      {canSubmitOffer && (
        <form
          onSubmit={submitOffer}
          className="mb-6 space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-gray-900">Submit Offer</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Price (USD)</label>
              <input
                required
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                inputMode="decimal"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="195"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Delivery time</label>
              <input
                required
                value={deliveryTime}
                onChange={(event) => setDeliveryTime(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="3 days"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
            <textarea
              required
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Describe what you can deliver..."
            />
          </div>
          <button
            type="submit"
            disabled={isSubmittingOffer}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {isSubmittingOffer ? 'Submitting offer...' : 'Submit offer'}
          </button>
        </form>
      )}

      {actionError && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-900">Offers ({offers.length})</h2>
          <select
            value={offerSort}
            onChange={(event) => setOfferSort(event.target.value as OfferSort)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="newest">Newest offer</option>
            <option value="lowest-price">Lowest price</option>
            <option value="fastest-delivery">Fastest delivery</option>
          </select>
        </div>

        {offers.length === 0 ? (
          <p className="text-sm text-gray-500">No offers yet.</p>
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {offer.seller?.name ?? 'Unknown seller'}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {offer.seller?.email ?? 'No email'}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                    {offer.status}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                  <span className="rounded bg-indigo-50 px-2 py-1 text-indigo-700">
                    ${offer.price.toFixed(2)}
                  </span>
                  <span className="rounded bg-white px-2 py-1">{offer.deliveryTime}</span>
                  <span className="rounded bg-white px-2 py-1">
                    {new Date(offer.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="mt-2 text-sm text-gray-600">{offer.message}</p>

                {isBuyerOwner && requestData.status === 'OPEN' && offer.status === 'PENDING' && (
                  <button
                    onClick={() => void acceptOffer(offer.id)}
                    disabled={isAcceptingOfferId === offer.id}
                    className="mt-3 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {isAcceptingOfferId === offer.id ? 'Accepting...' : 'Accept offer'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
