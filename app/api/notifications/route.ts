import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireActiveAccount } from '@/lib/server/reverse-marketplace';

export async function GET(request: NextRequest) {
  try {
    const accountId = request.nextUrl.searchParams.get('accountId');
    const unreadOnly = request.nextUrl.searchParams.get('unread') === 'true';

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

    const notifications = await prisma.notification.findMany({
      where: {
        accountId,
        ...(unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Failed to list notifications', error);
    return NextResponse.json(
      { success: false, message: 'Failed to list notifications' },
      { status: 500 },
    );
  }
}
