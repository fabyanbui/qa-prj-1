import { DealStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { assertUserHasRole } from '@/lib/server/reverse-marketplace';

const DEAL_STATUSES: DealStatus[] = ['ACTIVE', 'COMPLETED', 'CANCELLED'];

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const statusParam = request.nextUrl.searchParams.get('status');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'userId is required' },
        { status: 400 },
      );
    }

    if (statusParam && !DEAL_STATUSES.includes(statusParam as DealStatus)) {
      return NextResponse.json(
        { success: false, message: 'Invalid deal status' },
        { status: 400 },
      );
    }

    const buyerCheck = await assertUserHasRole(userId, 'BUYER');
    const sellerCheck = await assertUserHasRole(userId, 'SELLER');
    if (!buyerCheck.ok && !sellerCheck.ok) {
      return NextResponse.json(
        { success: false, message: 'User does not have marketplace roles' },
        { status: 403 },
      );
    }

    const deals = await prisma.deal.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
        ...(statusParam ? { status: statusParam as DealStatus } : {}),
      },
      include: {
        request: {
          select: {
            id: true,
            title: true,
            category: true,
            location: true,
            deadline: true,
            status: true,
          },
        },
        offer: {
          select: {
            id: true,
            deliveryTime: true,
            message: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: deals });
  } catch (error) {
    console.error('Failed to list deals', error);
    return NextResponse.json(
      { success: false, message: 'Failed to list deals' },
      { status: 500 },
    );
  }
}
