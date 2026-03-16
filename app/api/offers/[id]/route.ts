import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireActiveAccount } from '@/lib/server/reverse-marketplace';

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface UpdateOfferBody {
  accountId?: string;
  status?: 'WITHDRAWN';
  price?: number | string;
  estimatedDeliveryDays?: number | string;
  message?: string;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateOfferBody;
    const { accountId, status, price: priceRaw, estimatedDeliveryDays: deliveryRaw, message } = body;

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

    const existingOffer = await prisma.offer.findUnique({
      where: { id },
      include: {
        request: {
          select: { id: true, buyerId: true },
        },
      },
    });

    if (!existingOffer) {
      return NextResponse.json(
        { success: false, message: 'Offer not found' },
        { status: 404 },
      );
    }

    if (existingOffer.sellerId !== accountId) {
      return NextResponse.json(
        { success: false, message: 'Only the offer owner can modify this offer' },
        { status: 403 },
      );
    }

    if (existingOffer.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, message: 'Only pending offers can be modified' },
        { status: 409 },
      );
    }

    const updateData: {
      status?: 'WITHDRAWN';
      price?: number;
      estimatedDeliveryDays?: number;
      message?: string;
    } = {};

    if (status === 'WITHDRAWN') {
      updateData.status = 'WITHDRAWN';
    }

    if (priceRaw !== undefined) {
      const price = Number(priceRaw);
      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json(
          { success: false, message: 'Price must be a positive number' },
          { status: 400 },
        );
      }
      updateData.price = price;
    }

    if (deliveryRaw !== undefined) {
      const estimatedDeliveryDays = Number(deliveryRaw);
      if (!Number.isFinite(estimatedDeliveryDays) || estimatedDeliveryDays <= 0) {
        return NextResponse.json(
          { success: false, message: 'estimatedDeliveryDays must be a positive number' },
          { status: 400 },
        );
      }
      updateData.estimatedDeliveryDays = Math.round(estimatedDeliveryDays);
    }

    if (message !== undefined) {
      updateData.message = message.trim();
    }

    const updatedOffer = await prisma.$transaction(async (tx) => {
      const updated = await tx.offer.update({
        where: { id },
        data: updateData,
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
      });

      if (status === 'WITHDRAWN') {
        await tx.notification.create({
          data: {
            accountId: existingOffer.request.buyerId,
            type: 'NEW_OFFER',
            title: 'Offer withdrawn',
            body: 'A seller withdrew an offer from your request.',
            relatedEntityId: existingOffer.id,
          },
        });
      }

      return updated;
    });

    return NextResponse.json({ success: true, data: updatedOffer });
  } catch (error) {
    console.error('Failed to update offer', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update offer' },
      { status: 500 },
    );
  }
}
