import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

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

    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    });

    if (user && user.password === password) {
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
    }
    return NextResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 },
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Invalid request' },
      { status: 400 },
    );
  }
}
