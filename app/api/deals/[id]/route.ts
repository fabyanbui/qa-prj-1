import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'userId is required' },
        { status: 400 },
      );
    }

    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        request: true,
        offer: true,
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
    });

    if (!deal) {
      return NextResponse.json(
        { success: false, message: 'Deal not found' },
        { status: 404 },
      );
    }

    if (deal.buyerId !== userId && deal.sellerId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Access denied to this deal' },
        { status: 403 },
      );
    }

    return NextResponse.json({ success: true, data: deal });
  } catch (error) {
    console.error('Failed to fetch deal detail', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch deal detail' },
      { status: 500 },
    );
  }
}
