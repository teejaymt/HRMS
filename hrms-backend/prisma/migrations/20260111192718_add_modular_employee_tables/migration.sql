-- CreateTable
CREATE TABLE "EmployeeEducation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "degree" TEXT NOT NULL,
    "fieldOfStudy" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "institutionArabic" TEXT,
    "country" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "grade" TEXT,
    "isHighest" BOOLEAN NOT NULL DEFAULT false,
    "certificatePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmployeeEducation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmployeeExperience" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "company" TEXT NOT NULL,
    "companyArabic" TEXT,
    "position" TEXT NOT NULL,
    "positionArabic" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "responsibilities" TEXT,
    "salary" REAL,
    "reasonForLeaving" TEXT,
    "certificatePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmployeeExperience_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmployeeCertification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "certificationName" TEXT NOT NULL,
    "issuingOrganization" TEXT NOT NULL,
    "issueDate" DATETIME NOT NULL,
    "expiryDate" DATETIME,
    "credentialId" TEXT,
    "credentialUrl" TEXT,
    "certificatePath" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmployeeCertification_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmployeeSalaryHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "effectiveDate" DATETIME NOT NULL,
    "effectiveDateHijri" TEXT,
    "basicSalary" REAL NOT NULL,
    "housingAllowance" REAL NOT NULL DEFAULT 0,
    "transportAllowance" REAL NOT NULL DEFAULT 0,
    "foodAllowance" REAL NOT NULL DEFAULT 0,
    "otherAllowances" REAL NOT NULL DEFAULT 0,
    "totalSalary" REAL NOT NULL,
    "gosiEmployerShare" REAL NOT NULL DEFAULT 0,
    "gosiEmployeeShare" REAL NOT NULL DEFAULT 0,
    "changeReason" TEXT,
    "changeType" TEXT NOT NULL DEFAULT 'ADJUSTMENT',
    "previousSalary" REAL,
    "percentageIncrease" REAL,
    "changedBy" TEXT,
    "approvedBy" TEXT,
    "approvalDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmployeeSalaryHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmployeeSaudiCompliance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "saudiId" TEXT,
    "iqamaNumber" TEXT,
    "iqamaExpiryDate" DATETIME,
    "iqamaExpiryHijri" TEXT,
    "iqamaProfession" TEXT,
    "sponsorName" TEXT,
    "passportNumber" TEXT,
    "passportExpiry" DATETIME,
    "passportCountry" TEXT,
    "visaNumber" TEXT,
    "visaType" TEXT,
    "visaExpiryDate" DATETIME,
    "borderNumber" TEXT,
    "gosiNumber" TEXT,
    "gosiRegistrationDate" DATETIME,
    "gosiSalary" REAL,
    "workPermitNumber" TEXT,
    "workPermitExpiry" DATETIME,
    "medicalInsuranceProvider" TEXT,
    "medicalInsuranceNumber" TEXT,
    "medicalInsuranceExpiry" DATETIME,
    "exitReentryNumber" TEXT,
    "exitReentryExpiry" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmployeeSaudiCompliance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmployeeDocument" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "documentType" TEXT NOT NULL,
    "documentName" TEXT NOT NULL,
    "documentPath" TEXT NOT NULL,
    "uploadDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" DATETIME,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmployeeDocument_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmployeeDependent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "fullNameArabic" TEXT,
    "relationship" TEXT NOT NULL,
    "dateOfBirth" DATETIME,
    "dateOfBirthHijri" TEXT,
    "gender" TEXT,
    "nationality" TEXT,
    "iqamaNumber" TEXT,
    "passportNumber" TEXT,
    "isOnSponsor" BOOLEAN NOT NULL DEFAULT false,
    "isInsured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmployeeDependent_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DependentDocument" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dependentId" INTEGER NOT NULL,
    "documentType" TEXT NOT NULL,
    "documentName" TEXT NOT NULL,
    "documentPath" TEXT NOT NULL,
    "uploadDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" DATETIME,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DependentDocument_dependentId_fkey" FOREIGN KEY ("dependentId") REFERENCES "EmployeeDependent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSaudiCompliance_employeeId_key" ON "EmployeeSaudiCompliance"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSaudiCompliance_saudiId_key" ON "EmployeeSaudiCompliance"("saudiId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSaudiCompliance_iqamaNumber_key" ON "EmployeeSaudiCompliance"("iqamaNumber");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSaudiCompliance_gosiNumber_key" ON "EmployeeSaudiCompliance"("gosiNumber");
