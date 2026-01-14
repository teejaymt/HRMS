# Database & Prisma Conventions

## 📋 Table of Contents
1. [Schema Design Principles](#schema-design-principles)
2. [Naming Conventions](#naming-conventions)
3. [Data Types](#data-types)
4. [Relations](#relations)
5. [Enums](#enums)
6. [Indexes](#indexes)
7. [Migrations](#migrations)
8. [Seeding](#seeding)
9. [Prisma Client Usage](#prisma-client-usage)
10. [Query Patterns](#query-patterns)

## 🏗️ Schema Design Principles

### Model Organization
```prisma
// Group related models with comments
// ========== Authentication & Users ==========
model User {
  // ...
}

// ========== Employee Management ==========
model Employee {
  // ...
}

model Department {
  // ...
}

// ========== Time Management ==========
model Attendance {
  // ...
}

model Leave {
  // ...
}
```

### Field Organization Order
1. **ID field** - Always first
2. **Foreign keys** - Relation IDs
3. **Required fields** - Non-nullable business data
4. **Optional fields** - Nullable fields
5. **Relations** - Relation definitions
6. **Timestamps** - createdAt, updatedAt

```prisma
model Employee {
  // 1. ID
  id                 Int               @id @default(autoincrement())
  
  // 2. Foreign Keys
  userId             Int?              @unique
  departmentId       Int?
  
  // 3. Required Fields
  employeeCode       String            @unique
  firstName          String
  lastName           String
  email              String            @unique
  
  // 4. Optional Fields
  phone              String?
  dateOfBirth        DateTime?
  saudiId            String?
  
  // 5. Relations
  user               User?             @relation(fields: [userId], references: [id])
  department         Department?       @relation(fields: [departmentId], references: [id])
  leaves             Leave[]
  attendance         Attendance[]
  
  // 6. Timestamps
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt
}
```

## 📝 Naming Conventions

### Model Names
- **PascalCase** - `Employee`, `Department`, `LeaveRequest`
- **Singular** - Models represent a single entity
- **Descriptive** - Clear business domain terminology

```prisma
// GOOD
model Employee {}
model AdvanceRequest {}
model PayrollRecord {}

// AVOID
model Employees {}      // Plural
model emp {}            // Abbreviated
model Data {}           // Too generic
```

### Field Names
- **camelCase** - `firstName`, `dateOfBirth`, `iqamaNumber`
- **Descriptive** - Clear purpose
- **Consistent suffixes** - `Date`, `At`, `Count`, `Amount`

```prisma
// GOOD
firstName          String
joinDate           DateTime
totalSalary        Float
isActive           Boolean
employeeCount      Int

// AVOID
fname              String    // Abbreviated
Join_Date          DateTime  // Snake_case
TotalSalary        Float     // PascalCase
active             Boolean   // Missing 'is' prefix for booleans
```

### Relation Names
```prisma
model Employee {
  userId       Int?     @unique
  user         User?    @relation("UserEmployee", fields: [userId], references: [id])
  
  departmentId Int?
  department   Department? @relation(fields: [departmentId], references: [id])
}

// Use descriptive relation names for multiple relations
model Leave {
  employeeId     Int
  employee       Employee  @relation("EmployeeLeaves", fields: [employeeId], references: [id])
  
  approverId     Int?
  approver       Employee? @relation("ApprovedLeaves", fields: [approverId], references: [id])
}
```

## 🔤 Data Types

### Common Type Mapping

```prisma
// Strings
email          String            // Short text
description    String?           // Optional text
address        String            // Medium text

// Numbers
id             Int               // Integer primary key
age            Int               // Integer value
salary         Float             // Decimal/money
percentage     Float             // Percentage values

// Booleans
isActive       Boolean           @default(true)
isApproved     Boolean           @default(false)

// Dates
createdAt      DateTime          @default(now())
updatedAt      DateTime          @updatedAt
joinDate       DateTime
expiryDate     DateTime?         // Optional date

// Enums
role           Role              // Custom enum
status         EmployeeStatus    // Status enum
```

### Saudi-Specific Fields
```prisma
model Employee {
  // Arabic text fields
  firstNameArabic    String?
  lastNameArabic     String?
  addressArabic      String?
  
  // Saudi ID / Iqama
  saudiId            String?    @unique
  iqamaNumber        String?    @unique
  iqamaExpiryDate    DateTime?
  
  // Hijri dates (stored as strings)
  dateOfBirthHijri   String?
  joinDateHijri      String?
  
  // GOSI information
  gosiNumber         String?    @unique
  gosiRegistrationDate DateTime?
  
  // Nationality tracking
  nationality        String?
  isSaudi            Boolean    @default(false)
}
```

## 🔗 Relations

### One-to-One
```prisma
model User {
  id       Int       @id @default(autoincrement())
  email    String    @unique
  employee Employee? @relation("UserEmployee")
}

model Employee {
  id     Int   @id @default(autoincrement())
  userId Int?  @unique
  user   User? @relation("UserEmployee", fields: [userId], references: [id])
}
```

### One-to-Many
```prisma
model Department {
  id        Int        @id @default(autoincrement())
  name      String
  employees Employee[]
}

model Employee {
  id           Int         @id @default(autoincrement())
  departmentId Int?
  department   Department? @relation(fields: [departmentId], references: [id])
}
```

### Many-to-Many (Explicit Join Table)
```prisma
model Employee {
  id            Int                  @id @default(autoincrement())
  trainings     EmployeeTraining[]
}

model Training {
  id        Int                  @id @default(autoincrement())
  employees EmployeeTraining[]
}

model EmployeeTraining {
  employeeId   Int
  trainingId   Int
  completedAt  DateTime?
  score        Float?
  
  employee     Employee  @relation(fields: [employeeId], references: [id])
  training     Training  @relation(fields: [trainingId], references: [id])
  
  @@id([employeeId, trainingId])
}
```

### Cascade Behavior
```prisma
model Department {
  id        Int        @id @default(autoincrement())
  employees Employee[] @relation(onDelete: SetNull) // Set to null on delete
}

model Employee {
  id         Int         @id @default(autoincrement())
  leaves     Leave[]     @relation(onDelete: Cascade) // Delete leaves when employee deleted
}
```

## 📊 Enums

### Enum Definition
```prisma
enum Role {
  ADMIN
  HR
  MANAGER
  EMPLOYEE
}

enum EmployeeStatus {
  ACTIVE
  INACTIVE
  ON_LEAVE
  TERMINATED
  RESIGNED
}

enum Gender {
  MALE
  FEMALE
}

enum EmploymentType {
  FULL_TIME
  PART_TIME
  CONTRACT
  INTERN
}

enum ContractType {
  LIMITED      // محدد المدة
  UNLIMITED    // غير محدد المدة
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

enum WorkflowStatus {
  PENDING
  IN_PROGRESS
  APPROVED
  REJECTED
  COMPLETED
}
```

### Using Enums
```prisma
model Employee {
  status         EmployeeStatus   @default(ACTIVE)
  employmentType EmploymentType   @default(FULL_TIME)
  contractType   ContractType     @default(LIMITED)
  gender         Gender?
}
```

## 🔍 Indexes

### Single Field Index
```prisma
model Employee {
  email          String    @unique   // Implicit unique index
  employeeCode   String    @unique
  saudiId        String?   @unique
  iqamaNumber    String?   @unique
  
  // Explicit index for queries
  departmentId   Int?
  status         EmployeeStatus
  
  @@index([departmentId])
  @@index([status])
}
```

### Composite Index
```prisma
model Attendance {
  employeeId  Int
  date        DateTime
  checkIn     DateTime?
  checkOut    DateTime?
  
  @@index([employeeId, date])
  @@unique([employeeId, date])  // One attendance record per employee per day
}
```

### Full-Text Search (PostgreSQL)
```prisma
model Employee {
  firstName  String
  lastName   String
  email      String
  
  @@index([firstName, lastName])
}
```

## 🔄 Migrations

### Creating Migrations
```bash
# Create a new migration
npx prisma migrate dev --name add_employee_nationality

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Migration Best Practices
1. **Descriptive names** - `add_gosi_fields`, `update_leave_workflow`
2. **Small changes** - One logical change per migration
3. **Test migrations** - Always test in development first
4. **Review SQL** - Check generated SQL in `migrations/` folder
5. **Backup production** - Always backup before running migrations

### Manual Migration Edits
```sql
-- Add custom SQL in migration file if needed
-- Create custom indexes
CREATE INDEX CONCURRENTLY idx_employee_search ON "Employee" USING gin(to_tsvector('english', "firstName" || ' ' || "lastName"));

-- Add check constraints
ALTER TABLE "Employee" ADD CONSTRAINT salary_positive CHECK ("basicSalary" >= 0);
```

## 🌱 Seeding

### Seed File Structure
```typescript
// prisma/seed.ts
import { PrismaClient, Role, EmployeeStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hrms.com' },
    update: {},
    create: {
      email: 'admin@hrms.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });
  console.log('✓ Admin user created');

  // 2. Create departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { name: 'Human Resources' },
      update: {},
      create: {
        name: 'Human Resources',
        nameArabic: 'الموارد البشرية',
        description: 'HR Department',
      },
    }),
    prisma.department.upsert({
      where: { name: 'IT' },
      update: {},
      create: {
        name: 'IT',
        nameArabic: 'تقنية المعلومات',
        description: 'Information Technology',
      },
    }),
  ]);
  console.log('✓ Departments created');

  // 3. Create sample employees
  const employee = await prisma.employee.create({
    data: {
      employeeCode: 'EMP001',
      firstName: 'Ahmed',
      lastName: 'Al-Mansour',
      firstNameArabic: 'أحمد',
      lastNameArabic: 'المنصور',
      email: 'ahmed@company.com',
      phone: '+966501234567',
      departmentId: departments[0].id,
      position: 'HR Manager',
      positionArabic: 'مدير الموارد البشرية',
      status: EmployeeStatus.ACTIVE,
      isSaudi: true,
      nationality: 'Saudi',
      saudiId: '1234567890',
      joinDate: new Date('2023-01-01'),
      basicSalary: 10000,
      totalSalary: 10000,
    },
  });
  console.log('✓ Sample employees created');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Running Seeds
```bash
# Run seed
npx prisma db seed

# Reset and seed
npx prisma migrate reset
```

## 💻 Prisma Client Usage

### Service Injection
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.employee.findMany();
  }
}
```

### CRUD Operations

#### Create
```typescript
async create(data: any) {
  return this.prisma.employee.create({
    data: {
      ...data,
      employeeCode: await this.generateEmployeeCode(),
    },
    include: {
      department: true,
      user: true,
    },
  });
}
```

#### Read
```typescript
// Find many
async findAll() {
  return this.prisma.employee.findMany({
    where: { status: 'ACTIVE' },
    include: {
      department: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

// Find one
async findOne(id: number) {
  return this.prisma.employee.findUnique({
    where: { id },
    include: {
      department: true,
      user: true,
      leaves: true,
      attendance: {
        take: 10,
        orderBy: { date: 'desc' },
      },
    },
  });
}

// Find first
async findByEmail(email: string) {
  return this.prisma.employee.findFirst({
    where: { email },
  });
}
```

#### Update
```typescript
async update(id: number, data: any) {
  return this.prisma.employee.update({
    where: { id },
    data,
    include: {
      department: true,
    },
  });
}

// Update many
async updateStatus(ids: number[], status: EmployeeStatus) {
  return this.prisma.employee.updateMany({
    where: {
      id: { in: ids },
    },
    data: {
      status,
    },
  });
}
```

#### Delete
```typescript
async remove(id: number) {
  return this.prisma.employee.delete({
    where: { id },
  });
}

// Delete many
async removeMany(ids: number[]) {
  return this.prisma.employee.deleteMany({
    where: {
      id: { in: ids },
    },
  });
}
```

## 🔎 Query Patterns

### Filtering
```typescript
async findAll(filters: {
  status?: EmployeeStatus;
  departmentId?: number;
  search?: string;
}) {
  const where: any = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.departmentId) {
    where.departmentId = filters.departmentId;
  }

  if (filters.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { employeeCode: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return this.prisma.employee.findMany({ where });
}
```

### Pagination
```typescript
async findAll(options: { page?: number; limit?: number }) {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    this.prisma.employee.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.employee.count(),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
```

### Aggregations
```typescript
async getStats() {
  return this.prisma.employee.aggregate({
    _count: true,
    _avg: {
      basicSalary: true,
    },
    _sum: {
      basicSalary: true,
    },
    _max: {
      basicSalary: true,
    },
  });
}

// Group by
async getEmployeesByDepartment() {
  return this.prisma.employee.groupBy({
    by: ['departmentId'],
    _count: {
      id: true,
    },
  });
}
```

### Transactions
```typescript
async createEmployeeWithUser(employeeData: any, userData: any) {
  return this.prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: userData,
    });

    const employee = await tx.employee.create({
      data: {
        ...employeeData,
        userId: user.id,
      },
    });

    return { employee, user };
  });
}
```

### Raw Queries (Use Sparingly)
```typescript
// For complex queries not supported by Prisma
async customQuery() {
  return this.prisma.$queryRaw`
    SELECT 
      d.name as department_name,
      COUNT(e.id) as employee_count
    FROM "Department" d
    LEFT JOIN "Employee" e ON e."departmentId" = d.id
    GROUP BY d.name
  `;
}
```

## ✅ Best Practices

1. **Always use transactions** for multi-step operations
2. **Include relations** explicitly - Don't rely on defaults
3. **Use type-safe queries** - Leverage Prisma's TypeScript support
4. **Handle unique constraints** - Catch P2002 errors
5. **Optimize queries** - Use select/include wisely
6. **Index frequently queried fields**
7. **Use enums** for status fields
8. **Validate before insert** - Use DTOs and class-validator
9. **Soft delete** when possible - Use status field instead of DELETE
10. **Backup before migrations** in production

---

**Next**: [API Design Conventions](05-api-standards.md)
