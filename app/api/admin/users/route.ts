import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminAccount } from '@/lib/server/reverse-marketplace';

export async function GET(request: NextRequest) {
  try {
    const adminId = request.nextUrl.searchParams.get('adminId');
    if (!adminId) {
      return NextResponse.json(
        { success: false, message: 'adminId is required' },
        { status: 400 },
      );
    }

    const adminCheck = await requireAdminAccount(adminId);
    if (!adminCheck.ok) {
      return NextResponse.json(
        { success: false, message: adminCheck.message },
        { status: adminCheck.status },
      );
    }

    const accounts = await prisma.account.findMany({
      include: {
        profile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: accounts });
  } catch (error) {
    console.error('Failed to list accounts for admin', error);
    return NextResponse.json(
      { success: false, message: 'Failed to list accounts' },
      { status: 500 },
    );
  }
}
