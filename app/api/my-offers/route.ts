import { OfferStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import {
  assertUserHasRole,
  OFFER_STATUSES,
} from '@/lib/server/reverse-marketplace';

export async function GET(request: NextRequest) {
  try {
    const sellerId = request.nextUrl.searchParams.get('sellerId');
    const statusParam = request.nextUrl.searchParams.get('status');

    if (!sellerId) {
      return NextResponse.json(
        { success: false, message: 'sellerId is required' },
        { status: 400 },
      );
    }

    if (
      statusParam &&
      !OFFER_STATUSES.includes(statusParam as OfferStatus)
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid offer status' },
        { status: 400 },
      );
    }

    const sellerRoleCheck = await assertUserHasRole(sellerId, 'SELLER');
    if (!sellerRoleCheck.ok) {
      return NextResponse.json(
        { success: false, message: sellerRoleCheck.message },
        { status: sellerRoleCheck.status },
      );
    }

    const offers = await prisma.offer.findMany({
      where: {
        sellerId,
        ...(statusParam ? { status: statusParam as OfferStatus } : {}),
      },
      include: {
        request: {
          select: {
            id: true,
            title: true,
            category: true,
            budget: true,
            location: true,
            deadline: true,
            status: true,
            buyer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        deal: {
          select: {
            id: true,
            status: true,
            agreedPrice: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: offers });
  } catch (error) {
    console.error('Failed to list seller offers', error);
    return NextResponse.json(
      { success: false, message: 'Failed to list seller offers' },
      { status: 500 },
    );
  }
}
