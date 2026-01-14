-- CreateTable
CREATE TABLE "WorkflowDefinition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "entityType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WorkflowStep" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "workflowDefinitionId" INTEGER NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "stepName" TEXT NOT NULL,
    "approverRole" TEXT NOT NULL,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "conditionField" TEXT,
    "conditionValue" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkflowStep_workflowDefinitionId_fkey" FOREIGN KEY ("workflowDefinitionId") REFERENCES "WorkflowDefinition" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkflowInstance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "workflowDefinitionId" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "initiatedBy" TEXT NOT NULL,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkflowInstance_workflowDefinitionId_fkey" FOREIGN KEY ("workflowDefinitionId") REFERENCES "WorkflowDefinition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkflowHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "workflowInstanceId" INTEGER NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "stepName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actionBy" TEXT NOT NULL,
    "comments" TEXT,
    "actionAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkflowHistory_workflowInstanceId_fkey" FOREIGN KEY ("workflowInstanceId") REFERENCES "WorkflowInstance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdvanceRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "requestDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "reasonArabic" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "rejectedBy" TEXT,
    "rejectedAt" DATETIME,
    "comments" TEXT,
    "repaymentMonths" INTEGER NOT NULL DEFAULT 1,
    "monthlyDeduction" REAL,
    "remainingAmount" REAL,
    "repaymentStartDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdvanceRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdvanceRepayment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "advanceRequestId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "deductedAt" DATETIME,
    "payrollId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdvanceRepayment_advanceRequestId_fkey" FOREIGN KEY ("advanceRequestId") REFERENCES "AdvanceRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TicketRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "requestDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "travelYear" INTEGER NOT NULL,
    "destination" TEXT NOT NULL,
    "destinationArabic" TEXT,
    "departureDate" DATETIME NOT NULL,
    "returnDate" DATETIME,
    "travelClass" TEXT NOT NULL DEFAULT 'ECONOMY',
    "ticketType" TEXT NOT NULL DEFAULT 'ANNUAL_LEAVE',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "includeFamily" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "rejectedBy" TEXT,
    "rejectedAt" DATETIME,
    "comments" TEXT,
    "totalAmount" REAL,
    "bookingReference" TEXT,
    "issuedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TicketRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TicketFamilyMember" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ticketRequestId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "nameArabic" TEXT,
    "relationship" TEXT NOT NULL,
    "age" INTEGER,
    "passportNumber" TEXT,
    "nationality" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TicketFamilyMember_ticketRequestId_fkey" FOREIGN KEY ("ticketRequestId") REFERENCES "TicketRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BiometricDevice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceName" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 4370,
    "serialNumber" TEXT,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSync" DATETIME,
    "apiEndpoint" TEXT,
    "apiKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BiometricLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceId" INTEGER NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "logType" TEXT NOT NULL,
    "verifyMode" TEXT,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "attendanceId" INTEGER,
    "rawData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BiometricLog_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "BiometricDevice" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobPosting" (
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
    "closingDate" DATETIME,
    "numberOfVacancies" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JobPosting_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Applicant" (
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
    "status" TEXT NOT NULL DEFAULT 'APPLIED',
    "screeningNotes" TEXT,
    "onboardingId" INTEGER,
    "employeeId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Applicant_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "JobPosting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "applicantId" INTEGER NOT NULL,
    "interviewType" TEXT NOT NULL DEFAULT 'PHONE_SCREEN',
    "scheduledDate" DATETIME NOT NULL,
    "scheduledTime" TEXT,
    "location" TEXT,
    "interviewerName" TEXT,
    "interviewerEmail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "feedback" TEXT,
    "rating" INTEGER,
    "outcome" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Interview_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ERPIntegration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "erpSystem" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "apiEndpoint" TEXT NOT NULL,
    "apiKey" TEXT,
    "username" TEXT,
    "password" TEXT,
    "syncFrequency" TEXT NOT NULL DEFAULT 'DAILY',
    "syncDirection" TEXT NOT NULL DEFAULT 'BIDIRECTIONAL',
    "lastSyncAt" DATETIME,
    "nextSyncAt" DATETIME,
    "employeeFieldMap" TEXT,
    "payrollFieldMap" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ERPSyncLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "erpIntegrationId" INTEGER NOT NULL,
    "syncType" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsFailed" INTEGER NOT NULL DEFAULT 0,
    "errorDetails" TEXT,
    "syncStarted" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncCompleted" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ERPSyncLog_erpIntegrationId_fkey" FOREIGN KEY ("erpIntegrationId") REFERENCES "ERPIntegration" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowDefinition_name_key" ON "WorkflowDefinition"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStep_workflowDefinitionId_stepOrder_key" ON "WorkflowStep"("workflowDefinitionId", "stepOrder");

-- CreateIndex
CREATE UNIQUE INDEX "BiometricDevice_deviceName_key" ON "BiometricDevice"("deviceName");

-- CreateIndex
CREATE UNIQUE INDEX "BiometricDevice_serialNumber_key" ON "BiometricDevice"("serialNumber");

-- CreateIndex
CREATE INDEX "BiometricLog_employeeCode_timestamp_idx" ON "BiometricLog"("employeeCode", "timestamp");

-- CreateIndex
CREATE INDEX "BiometricLog_isProcessed_idx" ON "BiometricLog"("isProcessed");
