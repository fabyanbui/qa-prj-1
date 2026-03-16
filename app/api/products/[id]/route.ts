import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: 'Product detail API is retired. Use /api/requests/{id}.',
    },
    { status: 410 },
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      message: 'Product update API is retired. Reverse marketplace does not use product CRUD.',
    },
    { status: 410 },
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      message: 'Product delete API is retired. Reverse marketplace does not use product CRUD.',
    },
    { status: 410 },
  );
}
