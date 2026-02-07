import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, description, price, image, category, rating, stock, sellerId } = body;

        // In a real app, verify sellerId matches product.sellerId and authenticated user
        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price: parseFloat(price),
                image,
                category,
                rating: parseFloat(rating),
                stock: parseInt(stock),
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // In a real app, verify authenticated user owns this product
        await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
