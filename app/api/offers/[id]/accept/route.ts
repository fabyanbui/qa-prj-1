import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireActiveAccount } from '@/lib/server/reverse-marketplace';

interface AcceptOfferBody {
  accountId?: string;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = (await request.json()) as AcceptOfferBody;
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { success: false, message: 'accountId is required' },
        { status: 400 },
      );
    }

    const buyerCheck = await requireActiveAccount(accountId);
    if (!buyerCheck.ok) {
      return NextResponse.json(
        { success: false, message: buyerCheck.message },
        { status: buyerCheck.status },
      );
    }

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        request: {
          select: {
            id: true,
            buyerId: true,
            status: true,
          },
        },
      },
    });

    if (!offer) {
      return NextResponse.json(
        { success: false, message: 'Offer not found' },
        { status: 404 },
      );
    }

    if (offer.request.buyerId !== accountId) {
      return NextResponse.json(
        { success: false, message: 'Only the request owner can accept this offer' },
        { status: 403 },
      );
    }

    if (offer.request.status !== 'OPEN') {
      return NextResponse.json(
        { success: false, message: 'Request is no longer open for acceptance' },
        { status: 409 },
      );
    }

    if (offer.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, message: 'Only pending offers can be accepted' },
        { status: 409 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const acceptedOffer = await tx.offer.update({
        where: { id: offer.id },
        data: { status: 'ACCEPTED' },
      });

      await tx.offer.updateMany({
        where: {
          requestId: offer.requestId,
          id: { not: offer.id },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      });

      await tx.request.update({
        where: { id: offer.requestId },
        data: { status: 'CLOSED' },
      });

      const order = await tx.order.upsert({
        where: { requestId: offer.requestId },
        update: {
          offerId: offer.id,
          buyerId: accountId,
          sellerId: offer.sellerId,
          finalPrice: offer.price,
          status: 'ACTIVE',
          completedAt: null,
        },
        create: {
          requestId: offer.requestId,
          offerId: offer.id,
          buyerId: accountId,
          sellerId: offer.sellerId,
          finalPrice: offer.price,
          status: 'ACTIVE',
        },
      });

      await tx.notification.create({
        data: {
          accountId: offer.sellerId,
          type: 'OFFER_ACCEPTED',
          title: 'Offer accepted',
          body: 'Your offer has been accepted and an order was created.',
          relatedEntityId: order.id,
        },
      });

      return { acceptedOffer, order };
    });

    return NextResponse.json({
      success: true,
      message: 'Offer accepted and order created',
      data: result,
    });
  } catch (error) {
    console.error('Failed to accept offer', error);
    return NextResponse.json(
      { success: false, message: 'Failed to accept offer' },
      { status: 500 },
    );
  }
}
