import { PrismaClient } from '@prisma/client';
import { products, users } from '../lib/data';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Clear existing data in correct order
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();

    // Seed Users first
    console.log('Seeding users...');
    const createdUsers = [];
    for (const u of users) {
        const user = await prisma.user.create({
            data: {
                id: u.id,
                name: u.name,
                email: u.email,
                password: u.password,
                roles: {
                    create: u.roles.map(role => ({
                        role: role as any
                    }))
                }
            },
        });
        createdUsers.push(user);
    }

    // Seed Products
    console.log('Seeding products...');
    for (const p of products) {
        await prisma.product.create({
            data: {
                name: p.name,
                description: p.description,
                price: p.price,
                image: p.image,
                category: p.category,
                rating: p.rating,
                stock: p.stock,
                sellerId: p.sellerId,
            },
        });
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
