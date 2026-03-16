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

    const requests = await prisma.request.findMany({
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error('Failed to list requests for admin', error);
    return NextResponse.json(
      { success: false, message: 'Failed to list requests' },
      { status: 500 },
    );
  }
}
