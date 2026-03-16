import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdminAccount } from '@/lib/server/reverse-marketplace';

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface SuspendBody {
  adminId?: string;
  status?: 'ACTIVE' | 'SUSPENDED';
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = (await request.json()) as SuspendBody;
    const { adminId, status = 'SUSPENDED' } = body;

    if (!adminId) {
      return NextResponse.json(
        { success: false, message: 'adminId is required' },
        { status: 400 },
      );
    }

    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'status must be ACTIVE or SUSPENDED' },
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

    const updated = await prisma.account.update({
      where: { id },
      data: { status },
      include: { profile: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Failed to update account suspension status', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update account status' },
      { status: 500 },
    );
  }
}
