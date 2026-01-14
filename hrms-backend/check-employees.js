const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEmployees() {
  try {
    const employees = await prisma.employee.findMany();
    console.log('Total employees:', employees.length);
    employees.forEach(e => {
      console.log('- ' + e.firstName + ' ' + e.lastName + ' (' + e.email + ')');
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmployees();
