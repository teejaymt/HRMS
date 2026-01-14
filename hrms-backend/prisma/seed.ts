import { PrismaClient, OnboardingStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Departments
  console.log('📁 Creating departments...');
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { name: 'Human Resources' },
      update: {},
      create: {
        name: 'Human Resources',
        nameArabic: 'الموارد البشرية',
        description: 'Manages employee relations, recruitment, and HR policies',
        saudiCount: 2,
        nonSaudiCount: 1,
      },
    }),
    prisma.department.upsert({
      where: { name: 'Information Technology' },
      update: {},
      create: {
        name: 'Information Technology',
        nameArabic: 'تقنية المعلومات',
        description: 'Manages IT infrastructure, software development, and technical support',
        saudiCount: 3,
        nonSaudiCount: 2,
      },
    }),
    prisma.department.upsert({
      where: { name: 'Finance' },
      update: {},
      create: {
        name: 'Finance',
        nameArabic: 'المالية',
        description: 'Handles accounting, budgeting, and financial planning',
        saudiCount: 2,
        nonSaudiCount: 1,
      },
    }),
    prisma.department.upsert({
      where: { name: 'Operations' },
      update: {},
      create: {
        name: 'Operations',
        nameArabic: 'العمليات',
        description: 'Manages daily operations and logistics',
        saudiCount: 4,
        nonSaudiCount: 2,
      },
    }),
    prisma.department.upsert({
      where: { name: 'Marketing' },
      update: {},
      create: {
        name: 'Marketing',
        nameArabic: 'التسويق',
        description: 'Handles marketing campaigns, branding, and communications',
        saudiCount: 2,
        nonSaudiCount: 1,
      },
    }),
  ]);

  console.log(`✅ Created ${departments.length} departments`);

  // Create Employees with User accounts
  console.log('👥 Creating employees with user accounts...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);

  const employees = [
    {
      email: 'ahmed.alqahtani@company.sa',
      firstName: 'Ahmed',
      lastName: 'Al-Qahtani',
      firstNameArabic: 'أحمد',
      lastNameArabic: 'القحطاني',
      departmentName: 'Information Technology',
      position: 'Software Engineer',
      positionArabic: 'مهندس برمجيات',
      isSaudi: true,
      saudiId: '1234567890',
      nationality: 'Saudi',
      basicSalary: 12000,
      phone: '+966501234567',
    },
    {
      email: 'fatima.almutairi@company.sa',
      firstName: 'Fatima',
      lastName: 'Al-Mutairi',
      firstNameArabic: 'فاطمة',
      lastNameArabic: 'المطيري',
      departmentName: 'Human Resources',
      position: 'HR Specialist',
      positionArabic: 'أخصائي موارد بشرية',
      isSaudi: true,
      saudiId: '2345678901',
      nationality: 'Saudi',
      basicSalary: 10000,
      phone: '+966502345678',
    },
    {
      email: 'mohammed.alharbi@company.sa',
      firstName: 'Mohammed',
      lastName: 'Al-Harbi',
      firstNameArabic: 'محمد',
      lastNameArabic: 'الحربي',
      departmentName: 'Finance',
      position: 'Accountant',
      positionArabic: 'محاسب',
      isSaudi: true,
      saudiId: '3456789012',
      nationality: 'Saudi',
      basicSalary: 11000,
      phone: '+966503456789',
    },
    {
      email: 'sarah.alghamdi@company.sa',
      firstName: 'Sarah',
      lastName: 'Al-Ghamdi',
      firstNameArabic: 'سارة',
      lastNameArabic: 'الغامدي',
      departmentName: 'Marketing',
      position: 'Marketing Coordinator',
      positionArabic: 'منسق تسويق',
      isSaudi: true,
      saudiId: '4567890123',
      nationality: 'Saudi',
      basicSalary: 9500,
      phone: '+966504567890',
    },
    {
      email: 'khalid.alzahrani@company.sa',
      firstName: 'Khalid',
      lastName: 'Al-Zahrani',
      firstNameArabic: 'خالد',
      lastNameArabic: 'الزهراني',
      departmentName: 'Operations',
      position: 'Operations Manager',
      positionArabic: 'مدير عمليات',
      isSaudi: true,
      saudiId: '5678901234',
      nationality: 'Saudi',
      basicSalary: 15000,
      phone: '+966505678901',
    },
    {
      email: 'john.smith@company.sa',
      firstName: 'John',
      lastName: 'Smith',
      departmentName: 'Information Technology',
      position: 'Senior Developer',
      positionArabic: 'مطور أول',
      isSaudi: false,
      iqamaNumber: '2123456789',
      nationality: 'American',
      basicSalary: 18000,
      phone: '+966506789012',
    },
    {
      email: 'maria.garcia@company.sa',
      firstName: 'Maria',
      lastName: 'Garcia',
      departmentName: 'Human Resources',
      position: 'HR Assistant',
      positionArabic: 'مساعد موارد بشرية',
      isSaudi: false,
      iqamaNumber: '2234567890',
      nationality: 'Filipino',
      basicSalary: 7000,
      phone: '+966507890123',
    },
    {
      email: 'ali.alshehri@company.sa',
      firstName: 'Ali',
      lastName: 'Al-Shehri',
      firstNameArabic: 'علي',
      lastNameArabic: 'الشهري',
      departmentName: 'Finance',
      position: 'Financial Analyst',
      positionArabic: 'محلل مالي',
      isSaudi: true,
      saudiId: '6789012345',
      nationality: 'Saudi',
      basicSalary: 12500,
      phone: '+966508901234',
    },
    {
      email: 'nora.alanazi@company.sa',
      firstName: 'Nora',
      lastName: 'Al-Anazi',
      firstNameArabic: 'نورة',
      lastNameArabic: 'العنزي',
      departmentName: 'Operations',
      position: 'Operations Coordinator',
      positionArabic: 'منسق عمليات',
      isSaudi: true,
      saudiId: '7890123456',
      nationality: 'Saudi',
      basicSalary: 9000,
      phone: '+966509012345',
    },
    {
      email: 'omar.alotaibi@company.sa',
      firstName: 'Omar',
      lastName: 'Al-Otaibi',
      firstNameArabic: 'عمر',
      lastNameArabic: 'العتيبي',
      departmentName: 'Information Technology',
      position: 'System Administrator',
      positionArabic: 'مدير نظم',
      isSaudi: true,
      saudiId: '8901234567',
      nationality: 'Saudi',
      basicSalary: 11500,
      phone: '+966500123456',
    },
  ];

  let createdCount = 0;

  for (const empData of employees) {
    const department = departments.find(d => d.name === empData.departmentName);
    
    if (!department) {
      console.log(`❌ Department not found for ${empData.email}`);
      continue;
    }

    try {
      // Create User first
      const user = await prisma.user.upsert({
        where: { email: empData.email },
        update: {},
        create: {
          email: empData.email,
          password: hashedPassword,
          role: 'EMPLOYEE',
          isActive: true,
        },
      });

      // Generate employee code
      const employeeCode = `EMP${String(createdCount + 1001).padStart(4, '0')}`;

      // Create Employee
      const employee = await prisma.employee.upsert({
        where: { email: empData.email },
        update: {},
        create: {
          employeeCode,
          userId: user.id,
          firstName: empData.firstName,
          lastName: empData.lastName,
          firstNameArabic: empData.firstNameArabic,
          lastNameArabic: empData.lastNameArabic,
          email: empData.email,
          phone: empData.phone,
          nationality: empData.nationality,
          isSaudi: empData.isSaudi,
          saudiId: empData.saudiId,
          iqamaNumber: empData.iqamaNumber,
          departmentId: department.id,
          position: empData.position,
          positionArabic: empData.positionArabic,
          employmentType: 'FULL_TIME',
          contractType: 'UNLIMITED',
          basicSalary: empData.basicSalary,
          housingAllowance: empData.basicSalary * 0.25,
          transportAllowance: 1000,
          foodAllowance: 500,
          totalSalary: empData.basicSalary + (empData.basicSalary * 0.25) + 1500,
          status: 'ACTIVE',
          annualLeaveDays: 21,
          sickLeaveDays: 30,
          workingHoursPerDay: 8,
          workingDaysPerWeek: 5,
          dateOfBirth: new Date('1990-01-01'),
          gender: empData.firstName === 'Fatima' || empData.firstName === 'Sarah' || 
                  empData.firstName === 'Nora' || empData.firstName === 'Maria' ? 'FEMALE' : 'MALE',
        },
      });

      createdCount++;
      console.log(`✅ Created employee: ${employee.firstName} ${employee.lastName} (${employeeCode})`);
    } catch (error) {
      console.log(`❌ Error creating ${empData.email}:`, error.message);
    }
  }

  console.log(`\n✅ Created ${createdCount} employees with user accounts`);

  // Create Onboarding Records
  console.log('\n📋 Creating onboarding records...');
  
  const onboardingRecords = [
    {
      status: OnboardingStatus.PENDING,
      firstName: 'Khaled',
      lastName: 'Al-Harbi',
      firstNameArabic: 'خالد',
      lastNameArabic: 'الحربي',
      email: 'khaled.alharbi@example.sa',
      phone: '+966555123456',
      dateOfBirth: new Date('1995-03-15'),
      gender: 'MALE',
      nationality: 'Saudi',
      isSaudi: true,
      nationalId: '1098765432',
      address: '123 King Fahd Road, Riyadh',
      city: 'Riyadh',
      postalCode: '12345',
      emergencyContactName: 'Mohammed Al-Harbi',
      emergencyContactPhone: '+966555999888',
      emergencyContactRelation: 'Father',
      departmentId: departments[1].id, // IT Department
      position: 'Backend Developer',
      contractType: 'UNLIMITED',
      joiningDate: new Date('2026-02-01'),
      basicSalary: 11000,
      housingAllowance: 2750,
      transportAllowance: 1000,
      foodAllowance: 500,
      bankName: 'Al Rajhi Bank',
      bankAccountNumber: '123456789012',
      iban: 'SA0380000000608010167519',
      experiences: {
        create: [
          {
            companyName: 'Tech Solutions Ltd',
            position: 'Junior Developer',
            startDate: new Date('2022-01-01'),
            endDate: new Date('2025-12-31'),
            isCurrent: false,
            responsibilities: 'Developed web applications using React and Node.js',
            reasonForLeaving: 'Career advancement opportunity',
          },
        ],
      },
      education: {
        create: [
          {
            institution: 'King Saud University',
            degree: 'Bachelor of Computer Science',
            fieldOfStudy: 'Computer Science',
            startDate: new Date('2014-09-01'),
            endDate: new Date('2018-06-30'),
            grade: 'Very Good',
          },
        ],
      },
      certificates: {
        create: [
          {
            name: 'AWS Certified Developer',
            issuingOrganization: 'Amazon Web Services',
            issueDate: new Date('2023-05-15'),
            expiryDate: new Date('2026-05-15'),
            credentialId: 'AWS-123456',
          },
        ],
      },
    },
    {
      status: OnboardingStatus.IN_PROGRESS,
      firstName: 'Nora',
      lastName: 'Al-Zahrani',
      firstNameArabic: 'نورة',
      lastNameArabic: 'الزهراني',
      email: 'nora.alzahrani@example.sa',
      phone: '+966556789012',
      dateOfBirth: new Date('1993-08-20'),
      gender: 'FEMALE',
      nationality: 'Saudi',
      isSaudi: true,
      nationalId: '2087654321',
      address: '456 Al-Malik Street, Jeddah',
      city: 'Jeddah',
      postalCode: '23456',
      emergencyContactName: 'Fatima Al-Zahrani',
      emergencyContactPhone: '+966556888777',
      emergencyContactRelation: 'Mother',
      departmentId: departments[0].id, // HR Department
      position: 'HR Specialist',
      contractType: 'UNLIMITED',
      joiningDate: new Date('2026-01-15'),
      basicSalary: 9500,
      housingAllowance: 2375,
      transportAllowance: 900,
      foodAllowance: 500,
      bankName: 'Saudi National Bank',
      bankAccountNumber: '987654321098',
      iban: 'SA1234567890123456789012',
      experiences: {
        create: [
          {
            companyName: 'Global HR Services',
            position: 'HR Assistant',
            startDate: new Date('2020-06-01'),
            endDate: new Date('2025-12-31'),
            isCurrent: false,
            responsibilities: 'Recruitment, employee onboarding, and HR documentation',
            reasonForLeaving: 'Better opportunity',
          },
        ],
      },
      education: {
        create: [
          {
            institution: 'King Abdulaziz University',
            degree: 'Bachelor of Business Administration',
            fieldOfStudy: 'Human Resources Management',
            startDate: new Date('2012-09-01'),
            endDate: new Date('2016-06-30'),
            grade: 'Excellent',
          },
        ],
      },
      certificates: {
        create: [
          {
            name: 'SHRM-CP Certified Professional',
            issuingOrganization: 'Society for Human Resource Management',
            issueDate: new Date('2022-11-10'),
            expiryDate: new Date('2025-11-10'),
            credentialId: 'SHRM-CP-98765',
          },
        ],
      },
    },
    {
      status: OnboardingStatus.PENDING,
      firstName: 'Omar',
      lastName: 'Hassan',
      email: 'omar.hassan@example.com',
      phone: '+966557890123',
      dateOfBirth: new Date('1992-11-05'),
      gender: 'MALE',
      nationality: 'Egyptian',
      isSaudi: false,
      iqamaNumber: '3123456789',
      iqamaExpiry: new Date('2027-12-31'),
      passportNumber: 'A12345678',
      passportExpiry: new Date('2028-06-30'),
      address: '789 Prince Sultan Road, Dammam',
      city: 'Dammam',
      postalCode: '34567',
      emergencyContactName: 'Ahmed Hassan',
      emergencyContactPhone: '+201234567890',
      emergencyContactRelation: 'Brother',
      departmentId: departments[2].id, // Finance Department
      position: 'Senior Accountant',
      contractType: 'LIMITED',
      joiningDate: new Date('2026-02-15'),
      basicSalary: 10500,
      housingAllowance: 2625,
      transportAllowance: 1000,
      foodAllowance: 500,
      bankName: 'Riyad Bank',
      bankAccountNumber: '456789012345',
      iban: 'SA9876543210987654321098',
      experiences: {
        create: [
          {
            companyName: 'International Finance Corp',
            position: 'Accountant',
            startDate: new Date('2018-03-01'),
            endDate: new Date('2025-11-30'),
            isCurrent: false,
            responsibilities: 'Financial reporting, budgeting, and account reconciliation',
            reasonForLeaving: 'Relocation to Saudi Arabia',
          },
        ],
      },
      education: {
        create: [
          {
            institution: 'Cairo University',
            degree: 'Bachelor of Commerce',
            fieldOfStudy: 'Accounting',
            startDate: new Date('2010-09-01'),
            endDate: new Date('2014-06-30'),
            grade: 'Very Good',
          },
        ],
      },
      certificates: {
        create: [
          {
            name: 'SOCPA Certified Accountant',
            issuingOrganization: 'Saudi Organization for CPAs',
            issueDate: new Date('2023-03-20'),
            credentialId: 'SOCPA-54321',
          },
        ],
      },
    },
    {
      status: OnboardingStatus.COMPLETED,
      firstName: 'Layla',
      lastName: 'Al-Dosari',
      firstNameArabic: 'ليلى',
      lastNameArabic: 'الدوسري',
      email: 'layla.aldosari@example.sa',
      phone: '+966558901234',
      dateOfBirth: new Date('1994-05-12'),
      gender: 'FEMALE',
      nationality: 'Saudi',
      isSaudi: true,
      nationalId: '3098765432',
      address: '321 Olaya Street, Riyadh',
      city: 'Riyadh',
      postalCode: '11564',
      emergencyContactName: 'Abdullah Al-Dosari',
      emergencyContactPhone: '+966558777666',
      emergencyContactRelation: 'Husband',
      departmentId: departments[4].id, // Marketing Department
      position: 'Marketing Coordinator',
      contractType: 'UNLIMITED',
      joiningDate: new Date('2026-01-01'),
      basicSalary: 8500,
      housingAllowance: 2125,
      transportAllowance: 850,
      foodAllowance: 500,
      bankName: 'Al Rajhi Bank',
      bankAccountNumber: '234567890123',
      iban: 'SA1122334455667788990011',
      completedAt: new Date('2025-12-28'),
      completedBy: 'admin@company.sa',
      experiences: {
        create: [
          {
            companyName: 'Creative Marketing Agency',
            position: 'Marketing Assistant',
            startDate: new Date('2019-07-01'),
            endDate: new Date('2025-11-30'),
            isCurrent: false,
            responsibilities: 'Social media management, content creation, campaign coordination',
            reasonForLeaving: 'Career growth',
          },
        ],
      },
      education: {
        create: [
          {
            institution: 'Princess Nourah University',
            degree: 'Bachelor of Marketing',
            fieldOfStudy: 'Marketing and Communications',
            startDate: new Date('2013-09-01'),
            endDate: new Date('2017-06-30'),
            grade: 'Excellent',
          },
        ],
      },
      certificates: {
        create: [
          {
            name: 'Google Digital Marketing Certificate',
            issuingOrganization: 'Google',
            issueDate: new Date('2021-08-15'),
            credentialId: 'GOOGLE-DM-12345',
          },
        ],
      },
    },
    {
      status: OnboardingStatus.PENDING,
      firstName: 'Yusuf',
      lastName: 'Al-Shehri',
      firstNameArabic: 'يوسف',
      lastNameArabic: 'الشهري',
      email: 'yusuf.alshehri@example.sa',
      phone: '+966559012345',
      dateOfBirth: new Date('1996-09-25'),
      gender: 'MALE',
      nationality: 'Saudi',
      isSaudi: true,
      nationalId: '4012345678',
      address: '567 King Abdullah Road, Khobar',
      city: 'Khobar',
      postalCode: '31952',
      emergencyContactName: 'Salem Al-Shehri',
      emergencyContactPhone: '+966559666555',
      emergencyContactRelation: 'Father',
      departmentId: departments[3].id, // Operations Department
      position: 'Operations Officer',
      contractType: 'UNLIMITED',
      joiningDate: new Date('2026-03-01'),
      basicSalary: 9000,
      housingAllowance: 2250,
      transportAllowance: 900,
      foodAllowance: 500,
      bankName: 'Saudi British Bank',
      bankAccountNumber: '345678901234',
      iban: 'SA2233445566778899001122',
      experiences: {
        create: [
          {
            companyName: 'Logistics Co.',
            position: 'Logistics Coordinator',
            startDate: new Date('2021-01-15'),
            endDate: new Date('2025-12-15'),
            isCurrent: false,
            responsibilities: 'Supply chain coordination, inventory management, vendor relations',
            reasonForLeaving: 'New opportunity',
          },
        ],
      },
      education: {
        create: [
          {
            institution: 'Imam Abdulrahman Bin Faisal University',
            degree: 'Bachelor of Business Administration',
            fieldOfStudy: 'Operations Management',
            startDate: new Date('2015-09-01'),
            endDate: new Date('2019-06-30'),
            grade: 'Very Good',
          },
        ],
      },
      certificates: {
        create: [
          {
            name: 'Six Sigma Green Belt',
            issuingOrganization: 'American Society for Quality',
            issueDate: new Date('2022-04-10'),
            credentialId: 'ASQ-6S-GB-789',
          },
        ],
      },
    },
  ];

  let onboardingCount = 0;
  for (const record of onboardingRecords) {
    try {
      await prisma.onboarding.create({
        data: record,
      });
      onboardingCount++;
      console.log(`✅ Created onboarding: ${record.firstName} ${record.lastName} (${record.status})`);
    } catch (error) {
      console.log(`❌ Error creating onboarding for ${record.email}:`, error.message);
    }
  }

  console.log(`\n✅ Created ${onboardingCount} onboarding records`);

  console.log('\n📊 Summary:');
  console.log(`   Departments: ${departments.length}`);
  console.log(`   Employees: ${createdCount}`);
  console.log(`   Onboarding Records: ${onboardingCount}`);
  console.log('\n🔑 Login credentials for all employees:');
  console.log('   Password: password123');
  console.log('\n📧 Sample login emails:');
  employees.slice(0, 3).forEach(emp => {
    console.log(`   - ${emp.email}`);
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n✅ Seeding completed successfully!');
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
