import {
  NotificationType,
  OfferStatus,
  Prisma,
  RequestStatus,
} from '@prisma/client';
import prisma from '@/lib/db';
import { Role, User } from '@/types';

export const REQUEST_STATUSES: RequestStatus[] = [
  'OPEN',
  'CLOSED',
  'EXPIRED',
  'CANCELLED',
];

export const OFFER_STATUSES: OfferStatus[] = [
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
];

export const ORDER_STATUSES = ['ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED'] as const;

export function parseOptionalNumber(value: string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseIsoDate(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toRoles(isAdmin: boolean): Role[] {
  const roles: Role[] = ['BUYER', 'SELLER'];
  if (isAdmin) {
    roles.push('ADMIN');
  }
  return roles;
}

export const userPreviewSelect = {
  id: true,
  email: true,
  isAdmin: true,
  status: true,
  profile: {
    select: {
      displayName: true,
      avatarUrl: true,
      location: true,
    },
  },
} satisfies Prisma.AccountSelect;

type SessionAccount = Prisma.AccountGetPayload<{
  include: { profile: true };
}>;

export function toSessionUser(account: SessionAccount): User {
  const profile = account.profile ?? {
    id: `profile-${account.id}`,
    accountId: account.id,
    displayName: account.email,
    avatarUrl: null,
    bio: null,
    phoneNumber: null,
    location: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    id: account.id,
    email: account.email,
    status: account.status,
    isAdmin: account.isAdmin,
    roles: toRoles(account.isAdmin),
    profile: {
      id: profile.id,
      accountId: account.id,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      phoneNumber: profile.phoneNumber,
      location: profile.location,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    },
  };
}

export async function requireActiveAccount(accountId: string) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: { profile: true },
  });

  if (!account || !account.profile) {
    return { ok: false as const, status: 404, message: 'Account not found' };
  }

  if (account.status === 'SUSPENDED') {
    return {
      ok: false as const,
      status: 403,
      message: 'Account is suspended',
    };
  }

  return { ok: true as const, account };
}

export async function requireAdminAccount(accountId: string) {
  const accountResult = await requireActiveAccount(accountId);
  if (!accountResult.ok) {
    return accountResult;
  }

  if (!accountResult.account.isAdmin) {
    return {
      ok: false as const,
      status: 403,
      message: 'Admin access is required',
    };
  }

  return accountResult;
}

export async function createNotification(
  accountId: string,
  type: NotificationType,
  title: string,
  body: string,
  relatedEntityId?: string,
) {
  await prisma.notification.create({
    data: {
      accountId,
      type,
      title,
      body,
      relatedEntityId,
    },
  });
}

export function displayBudgetLabel(budgetMin: number, budgetMax: number) {
  if (budgetMin === budgetMax) {
    return `$${budgetMin.toFixed(2)}`;
  }
  return `$${budgetMin.toFixed(2)} - $${budgetMax.toFixed(2)}`;
}
