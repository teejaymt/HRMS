import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaLibSql({
  url: `file:./dev.db`,
});

const prisma = new PrismaClient({ adapter });

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@hrms.com' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@hrms.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@hrms.com');
    console.log('Password: admin123');
    console.log('Role:', admin.role);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
