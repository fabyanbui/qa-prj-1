import { Prisma, RequestStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import {
  assertUserHasRole,
  parseIsoDate,
  parseOptionalNumber,
  REQUEST_STATUSES,
} from '@/lib/server/reverse-marketplace';

interface CreateRequestBody {
  buyerId?: string;
  title?: string;
  description?: string;
  category?: string;
  budget?: number | string;
  location?: string;
  deadline?: string;
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get('status');
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const minBudgetRaw = searchParams.get('minBudget');
    const maxBudgetRaw = searchParams.get('maxBudget');
    const deadlineBeforeRaw = searchParams.get('deadlineBefore');
    const limitRaw = searchParams.get('limit');

    if (
      statusParam &&
      !REQUEST_STATUSES.includes(statusParam as RequestStatus)
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid request status' },
        { status: 400 },
      );
    }

    const minBudget = parseOptionalNumber(minBudgetRaw);
    const maxBudget = parseOptionalNumber(maxBudgetRaw);

    if ((minBudgetRaw && minBudget === null) || (maxBudgetRaw && maxBudget === null)) {
      return NextResponse.json(
        { success: false, message: 'Invalid budget filter value' },
        { status: 400 },
      );
    }

    if (minBudget !== null && minBudget < 0) {
      return NextResponse.json(
        { success: false, message: 'minBudget must be >= 0' },
        { status: 400 },
      );
    }

    if (maxBudget !== null && maxBudget < 0) {
      return NextResponse.json(
        { success: false, message: 'maxBudget must be >= 0' },
        { status: 400 },
      );
    }

    if (
      minBudget !== null &&
      maxBudget !== null &&
      minBudget > maxBudget
    ) {
      return NextResponse.json(
        { success: false, message: 'minBudget cannot be greater than maxBudget' },
        { status: 400 },
      );
    }

    let deadlineBefore: Date | null = null;
    if (deadlineBeforeRaw) {
      deadlineBefore = parseIsoDate(deadlineBeforeRaw);
      if (!deadlineBefore) {
        return NextResponse.json(
          { success: false, message: 'Invalid deadlineBefore value' },
          { status: 400 },
        );
      }
    }

    let take = DEFAULT_LIMIT;
    if (limitRaw) {
      const parsedLimit = Number.parseInt(limitRaw, 10);
      if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
        return NextResponse.json(
          { success: false, message: 'Invalid limit value' },
          { status: 400 },
        );
      }
      take = Math.min(parsedLimit, MAX_LIMIT);
    }

    const where: Prisma.RequestWhereInput = {};
    if (statusParam) where.status = statusParam as RequestStatus;
    if (category) where.category = category;
    if (location) where.location = { contains: location };
    if (minBudget !== null || maxBudget !== null) {
      where.budget = {};
      if (minBudget !== null) where.budget.gte = minBudget;
      if (maxBudget !== null) where.budget.lte = maxBudget;
    }
    if (deadlineBefore) {
      where.deadline = { lte: deadlineBefore };
    }

    const requests = await prisma.request.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { offers: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error('Failed to list requests', error);
    return NextResponse.json(
      { success: false, message: 'Failed to list requests' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateRequestBody;
    const {
      buyerId,
      title,
      description,
      category,
      budget: budgetRaw,
      location,
      deadline: deadlineRaw,
    } = body;

    if (
      !buyerId ||
      !title ||
      !description ||
      !category ||
      budgetRaw === undefined ||
      !location ||
      !deadlineRaw
    ) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 },
      );
    }

    const budget = Number(budgetRaw);
    if (!Number.isFinite(budget) || budget <= 0) {
      return NextResponse.json(
        { success: false, message: 'Budget must be a positive number' },
        { status: 400 },
      );
    }

    const deadline = parseIsoDate(deadlineRaw);
    if (!deadline) {
      return NextResponse.json(
        { success: false, message: 'Deadline must be a valid ISO date' },
        { status: 400 },
      );
    }

    const buyerRoleCheck = await assertUserHasRole(buyerId, 'BUYER');
    if (!buyerRoleCheck.ok) {
      return NextResponse.json(
        { success: false, message: buyerRoleCheck.message },
        { status: buyerRoleCheck.status },
      );
    }

    const createdRequest = await prisma.request.create({
      data: {
        buyerId,
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        budget,
        location: location.trim(),
        deadline,
        status: 'OPEN',
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: createdRequest }, { status: 201 });
  } catch (error) {
    console.error('Failed to create request', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create request' },
      { status: 500 },
    );
  }
}
