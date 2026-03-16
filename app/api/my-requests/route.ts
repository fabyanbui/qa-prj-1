import { RequestStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import {
  requireActiveAccount,
  REQUEST_STATUSES,
} from '@/lib/server/reverse-marketplace';

export async function GET(request: NextRequest) {
  try {
    const buyerId =
      request.nextUrl.searchParams.get('accountId') ??
      request.nextUrl.searchParams.get('buyerId');
    const statusParam = request.nextUrl.searchParams.get('status');

    if (!buyerId) {
      return NextResponse.json(
        { success: false, message: 'buyerId is required' },
        { status: 400 },
      );
    }

    if (
      statusParam &&
      !REQUEST_STATUSES.includes(statusParam as RequestStatus)
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid request status' },
        { status: 400 },
      );
    }

    const buyerCheck = await requireActiveAccount(buyerId);
    if (!buyerCheck.ok) {
      return NextResponse.json(
        { success: false, message: buyerCheck.message },
        { status: buyerCheck.status },
      );
    }

    const requests = await prisma.request.findMany({
      where: {
        buyerId,
        ...(statusParam ? { status: statusParam as RequestStatus } : {}),
      },
      include: {
        _count: {
          select: { offers: true },
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

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error('Failed to list buyer requests', error);
    return NextResponse.json(
      { success: false, message: 'Failed to list buyer requests' },
      { status: 500 },
    );
  }
}
