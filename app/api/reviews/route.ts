import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireActiveAccount } from '@/lib/server/reverse-marketplace';

interface CreateReviewBody {
  orderId?: string;
  reviewerId?: string;
  rating?: number;
  comment?: string;
}

export async function GET(request: NextRequest) {
  try {
    const revieweeId = request.nextUrl.searchParams.get('revieweeId');
    if (!revieweeId) {
      return NextResponse.json(
        { success: false, message: 'revieweeId is required' },
        { status: 400 },
      );
    }

    const reviews = await prisma.review.findMany({
      where: { revieweeId },
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
    });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Failed to list reviews', error);
    return NextResponse.json(
      { success: false, message: 'Failed to list reviews' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateReviewBody;
    const { orderId, reviewerId, rating, comment } = body;

    if (!orderId || !reviewerId || rating === undefined) {
      return NextResponse.json(
        { success: false, message: 'orderId, reviewerId, and rating are required' },
        { status: 400 },
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'rating must be an integer between 1 and 5' },
        { status: 400 },
      );
    }

    const reviewerCheck = await requireActiveAccount(reviewerId);
    if (!reviewerCheck.ok) {
      return NextResponse.json(
        { success: false, message: reviewerCheck.message },
        { status: reviewerCheck.status },
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, buyerId: true, sellerId: true, status: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 },
      );
    }

    if (order.status !== 'COMPLETED') {
      return NextResponse.json(
        { success: false, message: 'Reviews can only be left for completed orders' },
        { status: 409 },
      );
    }

    if (reviewerId !== order.buyerId && reviewerId !== order.sellerId) {
      return NextResponse.json(
        { success: false, message: 'Reviewer must be a participant in the order' },
        { status: 403 },
      );
    }

    const revieweeId = reviewerId === order.buyerId ? order.sellerId : order.buyerId;

    const review = await prisma.review.create({
      data: {
        orderId,
        reviewerId,
        revieweeId,
        rating,
        comment: comment?.trim(),
      },
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
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    console.error('Failed to create review', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create review' },
      { status: 500 },
    );
  }
}
