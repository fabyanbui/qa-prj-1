import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/server/auth';
import { toSessionUser } from '@/lib/server/reverse-marketplace';

interface SignupBody {
  email?: string;
  password?: string;
  displayName?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupBody;
    const { email, password, displayName } = body;

    if (!email || !password || !displayName) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 },
      );
    }

    const existingAccount = await prisma.account.findUnique({
      where: { email },
    });

    if (existingAccount) {
      return NextResponse.json(
        { success: false, message: 'Account already exists' },
        { status: 400 },
      );
    }

    const account = await prisma.account.create({
      data: {
        email,
        passwordHash: hashPassword(password),
        profile: {
          create: {
            displayName: displayName.trim(),
          },
        },
      },
      include: {
        profile: true,
      },
    });

    const user = toSessionUser(account);

    return NextResponse.json({
      success: true,
      token: `mock-jwt-token-${account.id}`,
      user,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'Invalid request' },
      { status: 400 },
    );
  }
}
