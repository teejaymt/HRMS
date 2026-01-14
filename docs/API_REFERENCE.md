# HRMS Advanced Modules - API Reference

Complete REST API documentation for all new modules.

---

## 🔄 Workflow Engine API

### Create Workflow Definition
```http
POST /workflows/definitions
Content-Type: application/json

{
  "name": "Leave Approval - Custom",
  "description": "Custom approval chain for senior staff",
  "entityType": "LEAVE",
  "steps": [
    {
      "stepOrder": 1,
      "stepName": "Manager Approval",
      "approverRole": "MANAGER",
      "requiresApproval": true,
      "isOptional": false
    },
    {
      "stepOrder": 2,
      "stepName": "Department Head",
      "approverRole": "MANAGER",
      "requiresApproval": true,
      "conditionField": "days",
      "conditionValue": ">7"
    },
    {
      "stepOrder": 3,
      "stepName": "HR Final Approval",
      "approverRole": "HR",
      "requiresApproval": true
    }
  ]
}
```

**Response**: WorkflowDefinition with created steps

---

### List All Workflow Definitions
```http
GET /workflows/definitions
```

**Response**:
```json
[
  {
    "id": 1,
    "name": "Leave Approval - Standard",
    "entityType": "LEAVE",
    "isActive": true,
    "steps": [...]
  }
]
```

---

### Get Workflow Definition by Type
```http
GET /workflows/definitions/type/:entityType

# Example: GET /workflows/definitions/type/LEAVE
```

**Response**: Active workflow definition for entity type

---

### Start Workflow Instance
```http
POST /workflows/instances

{
  "workflowDefinitionId": 1,
  "entityType": "LEAVE",
  "entityId": 5,
  "initiatedBy": "employee@company.com"
}
```

**Response**: WorkflowInstance with current step

---

### Get Workflow Instance
```http
GET /workflows/instances/:id
```

**Response**:
```json
{
  "id": 1,
  "currentStep": 1,
  "status": "IN_PROGRESS",
  "workflowDefinition": {...},
  "history": [
    {
      "stepOrder": 1,
      "action": "APPROVED",
      "actionBy": "manager@company.com",
      "actionAt": "2026-01-09T10:30:00Z"
    }
  ]
}
```

---

### Approve Workflow Step
```http
PATCH /workflows/instances/:id/approve

{
  "stepOrder": 1,
  "actionBy": "manager@company.com",
  "comments": "Approved - good reason"
}
```

**Response**: Updated WorkflowInstance (advances to next step)

---

### Reject Workflow
```http
PATCH /workflows/instances/:id/reject

{
  "stepOrder": 1,
  "actionBy": "manager@company.com",
  "comments": "Insufficient leave balance"
}
```

**Response**: WorkflowInstance with status REJECTED

---

## 💰 Advance Request API

### Create Advance Request
```http
POST /advance-requests

{
  "employeeId": 1,
  "amount": 5000,
  "reason": "Medical emergency",
  "reasonArabic": "حالة طبية طارئة",
  "repaymentMonths": 5
}
```

**Response**:
```json
{
  "id": 1,
  "employeeId": 1,
  "amount": 5000,
  "monthlyDeduction": 1000,
  "remainingAmount": 5000,
  "status": "PENDING",
  "repaymentSchedule": [
    {
      "month": 2,
      "year": 2026,
      "amount": 1000,
      "status": "PENDING"
    },
    ...
  ]
}
```

---

### List Advance Requests
```http
GET /advance-requests
GET /advance-requests?employeeId=1
GET /advance-requests?status=APPROVED
```

**Response**: Array of AdvanceRequest objects

---

### Get Single Advance Request
```http
GET /advance-requests/:id
```

**Response**: AdvanceRequest with repayment schedule

---

### Approve Advance Request
```http
PATCH /advance-requests/:id/approve

{
  "approvedBy": "hr@company.com"
}
```

**Response**: AdvanceRequest with status APPROVED + generated repayment schedule

---

### Reject Advance Request
```http
PATCH /advance-requests/:id/reject

{
  "rejectedBy": "hr@company.com",
  "comments": "Exceeds monthly limit"
}
```

**Response**: AdvanceRequest with status REJECTED

---

### Mark as Paid
```http
PATCH /advance-requests/:id/mark-paid
```

**Response**: AdvanceRequest with status PAID

---

### Delete Advance Request
```http
DELETE /advance-requests/:id
```

---

## ✈️ Ticket Request API

### Create Ticket Request
```http
POST /ticket-requests

{
  "employeeId": 1,
  "travelYear": 2026,
  "destination": "Egypt",
  "destinationArabic": "مصر",
  "departureDate": "2026-06-01",
  "returnDate": "2026-06-15",
  "travelClass": "ECONOMY",
  "ticketType": "ANNUAL_LEAVE",
  "includeFamily": true,
  "familyMembers": [
    {
      "name": "Sarah Ahmed",
      "nameArabic": "سارة أحمد",
      "relationship": "Spouse",
      "passportNumber": "A12345678",
      "nationality": "Saudi"
    },
    {
      "name": "Omar Ahmed",
      "nameArabic": "عمر أحمد",
      "relationship": "Child",
      "age": 5,
      "passportNumber": "A87654321"
    }
  ]
}
```

**Response**: TicketRequest with family members

---

### List Ticket Requests
```http
GET /ticket-requests
GET /ticket-requests?employeeId=1
GET /ticket-requests?status=PENDING
GET /ticket-requests?travelYear=2026
```

---

### Get Single Ticket Request
```http
GET /ticket-requests/:id
```

**Response**:
```json
{
  "id": 1,
  "employeeId": 1,
  "destination": "Egypt",
  "travelClass": "ECONOMY",
  "familyMembers": [...],
  "status": "PENDING"
}
```

---

### Approve Ticket Request
```http
PATCH /ticket-requests/:id/approve

{
  "approvedBy": "hr@company.com"
}
```

---

### Reject Ticket Request
```http
PATCH /ticket-requests/:id/reject

{
  "rejectedBy": "hr@company.com",
  "comments": "Already used annual ticket"
}
```

---

### Update Booking Details
```http
PATCH /ticket-requests/:id

{
  "bookingReference": "PNR123456",
  "totalAmount": 6500,
  "issuedAt": "2026-01-10T14:00:00Z"
}
```

---

## 🔐 Biometric Attendance API

### Register Biometric Device
```http
POST /biometric/devices

{
  "deviceName": "Main Gate - Fingerprint",
  "deviceType": "FINGERPRINT",
  "ipAddress": "192.168.1.100",
  "port": 4370,
  "serialNumber": "ZKT123456",
  "location": "Main Entrance",
  "apiEndpoint": "http://192.168.1.100/api",
  "apiKey": "device-api-key-here"
}
```

**Device Types**: `FINGERPRINT`, `FACE`, `RFID`, `PALM`, `IRIS`

---

### List Biometric Devices
```http
GET /biometric/devices
GET /biometric/devices?isActive=true
```

---

### Get Single Device
```http
GET /biometric/devices/:id
```

---

### Update Device
```http
PATCH /biometric/devices/:id

{
  "isActive": false,
  "location": "Side Entrance"
}
```

---

### Manual Sync Device
```http
POST /biometric/sync/:deviceId
```

**Response**:
```json
{
  "deviceId": 1,
  "logsFetched": 145,
  "attendanceCreated": 73,
  "errors": []
}
```

---

### Get Biometric Logs
```http
GET /biometric/logs
GET /biometric/logs?deviceId=1
GET /biometric/logs?isProcessed=false
GET /biometric/logs?employeeCode=EMP001
```

**Response**:
```json
[
  {
    "id": 1,
    "deviceId": 1,
    "employeeCode": "EMP001",
    "timestamp": "2026-01-09T08:00:00Z",
    "logType": "CHECK_IN",
    "verifyMode": "FINGERPRINT",
    "isProcessed": true,
    "attendanceId": 45
  }
]
```

---

## 👥 Recruitment API

### Create Job Posting
```http
POST /recruitment/jobs

{
  "jobTitle": "Senior Software Engineer",
  "jobTitleArabic": "مهندس برمجيات أول",
  "departmentId": 1,
  "position": "Developer",
  "employmentType": "FULL_TIME",
  "contractType": "UNLIMITED",
  "description": "We are seeking a talented...",
  "descriptionArabic": "نبحث عن موهوب...",
  "requirements": "5+ years experience, TypeScript, NestJS...",
  "responsibilities": "Lead feature development, mentor juniors...",
  "salaryMin": 12000,
  "salaryMax": 18000,
  "benefits": "Health insurance, annual bonus...",
  "closingDate": "2026-02-28",
  "numberOfVacancies": 2
}
```

---

### List Job Postings
```http
GET /recruitment/jobs
GET /recruitment/jobs?status=OPEN
GET /recruitment/jobs?departmentId=1
```

---

### Update Job Posting
```http
PATCH /recruitment/jobs/:id

{
  "status": "CLOSED",
  "numberOfVacancies": 1
}
```

**Job Statuses**: `DRAFT`, `OPEN`, `CLOSED`, `FILLED`, `CANCELLED`

---

### Submit Application
```http
POST /recruitment/applicants

{
  "jobPostingId": 1,
  "firstName": "Ahmad",
  "lastName": "Mohamed",
  "firstNameArabic": "أحمد",
  "lastNameArabic": "محمد",
  "email": "ahmad@email.com",
  "phone": "+966501234567",
  "dateOfBirth": "1990-05-15",
  "nationality": "Saudi",
  "isSaudi": true,
  "resumePath": "/uploads/resumes/ahmad-cv.pdf",
  "coverLetter": "I am excited to apply..."
}
```

---

### List Applicants
```http
GET /recruitment/applicants
GET /recruitment/applicants?jobPostingId=1
GET /recruitment/applicants?status=APPLIED
```

---

### Update Applicant Status
```http
PATCH /recruitment/applicants/:id/status

{
  "status": "SCREENING",
  "screeningNotes": "Strong technical background, good communication"
}
```

**Applicant Statuses**: `APPLIED`, `SCREENING`, `INTERVIEWED`, `OFFER_EXTENDED`, `OFFER_ACCEPTED`, `OFFER_REJECTED`, `REJECTED`, `WITHDRAWN`

---

### Schedule Interview
```http
POST /recruitment/interviews

{
  "applicantId": 1,
  "interviewType": "TECHNICAL",
  "scheduledDate": "2026-01-15",
  "scheduledTime": "10:00",
  "location": "Meeting Room A",
  "interviewerName": "Sarah Ali",
  "interviewerEmail": "sarah@company.com"
}
```

**Interview Types**: `PHONE_SCREEN`, `VIDEO`, `IN_PERSON`, `TECHNICAL`, `HR`, `FINAL`

---

### Update Interview Feedback
```http
PATCH /recruitment/interviews/:id

{
  "status": "COMPLETED",
  "feedback": "Excellent technical skills, strong problem-solving...",
  "rating": 5,
  "outcome": "PASS"
}
```

**Interview Statuses**: `SCHEDULED`, `COMPLETED`, `CANCELLED`, `RESCHEDULED`, `NO_SHOW`

---

### Convert Applicant to Onboarding
```http
POST /recruitment/applicants/:id/convert-to-onboarding

{
  "departmentId": 1,
  "position": "Software Engineer",
  "joiningDate": "2026-02-01",
  "basicSalary": 15000,
  "housingAllowance": 3000
}
```

**Response**: Creates Onboarding record, links applicant

---

## 🔗 ERP Integration API

### Configure ERP Integration
```http
POST /erp/integrations

{
  "erpSystem": "SAP",
  "isActive": true,
  "apiEndpoint": "https://erp.company.com/api/v1",
  "username": "hrms-integration",
  "password": "secure-password",
  "syncFrequency": "DAILY",
  "syncDirection": "BIDIRECTIONAL",
  "employeeFieldMap": {
    "HRMS_TO_ERP": {
      "employeeCode": "PERNR",
      "firstName": "VORNA",
      "lastName": "NACHN",
      "basicSalary": "BETRG"
    },
    "ERP_TO_HRMS": {
      "PERNR": "employeeCode",
      "VORNA": "firstName"
    }
  }
}
```

**Sync Frequencies**: `HOURLY`, `DAILY`, `WEEKLY`, `MANUAL`  
**Sync Directions**: `BIDIRECTIONAL`, `TO_ERP`, `FROM_ERP`

---

### List ERP Integrations
```http
GET /erp/integrations
GET /erp/integrations?isActive=true
```

---

### Sync Employees to ERP
```http
POST /erp/sync/employees/:integrationId
```

**Response**:
```json
{
  "syncId": 1,
  "recordsProcessed": 150,
  "recordsFailed": 2,
  "status": "PARTIAL",
  "errors": [...]
}
```

---

### Sync Payroll to ERP
```http
POST /erp/sync/payroll/:integrationId

{
  "month": 1,
  "year": 2026
}
```

---

### Get Sync Logs
```http
GET /erp/logs
GET /erp/logs?integrationId=1
GET /erp/logs?status=FAILED
GET /erp/logs?syncType=EMPLOYEE
```

**Response**:
```json
[
  {
    "id": 1,
    "syncType": "EMPLOYEE",
    "direction": "TO_ERP",
    "status": "SUCCESS",
    "recordsProcessed": 150,
    "recordsFailed": 0,
    "syncStarted": "2026-01-09T02:00:00Z",
    "syncCompleted": "2026-01-09T02:05:30Z"
  }
]
```

---

## 📊 Enhanced Leave API

The Leaves API now includes workflow integration.

### Create Leave (Auto-starts Workflow)
```http
POST /leaves

{
  "employeeId": 1,
  "leaveType": "ANNUAL",
  "startDate": "2026-02-01",
  "endDate": "2026-02-10",
  "reason": "Family vacation",
  "reasonArabic": "عطلة عائلية"
}
```

**Response**: Leave object + Workflow instance created

---

### Approve Leave (Advances Workflow)
```http
PATCH /leaves/:id/approve

{
  "approvedBy": "manager@company.com"
}
```

**Response**: Leave updated + Workflow advanced to next step

---

### Reject Leave (Closes Workflow)
```http
PATCH /leaves/:id/reject

{
  "rejectedBy": "manager@company.com",
  "comments": "Insufficient leave balance"
}
```

**Response**: Leave rejected + Workflow status = REJECTED

---

### Get Leave with Workflow History
```http
GET /leaves/:id

# Then fetch workflow:
GET /workflows/instances/LEAVE/:leaveId
```

---

## 🔑 Authentication

All APIs require JWT authentication (existing auth system).

**Headers**:
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Roles**:
- `ADMIN`: Full access
- `HR`: All HR operations
- `MANAGER`: Approve team requests
- `EMPLOYEE`: Submit own requests

---

## 📝 Response Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Server Error

---

## 🚀 Rate Limiting

- Standard: 100 requests/minute
- Biometric Sync: 10 requests/minute
- ERP Sync: 5 requests/minute

---

**API Version**: 2.0  
**Last Updated**: January 2026  
**Base URL**: `http://localhost:3000` (development)
