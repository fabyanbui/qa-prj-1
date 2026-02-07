import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
    try {
        const products = await prisma.product.findMany();
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, price, image, category, rating, stock, sellerId } = body;

        if (!sellerId) {
            return NextResponse.json({ error: 'sellerId is required' }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                image,
                category,
                rating: parseFloat(rating) || 0,
                stock: parseInt(stock),
                sellerId,
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Create product error:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
