const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { shortId: null }
  });
  
  if (users.length === 0) {
    console.log("No users need updating.");
    return;
  }
  
  for (const user of users) {
    const shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
    await prisma.user.update({
      where: { id: user.id },
      data: { shortId }
    });
    console.log(`Updated user ${user.email} with shortId ${shortId}`);
  }
  
  console.log("Finished generating short IDs for existing users");
}

main().catch(console.error).finally(() => prisma.$disconnect());
