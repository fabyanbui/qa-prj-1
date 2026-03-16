import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { assertUserHasRole } from '@/lib/server/reverse-marketplace';

interface CreateOfferBody {
  requestId?: string;
  sellerId?: string;
  price?: number | string;
  deliveryTime?: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateOfferBody;
    const {
      requestId,
      sellerId,
      price: priceRaw,
      deliveryTime,
      message,
    } = body;

    if (!requestId || !sellerId || priceRaw === undefined || !deliveryTime || !message) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 },
      );
    }

    const price = Number(priceRaw);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { success: false, message: 'Price must be a positive number' },
        { status: 400 },
      );
    }

    const sellerRoleCheck = await assertUserHasRole(sellerId, 'SELLER');
    if (!sellerRoleCheck.ok) {
      return NextResponse.json(
        { success: false, message: sellerRoleCheck.message },
        { status: sellerRoleCheck.status },
      );
    }

    const targetRequest = await prisma.request.findUnique({
      where: { id: requestId },
      select: { id: true, buyerId: true, status: true },
    });

    if (!targetRequest) {
      return NextResponse.json(
        { success: false, message: 'Request not found' },
        { status: 404 },
      );
    }

    if (targetRequest.buyerId === sellerId) {
      return NextResponse.json(
        { success: false, message: 'You cannot submit an offer on your own request' },
        { status: 400 },
      );
    }

    if (targetRequest.status !== 'OPEN') {
      return NextResponse.json(
        { success: false, message: 'Offers can only be submitted to OPEN requests' },
        { status: 409 },
      );
    }

    const existingOffer = await prisma.offer.findFirst({
      where: {
        requestId,
        sellerId,
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
      select: { id: true },
    });

    if (existingOffer) {
      return NextResponse.json(
        { success: false, message: 'An active offer already exists for this request by this seller' },
        { status: 409 },
      );
    }

    const createdOffer = await prisma.offer.create({
      data: {
        requestId,
        sellerId,
        price,
        deliveryTime: deliveryTime.trim(),
        message: message.trim(),
        status: 'PENDING',
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: createdOffer }, { status: 201 });
  } catch (error) {
    console.error('Failed to create offer', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create offer' },
      { status: 500 },
    );
  }
}
