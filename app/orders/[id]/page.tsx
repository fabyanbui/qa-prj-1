'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store/auth-context';
import { MarketplaceOrder, MarketplaceReview } from '@/types';

export default function OrderDetailPage() {
  const { activeSession, isReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<MarketplaceOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadOrder = async () => {
    if (!activeSession || !orderId) return;

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(
        `/api/orders/${orderId}?accountId=${encodeURIComponent(activeSession.user.id)}`,
      );
      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
        data?: MarketplaceOrder;
      };

      if (!response.ok || !payload.success || !payload.data) {
        setError(payload.message ?? 'Failed to load order');
        return;
      }

      setOrder(payload.data);
    } catch (orderError) {
      console.error('Failed to load order detail', orderError);
      setError('Failed to load order detail');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!activeSession) {
      router.push('/login');
      return;
    }

    void loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession, isReady, orderId, router]);

  const currentUserIsBuyer = useMemo(() => {
    if (!activeSession || !order) return false;
    return order.buyerId === activeSession.user.id;
  }, [activeSession, order]);

  const existingReviewByUser = useMemo(() => {
    if (!activeSession || !order) return null;
    return (order.reviews ?? []).find((review) => review.reviewerId === activeSession.user.id) ?? null;
  }, [activeSession, order]);

  const updateOrderStatus = async (status: 'COMPLETED' | 'DISPUTED' | 'CANCELLED') => {
    if (!activeSession || !order) return;
    setActionError('');
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: activeSession.user.id,
          status,
        }),
      });
      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
      };
      if (!response.ok || !payload.success) {
        setActionError(payload.message ?? 'Failed to update order');
        return;
      }

      await loadOrder();
    } catch (updateError) {
      console.error('Failed to update order', updateError);
      setActionError('Failed to update order');
    }
  };

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeSession || !order) return;

    setActionError('');
    setIsSubmittingReview(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          reviewerId: activeSession.user.id,
          rating: Number(rating),
          comment,
        }),
      });
      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
      };
      if (!response.ok || !payload.success) {
        setActionError(payload.message ?? 'Failed to submit review');
        return;
      }
      setComment('');
      setRating('5');
      await loadOrder();
    } catch (reviewError) {
      console.error('Failed to submit review', reviewError);
      setActionError('Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!isReady || !activeSession) return null;

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-gray-500">Loading order...</div>;
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error || 'Order not found'}
        </div>
        <Link href="/orders" className="mt-4 inline-block text-sm font-semibold text-amber-600">
          Back to orders
        </Link>
      </div>
    );
  }

  const counterpart = currentUserIsBuyer ? order.seller : order.buyer;
  const canComplete = currentUserIsBuyer && order.status === 'ACTIVE';
  const canDispute = order.status === 'ACTIVE';
  const canCancel = order.status === 'ACTIVE';
  const canReview = order.status === 'COMPLETED' && !existingReviewByUser;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/orders" className="text-sm font-semibold text-amber-600 hover:text-amber-500">
        ← Back to orders
      </Link>

      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{order.request.title}</h1>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            {order.status}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-gray-700 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Order summary
            </p>
            <p className="mt-2">Final price: ${order.finalPrice.toFixed(2)}</p>
            <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
            {order.completedAt && <p>Completed: {new Date(order.completedAt).toLocaleString()}</p>}
            <p>Your role: {currentUserIsBuyer ? 'Buyer' : 'Seller'}</p>
            <p>Counterpart: {counterpart.profile.displayName}</p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Accepted offer
            </p>
            <p className="mt-2">Delivery: {order.offer.estimatedDeliveryDays} day(s)</p>
            <p>{order.offer.message}</p>
          </div>
        </div>

        {actionError && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {actionError}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {canComplete && (
            <button
              onClick={() => void updateOrderStatus('COMPLETED')}
              className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              Mark completed
            </button>
          )}
          {canDispute && (
            <button
              onClick={() => void updateOrderStatus('DISPUTED')}
              className="rounded-md bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-500"
            >
              Mark disputed
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => void updateOrderStatus('CANCELLED')}
              className="rounded-md bg-gray-700 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-600"
            >
              Cancel order
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Reviews</h2>

        {(order.reviews ?? []).length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No reviews yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {(order.reviews as MarketplaceReview[]).map((review) => (
              <div key={review.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                <p className="font-semibold text-gray-900">
                  {review.reviewer.profile.displayName} rated {review.rating}/5
                </p>
                <p className="mt-1 text-gray-600">{review.comment || 'No comment'}</p>
              </div>
            ))}
          </div>
        )}

        {canReview && (
          <form onSubmit={submitReview} className="mt-4 space-y-3 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900">Leave a review</h3>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Rating</label>
              <select
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Comment</label>
              <textarea
                rows={3}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="rounded-md bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
            >
              {isSubmittingReview ? 'Submitting...' : 'Submit review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
