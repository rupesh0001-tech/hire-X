import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ take: 1 });
  if (users.length === 0) return;
  const user = users[0];
  
  // Create token
  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
  console.log('Fetching for user:', user.email);
  
  const res = await fetch('http://localhost:5000/marketplace/my-listings', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  console.log('Status:', res.status);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
