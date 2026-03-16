import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireActiveAccount } from '@/lib/server/reverse-marketplace';

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface UpdateProfileBody {
  accountId?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  phoneNumber?: string;
  location?: string;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const profile = await prisma.profile.findUnique({
      where: { accountId: id },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'Profile not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('Failed to fetch profile', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateProfileBody;
    const { accountId, displayName, avatarUrl, bio, phoneNumber, location } = body;

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

    const canUpdate = accountId === id || accountCheck.account.isAdmin;
    if (!canUpdate) {
      return NextResponse.json(
        { success: false, message: 'You can only update your own profile' },
        { status: 403 },
      );
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { accountId: id },
      select: { id: true },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { success: false, message: 'Profile not found' },
        { status: 404 },
      );
    }

    const updatedProfile = await prisma.profile.update({
      where: { accountId: id },
      data: {
        displayName: displayName?.trim(),
        avatarUrl: avatarUrl?.trim() || null,
        bio: bio?.trim() || null,
        phoneNumber: phoneNumber?.trim() || null,
        location: location?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, data: updatedProfile });
  } catch (error) {
    console.error('Failed to update profile', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 },
    );
  }
}
