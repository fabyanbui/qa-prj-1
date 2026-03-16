import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminAccount } from '@/lib/server/reverse-marketplace';

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface DeleteRequestBody {
  adminId?: string;
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = (await request.json()) as DeleteRequestBody;
    const { adminId } = body;

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

    await prisma.$transaction(async (tx) => {
      await tx.request.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
      await tx.offer.updateMany({
        where: { requestId: id, status: 'PENDING' },
        data: { status: 'REJECTED' },
      });
    });

    return NextResponse.json({ success: true, message: 'Request moderated successfully' });
  } catch (error) {
    console.error('Failed to moderate request', error);
    return NextResponse.json(
      { success: false, message: 'Failed to moderate request' },
      { status: 500 },
    );
  }
}
