import { NextResponse } from 'next/server';
import { users } from '@/lib/data';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const user = users.find(u => u.email === body.email && u.password === body.password);

        if (user) {
            const { password: _, ...userWithoutPassword } = user;
            return NextResponse.json({
                success: true,
                token: `mock-jwt-token-${user.id}`,
                user: userWithoutPassword
            });
        }
        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    } catch {
        return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
    }
}
