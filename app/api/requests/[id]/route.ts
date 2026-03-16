import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import {
  parseIsoDate,
  requireActiveAccount,
  REQUEST_STATUSES,
} from '@/lib/server/reverse-marketplace';

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface UpdateRequestBody {
  accountId?: string;
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  budgetMin?: number | string;
  budgetMax?: number | string;
  deadline?: string;
  status?: 'OPEN' | 'CLOSED' | 'EXPIRED' | 'CANCELLED';
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        buyer: {
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
        offers: {
          orderBy: { createdAt: 'desc' },
          include: {
            seller: {
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
        },
        order: true,
      },
    });

    if (!request) {
      return NextResponse.json(
        { success: false, message: 'Request not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: request });
  } catch (error) {
    console.error('Failed to get request detail', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch request detail' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateRequestBody;
    const {
      accountId,
      title,
      description,
      category,
      location,
      budgetMin: budgetMinRaw,
      budgetMax: budgetMaxRaw,
      deadline: deadlineRaw,
      status,
    } = body;

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

    const existingRequest = await prisma.request.findUnique({
      where: { id },
      select: { id: true, buyerId: true, status: true },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, message: 'Request not found' },
        { status: 404 },
      );
    }

    if (existingRequest.buyerId !== accountId) {
      return NextResponse.json(
        { success: false, message: 'Only the buyer can update this request' },
        { status: 403 },
      );
    }

    if (status && !REQUEST_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid request status' },
        { status: 400 },
      );
    }

    const updateData: {
      title?: string;
      description?: string;
      category?: string | null;
      location?: string | null;
      budgetMin?: number;
      budgetMax?: number;
      deadline?: Date;
      status?: 'OPEN' | 'CLOSED' | 'EXPIRED' | 'CANCELLED';
    } = {};

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (category !== undefined) updateData.category = category.trim() || null;
    if (location !== undefined) updateData.location = location.trim() || null;
    if (status !== undefined) updateData.status = status;

    if (budgetMinRaw !== undefined || budgetMaxRaw !== undefined) {
      const nextBudgetMin = budgetMinRaw !== undefined ? Number(budgetMinRaw) : undefined;
      const nextBudgetMax = budgetMaxRaw !== undefined ? Number(budgetMaxRaw) : undefined;

      if (
        (nextBudgetMin !== undefined && (!Number.isFinite(nextBudgetMin) || nextBudgetMin <= 0)) ||
        (nextBudgetMax !== undefined && (!Number.isFinite(nextBudgetMax) || nextBudgetMax <= 0))
      ) {
        return NextResponse.json(
          { success: false, message: 'Budget values must be positive numbers' },
          { status: 400 },
        );
      }

      const effectiveMin = nextBudgetMin ?? undefined;
      const effectiveMax = nextBudgetMax ?? undefined;
      if (effectiveMin !== undefined) updateData.budgetMin = effectiveMin;
      if (effectiveMax !== undefined) updateData.budgetMax = effectiveMax;
      if (
        updateData.budgetMin !== undefined &&
        updateData.budgetMax !== undefined &&
        updateData.budgetMin > updateData.budgetMax
      ) {
        return NextResponse.json(
          { success: false, message: 'budgetMin must be <= budgetMax' },
          { status: 400 },
        );
      }
    }

    if (deadlineRaw !== undefined) {
      const parsedDeadline = parseIsoDate(deadlineRaw);
      if (!parsedDeadline) {
        return NextResponse.json(
          { success: false, message: 'Invalid deadline value' },
          { status: 400 },
        );
      }
      updateData.deadline = parsedDeadline;
    }

    const updatedRequest = await prisma.$transaction(async (tx) => {
      const updated = await tx.request.update({
        where: { id },
        data: updateData,
        include: {
          buyer: {
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

      if (status === 'CLOSED' || status === 'CANCELLED') {
        await tx.offer.updateMany({
          where: { requestId: id, status: 'PENDING' },
          data: { status: 'REJECTED' },
        });
      }

      return updated;
    });

    return NextResponse.json({ success: true, data: updatedRequest });
  } catch (error) {
    console.error('Failed to update request', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update request' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const requestUrl = new URL(request.url);
    const accountId = requestUrl.searchParams.get('accountId');

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

    const existingRequest = await prisma.request.findUnique({
      where: { id },
      select: { id: true, buyerId: true },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, message: 'Request not found' },
        { status: 404 },
      );
    }

    if (existingRequest.buyerId !== accountId) {
      return NextResponse.json(
        { success: false, message: 'Only the buyer can cancel this request' },
        { status: 403 },
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

    return NextResponse.json({ success: true, message: 'Request cancelled' });
  } catch (error) {
    console.error('Failed to cancel request', error);
    return NextResponse.json(
      { success: false, message: 'Failed to cancel request' },
      { status: 500 },
    );
  }
}
