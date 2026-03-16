'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store/auth-context';

export default function NewRequestPage() {
  const { activeSession, isReady } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeSession) return;

    setError('');
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: activeSession.user.id,
          title,
          description,
          category,
          budget,
          location,
          deadline: new Date(deadline).toISOString(),
        }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
        data?: { id: string };
      };

      if (!response.ok || !payload.success || !payload.data) {
        setError(payload.message ?? 'Failed to create request');
        return;
      }

      router.push(`/requests/${payload.data.id}`);
    } catch (submitError) {
      console.error('Failed to create request', submitError);
      setError('Failed to create request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady || !activeSession) return null;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Create Request</h1>
      <p className="mb-6 text-gray-500">
        Describe what you need and let sellers compete with offers.
      </p>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Need a wooden desk"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            rows={4}
            placeholder="Dimensions, quality preferences, and other details..."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <input
              required
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Furniture"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Budget (USD)</label>
            <input
              required
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              inputMode="decimal"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="220"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
            <input
              required
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Ho Chi Minh City"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Deadline</label>
            <input
              required
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating request...' : 'Create request'}
        </button>
      </form>
    </div>
  );
}
