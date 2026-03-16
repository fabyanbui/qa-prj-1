import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireActiveAccount } from '@/lib/server/reverse-marketplace';

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface UpdateOrderBody {
  accountId?: string;
  status?: 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const accountId =
      request.nextUrl.searchParams.get('accountId') ??
      request.nextUrl.searchParams.get('userId');

    if (!accountId) {
      return NextResponse.json(
        { success: false, message: 'accountId is required' },
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

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        request: true,
        offer: true,
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
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 },
      );
    }

    if (order.buyerId !== accountId && order.sellerId !== accountId) {
      return NextResponse.json(
        { success: false, message: 'Access denied to this order' },
        { status: 403 },
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Failed to fetch order detail', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch order detail' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateOrderBody;
    const { accountId, status } = body;

    if (!accountId || !status) {
      return NextResponse.json(
        { success: false, message: 'accountId and status are required' },
        { status: 400 },
      );
    }

    if (!['COMPLETED', 'DISPUTED', 'CANCELLED'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status transition' },
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

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      select: { id: true, buyerId: true, sellerId: true, status: true },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 },
      );
    }

    if (existingOrder.buyerId !== accountId && existingOrder.sellerId !== accountId) {
      return NextResponse.json(
        { success: false, message: 'Only order participants can update status' },
        { status: 403 },
      );
    }

    if (existingOrder.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, message: 'Only ACTIVE orders can be updated' },
        { status: 409 },
      );
    }

    if (status === 'COMPLETED' && existingOrder.buyerId !== accountId) {
      return NextResponse.json(
        { success: false, message: 'Only the buyer can mark order as completed' },
        { status: 403 },
      );
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: {
          status,
          completedAt: status === 'COMPLETED' ? new Date() : null,
        },
      });

      if (status === 'COMPLETED') {
        await tx.notification.createMany({
          data: [
            {
              accountId: existingOrder.buyerId,
              type: 'ORDER_COMPLETED',
              title: 'Order completed',
              body: 'An order has been marked as completed.',
              relatedEntityId: id,
            },
            {
              accountId: existingOrder.sellerId,
              type: 'ORDER_COMPLETED',
              title: 'Order completed',
              body: 'An order has been marked as completed.',
              relatedEntityId: id,
            },
          ],
        });
      }

      return updated;
    });

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Failed to update order status', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order status' },
      { status: 500 },
    );
  }
}
