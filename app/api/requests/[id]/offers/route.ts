import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

type OfferSort = 'lowest-price' | 'fastest-delivery' | 'newest';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const sort = (request.nextUrl.searchParams.get('sort') ?? 'newest') as OfferSort;

    if (!['lowest-price', 'fastest-delivery', 'newest'].includes(sort)) {
      return NextResponse.json(
        { success: false, message: 'Invalid sort mode' },
        { status: 400 },
      );
    }

    const requestExists = await prisma.request.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!requestExists) {
      return NextResponse.json(
        { success: false, message: 'Request not found' },
        { status: 404 },
      );
    }

    const offers = await prisma.offer.findMany({
      where: { requestId: id },
      include: {
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
      },
      orderBy: { createdAt: 'desc' },
    });

    const sortedOffers = [...offers];
    if (sort === 'lowest-price') {
      sortedOffers.sort((a, b) => a.price - b.price || b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sort === 'fastest-delivery') {
      sortedOffers.sort((a, b) => {
        const dayDiff = a.estimatedDeliveryDays - b.estimatedDeliveryDays;
        if (dayDiff !== 0) return dayDiff;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
    }

    return NextResponse.json({ success: true, data: sortedOffers });
  } catch (error) {
    console.error('Failed to list offers for request', error);
    return NextResponse.json(
      { success: false, message: 'Failed to list offers for request' },
      { status: 500 },
    );
  }
}
