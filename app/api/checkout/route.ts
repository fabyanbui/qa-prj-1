import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate request if needed, for mock just proceed
        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Return success
        return NextResponse.json({
            success: true,
            orderId: `ORD-${Math.floor(Math.random() * 10000)}`,
            message: 'Order placed successfully'
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
    }
}
