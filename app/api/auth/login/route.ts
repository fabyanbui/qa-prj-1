import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { roles: true }
        });

        if (user && user.password === password) {
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
        }
        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
    }
}
