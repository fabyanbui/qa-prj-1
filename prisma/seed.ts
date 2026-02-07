import { PrismaClient } from '@prisma/client';
import { products, users } from '../lib/data';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Clear existing data
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    // Seed Products
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
            },
        });
    }

    // Seed Users
    for (const u of users) {
        await prisma.user.create({
            data: {
                name: u.name,
                email: u.email,
                password: u.password,
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
