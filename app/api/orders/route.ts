import { OrderStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireActiveAccount } from '@/lib/server/reverse-marketplace';

const ORDER_STATUSES: OrderStatus[] = ['ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED'];

export async function GET(request: NextRequest) {
  try {
    const accountId =
      request.nextUrl.searchParams.get('accountId') ??
      request.nextUrl.searchParams.get('userId');
    const statusParam = request.nextUrl.searchParams.get('status');

    if (!accountId) {
      return NextResponse.json(
        { success: false, message: 'accountId is required' },
        { status: 400 },
      );
    }

    if (statusParam && !ORDER_STATUSES.includes(statusParam as OrderStatus)) {
      return NextResponse.json(
        { success: false, message: 'Invalid order status' },
        { status: 400 },
      );
    }

    const accountCheck = await requireActiveAccount(accountId);
    if (!accountCheck.ok) {
      return NextResponse.json(
        { success: false, message: accountCheck.message },
        { status: accountCheck.status },
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [{ buyerId: accountId }, { sellerId: accountId }],
        ...(statusParam ? { status: statusParam as OrderStatus } : {}),
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
            estimatedDeliveryDays: true,
            message: true,
          },
        },
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
        seller: {
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
        reviews: {
          include: {
            reviewer: {
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
            reviewee: {
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
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Failed to list orders', error);
    return NextResponse.json(
      { success: false, message: 'Failed to list orders' },
      { status: 500 },
    );
  }
}
