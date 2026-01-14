# Saudi Compliance Guidelines

## 📋 Table of Contents
1. [Saudi Labor Law Overview](#saudi-labor-law-overview)
2. [Employee Data Requirements](#employee-data-requirements)
3. [Iqama & Visa Tracking](#iqama--visa-tracking)
4. [GOSI (Social Insurance)](#gosi-social-insurance)
5. [Nitaqat/Saudization](#nitaqatsaudization)
6. [Contract Types](#contract-types)
7. [Working Hours](#working-hours)
8. [Leave Entitlements](#leave-entitlements)
9. [End of Service Benefits](#end-of-service-benefits)
10. [Arabic Language Support](#arabic-language-support)
11. [Hijri Calendar](#hijri-calendar)

## ⚖️ Saudi Labor Law Overview

Saudi Arabia's labor law is governed by the **Saudi Labor Law (Royal Decree M/51)** and subsequent amendments. The HRMS must comply with these regulations.

### Key Principles
1. All employment contracts must be written and in Arabic
2. Probation period cannot exceed 90 days
3. Contracts can be limited (محدد المدة) or unlimited (غير محدد المدة)
4. Specific leave entitlements and working hours
5. End of service benefits calculation
6. GOSI registration mandatory
7. Nitaqat compliance for Saudi/expat ratio

## 👤 Employee Data Requirements

### Mandatory Fields for All Employees

```prisma
model Employee {
  // Basic Information
  firstName          String            // Required
  lastName           String            // Required
  firstNameArabic    String?           // Required for official docs
  lastNameArabic     String?           // Required for official docs
  email              String   @unique  // Required
  dateOfBirth        DateTime?         // Required
  gender             Gender?           // Required
  nationality        String?           // Required
  
  // Employment Details
  position           String            // Required
  joinDate           DateTime          // Required
  contractType       ContractType      // Required (LIMITED/UNLIMITED)
  basicSalary        Float             // Required
  
  // Nationality Tracking
  isSaudi            Boolean  @default(false)  // Required for Nitaqat
}
```

### Saudi National Requirements

```prisma
model Employee {
  isSaudi            Boolean           @default(false)
  saudiId            String?           @unique  // 10-digit National ID
  dateOfBirthHijri   String?                   // Hijri date
  
  // GOSI (mandatory for Saudis)
  gosiNumber         String?           @unique
  gosiRegistrationDate DateTime?
}
```

### Expat Employee Requirements

```prisma
model Employee {
  // Iqama (Residence Permit)
  iqamaNumber        String?           @unique  // 10-digit
  iqamaExpiryDate    DateTime?                  // Critical!
  iqamaExpiryHijri   String?
  
  // Passport
  passportNumber     String?
  passportExpiry     DateTime?
  
  // Visa & Entry
  visaNumber         String?
  borderNumber       String?           // Entry/exit tracking
  
  // Sponsor information
  sponsorId          String?           // Company/individual sponsor
}
```

### Additional Required Fields

```prisma
model Employee {
  // Contact (required)
  phone              String?           // Mobile number
  address            String?
  city               String?           // Saudi city
  
  // Father's name (required for official documents)
  fatherName         String?
  grandfatherName    String?
  
  // Bank details (required for salary)
  bankName           String?
  bankAccountNumber  String?
  ibanNumber         String?           // SA + 22 digits
}
```

## 🪪 Iqama & Visa Tracking

### Expiry Tracking

#### Database Fields
```prisma
model Employee {
  iqamaExpiryDate    DateTime?
  passportExpiry     DateTime?
  
  // Alerts
  iqamaExpiryAlert   Boolean  @default(false)
  passportExpiryAlert Boolean  @default(false)
}
```

#### Service Implementation
```typescript
@Injectable()
export class IqamaTrackingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get employees with Iqamas expiring within specified days
   */
  async getExpiringIqamas(daysAhead: number = 60) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.prisma.employee.findMany({
      where: {
        iqamaExpiryDate: {
          lte: futureDate,
          gte: new Date(),
        },
        status: 'ACTIVE',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true,
        iqamaNumber: true,
        iqamaExpiryDate: true,
        email: true,
        phone: true,
      },
      orderBy: {
        iqamaExpiryDate: 'asc',
      },
    });
  }

  /**
   * Check for expired Iqamas
   */
  async getExpiredIqamas() {
    return this.prisma.employee.findMany({
      where: {
        iqamaExpiryDate: {
          lt: new Date(),
        },
        status: 'ACTIVE',
      },
    });
  }

  /**
   * Scheduled task to check and alert
   */
  @Cron('0 9 * * *') // Run daily at 9 AM
  async checkExpiringDocuments() {
    const expiring60Days = await this.getExpiringIqamas(60);
    const expiring30Days = await this.getExpiringIqamas(30);
    const expired = await this.getExpiredIqamas();

    // Send notifications to HR
    if (expired.length > 0) {
      await this.notificationService.alertHR({
        type: 'EXPIRED_IQAMA',
        employees: expired,
        severity: 'CRITICAL',
      });
    }

    if (expiring30Days.length > 0) {
      await this.notificationService.alertHR({
        type: 'EXPIRING_SOON',
        employees: expiring30Days,
        severity: 'HIGH',
      });
    }
  }
}
```

### Iqama Renewal Workflow
```typescript
// Track renewal process
model IqamaRenewal {
  id                Int          @id @default(autoincrement())
  employeeId        Int
  employee          Employee     @relation(fields: [employeeId], references: [id])
  
  currentIqamaNumber String
  currentExpiryDate DateTime
  
  renewalStartDate  DateTime     @default(now())
  newExpiryDate     DateTime?
  newIqamaNumber    String?
  
  status            RenewalStatus @default(PENDING)
  submittedToMOL    Boolean      @default(false)
  approvedByMOL     Boolean      @default(false)
  completedDate     DateTime?
  
  notes             String?
  documents         String[]     // Array of document URLs
  
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
}

enum RenewalStatus {
  PENDING
  IN_PROGRESS
  SUBMITTED_TO_MOL
  APPROVED
  REJECTED
  COMPLETED
}
```

## 🏛️ GOSI (Social Insurance)

### GOSI Registration Fields

```prisma
model Employee {
  // GOSI Information
  gosiNumber            String?    @unique
  gosiRegistrationDate  DateTime?
  gosiContribution      Boolean    @default(false)
  
  // Contribution percentages (as per Saudi law)
  // Employee: 10% of salary (9% pension + 1% unemployment)
  // Employer: 12% of salary (9% pension + 2% unemployment + 1% occupational hazards)
  
  // Monthly GOSI tracking
  gosiRecords           GosiRecord[]
}

model GosiRecord {
  id                    Int       @id @default(autoincrement())
  employeeId            Int
  employee              Employee  @relation(fields: [employeeId], references: [id])
  
  month                 String    // YYYY-MM
  baseSalary            Float     // Salary used for GOSI calculation
  
  // Employee contribution (10%)
  employeeContribution  Float
  
  // Employer contribution (12%)
  employerContribution  Float
  
  // Total contribution
  totalContribution     Float
  
  submittedToGOSI       Boolean   @default(false)
  submissionDate        DateTime?
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  @@unique([employeeId, month])
}
```

### GOSI Calculation

```typescript
@Injectable()
export class GosiService {
  /**
   * Calculate GOSI contribution based on Saudi law
   */
  calculateGosiContribution(salary: number): {
    employeeContribution: number;
    employerContribution: number;
    totalContribution: number;
  } {
    // Employee contribution: 10% (9% pension + 1% unemployment)
    const employeeContribution = salary * 0.10;
    
    // Employer contribution: 12% (9% pension + 2% unemployment + 1% occupational)
    const employerContribution = salary * 0.12;
    
    // Total
    const totalContribution = employeeContribution + employerContribution;
    
    return {
      employeeContribution: Math.round(employeeContribution * 100) / 100,
      employerContribution: Math.round(employerContribution * 100) / 100,
      totalContribution: Math.round(totalContribution * 100) / 100,
    };
  }

  /**
   * Generate monthly GOSI report
   */
  async generateMonthlyReport(year: number, month: number) {
    const employees = await this.prisma.employee.findMany({
      where: {
        status: 'ACTIVE',
        gosiContribution: true,
      },
      include: {
        payroll: {
          where: {
            month: `${year}-${month.toString().padStart(2, '0')}`,
          },
        },
      },
    });

    const gosiRecords = employees.map(emp => {
      const salary = emp.payroll[0]?.basicSalary || emp.basicSalary;
      const contribution = this.calculateGosiContribution(salary);
      
      return {
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        gosiNumber: emp.gosiNumber,
        saudiId: emp.saudiId,
        iqamaNumber: emp.iqamaNumber,
        salary,
        ...contribution,
      };
    });

    return gosiRecords;
  }
}
```

### GOSI Alerts

```typescript
/**
 * Check for employees without GOSI registration
 */
async getEmployeesWithoutGOSI() {
  return this.prisma.employee.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { gosiNumber: null },
        { gosiRegistrationDate: null },
      ],
    },
  });
}
```

## 🇸🇦 Nitaqat/Saudization

### Department-Level Tracking

```prisma
model Department {
  id              Int        @id @default(autoincrement())
  name            String     @unique
  nameArabic      String?
  
  // Nitaqat tracking
  saudiCount      Int        @default(0)
  nonSaudiCount   Int        @default(0)
  
  // Auto-calculated
  totalCount      Int        @default(0)
  saudiPercentage Float      @default(0)
  
  employees       Employee[]
  
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
}
```

### Calculation Service

```typescript
@Injectable()
export class NitaqatService {
  constructor(private prisma: PrismaService) {}

  /**
   * Update Nitaqat counts for a department
   */
  async updateDepartmentCounts(departmentId: number) {
    const counts = await this.prisma.employee.groupBy({
      by: ['isSaudi'],
      where: {
        departmentId,
        status: 'ACTIVE',
      },
      _count: true,
    });

    const saudiCount = counts.find(c => c.isSaudi)?._count || 0;
    const nonSaudiCount = counts.find(c => !c.isSaudi)?._count || 0;
    const totalCount = saudiCount + nonSaudiCount;
    const saudiPercentage = totalCount > 0 ? (saudiCount / totalCount) * 100 : 0;

    await this.prisma.department.update({
      where: { id: departmentId },
      data: {
        saudiCount,
        nonSaudiCount,
        totalCount,
        saudiPercentage,
      },
    });

    return { saudiCount, nonSaudiCount, totalCount, saudiPercentage };
  }

  /**
   * Get company-wide Nitaqat status
   */
  async getCompanyNitaqatStatus() {
    const departments = await this.prisma.department.findMany({
      select: {
        id: true,
        name: true,
        saudiCount: true,
        nonSaudiCount: true,
        totalCount: true,
        saudiPercentage: true,
      },
    });

    const totals = departments.reduce(
      (acc, dept) => ({
        saudi: acc.saudi + dept.saudiCount,
        nonSaudi: acc.nonSaudi + dept.nonSaudiCount,
        total: acc.total + dept.totalCount,
      }),
      { saudi: 0, nonSaudi: 0, total: 0 }
    );

    const overallPercentage = totals.total > 0 
      ? (totals.saudi / totals.total) * 100 
      : 0;

    return {
      departments,
      totals: {
        ...totals,
        saudiPercentage: Math.round(overallPercentage * 100) / 100,
      },
    };
  }

  /**
   * Determine Nitaqat color band
   * Green: High Saudization (varies by industry)
   * Yellow: Medium
   * Red: Low
   */
  getNitaqatBand(percentage: number, industry: string): 'GREEN' | 'YELLOW' | 'RED' {
    // Example thresholds (adjust based on actual industry requirements)
    const thresholds: Record<string, { green: number; yellow: number }> = {
      IT: { green: 20, yellow: 10 },
      RETAIL: { green: 30, yellow: 15 },
      CONSTRUCTION: { green: 25, yellow: 12 },
      DEFAULT: { green: 25, yellow: 12 },
    };

    const threshold = thresholds[industry] || thresholds.DEFAULT;

    if (percentage >= threshold.green) return 'GREEN';
    if (percentage >= threshold.yellow) return 'YELLOW';
    return 'RED';
  }
}
```

## 📄 Contract Types

### Contract Type Implementation

```prisma
enum ContractType {
  LIMITED      // محدد المدة - Fixed term
  UNLIMITED    // غير محدد المدة - Indefinite
}

model Employee {
  contractType       ContractType     @default(LIMITED)
  contractStartDate  DateTime?
  contractEndDate    DateTime?        // Required for LIMITED contracts
  
  // Probation period (max 90 days as per law)
  probationEndDate   DateTime?
}
```

### Contract Validation

```typescript
@Injectable()
export class ContractService {
  /**
   * Validate contract dates
   */
  validateContract(data: {
    contractType: ContractType;
    contractStartDate: Date;
    contractEndDate?: Date;
    probationEndDate?: Date;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // LIMITED contract must have end date
    if (data.contractType === 'LIMITED' && !data.contractEndDate) {
      errors.push('Limited contract must have an end date');
    }

    // Contract end date must be after start date
    if (data.contractEndDate && data.contractEndDate <= data.contractStartDate) {
      errors.push('Contract end date must be after start date');
    }

    // Probation period validation (max 90 days)
    if (data.probationEndDate) {
      const diffDays = Math.floor(
        (data.probationEndDate.getTime() - data.contractStartDate.getTime()) /
        (1000 * 60 * 60 * 24)
      );

      if (diffDays > 90) {
        errors.push('Probation period cannot exceed 90 days');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check for expiring contracts
   */
  async getExpiringContracts(daysAhead: number = 60) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.prisma.employee.findMany({
      where: {
        contractType: 'LIMITED',
        contractEndDate: {
          lte: futureDate,
          gte: new Date(),
        },
        status: 'ACTIVE',
      },
      orderBy: {
        contractEndDate: 'asc',
      },
    });
  }
}
```

## ⏰ Working Hours

### Saudi Working Hours Regulations

```typescript
// Standard working hours per Saudi law
const WORKING_HOURS = {
  STANDARD: {
    DAILY: 8,
    WEEKLY: 48,
  },
  RAMADAN: {
    DAILY: 6,
    WEEKLY: 36,
  },
};

// Overtime calculation
const OVERTIME_MULTIPLIER = {
  REGULAR: 1.5,      // First 2 hours
  EXTENDED: 2.0,     // Beyond 2 hours
};
```

### Implementation

```prisma
model Attendance {
  id            Int       @id @default(autoincrement())
  employeeId    Int
  employee      Employee  @relation(fields: [employeeId], references: [id])
  
  date          DateTime
  checkIn       DateTime?
  checkOut      DateTime?
  
  // Calculated fields
  workHours     Float     @default(0)
  overtimeHours Float     @default(0)
  isRamadan     Boolean   @default(false)
  
  @@unique([employeeId, date])
}
```

```typescript
@Injectable()
export class AttendanceService {
  /**
   * Calculate work hours and overtime
   */
  calculateHours(
    checkIn: Date,
    checkOut: Date,
    isRamadan: boolean = false
  ): { workHours: number; overtimeHours: number } {
    const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
    const standardHours = isRamadan ? 6 : 8;

    const workHours = Math.min(hours, standardHours);
    const overtimeHours = Math.max(0, hours - standardHours);

    return {
      workHours: Math.round(workHours * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
    };
  }
}
```

## 🏖️ Leave Entitlements

### Saudi Leave Regulations

```typescript
// Annual leave entitlements as per Saudi law
const LEAVE_ENTITLEMENTS = {
  // Less than 5 years service: 21 days
  STANDARD: 21,
  
  // 5+ years service: 30 days
  EXPERIENCED: 30,
  
  // Sick leave: 30 days full pay, 60 days 75% pay, 30 days unpaid
  SICK: {
    FULL_PAY: 30,
    SEVENTY_FIVE_PERCENT: 60,
    UNPAID: 30,
  },
  
  // Special leaves
  MARRIAGE: 5,          // Marriage leave
  DEATH_RELATIVE: 5,    // Death of close relative
  MATERNITY: 70,        // 10 weeks (70 days)
  HAJJ: 10,             // Hajj pilgrimage (once in service)
  STUDY: 0,             // As per agreement
};
```

### Database Schema

```prisma
model Employee {
  // Leave balances
  annualLeaveBalance    Float  @default(21)
  sickLeaveBalance      Float  @default(120)  // 30+60+30
  hajjLeaveUsed         Boolean @default(false)
  
  // Service years (for leave calculation)
  serviceYears          Float  @default(0)
  
  leaves                Leave[]
}

model Leave {
  id                Int          @id @default(autoincrement())
  employeeId        Int
  employee          Employee     @relation(fields: [employeeId], references: [id])
  
  type              LeaveType
  startDate         DateTime
  endDate           DateTime
  days              Float        // Can be half days
  
  reason            String?
  status            LeaveStatus  @default(PENDING)
  
  // Approval workflow
  approverId        Int?
  approver          Employee?    @relation("ApprovedLeaves", fields: [approverId], references: [id])
  approvedAt        DateTime?
  rejectionReason   String?
  
  // Medical certificate for sick leave
  medicalCertificate String?
  
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
}

enum LeaveType {
  ANNUAL
  SICK
  EMERGENCY
  UNPAID
  MARRIAGE
  DEATH
  MATERNITY
  PATERNITY
  HAJJ
  STUDY
}
```

### Leave Calculation

```typescript
@Injectable()
export class LeaveService {
  /**
   * Calculate annual leave entitlement based on service years
   */
  calculateAnnualLeaveEntitlement(serviceYears: number): number {
    return serviceYears >= 5 ? 30 : 21;
  }

  /**
   * Update employee leave balance
   */
  async updateLeaveBalance(employeeId: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    const serviceYears = this.calculateServiceYears(employee.joinDate);
    const annualEntitlement = this.calculateAnnualLeaveEntitlement(serviceYears);

    // Get used leaves this year
    const usedLeaves = await this.prisma.leave.aggregate({
      where: {
        employeeId,
        status: 'APPROVED',
        startDate: {
          gte: new Date(new Date().getFullYear(), 0, 1),
        },
      },
      _sum: {
        days: true,
      },
    });

    const balance = annualEntitlement - (usedLeaves._sum.days || 0);

    await this.prisma.employee.update({
      where: { id: employeeId },
      data: {
        annualLeaveBalance: balance,
        serviceYears,
      },
    });

    return balance;
  }

  /**
   * Calculate service years
   */
  calculateServiceYears(joinDate: Date): number {
    const diffMs = new Date().getTime() - joinDate.getTime();
    const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(years * 10) / 10; // Round to 1 decimal
  }
}
```

## 💰 End of Service Benefits

### Calculation Rules

```typescript
@Injectable()
export class EndOfServiceService {
  /**
   * Calculate end of service benefits (gratuity) as per Saudi law
   * 
   * Rules:
   * - Unlimited contract:
   *   - First 5 years: half month salary per year
   *   - After 5 years: 1 month salary per year
   * 
   * - Limited contract:
   *   - If employee completes contract: full benefits
   *   - If employee resigns: reduced benefits based on service years
   */
  calculateGratuity(
    basicSalary: number,
    serviceYears: number,
    contractType: 'LIMITED' | 'UNLIMITED',
    terminationType: 'RESIGNATION' | 'TERMINATION' | 'CONTRACT_END'
  ): number {
    let gratuity = 0;

    if (contractType === 'UNLIMITED') {
      // First 5 years: 0.5 month per year
      const firstPeriod = Math.min(serviceYears, 5);
      gratuity += (basicSalary * 0.5) * firstPeriod;

      // After 5 years: 1 month per year
      if (serviceYears > 5) {
        const secondPeriod = serviceYears - 5;
        gratuity += basicSalary * secondPeriod;
      }

      // If resignation, reduce based on service years
      if (terminationType === 'RESIGNATION') {
        if (serviceYears < 2) {
          gratuity = 0; // No gratuity
        } else if (serviceYears >= 2 && serviceYears < 5) {
          gratuity *= 0.33; // 1/3 of calculated amount
        } else if (serviceYears >= 5 && serviceYears < 10) {
          gratuity *= 0.66; // 2/3 of calculated amount
        }
        // 10+ years: full gratuity even on resignation
      }
    } else {
      // LIMITED contract
      if (terminationType === 'CONTRACT_END' || terminationType === 'TERMINATION') {
        // Full benefits
        gratuity = (basicSalary / 12) * (serviceYears * 12); // Pro-rata
      } else if (terminationType === 'RESIGNATION') {
        // Reduced based on service years (similar to unlimited)
        const fullAmount = (basicSalary / 12) * (serviceYears * 12);
        
        if (serviceYears < 2) {
          gratuity = 0;
        } else if (serviceYears >= 2 && serviceYears < 5) {
          gratuity = fullAmount * 0.33;
        } else if (serviceYears >= 5 && serviceYears < 10) {
          gratuity = fullAmount * 0.66;
        } else {
          gratuity = fullAmount;
        }
      }
    }

    return Math.round(gratuity * 100) / 100;
  }

  /**
   * Calculate final settlement
   */
  async calculateFinalSettlement(employeeId: number, endDate: Date) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    const serviceYears = this.calculateServiceYears(
      employee.joinDate,
      endDate
    );

    // 1. End of service gratuity
    const gratuity = this.calculateGratuity(
      employee.basicSalary,
      serviceYears,
      employee.contractType,
      'CONTRACT_END' // Adjust based on actual termination type
    );

    // 2. Unused annual leave
    const unusedLeave = employee.annualLeaveBalance;
    const leavePayout = (employee.basicSalary / 30) * unusedLeave;

    // 3. Last month salary (pro-rata if needed)
    const lastMonthDays = this.calculateWorkedDaysInMonth(endDate);
    const lastMonthSalary = (employee.totalSalary / 30) * lastMonthDays;

    // 4. Any pending allowances or bonuses

    const totalSettlement = gratuity + leavePayout + lastMonthSalary;

    return {
      gratuity,
      unusedLeavedays: unusedLeave,
      leavePayout,
      lastMonthSalary,
      totalSettlement: Math.round(totalSettlement * 100) / 100,
    };
  }

  private calculateServiceYears(joinDate: Date, endDate: Date): number {
    const diffMs = endDate.getTime() - joinDate.getTime();
    const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(years * 10) / 10;
  }

  private calculateWorkedDaysInMonth(endDate: Date): number {
    return endDate.getDate();
  }
}
```

## 🔤 Arabic Language Support

### Database Fields

```prisma
model Employee {
  // English fields
  firstName          String
  lastName           String
  position           String
  address            String?
  
  // Arabic equivalents (required for official documents)
  firstNameArabic    String?
  lastNameArabic     String?
  positionArabic     String?
  addressArabic      String?
}

model Department {
  name               String   @unique
  nameArabic         String?
}
```

### API Responses

```typescript
// Return both languages
{
  "id": 123,
  "firstName": "Ahmed",
  "lastName": "Al-Mansour",
  "firstNameArabic": "أحمد",
  "lastNameArabic": "المنصور",
  "position": "Software Engineer",
  "positionArabic": "مهندس برمجيات"
}
```

### Form Validation

```typescript
import { IsString, IsOptional, Matches } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  @Matches(/^[\u0600-\u06FF\s]+$/, {
    message: 'First name (Arabic) must contain only Arabic characters',
  })
  firstNameArabic?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[\u0600-\u06FF\s]+$/, {
    message: 'Last name (Arabic) must contain only Arabic characters',
  })
  lastNameArabic?: string;
}
```

## 📅 Hijri Calendar

### Hijri Date Fields

```prisma
model Employee {
  // Gregorian dates
  dateOfBirth        DateTime?
  joinDate           DateTime
  
  // Hijri equivalents (stored as strings)
  dateOfBirthHijri   String?    // e.g., "15/05/1415"
  joinDateHijri      String?
  
  // Iqama expiry (both calendars)
  iqamaExpiryDate    DateTime?
  iqamaExpiryHijri   String?
}
```

### Hijri Conversion Service

```typescript
@Injectable()
export class HijriService {
  /**
   * Convert Gregorian to Hijri (basic implementation)
   * For production, use a library like moment-hijri
   */
  gregorianToHijri(date: Date): string {
    // Use a proper Hijri conversion library
    // This is a placeholder
    return '15/05/1446'; // DD/MM/YYYY format
  }

  /**
   * Convert Hijri to Gregorian
   */
  hijriToGregorian(hijriDate: string): Date {
    // Use a proper Hijri conversion library
    // This is a placeholder
    return new Date();
  }

  /**
   * Format Hijri date for display
   */
  formatHijri(hijriDate: string, locale: 'ar' | 'en' = 'en'): string {
    if (locale === 'ar') {
      return hijriDate; // Arabic numerals
    }
    return hijriDate; // English numerals
  }
}
```

## ✅ Compliance Checklist

When implementing employee features, ensure:

- [ ] **Arabic name fields** are collected for Saudi nationals
- [ ] **Iqama tracking** for expats with expiry alerts
- [ ] **GOSI registration** is mandatory and tracked
- [ ] **Nitaqat counters** are updated on employee changes
- [ ] **Contract type** is specified (LIMITED/UNLIMITED)
- [ ] **Probation period** does not exceed 90 days
- [ ] **Leave entitlements** match Saudi law requirements
- [ ] **Working hours** comply with regulations (8h/day, 6h Ramadan)
- [ ] **End of service benefits** are calculated correctly
- [ ] **Hijri dates** are provided where applicable
- [ ] **IBAN format** is validated (SA + 22 digits)
- [ ] **National ID/Iqama** are 10 digits

---

**Next**: [File Structure & Naming Conventions](07-file-structure.md)
