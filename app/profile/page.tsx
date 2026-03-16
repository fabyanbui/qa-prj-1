'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store/auth-context';
import { MarketplaceReview, Profile, Reputation } from '@/types';

export default function ProfilePage() {
  const { activeSession, isReady } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reputation, setReputation] = useState<Reputation | null>(null);
  const [reviews, setReviews] = useState<MarketplaceReview[]>([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    if (!activeSession) {
      router.push('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const [profileRes, reputationRes, reviewsRes] = await Promise.all([
          fetch(`/api/profiles/${activeSession.user.id}`),
          fetch(`/api/users/${activeSession.user.id}/reputation`),
          fetch(`/api/users/${activeSession.user.id}/reviews`),
        ]);

        const profilePayload = (await profileRes.json()) as {
          success: boolean;
          message?: string;
          data?: Profile;
        };
        const reputationPayload = (await reputationRes.json()) as {
          success: boolean;
          message?: string;
          data?: Reputation;
        };
        const reviewsPayload = (await reviewsRes.json()) as {
          success: boolean;
          message?: string;
          data?: MarketplaceReview[];
        };

        if (!profileRes.ok || !profilePayload.success || !profilePayload.data) {
          setError(profilePayload.message ?? 'Failed to load profile');
          return;
        }

        setProfile(profilePayload.data);
        if (reputationRes.ok && reputationPayload.success && reputationPayload.data) {
          setReputation(reputationPayload.data);
        }
        if (reviewsRes.ok && reviewsPayload.success && reviewsPayload.data) {
          setReviews(reviewsPayload.data);
        }
      } catch (loadError) {
        console.error('Failed to load profile page', loadError);
        setError('Failed to load profile page');
      }
    };

    void loadProfile();
  }, [activeSession, isReady, router]);

  const onSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeSession || !profile) return;

    setError('');
    setIsSaving(true);
    try {
      const response = await fetch(`/api/profiles/${activeSession.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: activeSession.user.id,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl ?? '',
          bio: profile.bio ?? '',
          phoneNumber: profile.phoneNumber ?? '',
          location: profile.location ?? '',
        }),
      });
      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
        data?: Profile;
      };

      if (!response.ok || !payload.success || !payload.data) {
        setError(payload.message ?? 'Failed to save profile');
        return;
      }
      setProfile(payload.data);
    } catch (saveError) {
      console.error('Failed to save profile', saveError);
      setError('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isReady || !activeSession) return null;

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-gray-500">
        {error || 'Loading profile...'}
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
      <p className="mt-1 text-gray-500">Manage your public information and reputation.</p>

      {error && (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={onSave} className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Display name</label>
            <input
              value={profile.displayName}
              onChange={(event) => setProfile({ ...profile, displayName: event.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Phone number</label>
            <input
              value={profile.phoneNumber ?? ''}
              onChange={(event) => setProfile({ ...profile, phoneNumber: event.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Avatar URL</label>
          <input
            value={profile.avatarUrl ?? ''}
            onChange={(event) => setProfile({ ...profile, avatarUrl: event.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
          <input
            value={profile.location ?? ''}
            onChange={(event) => setProfile({ ...profile, location: event.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            rows={4}
            value={profile.bio ?? ''}
            onChange={(event) => setProfile({ ...profile, bio: event.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save profile'}
        </button>
      </form>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Reputation</h2>
        <p className="mt-1 text-sm text-gray-600">
          Avg rating: {reputation?.avgRating?.toFixed(2) ?? '0.00'} / 5 ({reputation?.totalReviews ?? 0}{' '}
          reviews)
        </p>
        <div className="mt-3 space-y-2">
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500">No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                <p className="font-semibold text-gray-900">
                  {review.reviewer.profile.displayName} rated {review.rating}/5
                </p>
                <p className="mt-1 text-gray-600">{review.comment || 'No comment provided.'}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
