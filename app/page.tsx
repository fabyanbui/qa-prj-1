'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/store/auth-context';
import { MarketplaceRequest } from '@/types';

export default function HomePage() {
  const { activeSession } = useAuth();
  const [recentRequests, setRecentRequests] = useState<MarketplaceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecentRequests = async () => {
      try {
        const response = await fetch('/api/requests?status=OPEN&limit=5');
        const payload = (await response.json()) as {
          success: boolean;
          data: MarketplaceRequest[];
        };

        if (payload.success) {
          setRecentRequests(payload.data);
        }
      } catch (error) {
        console.error('Failed to load recent requests', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadRecentRequests();
  }, []);

  const isBuyer = activeSession?.user.roles.includes('BUYER');
  const isSeller = activeSession?.user.roles.includes('SELLER');

  return (
    <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-indigo-900 sm:text-4xl">
          Reverse Marketplace
        </h1>
        <p className="mt-3 max-w-3xl text-indigo-800">
          Buyers post requests first, and sellers compete by submitting offers. Compare offers
          by price and delivery speed, then accept the best one to create a deal.
        </p>

        {!activeSession ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-indigo-200 bg-white px-4 py-2 font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              Sign in
            </Link>
            <Link
              href="/requests"
              className="rounded-md border border-indigo-200 bg-white px-4 py-2 font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              Browse open requests
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {isBuyer && (
              <Link
                href="/requests/new"
                className="rounded-lg border border-indigo-200 bg-white p-4 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                Create a request
              </Link>
            )}
            {isBuyer && (
              <Link
                href="/my-requests"
                className="rounded-lg border border-indigo-200 bg-white p-4 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                Review my requests
              </Link>
            )}
            {isSeller && (
              <Link
                href="/requests"
                className="rounded-lg border border-indigo-200 bg-white p-4 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                Browse requests to offer
              </Link>
            )}
            {isSeller && (
              <Link
                href="/my-offers"
                className="rounded-lg border border-indigo-200 bg-white p-4 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                Track my offers
              </Link>
            )}
            <Link
              href="/deals"
              className="rounded-lg border border-indigo-200 bg-white p-4 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              View deals
            </Link>
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Recent open requests</h2>
          <Link href="/requests" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            View all
          </Link>
        </div>

        {isLoading ? (
          <p className="rounded-lg border border-gray-200 bg-white p-4 text-gray-500">
            Loading requests...
          </p>
        ) : recentRequests.length === 0 ? (
          <p className="rounded-lg border border-gray-200 bg-white p-4 text-gray-500">
            No open requests yet.
          </p>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((item) => (
              <Link
                key={item.id}
                href={`/requests/${item.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    Budget ${item.budget.toFixed(2)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="rounded bg-gray-100 px-2 py-1">{item.category}</span>
                  <span className="rounded bg-gray-100 px-2 py-1">{item.location}</span>
                  <span className="rounded bg-gray-100 px-2 py-1">
                    {item._count?.offers ?? 0} offers
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
