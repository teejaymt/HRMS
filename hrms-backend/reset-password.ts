import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaLibSql({
  url: `file:./dev.db`,
});

const prisma = new PrismaClient({ adapter });

async function resetPassword() {
  try {
    // Get email from command line argument or use default
    const email = process.argv[2] || 'admin@company.sa';
    const newPassword = process.argv[3] || 'Admin@123';

    console.log(`🔄 Resetting password for: ${email}`);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      console.log('\n📋 Available users:');

      const allUsers = await prisma.user.findMany({
        select: {
          email: true,
          role: true,
          isActive: true,
        },
      });

      allUsers.forEach((u) => {
        console.log(
          `   - ${u.email} (${u.role}) ${u.isActive ? '✅' : '❌ Inactive'}`,
        );
      });

      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log('✅ Password reset successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 New Password: ${newPassword}`);
    console.log(`👤 Role: ${user.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 Usage for other users:');
    console.log('   npx ts-node reset-password.ts <email> <new-password>');
    console.log(
      '   Example: npx ts-node reset-password.ts admin@company.sa MyNewPass123',
    );
  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

void resetPassword();
