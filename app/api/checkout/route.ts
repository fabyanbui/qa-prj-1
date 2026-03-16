import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: 'Checkout API is retired. Use reverse marketplace request/offer/deal APIs.',
    },
    { status: 410 },
  );
}
