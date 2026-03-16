import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: 'Product listing API is retired. Use /api/requests for reverse marketplace.',
    },
    { status: 410 },
  );
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: 'Product creation API is retired. Buyers now create requests via /api/requests.',
    },
    { status: 410 },
  );
}
