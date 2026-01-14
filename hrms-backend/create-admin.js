const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const bcrypt = require('bcrypt');

const adapter = new PrismaLibSql({
  url: 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

async function createAdminUser() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@hrms.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@hrms.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role:', admin.role);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  User already exists!');
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
