'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store/auth-context';
import { MarketplaceOrder, OrderStatus } from '@/types';

export default function OrdersPage() {
  const { activeSession, isReady } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
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
    const loadOrders = async () => {
      if (!isReady || !activeSession) return;

      setIsLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ accountId: activeSession.user.id });
        if (statusFilter !== 'ALL') params.set('status', statusFilter);

        const response = await fetch(`/api/orders?${params.toString()}`);
        const payload = (await response.json()) as {
          success: boolean;
          message?: string;
          data: MarketplaceOrder[];
        };

        if (!response.ok || !payload.success) {
          setError(payload.message ?? 'Failed to load orders');
          return;
        }

        setOrders(payload.data);
      } catch (orderError) {
        console.error('Failed to load orders', orderError);
        setError('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrders();
  }, [activeSession, isReady, statusFilter]);

  if (!isReady || !activeSession) return null;

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
      <p className="mt-1 text-gray-500">
        Orders are created when a buyer accepts an offer.
      </p>

      <div className="my-4 flex flex-wrap gap-2">
        {(['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED'] as const).map((status) => (
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

      {isLoading ? (
        <p className="rounded-lg border border-gray-200 bg-white p-4 text-gray-500">
          Loading orders...
        </p>
      ) : error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</p>
      ) : orders.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-white p-4 text-gray-500">
          No orders found in this status.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {orders.map((order) => {
            const roleLabel = order.buyerId === activeSession.user.id ? 'Buyer' : 'Seller';
            const counterpart =
              order.buyerId === activeSession.user.id
                ? order.seller.profile.displayName
                : order.buyer.profile.displayName;

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-amber-200 hover:shadow"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">{order.request.title}</h2>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {order.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="rounded bg-amber-50 px-2 py-1 text-amber-700">
                    ${order.finalPrice.toFixed(2)}
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-1">You: {roleLabel}</span>
                  <span className="rounded bg-gray-100 px-2 py-1">
                    Counterpart: {counterpart}
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-1">
                    {new Date(order.createdAt).toLocaleDateString()}
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
