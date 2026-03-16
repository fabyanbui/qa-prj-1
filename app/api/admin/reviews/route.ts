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

    const reviews = await prisma.review.findMany({
      include: {
        reviewer: {
          include: { profile: true },
        },
        reviewee: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Failed to list reviews for admin', error);
    return NextResponse.json(
      { success: false, message: 'Failed to list reviews' },
      { status: 500 },
    );
  }
}
