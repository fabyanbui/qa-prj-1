import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items, buyerId } = body;

        if (!items || !buyerId) {
            return NextResponse.json({ success: false, message: 'Missing items or buyerId' }, { status: 400 });
        }

        // Group items by sellerId
        const itemsBySeller: Record<string, any[]> = items.reduce((acc: Record<string, any[]>, item: any) => {
            if (!acc[item.sellerId]) acc[item.sellerId] = [];
            acc[item.sellerId].push(item);
            return acc;
        }, {});

        // Create orders in a transaction
        const orders = await prisma.$transaction(
            Object.keys(itemsBySeller).map((sellerId) => {
                const sellerItems = itemsBySeller[sellerId];
                const total = sellerItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

                return prisma.order.create({
                    data: {
                        buyerId,
                        sellerId,
                        total,
                        items: {
                            create: sellerItems.map((item: any) => ({
                                productId: item.id,
                                quantity: item.quantity,
                                price: item.price,
                            })),
                        },
                    },
                });
            })
        );

        return NextResponse.json({
            success: true,
            orderIds: orders.map((o: any) => o.id),
            message: 'Order placed successfully'
        });
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json({ success: false, message: 'Failed to process order' }, { status: 500 });
    }
}
