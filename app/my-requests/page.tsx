'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store/auth-context';
import { MarketplaceRequest, RequestStatus } from '@/types';

interface EditDraft {
  title: string;
  description: string;
  category: string;
  location: string;
  budgetMin: string;
  budgetMax: string;
  deadline: string;
}

const toDateInputValue = (isoValue: string) => {
  const date = new Date(isoValue);
  return date.toISOString().slice(0, 10);
};

export default function MyRequestsPage() {
  const { activeSession, isReady } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<MarketplaceRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [actionMessage, setActionMessage] = useState('');

  const loadMyRequests = useCallback(async () => {
    if (!isReady || !activeSession) return;

    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ accountId: activeSession.user.id });
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
  }, [activeSession, isReady, statusFilter]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!activeSession) {
      router.push('/login');
    }
  }, [activeSession, isReady, router]);

  useEffect(() => {
    void loadMyRequests();
  }, [loadMyRequests]);

  const closeRequest = async (requestId: string) => {
    if (!activeSession) return;
    setActionMessage('');
    const response = await fetch(`/api/requests/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: activeSession.user.id,
        status: 'CLOSED',
      }),
    });
    const payload = (await response.json()) as {
      success: boolean;
      message?: string;
    };
    if (!response.ok || !payload.success) {
      setActionMessage(payload.message ?? 'Failed to close request');
      return;
    }
    setActionMessage('Request closed.');
    await loadMyRequests();
  };

  const cancelRequest = async (requestId: string) => {
    if (!activeSession) return;
    setActionMessage('');
    const response = await fetch(
      `/api/requests/${requestId}?accountId=${encodeURIComponent(activeSession.user.id)}`,
      {
        method: 'DELETE',
      },
    );
    const payload = (await response.json()) as {
      success: boolean;
      message?: string;
    };
    if (!response.ok || !payload.success) {
      setActionMessage(payload.message ?? 'Failed to cancel request');
      return;
    }
    setActionMessage('Request cancelled.');
    await loadMyRequests();
  };

  const startEdit = (item: MarketplaceRequest) => {
    setEditingRequestId(item.id);
    setEditDraft({
      title: item.title,
      description: item.description,
      category: item.category ?? '',
      location: item.location ?? '',
      budgetMin: String(item.budgetMin),
      budgetMax: String(item.budgetMax),
      deadline: toDateInputValue(item.deadline),
    });
  };

  const submitEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeSession || !editingRequestId || !editDraft) return;

    setActionMessage('');
    const response = await fetch(`/api/requests/${editingRequestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: activeSession.user.id,
        title: editDraft.title,
        description: editDraft.description,
        category: editDraft.category,
        location: editDraft.location,
        budgetMin: editDraft.budgetMin,
        budgetMax: editDraft.budgetMax,
        deadline: new Date(editDraft.deadline).toISOString(),
      }),
    });

    const payload = (await response.json()) as {
      success: boolean;
      message?: string;
    };

    if (!response.ok || !payload.success) {
      setActionMessage(payload.message ?? 'Failed to update request');
      return;
    }

    setActionMessage('Request updated.');
    setEditingRequestId(null);
    setEditDraft(null);
    await loadMyRequests();
  };

  if (!isReady || !activeSession) return null;

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
          <p className="mt-1 text-gray-500">Manage your requests and evaluate offers.</p>
        </div>
        <Link
          href="/requests/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          New request
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(['ALL', 'OPEN', 'CLOSED', 'EXPIRED', 'CANCELLED'] as const).map((status) => (
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

      {actionMessage && (
        <p className="mb-4 rounded-md border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-700">
          {actionMessage}
        </p>
      )}

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
                  Budget ${item.budgetMin.toFixed(2)} - ${item.budgetMax.toFixed(2)}
                </span>
                {item.category && <span className="rounded bg-gray-100 px-2 py-1">{item.category}</span>}
                {item.location && <span className="rounded bg-gray-100 px-2 py-1">{item.location}</span>}
                <span className="rounded bg-gray-100 px-2 py-1">
                  {item._count?.offers ?? 0} offers
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/requests/${item.id}`}
                  className="rounded-md border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                >
                  View details
                </Link>
                {item.status === 'OPEN' && (
                  <>
                    <button
                      onClick={() => startEdit(item)}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => void closeRequest(item.id)}
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => void cancelRequest(item.id)}
                      className="rounded-md bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editingRequestId && editDraft && (
        <form
          onSubmit={submitEdit}
          className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold text-gray-900">Edit request</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              value={editDraft.title}
              onChange={(event) => setEditDraft({ ...editDraft, title: event.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Title"
            />
            <input
              value={editDraft.category}
              onChange={(event) => setEditDraft({ ...editDraft, category: event.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Category"
            />
          </div>
          <textarea
            value={editDraft.description}
            onChange={(event) => setEditDraft({ ...editDraft, description: event.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            rows={3}
            placeholder="Description"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <input
              value={editDraft.location}
              onChange={(event) => setEditDraft({ ...editDraft, location: event.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Location"
            />
            <input
              value={editDraft.budgetMin}
              onChange={(event) => setEditDraft({ ...editDraft, budgetMin: event.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Budget min"
            />
            <input
              value={editDraft.budgetMax}
              onChange={(event) => setEditDraft({ ...editDraft, budgetMax: event.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Budget max"
            />
            <input
              type="date"
              value={editDraft.deadline}
              onChange={(event) => setEditDraft({ ...editDraft, deadline: event.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingRequestId(null);
                setEditDraft(null);
              }}
              className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
