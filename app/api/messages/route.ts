import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireActiveAccount } from '@/lib/server/reverse-marketplace';

interface CreateMessageBody {
  senderId?: string;
  receiverId?: string;
  requestId?: string;
  offerId?: string;
  content?: string;
}

export async function GET(request: NextRequest) {
  try {
    const accountId = request.nextUrl.searchParams.get('accountId');
    const withUserId = request.nextUrl.searchParams.get('withUserId');
    const requestId = request.nextUrl.searchParams.get('requestId');
    const offerId = request.nextUrl.searchParams.get('offerId');

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

    const where = withUserId
      ? {
          OR: [
            { senderId: accountId, receiverId: withUserId },
            { senderId: withUserId, receiverId: accountId },
          ],
          ...(requestId ? { requestId } : {}),
          ...(offerId ? { offerId } : {}),
        }
      : {
          OR: [{ senderId: accountId }, { receiverId: accountId }],
          ...(requestId ? { requestId } : {}),
          ...(offerId ? { offerId } : {}),
        };

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
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
        receiver: {
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
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error('Failed to list messages', error);
    return NextResponse.json(
      { success: false, message: 'Failed to list messages' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateMessageBody;
    const { senderId, receiverId, requestId, offerId, content } = body;

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { success: false, message: 'senderId, receiverId, and content are required' },
        { status: 400 },
      );
    }

    if (senderId === receiverId) {
      return NextResponse.json(
        { success: false, message: 'senderId and receiverId must be different' },
        { status: 400 },
      );
    }

    const senderCheck = await requireActiveAccount(senderId);
    if (!senderCheck.ok) {
      return NextResponse.json(
        { success: false, message: senderCheck.message },
        { status: senderCheck.status },
      );
    }

    const receiverCheck = await requireActiveAccount(receiverId);
    if (!receiverCheck.ok) {
      return NextResponse.json(
        { success: false, message: receiverCheck.message },
        { status: receiverCheck.status },
      );
    }

    if (requestId) {
      const requestRecord = await prisma.request.findUnique({
        where: { id: requestId },
        select: { id: true },
      });
      if (!requestRecord) {
        return NextResponse.json(
          { success: false, message: 'requestId is invalid' },
          { status: 400 },
        );
      }
    }

    if (offerId) {
      const offerRecord = await prisma.offer.findUnique({
        where: { id: offerId },
        select: { id: true },
      });
      if (!offerRecord) {
        return NextResponse.json(
          { success: false, message: 'offerId is invalid' },
          { status: 400 },
        );
      }
    }

    const createdMessage = await prisma.$transaction(async (tx) => {
      const messageRecord = await tx.message.create({
        data: {
          senderId,
          receiverId,
          requestId,
          offerId,
          content: content.trim(),
        },
        include: {
          sender: {
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
          receiver: {
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

      await tx.notification.create({
        data: {
          accountId: receiverId,
          type: 'NEW_MESSAGE',
          title: 'New message',
          body: 'You received a new message.',
          relatedEntityId: messageRecord.id,
        },
      });

      return messageRecord;
    });

    return NextResponse.json({ success: true, data: createdMessage }, { status: 201 });
  } catch (error) {
    console.error('Failed to create message', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create message' },
      { status: 500 },
    );
  }
}
