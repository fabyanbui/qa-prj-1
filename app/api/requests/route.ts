import { Prisma, RequestStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import {
  parseIsoDate,
  parseOptionalNumber,
  requireActiveAccount,
  REQUEST_STATUSES,
} from '@/lib/server/reverse-marketplace';

interface CreateRequestBody {
  buyerId?: string;
  title?: string;
  description?: string;
  category?: string;
  budgetMin?: number | string;
  budgetMax?: number | string;
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
    if (category) where.category = { contains: category };
    if (location) where.location = { contains: location };
    const budgetFilters: Prisma.RequestWhereInput[] = [];
    if (minBudget !== null) {
      budgetFilters.push({ budgetMax: { gte: minBudget } });
    }
    if (maxBudget !== null) {
      budgetFilters.push({ budgetMin: { lte: maxBudget } });
    }
    if (budgetFilters.length > 0) {
      where.AND = budgetFilters;
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
      budgetMin: budgetMinRaw,
      budgetMax: budgetMaxRaw,
      location,
      deadline: deadlineRaw,
    } = body;

    if (
      !buyerId ||
      !title ||
      !description ||
      budgetMinRaw === undefined ||
      budgetMaxRaw === undefined ||
      !deadlineRaw
    ) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 },
      );
    }

    const budgetMin = Number(budgetMinRaw);
    const budgetMax = Number(budgetMaxRaw);
    if (
      !Number.isFinite(budgetMin) ||
      !Number.isFinite(budgetMax) ||
      budgetMin <= 0 ||
      budgetMax <= 0
    ) {
      return NextResponse.json(
        { success: false, message: 'Budget values must be positive numbers' },
        { status: 400 },
      );
    }

    if (budgetMin > budgetMax) {
      return NextResponse.json(
        { success: false, message: 'budgetMin must be <= budgetMax' },
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

    const buyerCheck = await requireActiveAccount(buyerId);
    if (!buyerCheck.ok) {
      return NextResponse.json(
        { success: false, message: buyerCheck.message },
        { status: buyerCheck.status },
      );
    }

    const createdRequest = await prisma.request.create({
      data: {
        buyerId,
        title: title.trim(),
        description: description.trim(),
        category: category?.trim(),
        location: location?.trim(),
        budgetMin,
        budgetMax,
        deadline,
        status: 'OPEN',
      },
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

    return NextResponse.json({ success: true, data: createdRequest }, { status: 201 });
  } catch (error) {
    console.error('Failed to create request', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create request' },
      { status: 500 },
    );
  }
}
