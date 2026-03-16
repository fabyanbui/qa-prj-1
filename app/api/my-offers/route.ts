import { OfferStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import {
  OFFER_STATUSES,
  requireActiveAccount,
} from '@/lib/server/reverse-marketplace';

export async function GET(request: NextRequest) {
  try {
    const sellerId =
      request.nextUrl.searchParams.get('accountId') ??
      request.nextUrl.searchParams.get('sellerId');
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

    const sellerCheck = await requireActiveAccount(sellerId);
    if (!sellerCheck.ok) {
      return NextResponse.json(
        { success: false, message: sellerCheck.message },
        { status: sellerCheck.status },
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
            budgetMin: true,
            budgetMax: true,
            location: true,
            deadline: true,
            status: true,
            buyer: {
              select: {
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
              },
            },
          },
        },
        order: {
          select: {
            id: true,
            status: true,
            finalPrice: true,
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
