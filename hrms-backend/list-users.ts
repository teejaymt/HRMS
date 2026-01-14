import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: `file:./dev.db`,
});

const prisma = new PrismaClient({ adapter });

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        isActive: true,
      },
      orderBy: {
        role: 'asc',
      },
    });

    console.log('\n📋 All Users in Database:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    users.forEach(user => {
      const status = user.isActive ? '✅' : '❌';
      console.log(`${status} ${user.email.padEnd(40)} (${user.role})`);
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total: ${users.length} users`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
