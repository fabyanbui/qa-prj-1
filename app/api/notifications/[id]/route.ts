import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireActiveAccount } from '@/lib/server/reverse-marketplace';

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface UpdateNotificationBody {
  accountId?: string;
  read?: boolean;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateNotificationBody;
    const { accountId, read } = body;

    if (!accountId || read === undefined) {
      return NextResponse.json(
        { success: false, message: 'accountId and read are required' },
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

    const notification = await prisma.notification.findUnique({
      where: { id },
      select: { id: true, accountId: true },
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 },
      );
    }

    if (notification.accountId !== accountId) {
      return NextResponse.json(
        { success: false, message: 'Cannot modify another account notification' },
        { status: 403 },
      );
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Failed to update notification', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update notification' },
      { status: 500 },
    );
  }
}
