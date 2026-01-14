import { PrismaClient, AttendanceStatus } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

async function createDecemberAttendance() {
  try {
    console.log('🔍 Fetching all employees...');
    const employees = await prisma.employee.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        workingDaysPerWeek: true,
        weekendDays: true,
      },
    });

    console.log(`📊 Found ${employees.length} active employees`);

    if (employees.length === 0) {
      console.log('⚠️  No employees found. Please create employees first.');
      return;
    }

    // December 2025 (since we're in January 2026)
    const year = 2025;
    const month = 11; // December (0-indexed)
    const daysInDecember = 31;

    console.log('📅 Creating attendance records for December 2025...\n');

    let totalRecordsCreated = 0;

    for (const employee of employees) {
      console.log(`Processing ${employee.firstName} ${employee.lastName} (${employee.employeeCode})`);
      
      const weekendDays = employee.weekendDays.split(',');
      const weekendDayNumbers = weekendDays.map(day => {
        const dayMap: { [key: string]: number } = {
          'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
          'Thursday': 4, 'Friday': 5, 'Saturday': 6
        };
        return dayMap[day.trim()];
      });

      for (let day = 1; day <= daysInDecember; day++) {
        const date = new Date(year, month, day, 9, 0, 0); // Set to 9 AM
        const dayOfWeek = date.getDay();
        const isWeekend = weekendDayNumbers.includes(dayOfWeek);

        // Check if attendance already exists
        const existing = await prisma.attendance.findUnique({
          where: {
            employeeId_date: {
              employeeId: employee.id,
              date: date,
            },
          },
        });

        if (existing) {
          continue; // Skip if already exists
        }

        let status: AttendanceStatus;
        let checkIn: Date | null = null;
        let checkOut: Date | null = null;
        let workHours: number | null = null;
        let overtime: number | null = null;
        let lateMinutes = 0;

        if (isWeekend) {
          status = 'WEEKEND';
        } else {
          // 90% attendance, 5% leave, 5% absent
          const rand = Math.random();
          
          if (rand < 0.90) {
            // Present
            status = 'PRESENT';
            
            // Random check-in between 8:00 AM and 9:30 AM
            const checkInHour = 8;
            const checkInMinutes = Math.floor(Math.random() * 90); // 0-90 minutes
            checkIn = new Date(year, month, day, checkInHour, checkInMinutes, 0);
            
            // Calculate late minutes (standard work time is 9:00 AM)
            const standardStart = new Date(year, month, day, 9, 0, 0);
            if (checkIn > standardStart) {
              lateMinutes = Math.floor((checkIn.getTime() - standardStart.getTime()) / 60000);
            }
            
            // Work hours between 8-9 hours
            const hoursWorked = 8 + Math.random(); // 8.0 to 9.0 hours
            workHours = Math.round(hoursWorked * 100) / 100;
            
            // Check-out time
            checkOut = new Date(checkIn.getTime() + workHours * 60 * 60 * 1000);
            
            // 10% chance of overtime (1-2 hours)
            if (Math.random() < 0.1) {
              overtime = 1 + Math.random(); // 1.0 to 2.0 hours
              overtime = Math.round(overtime * 100) / 100;
            }
          } else if (rand < 0.95) {
            // On Leave
            status = 'ON_LEAVE';
          } else {
            // Absent
            status = 'ABSENT';
          }
        }

        await prisma.attendance.create({
          data: {
            employeeId: employee.id,
            date: date,
            checkIn: checkIn,
            checkOut: checkOut,
            status: status,
            workHours: workHours,
            overtime: overtime,
            lateMinutes: lateMinutes,
            isWeekend: isWeekend,
            isHoliday: false,
          },
        });

        totalRecordsCreated++;
      }
      
      console.log(`  ✅ Created ${daysInDecember} attendance records`);
    }

    console.log(`\n✅ Successfully created ${totalRecordsCreated} attendance records for December 2025!`);
    console.log(`📊 Summary:`);
    console.log(`   - Employees: ${employees.length}`);
    console.log(`   - Days: ${daysInDecember}`);
    console.log(`   - Total Records: ${totalRecordsCreated}`);

  } catch (error) {
    console.error('❌ Error creating attendance data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDecemberAttendance();
