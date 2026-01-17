import * as argon2 from 'argon2';
import { PrismaClient, Role } from './generated/client';

const prisma = new PrismaClient();

async function main() {
    const hashPassword = await argon2.hash('111111');
    const user = await prisma.user.upsert({
        where: {
            email: 'test@gmail.com'
        },
        create: {
            email: 'test@gmail.com',
            password: hashPassword,
            role: Role.ADMIN,
        },
        update: {}
    });
    console.log('Seeded user:', user);
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
