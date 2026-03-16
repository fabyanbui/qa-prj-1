import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/server/auth';
import { toSessionUser } from '@/lib/server/reverse-marketplace';

interface SignupBody {
  email?: string;
  password?: string;
}

function toDisplayNameFromEmail(email: string) {
  const localPart = email.split('@')[0]?.trim() ?? '';
  const cleaned = localPart.replace(/[._-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return 'ShopPy User';
  }

  return cleaned
    .split(' ')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupBody;
    const { email, password } = body;
    const normalizedEmail = email?.trim();

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 },
      );
    }

    const existingAccount = await prisma.account.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingAccount) {
      return NextResponse.json(
        { success: false, message: 'Account already exists' },
        { status: 400 },
      );
    }

    const account = await prisma.account.create({
      data: {
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        profile: {
          create: {
            displayName: toDisplayNameFromEmail(normalizedEmail),
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
