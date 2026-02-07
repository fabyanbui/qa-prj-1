import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, name, roles } = body;

        if (!email || !password || !name) {
            return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ success: false, message: 'User already exists' }, { status: 400 });
        }

        // Create user with roles
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password, // Note: In a real app, this should be hashed!
                roles: {
                    create: (roles || ['BUYER']).map((role: string) => ({
                        role: role as any
                    }))
                }
            },
            include: {
                roles: true
            }
        });

        // Format user for response
        const formattedUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            roles: user.roles.map((r: { role: string }) => r.role)
        };

        return NextResponse.json({
            success: true,
            token: `mock-jwt-token-${user.id}`,
            user: formattedUser
        });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
    }
}
