import { OfferStatus, RequestStatus, Role } from '@prisma/client';
import prisma from '@/lib/db';

export const REQUEST_STATUSES: RequestStatus[] = [
  'OPEN',
  'CLOSED',
  'FULFILLED',
  'EXPIRED',
];

export const OFFER_STATUSES: OfferStatus[] = [
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
];

export function parseOptionalNumber(value: string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseIsoDate(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function extractDeliveryDays(deliveryTime: string): number {
  const match = deliveryTime.match(/\d+/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number.parseInt(match[0], 10);
}

export async function assertUserHasRole(userId: string, role: Role) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true },
  });

  if (!user) {
    return { ok: false as const, status: 404, message: 'User not found' };
  }

  if (!user.roles.some((userRole) => userRole.role === role)) {
    return {
      ok: false as const,
      status: 403,
      message: `User does not have required role: ${role}`,
    };
  }

  return { ok: true as const, user };
}
