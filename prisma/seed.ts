import { PrismaClient } from '@prisma/client';
import { dealSeeds, offerSeeds, requestSeeds, users } from '../lib/data';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  await prisma.deal.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.request.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding users...');
  for (const user of users) {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        roles: {
          create: user.roles.map((role) => ({ role })),
        },
      },
    });
  }

  console.log('Seeding requests...');
  for (const request of requestSeeds) {
    await prisma.request.create({
      data: request,
    });
  }

  console.log('Seeding offers...');
  for (const offer of offerSeeds) {
    await prisma.offer.create({
      data: offer,
    });
  }

  console.log('Seeding deals...');
  for (const deal of dealSeeds) {
    await prisma.deal.create({
      data: deal,
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
