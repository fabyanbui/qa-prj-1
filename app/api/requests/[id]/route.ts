import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

interface RouteContext {
  params: Promise<{ id: string }>;
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
            name: true,
            email: true,
          },
        },
        offers: {
          orderBy: { createdAt: 'desc' },
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        deal: true,
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
