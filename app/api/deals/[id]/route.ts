import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: 'The /api/deals endpoint has been removed. Use /api/orders/[id] instead.',
    },
    { status: 410 },
  );
}
