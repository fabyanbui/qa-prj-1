import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, name } = body;

        if (!email || !password || !name) {
            return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
        }

        // Mock signup logic
        // In a real application, you would:
        // 1. Validate the input (already done above)
        // 2. Hash the password
        // 3. Save the user to the database
        // 4. Generate a JWT token

        const newUser = {
            id: `u-${Date.now()}`,
            name,
            email,
        };

        return NextResponse.json({
            success: true,
            token: `mock-jwt-token-${newUser.id}`,
            user: newUser
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
    }
}
