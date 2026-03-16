import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import prisma from '@/lib/db';

interface SignupBody {
  email?: string;
  password?: string;
  name?: string;
  roles?: string[];
}

function toValidRoles(roles: string[] | undefined): Role[] {
  if (!roles || roles.length === 0) {
    return ['BUYER'];
  }

  const filteredRoles = roles.filter(
    (role): role is Role => role === 'BUYER' || role === 'SELLER',
  );
  return filteredRoles.length > 0 ? filteredRoles : ['BUYER'];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupBody;
    const { email, password, name, roles } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 400 },
      );
    }

    const normalizedRoles = toValidRoles(roles);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        roles: {
          create: normalizedRoles.map((role) => ({ role })),
        },
      },
      include: {
        roles: true,
      },
    });

    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles.map((role) => role.role),
    };

    return NextResponse.json({
      success: true,
      token: `mock-jwt-token-${user.id}`,
      user: formattedUser,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'Invalid request' },
      { status: 400 },
    );
  }
}
