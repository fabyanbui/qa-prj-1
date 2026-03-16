import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const [aggregate, totalReviews] = await Promise.all([
      prisma.review.aggregate({
        where: { revieweeId: id },
        _avg: { rating: true },
      }),
      prisma.review.count({
        where: { revieweeId: id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        avgRating: aggregate._avg.rating ?? 0,
        totalReviews,
      },
    });
  } catch (error) {
    console.error('Failed to fetch reputation', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reputation' },
      { status: 500 },
    );
  }
}
