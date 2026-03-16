'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { MarketplaceRequest } from '@/types';

interface RequestFilters {
  category: string;
  location: string;
  minBudget: string;
  maxBudget: string;
  deadlineBefore: string;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<MarketplaceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [deadlineBefore, setDeadlineBefore] = useState('');

  const loadRequests = useCallback(async (filters: RequestFilters) => {
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('status', 'OPEN');
      if (filters.category) params.set('category', filters.category);
      if (filters.location) params.set('location', filters.location);
      if (filters.minBudget) params.set('minBudget', filters.minBudget);
      if (filters.maxBudget) params.set('maxBudget', filters.maxBudget);
      if (filters.deadlineBefore) {
        params.set('deadlineBefore', `${filters.deadlineBefore}T23:59:59.000Z`);
      }

      const response = await fetch(`/api/requests?${params.toString()}`);
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
      console.error('Failed to fetch requests', requestError);
      setError('Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests({
      category: '',
      location: '',
      minBudget: '',
      maxBudget: '',
      deadlineBefore: '',
    });
  }, [loadRequests]);

  const onSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loadRequests({
      category,
      location,
      minBudget,
      maxBudget,
      deadlineBefore,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Open Requests</h1>
        <p className="mt-1 text-gray-500">
          Browse what buyers need and submit your best offer.
        </p>
      </div>

      <form
        onSubmit={onSearch}
        className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-5"
      >
        <input
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Category"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Location"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          value={minBudget}
          onChange={(event) => setMinBudget(event.target.value)}
          placeholder="Min budget"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          inputMode="decimal"
        />
        <input
          value={maxBudget}
          onChange={(event) => setMaxBudget(event.target.value)}
          placeholder="Max budget"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          inputMode="decimal"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={deadlineBefore}
            onChange={(event) => setDeadlineBefore(event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Filter
          </button>
        </div>
      </form>

      {isLoading ? (
        <p className="rounded-lg border border-gray-200 bg-white p-4 text-gray-500">
          Loading open requests...
        </p>
      ) : error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</p>
      ) : requests.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-white p-4 text-gray-500">
          No requests match your filters.
        </p>
      ) : (
        <div className="space-y-4">
          {requests.map((item) => (
            <Link
              key={item.id}
              href={`/requests/${item.id}`}
              className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-xl font-semibold text-gray-900">{item.title}</h2>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  Budget ${item.budgetMin.toFixed(2)} - ${item.budgetMax.toFixed(2)}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{item.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                {item.category && <span className="rounded bg-gray-100 px-2 py-1">{item.category}</span>}
                {item.location && <span className="rounded bg-gray-100 px-2 py-1">{item.location}</span>}
                <span className="rounded bg-gray-100 px-2 py-1">
                  Deadline {new Date(item.deadline).toLocaleDateString()}
                </span>
                <span className="rounded bg-gray-100 px-2 py-1">
                  {item._count?.offers ?? 0} offers
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
