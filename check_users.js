async function main() {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  const users = await prisma.user.findMany({
    include: { roles: true },
  });
  console.log(JSON.stringify(users, null, 2));

  await prisma.$disconnect();
}

main()
  .catch((error) => {
    console.error(error);
  });
