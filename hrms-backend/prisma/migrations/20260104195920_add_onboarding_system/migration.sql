-- CreateTable
CREATE TABLE "Onboarding" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstNameArabic" TEXT,
    "lastNameArabic" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "isSaudi" BOOLEAN NOT NULL DEFAULT false,
    "nationalId" TEXT,
    "iqamaNumber" TEXT,
    "iqamaExpiry" DATETIME,
    "passportNumber" TEXT,
    "passportExpiry" DATETIME,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "emergencyContactRelation" TEXT,
    "departmentId" INTEGER,
    "position" TEXT,
    "contractType" TEXT,
    "joiningDate" DATETIME,
    "basicSalary" REAL,
    "housingAllowance" REAL,
    "transportAllowance" REAL,
    "foodAllowance" REAL,
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "iban" TEXT,
    "photoPath" TEXT,
    "cvPath" TEXT,
    "idCopyPath" TEXT,
    "createdBy" TEXT,
    "completedBy" TEXT,
    "completedAt" DATETIME,
    "employeeId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OnboardingExperience" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "onboardingId" INTEGER NOT NULL,
    "companyName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "responsibilities" TEXT,
    "reasonForLeaving" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OnboardingExperience_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "Onboarding" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OnboardingEducation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "onboardingId" INTEGER NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "fieldOfStudy" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "grade" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OnboardingEducation_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "Onboarding" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OnboardingCertificate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "onboardingId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "issuingOrganization" TEXT NOT NULL,
    "issueDate" DATETIME NOT NULL,
    "expiryDate" DATETIME,
    "credentialId" TEXT,
    "certificatePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OnboardingCertificate_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "Onboarding" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Onboarding_email_key" ON "Onboarding"("email");
