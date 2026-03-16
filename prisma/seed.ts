import { PrismaClient } from '@prisma/client';
import {
  accounts,
  messageSeeds,
  notificationSeeds,
  offerSeeds,
  orderSeeds,
  profiles,
  requestSeeds,
  reviewSeeds,
} from '../lib/data';
import { hashPassword } from '../lib/server/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.order.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.request.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.account.deleteMany();

  console.log('Seeding accounts...');
  for (const account of accounts) {
    await prisma.account.create({
      data: {
        id: account.id,
        email: account.email,
        passwordHash: hashPassword(account.plainPassword),
        status: account.status,
        isAdmin: Boolean(account.isAdmin),
      },
    });
  }

  console.log('Seeding profiles...');
  for (const profile of profiles) {
    await prisma.profile.create({
      data: profile,
    });
  }

  console.log('Seeding requests...');
  for (const requestSeed of requestSeeds) {
    await prisma.request.create({
      data: requestSeed,
    });
  }

  console.log('Seeding offers...');
  for (const offerSeed of offerSeeds) {
    await prisma.offer.create({
      data: offerSeed,
    });
  }

  console.log('Seeding orders...');
  for (const orderSeed of orderSeeds) {
    await prisma.order.create({
      data: orderSeed,
    });
  }

  console.log('Seeding messages...');
  for (const messageSeed of messageSeeds) {
    await prisma.message.create({
      data: messageSeed,
    });
  }

  console.log('Seeding reviews...');
  for (const reviewSeed of reviewSeeds) {
    await prisma.review.create({
      data: reviewSeed,
    });
  }

  console.log('Seeding notifications...');
  for (const notificationSeed of notificationSeeds) {
    await prisma.notification.create({
      data: notificationSeed,
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
