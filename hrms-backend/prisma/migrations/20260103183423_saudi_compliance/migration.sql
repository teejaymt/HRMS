-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Department" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "nameArabic" TEXT,
    "description" TEXT,
    "saudiCount" INTEGER NOT NULL DEFAULT 0,
    "nonSaudiCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "employeeCode" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstNameArabic" TEXT,
    "lastNameArabic" TEXT,
    "fatherName" TEXT,
    "grandfatherName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "dateOfBirth" DATETIME,
    "dateOfBirthHijri" TEXT,
    "gender" TEXT,
    "nationality" TEXT,
    "isSaudi" BOOLEAN NOT NULL DEFAULT false,
    "saudiId" TEXT,
    "iqamaNumber" TEXT,
    "iqamaExpiryDate" DATETIME,
    "iqamaExpiryHijri" TEXT,
    "passportNumber" TEXT,
    "passportExpiry" DATETIME,
    "visaNumber" TEXT,
    "borderNumber" TEXT,
    "gosiNumber" TEXT,
    "gosiRegistrationDate" DATETIME,
    "gosiContribution" BOOLEAN NOT NULL DEFAULT false,
    "address" TEXT,
    "addressArabic" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT DEFAULT 'Saudi Arabia',
    "departmentId" INTEGER,
    "position" TEXT NOT NULL,
    "positionArabic" TEXT,
    "employmentType" TEXT NOT NULL DEFAULT 'FULL_TIME',
    "contractType" TEXT NOT NULL DEFAULT 'LIMITED',
    "joinDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinDateHijri" TEXT,
    "contractStartDate" DATETIME,
    "contractEndDate" DATETIME,
    "probationEndDate" DATETIME,
    "basicSalary" REAL NOT NULL,
    "housingAllowance" REAL NOT NULL DEFAULT 0,
    "transportAllowance" REAL NOT NULL DEFAULT 0,
    "foodAllowance" REAL NOT NULL DEFAULT 0,
    "otherAllowances" REAL NOT NULL DEFAULT 0,
    "totalSalary" REAL NOT NULL,
    "gosiEmployerShare" REAL NOT NULL DEFAULT 0,
    "gosiEmployeeShare" REAL NOT NULL DEFAULT 0,
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "ibanNumber" TEXT,
    "workingHoursPerDay" INTEGER NOT NULL DEFAULT 8,
    "workingDaysPerWeek" INTEGER NOT NULL DEFAULT 5,
    "weekendDays" TEXT NOT NULL DEFAULT 'Friday,Saturday',
    "annualLeaveDays" INTEGER NOT NULL DEFAULT 21,
    "sickLeaveDays" INTEGER NOT NULL DEFAULT 30,
    "hajjLeaveUsed" BOOLEAN NOT NULL DEFAULT false,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "emergencyRelation" TEXT,
    "eosbEligible" BOOLEAN NOT NULL DEFAULT true,
    "eosbCalculatedAmount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "terminationDate" DATETIME,
    "terminationReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Leave" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "leaveType" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "startDateHijri" TEXT,
    "endDate" DATETIME NOT NULL,
    "endDateHijri" TEXT,
    "days" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "reasonArabic" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "rejectedBy" TEXT,
    "rejectedAt" DATETIME,
    "comments" TEXT,
    "isPaid" BOOLEAN NOT NULL DEFAULT true,
    "deductFromSalary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Leave_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "dateHijri" TEXT,
    "checkIn" DATETIME,
    "checkOut" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PRESENT',
    "workHours" REAL,
    "overtime" REAL,
    "lateMinutes" INTEGER NOT NULL DEFAULT 0,
    "earlyLeaveMinutes" INTEGER NOT NULL DEFAULT 0,
    "isWeekend" BOOLEAN NOT NULL DEFAULT false,
    "isHoliday" BOOLEAN NOT NULL DEFAULT false,
    "holidayName" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payroll" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "monthHijri" INTEGER,
    "year" INTEGER NOT NULL,
    "yearHijri" INTEGER,
    "basicSalary" REAL NOT NULL,
    "housingAllowance" REAL NOT NULL DEFAULT 0,
    "transportAllowance" REAL NOT NULL DEFAULT 0,
    "foodAllowance" REAL NOT NULL DEFAULT 0,
    "otherAllowances" REAL NOT NULL DEFAULT 0,
    "overtimePay" REAL NOT NULL DEFAULT 0,
    "bonuses" REAL NOT NULL DEFAULT 0,
    "gosiEmployeeDeduction" REAL NOT NULL DEFAULT 0,
    "absenceDeduction" REAL NOT NULL DEFAULT 0,
    "lateDeduction" REAL NOT NULL DEFAULT 0,
    "loanDeduction" REAL NOT NULL DEFAULT 0,
    "otherDeductions" REAL NOT NULL DEFAULT 0,
    "gosiEmployerContribution" REAL NOT NULL DEFAULT 0,
    "grossSalary" REAL NOT NULL,
    "totalDeductions" REAL NOT NULL,
    "netSalary" REAL NOT NULL,
    "paymentDate" DATETIME,
    "paymentDateHijri" TEXT,
    "paymentMethod" TEXT,
    "paymentReference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payroll_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Violation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "violationType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionArabic" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateHijri" TEXT,
    "penaltyAmount" REAL NOT NULL DEFAULT 0,
    "warningLevel" INTEGER NOT NULL DEFAULT 1,
    "issuedBy" TEXT NOT NULL,
    "acknowledgedBy" TEXT,
    "acknowledgedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Violation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Performance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "reviewPeriod" TEXT NOT NULL,
    "reviewPeriodHijri" TEXT,
    "rating" INTEGER NOT NULL,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "goals" TEXT,
    "comments" TEXT,
    "reviewedBy" TEXT NOT NULL,
    "reviewDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextReviewDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Performance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "titleArabic" TEXT,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "documentNumber" TEXT,
    "issueDate" DATETIME,
    "expiryDate" DATETIME,
    "issuedBy" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Document_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PublicHoliday" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "nameArabic" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "dateHijri" TEXT,
    "isNational" BOOLEAN NOT NULL DEFAULT false,
    "isReligious" BOOLEAN NOT NULL DEFAULT false,
    "isPaid" BOOLEAN NOT NULL DEFAULT true,
    "year" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeCode_key" ON "Employee"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_saudiId_key" ON "Employee"("saudiId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_iqamaNumber_key" ON "Employee"("iqamaNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_gosiNumber_key" ON "Employee"("gosiNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_employeeId_date_key" ON "Attendance"("employeeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Payroll_employeeId_month_year_key" ON "Payroll"("employeeId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "PublicHoliday_date_year_key" ON "PublicHoliday"("date", "year");
