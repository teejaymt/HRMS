import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

async function createAdminUser() {
  console.log('🔐 Creating admin user...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  try {
    // Create Admin User
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@company.sa',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@company.sa');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: ADMIN');

    // Create HR Manager User
    const hrUser = await prisma.user.create({
      data: {
        email: 'hr@company.sa',
        password: hashedPassword,
        role: 'HR',
        isActive: true,
      },
    });

    console.log('\n✅ HR Manager user created successfully!');
    console.log('📧 Email: hr@company.sa');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: HR');

    // Create Manager User
    const managerUser = await prisma.user.create({
      data: {
        email: 'manager@company.sa',
        password: hashedPassword,
        role: 'MANAGER',
        isActive: true,
      },
    });

    console.log('\n✅ Manager user created successfully!');
    console.log('📧 Email: manager@company.sa');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: MANAGER');

    console.log('\n📊 Summary:');
    console.log('   - 1 Admin user');
    console.log('   - 1 HR user');
    console.log('   - 1 Manager user');
    console.log('\n✅ All administrative users created!');

  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('⚠️  User already exists. Skipping...');
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
