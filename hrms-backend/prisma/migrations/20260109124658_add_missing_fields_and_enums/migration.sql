/*
  Warnings:

  - Added the required column `deviceCode` to the `BiometricDevice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `BiometricDevice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `ERPIntegration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `integrationId` to the `ERPSyncLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postedBy` to the `JobPosting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN "hoursWorked" REAL;

-- AlterTable
ALTER TABLE "BiometricLog" ADD COLUMN "employeeId" INTEGER;
ALTER TABLE "BiometricLog" ADD COLUMN "processedAt" DATETIME;

-- AlterTable
ALTER TABLE "Payroll" ADD COLUMN "payPeriodStart" DATETIME;

-- AlterTable
ALTER TABLE "TicketFamilyMember" ADD COLUMN "ticketCost" REAL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdvanceRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "requestDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestType" TEXT NOT NULL DEFAULT 'SALARY_ADVANCE',
    "amount" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "reasonArabic" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "rejectedBy" TEXT,
    "rejectedAt" DATETIME,
    "rejectionReason" TEXT,
    "comments" TEXT,
    "disbursedAmount" REAL,
    "disbursedAt" DATETIME,
    "repaymentMonths" INTEGER NOT NULL DEFAULT 1,
    "monthlyDeduction" REAL,
    "remainingAmount" REAL,
    "totalRepaid" REAL NOT NULL DEFAULT 0,
    "isFullyRepaid" BOOLEAN NOT NULL DEFAULT false,
    "repaymentStartDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdvanceRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AdvanceRequest" ("amount", "approvedAt", "approvedBy", "comments", "createdAt", "employeeId", "id", "monthlyDeduction", "reason", "reasonArabic", "rejectedAt", "rejectedBy", "remainingAmount", "repaymentMonths", "repaymentStartDate", "requestDate", "status", "updatedAt") SELECT "amount", "approvedAt", "approvedBy", "comments", "createdAt", "employeeId", "id", "monthlyDeduction", "reason", "reasonArabic", "rejectedAt", "rejectedBy", "remainingAmount", "repaymentMonths", "repaymentStartDate", "requestDate", "status", "updatedAt" FROM "AdvanceRequest";
DROP TABLE "AdvanceRequest";
ALTER TABLE "new_AdvanceRequest" RENAME TO "AdvanceRequest";
CREATE TABLE "new_Applicant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "jobPostingId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstNameArabic" TEXT,
    "lastNameArabic" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dateOfBirth" DATETIME,
    "nationality" TEXT,
    "isSaudi" BOOLEAN NOT NULL DEFAULT false,
    "resumePath" TEXT,
    "coverLetter" TEXT,
    "applicationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'APPLIED',
    "currentStage" TEXT NOT NULL DEFAULT 'APPLICATION_REVIEW',
    "screeningNotes" TEXT,
    "score" INTEGER,
    "scoredBy" TEXT,
    "onboardingId" INTEGER,
    "employeeId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Applicant_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "JobPosting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Applicant" ("applicationDate", "coverLetter", "createdAt", "dateOfBirth", "email", "employeeId", "firstName", "firstNameArabic", "id", "isSaudi", "jobPostingId", "lastName", "lastNameArabic", "nationality", "onboardingId", "phone", "resumePath", "screeningNotes", "status", "updatedAt") SELECT "applicationDate", "coverLetter", "createdAt", "dateOfBirth", "email", "employeeId", "firstName", "firstNameArabic", "id", "isSaudi", "jobPostingId", "lastName", "lastNameArabic", "nationality", "onboardingId", "phone", "resumePath", "screeningNotes", "status", "updatedAt" FROM "Applicant";
DROP TABLE "Applicant";
ALTER TABLE "new_Applicant" RENAME TO "Applicant";
CREATE TABLE "new_BiometricDevice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceName" TEXT NOT NULL,
    "deviceCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 4370,
    "serialNumber" TEXT,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastSync" DATETIME,
    "lastSyncTime" DATETIME,
    "apiEndpoint" TEXT,
    "apiKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BiometricDevice" ("apiEndpoint", "apiKey", "createdAt", "deviceName", "deviceType", "id", "ipAddress", "isActive", "lastSync", "location", "port", "serialNumber", "updatedAt") SELECT "apiEndpoint", "apiKey", "createdAt", "deviceName", "deviceType", "id", "ipAddress", "isActive", "lastSync", "location", "port", "serialNumber", "updatedAt" FROM "BiometricDevice";
DROP TABLE "BiometricDevice";
ALTER TABLE "new_BiometricDevice" RENAME TO "BiometricDevice";
CREATE UNIQUE INDEX "BiometricDevice_deviceName_key" ON "BiometricDevice"("deviceName");
CREATE UNIQUE INDEX "BiometricDevice_deviceCode_key" ON "BiometricDevice"("deviceCode");
CREATE UNIQUE INDEX "BiometricDevice_serialNumber_key" ON "BiometricDevice"("serialNumber");
CREATE TABLE "new_ERPIntegration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "erpSystem" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "apiEndpoint" TEXT NOT NULL,
    "apiKey" TEXT,
    "username" TEXT,
    "password" TEXT,
    "syncFrequency" TEXT NOT NULL DEFAULT 'DAILY',
    "syncDirection" TEXT NOT NULL DEFAULT 'BIDIRECTIONAL',
    "lastSyncAt" DATETIME,
    "lastSyncTime" DATETIME,
    "nextSyncAt" DATETIME,
    "employeeFieldMap" TEXT,
    "payrollFieldMap" TEXT,
    "employeeMapping" TEXT,
    "payrollMapping" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ERPIntegration" ("apiEndpoint", "apiKey", "createdAt", "employeeFieldMap", "erpSystem", "id", "isActive", "lastSyncAt", "nextSyncAt", "password", "payrollFieldMap", "syncDirection", "syncFrequency", "updatedAt", "username") SELECT "apiEndpoint", "apiKey", "createdAt", "employeeFieldMap", "erpSystem", "id", "isActive", "lastSyncAt", "nextSyncAt", "password", "payrollFieldMap", "syncDirection", "syncFrequency", "updatedAt", "username" FROM "ERPIntegration";
DROP TABLE "ERPIntegration";
ALTER TABLE "new_ERPIntegration" RENAME TO "ERPIntegration";
CREATE TABLE "new_ERPSyncLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "erpIntegrationId" INTEGER NOT NULL,
    "integrationId" INTEGER NOT NULL,
    "entityType" TEXT,
    "syncType" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "recordsFailed" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "errorDetails" TEXT,
    "duration" INTEGER,
    "syncStarted" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncCompleted" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ERPSyncLog_erpIntegrationId_fkey" FOREIGN KEY ("erpIntegrationId") REFERENCES "ERPIntegration" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ERPSyncLog" ("createdAt", "direction", "erpIntegrationId", "errorDetails", "id", "recordsFailed", "recordsProcessed", "status", "syncCompleted", "syncStarted", "syncType") SELECT "createdAt", "direction", "erpIntegrationId", "errorDetails", "id", "recordsFailed", "recordsProcessed", "status", "syncCompleted", "syncStarted", "syncType" FROM "ERPSyncLog";
DROP TABLE "ERPSyncLog";
ALTER TABLE "new_ERPSyncLog" RENAME TO "ERPSyncLog";
CREATE TABLE "new_Interview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicantId" INTEGER NOT NULL,
    "interviewType" TEXT NOT NULL DEFAULT 'PHONE_SCREEN',
    "interviewMode" TEXT NOT NULL DEFAULT 'PHONE',
    "scheduledDate" DATETIME NOT NULL,
    "scheduledTime" TEXT,
    "location" TEXT,
    "interviewerName" TEXT,
    "interviewerEmail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "feedback" TEXT,
    "rating" INTEGER,
    "outcome" TEXT,
    "recommendation" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Interview_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Interview" ("applicantId", "createdAt", "feedback", "id", "interviewType", "interviewerEmail", "interviewerName", "location", "outcome", "rating", "scheduledDate", "scheduledTime", "status", "updatedAt") SELECT "applicantId", "createdAt", "feedback", "id", "interviewType", "interviewerEmail", "interviewerName", "location", "outcome", "rating", "scheduledDate", "scheduledTime", "status", "updatedAt" FROM "Interview";
DROP TABLE "Interview";
ALTER TABLE "new_Interview" RENAME TO "Interview";
CREATE TABLE "new_JobPosting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "jobTitle" TEXT NOT NULL,
    "jobTitleArabic" TEXT,
    "departmentId" INTEGER,
    "position" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL DEFAULT 'FULL_TIME',
    "contractType" TEXT NOT NULL DEFAULT 'LIMITED',
    "description" TEXT NOT NULL,
    "descriptionArabic" TEXT,
    "requirements" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL,
    "salaryMin" REAL,
    "salaryMax" REAL,
    "benefits" TEXT,
    "postingDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedDate" DATETIME,
    "closingDate" DATETIME,
    "numberOfVacancies" INTEGER NOT NULL DEFAULT 1,
    "postedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JobPosting_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_JobPosting" ("benefits", "closingDate", "contractType", "createdAt", "departmentId", "description", "descriptionArabic", "employmentType", "id", "jobTitle", "jobTitleArabic", "numberOfVacancies", "position", "postingDate", "requirements", "responsibilities", "salaryMax", "salaryMin", "status", "updatedAt") SELECT "benefits", "closingDate", "contractType", "createdAt", "departmentId", "description", "descriptionArabic", "employmentType", "id", "jobTitle", "jobTitleArabic", "numberOfVacancies", "position", "postingDate", "requirements", "responsibilities", "salaryMax", "salaryMin", "status", "updatedAt" FROM "JobPosting";
DROP TABLE "JobPosting";
ALTER TABLE "new_JobPosting" RENAME TO "JobPosting";
CREATE TABLE "new_TicketRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "requestDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestType" TEXT NOT NULL DEFAULT 'ANNUAL_LEAVE',
    "travelYear" INTEGER NOT NULL,
    "destination" TEXT NOT NULL,
    "destinationArabic" TEXT,
    "departureDate" DATETIME NOT NULL,
    "returnDate" DATETIME,
    "travelClass" TEXT NOT NULL DEFAULT 'ECONOMY',
    "ticketType" TEXT NOT NULL DEFAULT 'ANNUAL_LEAVE',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "includeFamily" BOOLEAN NOT NULL DEFAULT false,
    "totalFamilyMembers" INTEGER NOT NULL DEFAULT 0,
    "totalFamilyCost" REAL NOT NULL DEFAULT 0,
    "employeeTicketCost" REAL,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "rejectedBy" TEXT,
    "rejectedAt" DATETIME,
    "rejectionReason" TEXT,
    "comments" TEXT,
    "totalAmount" REAL,
    "totalCost" REAL,
    "bookingReference" TEXT,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "ticketNumbers" TEXT,
    "issuedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TicketRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TicketRequest" ("approvedAt", "approvedBy", "bookingReference", "comments", "createdAt", "departureDate", "destination", "destinationArabic", "employeeId", "id", "includeFamily", "issuedAt", "rejectedAt", "rejectedBy", "requestDate", "returnDate", "status", "ticketType", "totalAmount", "travelClass", "travelYear", "updatedAt") SELECT "approvedAt", "approvedBy", "bookingReference", "comments", "createdAt", "departureDate", "destination", "destinationArabic", "employeeId", "id", "includeFamily", "issuedAt", "rejectedAt", "rejectedBy", "requestDate", "returnDate", "status", "ticketType", "totalAmount", "travelClass", "travelYear", "updatedAt" FROM "TicketRequest";
DROP TABLE "TicketRequest";
ALTER TABLE "new_TicketRequest" RENAME TO "TicketRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
