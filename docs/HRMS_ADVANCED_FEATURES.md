# HRMS Advanced Features - Implementation Guide

## Overview
This document describes the expanded HRMS system with advanced workflow engine, biometric attendance, talent acquisition, and ERP integration capabilities for Saudi Arabia compliance.

## New Modules Implemented

### 1. Workflow Engine (`/src/workflows`)
**Purpose**: Generic workflow system for multi-step approvals across all request types.

**Database Models**:
- `WorkflowDefinition`: Template for workflows (e.g., Leave Approval, Advance Request)
- `WorkflowStep`: Individual steps in a workflow with approval requirements
- `WorkflowInstance`: Active workflow for a specific request
- `WorkflowHistory`: Audit trail of all actions taken

**Key Features**:
- Configurable approval chains (Manager → Department Head → HR)
- Conditional routing based on field values (e.g., amount threshold)
- Complete audit trail with timestamps and comments
- Support for optional steps

**API Endpoints**:
```
POST   /workflows/definitions          - Create workflow template
GET    /workflows/definitions          - List all templates
POST   /workflows/instances            - Start a workflow
PATCH  /workflows/instances/:id/approve - Approve current step
PATCH  /workflows/instances/:id/reject  - Reject workflow
```

**Usage Example**:
```typescript
// Create Leave Approval Workflow
{
  "name": "Leave Approval - Standard",
  "entityType": "LEAVE",
  "steps": [
    { "stepOrder": 1, "stepName": "Manager Approval", "approverRole": "MANAGER" },
    { "stepOrder": 2, "stepName": "HR Approval", "approverRole": "HR" }
  ]
}
```

---

### 2. Advance Request Module (`/src/advance-request`)
**Purpose**: Employee salary advance requests with automatic repayment scheduling.

**Database Models**:
- `AdvanceRequest`: Advance request with approval status
- `AdvanceRepayment`: Monthly repayment schedule linked to payroll

**Key Features**:
- Automatic repayment schedule generation
- Monthly payroll deduction tracking
- Remaining balance calculation
- Workflow integration for approvals

**API Endpoints**:
```
POST   /advance-requests               - Create advance request
GET    /advance-requests               - List all requests
PATCH  /advance-requests/:id/approve   - Approve request
PATCH  /advance-requests/:id/reject    - Reject request
```

**Business Logic**:
- Request amount divided by repayment months
- Auto-generates monthly deduction schedule
- Links to payroll for automatic deductions
- Tracks remaining balance

---

### 3. Air Ticket Request Module (`/src/ticket-request`)
**Purpose**: Annual leave air ticket requests (Saudi labor law compliance).

**Database Models**:
- `TicketRequest`: Ticket request with travel details
- `TicketFamilyMember`: Family members included in ticket

**Key Features**:
- Travel class selection (Economy, Business, First Class)
- Family member tracking (spouse, children)
- Annual vacation ticket entitlement
- Hajj, Emergency, Business trip types

**API Endpoints**:
```
POST   /ticket-requests                - Create ticket request
GET    /ticket-requests                - List all requests
PATCH  /ticket-requests/:id/approve    - Approve request
```

**Saudi Compliance**:
- Annual leave ticket for employee + family
- Hajj pilgrimage ticket (one-time)
- Based on contract type and grade

---

### 4. Biometric Attendance Integration (`/src/biometric`)
**Purpose**: Automated attendance from biometric devices (fingerprint, face, RFID).

**Database Models**:
- `BiometricDevice`: Device configuration (IP, type, location)
- `BiometricLog`: Raw logs from devices

**Key Features**:
- Scheduled polling from devices (@nestjs/schedule)
- Auto-conversion to Attendance records
- Support for multiple device types (ZKTeco, Anviz, etc.)
- Offline fallback handling

**Device Types Supported**:
- FINGERPRINT
- FACE
- RFID
- PALM
- IRIS

**API Endpoints**:
```
POST   /biometric/devices              - Register device
GET    /biometric/devices              - List devices
POST   /biometric/sync/:deviceId       - Manual sync
GET    /biometric/logs                 - View raw logs
```

**Scheduled Tasks**:
- Auto-sync every 15 minutes (configurable)
- Process unprocessed logs
- Match employee codes to employees
- Create/update Attendance records

---

### 5. Talent Acquisition / Recruitment (`/src/recruitment`)
**Purpose**: Complete hiring workflow from job posting to onboarding.

**Database Models**:
- `JobPosting`: Job vacancies
- `Applicant`: Candidate applications
- `Interview`: Interview scheduling and feedback

**Hiring Workflow**:
1. Create Job Posting
2. Receive Applications
3. Screen Candidates
4. Schedule Interviews
5. Extend Offer
6. Convert to Onboarding
7. Convert to Employee

**API Endpoints**:
```
POST   /recruitment/jobs               - Create job posting
GET    /recruitment/jobs               - List open positions
POST   /recruitment/applicants         - Submit application
PATCH  /recruitment/applicants/:id/status - Update status
POST   /recruitment/interviews         - Schedule interview
```

---

### 6. ERP Integration (`/src/erp`)
**Purpose**: Bidirectional sync with external ERP systems (SAP, Oracle, Odoo).

**Database Models**:
- `ERPIntegration`: ERP connection configuration
- `ERPSyncLog`: Sync history and error tracking

**Key Features**:
- Scheduled or manual sync
- Bidirectional data flow
- Field mapping configuration (JSON)
- Error logging and retry mechanism

**Sync Types**:
- Employee master data
- Payroll transactions
- Department structure
- Leave balances

**API Endpoints**:
```
POST   /erp/integrations               - Configure ERP connection
POST   /erp/sync/employees             - Sync employees
POST   /erp/sync/payroll               - Sync payroll
GET    /erp/logs                       - View sync history
```

---

## Updated Modules

### Leave Management Enhancement
**Changes**:
- Integrated with workflow engine
- Auto-starts approval workflow on creation
- Tracks workflow history
- Supports configurable approval chains

**Annual Leave Calculation**:
- Default: 21 days per year (Saudi minimum)
- Accrual: Monthly (1.75 days/month)
- Carry-forward: Configurable per policy
- Expiry: End of year (configurable)

---

## Database Schema Updates

### New Enums
```prisma
enum WorkflowStatus { IN_PROGRESS, COMPLETED, REJECTED, CANCELLED }
enum RequestStatus { PENDING, APPROVED, REJECTED, CANCELLED, PAID }
enum TravelClass { ECONOMY, BUSINESS, FIRST_CLASS }
enum TicketType { ANNUAL_LEAVE, EMERGENCY, HAJJ, BUSINESS }
enum DeviceType { FINGERPRINT, FACE, RFID, PALM, IRIS }
enum JobPostingStatus { DRAFT, OPEN, CLOSED, FILLED, CANCELLED }
enum ApplicantStatus { APPLIED, SCREENING, INTERVIEWED, OFFER_EXTENDED, ... }
```

### Employee Model Updates
Added relations:
- `advanceRequests` → AdvanceRequest[]
- `ticketRequests` → TicketRequest[]

### Department Model Updates
Added relations:
- `jobPostings` → JobPosting[]

---

## Configuration & Setup

### 1. Install Dependencies
```bash
npm install @nestjs/schedule
```

### 2. Run Database Migration
```bash
npx prisma migrate dev --name add-advanced-modules
npx prisma generate
```

### 3. Seed Workflow Definitions
```bash
npm run seed
```

This creates default workflows:
- Leave Approval (Manager → HR)
- Advance Request (Manager → HR → Finance)
- Ticket Request (Manager → HR)

### 4. Configure Biometric Devices
Add devices via API:
```json
{
  "deviceName": "Main Gate - Fingerprint",
  "deviceType": "FINGERPRINT",
  "ipAddress": "192.168.1.100",
  "port": 4370,
  "location": "Main Entrance"
}
```

### 5. Configure ERP Integration
```json
{
  "erpSystem": "SAP",
  "apiEndpoint": "https://erp.company.com/api",
  "syncFrequency": "DAILY",
  "syncDirection": "BIDIRECTIONAL"
}
```

---

## Saudi Labor Law Compliance

### Leave Management
- ✅ 21+ days annual leave
- ✅ 30 days sick leave (full pay)
- ✅ 10 weeks maternity leave
- ✅ One-time Hajj leave
- ✅ 5 days marriage/death leave

### Air Tickets
- ✅ Annual vacation ticket for employee + family
- ✅ Based on contract type and grade
- ✅ Travel class by position level

### GOSI Integration
- Employee contributions tracked
- Employer contributions calculated
- Ready for ERP sync

---

## API Usage Examples

### Create Leave with Workflow
```typescript
// POST /leaves
{
  "employeeId": 1,
  "leaveType": "ANNUAL",
  "startDate": "2026-02-01",
  "endDate": "2026-02-10",
  "reason": "Family vacation"
}
// Auto-starts workflow, sends to manager
```

### Request Advance
```typescript
// POST /advance-requests
{
  "employeeId": 1,
  "amount": 5000,
  "reason": "Medical emergency",
  "repaymentMonths": 5
}
// Creates schedule: 1000 SAR x 5 months
```

### Request Air Ticket
```typescript
// POST /ticket-requests
{
  "employeeId": 1,
  "travelYear": 2026,
  "destination": "Egypt",
  "departureDate": "2026-06-01",
  "includeFamily": true,
  "familyMembers": [
    { "name": "Spouse Name", "relationship": "Spouse" }
  ]
}
```

---

## Further Considerations Answered

### 1. Annual Leave Calculation
**Implemented**:
- 21 days minimum (configurable per employee)
- Monthly accrual: 21 ÷ 12 = 1.75 days/month
- **Policy needed**: Create `LeavePolicy` model for:
  - Carry-forward rules
  - Expiry dates
  - Accrual rates by position

### 2. Notification System
**Recommendation**:
- Install `@nestjs/mailer`
- Create `NotificationService`
- Send emails on:
  - Workflow step approvals
  - Leave approvals/rejections
  - Advance payment confirmations
  - Ticket bookings
- Use employee emails from User/Employee tables

### 3. Air Ticket Entitlements
**Implemented**:
- Track in `TicketRequest` model
- **Policy needed**: Create `TicketPolicy` model:
  - Tickets per year by grade
  - Travel class by position
  - Family member limits
  - Destination restrictions

### 4. Biometric Device Communication
**Supported**:
- REST API (configure `apiEndpoint`)
- SOAP (add adapter in service)
- SDK (vendor-specific adapters)
- **Offline fallback**: Manual attendance entry

### 5. ERP Sync Strategy
**Implemented**:
- Scheduled (HOURLY, DAILY, WEEKLY)
- Manual trigger via API
- **Source of truth**:
  - Employee master → HRMS
  - Payroll transactions → Bidirectional
  - Sync conflicts logged in `ERPSyncLog`

---

## Testing Checklist

- [ ] Create workflow definition
- [ ] Submit leave request → workflow starts
- [ ] Approve leave → workflow advances
- [ ] Reject leave → workflow closes
- [ ] Create advance request → repayment schedule generated
- [ ] Process payroll → advance deducted
- [ ] Submit ticket request → family members tracked
- [ ] Register biometric device
- [ ] Sync biometric logs → attendance created
- [ ] Create job posting
- [ ] Submit application → interview scheduled
- [ ] Convert applicant → onboarding → employee
- [ ] Configure ERP integration
- [ ] Sync employees to ERP

---

## Next Steps

1. **Notifications**: Implement email/SMS alerts
2. **Leave Policies**: Create policy configuration module
3. **Ticket Policies**: Add entitlement rules
4. **Reports**: Generate leave balance, advance tracking, recruitment pipeline reports
5. **Mobile App**: Add biometric mobile check-in
6. **Dashboard**: Real-time workflow status, pending approvals
7. **Multi-language**: Full Arabic support in UI

---

## Support & Maintenance

For questions or issues:
- Check workflow logs: `GET /workflows/instances/:id`
- Check ERP sync errors: `GET /erp/logs`
- Review biometric logs: `GET /biometric/logs?isProcessed=false`

**Database Backup**: Schedule daily backups before ERP syncs.

---

**Version**: 2.0  
**Last Updated**: January 2026  
**Author**: HRMS Development Team
