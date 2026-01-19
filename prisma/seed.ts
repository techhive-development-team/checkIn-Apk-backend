import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from './generated/client';

const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
});

const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const hashPassword = await argon2.hash('111111');

    const user = await prisma.user.upsert({
      where: {
        email: 'test@gmail.com',
      },
      create: {
        email: 'test@gmail.com',
        password: hashPassword,
        role: Role.ADMIN,
      },
      update: {},
    });

    console.log('Seeded user:', user);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });