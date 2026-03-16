import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyPassword } from '@/lib/server/auth';
import { toSessionUser } from '@/lib/server/reverse-marketplace';

interface LoginBody {
  email?: string;
  password?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 },
      );
    }

    const account = await prisma.account.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!account || !account.profile || !verifyPassword(password, account.passwordHash)) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 },
      );
    }

    if (account.status === 'SUSPENDED') {
      return NextResponse.json(
        { success: false, message: 'Account is suspended' },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      token: `mock-jwt-token-${account.id}`,
      user: toSessionUser(account),
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Invalid request' },
      { status: 400 },
    );
  }
}
