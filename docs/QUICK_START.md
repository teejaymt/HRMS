# HRMS Advanced Modules - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

This guide will get your expanded HRMS system up and running quickly.

---

## Step 1: Database Migration (2 minutes)

```bash
cd hrms-backend

# Generate Prisma client with new models
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add-advanced-modules

# You should see:
# ✅ WorkflowDefinition table created
# ✅ AdvanceRequest table created
# ✅ TicketRequest table created
# ✅ BiometricDevice table created
# ✅ JobPosting table created
# ✅ ERPIntegration table created
```

---

## Step 2: Install Dependencies (1 minute)

```bash
# Install @nestjs/schedule for biometric device polling
npm install @nestjs/schedule

# Optional: For notifications
npm install @nestjs/mailer nodemailer
```

---

## Step 3: Seed Workflow Definitions (30 seconds)

```bash
# Create default workflows (Leave, Advance, Ticket approvals)
npx ts-node prisma/seed-workflows.ts

# You should see:
# ✅ Created Leave Approval Workflow
# ✅ Created Advance Request Workflow
# ✅ Created Air Ticket Request Workflow
```

---

## Step 4: Start the Server (30 seconds)

```bash
# Development mode
npm run start:dev

# Server should start on http://localhost:3000
```

---

## Step 5: Test the New Features (1 minute)

### Test Workflow Engine

**Create a Leave Request** (which auto-starts workflow):
```bash
POST http://localhost:3000/leaves
Content-Type: application/json

{
  "employeeId": 1,
  "leaveType": "ANNUAL",
  "startDate": "2026-02-01",
  "endDate": "2026-02-05",
  "reason": "Family vacation"
}

# ✅ Creates leave
# ✅ Auto-starts workflow
# ✅ Sets status to PENDING
```

**Check Workflow Status**:
```bash
GET http://localhost:3000/workflows/instances/LEAVE/1

# Response shows:
# - Current step (1: Manager Approval)
# - Workflow history
# - Approval chain
```

**Approve the Leave**:
```bash
PATCH http://localhost:3000/leaves/1/approve
Content-Type: application/json

{
  "approvedBy": "manager@company.com"
}

# ✅ Updates leave status
# ✅ Advances workflow to step 2 (HR Approval)
# ✅ Logs history
```

---

### Test Advance Request

**Request Salary Advance**:
```bash
POST http://localhost:3000/advance-requests
Content-Type: application/json

{
  "employeeId": 1,
  "amount": 5000,
  "reason": "Medical emergency",
  "repaymentMonths": 5
}

# ✅ Creates advance request
# ✅ Generates repayment schedule (1000 SAR × 5 months)
# ✅ Starts approval workflow
```

**View Repayment Schedule**:
```bash
GET http://localhost:3000/advance-requests/1

# Response shows:
# - Repayment schedule (5 months)
# - Monthly deduction: 1000 SAR
# - Remaining balance: 5000 SAR
```

---

### Test Air Ticket Request

**Request Annual Vacation Ticket**:
```bash
POST http://localhost:3000/ticket-requests
Content-Type: application/json

{
  "employeeId": 1,
  "travelYear": 2026,
  "destination": "Egypt",
  "departureDate": "2026-06-01",
  "returnDate": "2026-06-15",
  "travelClass": "ECONOMY",
  "includeFamily": true,
  "familyMembers": [
    {
      "name": "Spouse Name",
      "relationship": "Spouse",
      "passportNumber": "A12345678"
    },
    {
      "name": "Child Name",
      "relationship": "Child",
      "age": 5
    }
  ]
}

# ✅ Creates ticket request
# ✅ Tracks family members
# ✅ Starts approval workflow
```

---

### Test Biometric Device Registration

**Register Fingerprint Device**:
```bash
POST http://localhost:3000/biometric/devices
Content-Type: application/json

{
  "deviceName": "Main Gate - Fingerprint",
  "deviceType": "FINGERPRINT",
  "ipAddress": "192.168.1.100",
  "port": 4370,
  "location": "Main Entrance"
}

# ✅ Registers device
# ✅ Auto-sync will start every 15 minutes
```

**Manual Sync** (if device is accessible):
```bash
POST http://localhost:3000/biometric/sync/1

# ✅ Fetches logs from device
# ✅ Creates Attendance records
```

---

### Test Recruitment

**Create Job Posting**:
```bash
POST http://localhost:3000/recruitment/jobs
Content-Type: application/json

{
  "jobTitle": "Software Engineer",
  "departmentId": 1,
  "position": "Developer",
  "description": "We are looking for a talented developer...",
  "requirements": "3+ years experience, TypeScript, NestJS",
  "responsibilities": "Build features, code reviews, mentoring",
  "salaryMin": 8000,
  "salaryMax": 12000,
  "numberOfVacancies": 2
}

# ✅ Creates job posting
# ✅ Status: OPEN
```

**Submit Application**:
```bash
POST http://localhost:3000/recruitment/applicants
Content-Type: application/json

{
  "jobPostingId": 1,
  "firstName": "Ahmad",
  "lastName": "Mohamed",
  "email": "ahmad@email.com",
  "phone": "+966501234567",
  "nationality": "Saudi",
  "isSaudi": true,
  "coverLetter": "I am excited to apply..."
}

# ✅ Creates applicant
# ✅ Status: APPLIED
```

---

## 🎯 Common API Endpoints

### Workflows
```
GET    /workflows/definitions          - List workflow templates
GET    /workflows/instances/:id        - View workflow status
GET    /workflows/instances/:type/:id  - Get workflows by entity
```

### Leaves (Enhanced)
```
POST   /leaves                         - Create + auto-start workflow
PATCH  /leaves/:id/approve             - Approve + advance workflow
PATCH  /leaves/:id/reject              - Reject + close workflow
GET    /leaves                         - List with filters
```

### Advance Requests
```
POST   /advance-requests               - Request advance
GET    /advance-requests               - List all requests
GET    /advance-requests/:id           - View with schedule
PATCH  /advance-requests/:id/approve   - Approve request
```

### Ticket Requests
```
POST   /ticket-requests                - Request ticket
GET    /ticket-requests                - List all requests
PATCH  /ticket-requests/:id/approve    - Approve request
```

### Biometric Devices
```
POST   /biometric/devices              - Register device
GET    /biometric/devices              - List devices
POST   /biometric/sync/:id             - Manual sync
GET    /biometric/logs                 - View raw logs
```

### Recruitment
```
POST   /recruitment/jobs               - Create job posting
GET    /recruitment/jobs               - List jobs
POST   /recruitment/applicants         - Submit application
POST   /recruitment/interviews         - Schedule interview
```

### ERP Integration
```
POST   /erp/integrations               - Configure ERP
POST   /erp/sync/employees             - Sync employees
POST   /erp/sync/payroll               - Sync payroll
GET    /erp/logs                       - View sync history
```

---

## 🔍 Verify Installation

### Check Database Tables
```bash
npx prisma studio

# Open http://localhost:5555
# You should see:
# - WorkflowDefinition (with 3-5 seeded workflows)
# - AdvanceRequest
# - TicketRequest
# - BiometricDevice
# - JobPosting
# - ERPIntegration
```

### Check Server Logs
```bash
# You should see:
# [NestApplication] Nest application successfully started
# [WorkflowsModule] Initialized
# [AdvanceRequestModule] Initialized
# [BiometricModule] Scheduled sync every 15 minutes
```

---

## 🐛 Troubleshooting

### Issue: Migration fails
```bash
# Reset database (DEV ONLY!)
npx prisma migrate reset

# Then re-run migration
npx prisma migrate dev
```

### Issue: Module not found
```bash
# Regenerate Prisma client
npx prisma generate

# Restart server
npm run start:dev
```

### Issue: Workflow not starting
```bash
# Check workflow definition exists
GET http://localhost:3000/workflows/definitions

# Should return at least 3 workflows (Leave, Advance, Ticket)
# If empty, run seed script:
npx ts-node prisma/seed-workflows.ts
```

### Issue: @nestjs/schedule not found
```bash
npm install @nestjs/schedule
npm run start:dev
```

---

## 📚 Next Steps

1. **Read Full Documentation**: `HRMS_ADVANCED_FEATURES.md`
2. **Review Design Decisions**: `FURTHER_CONSIDERATIONS.md`
3. **Follow Deployment Checklist**: `IMPLEMENTATION_CHECKLIST.md`
4. **Test All Workflows**: Use the API examples above
5. **Configure Devices**: Add biometric devices via API
6. **Set Up ERP Sync**: Configure your ERP integration

---

## 🎉 Success Indicators

You're ready when:
- ✅ All 15 new tables exist in database
- ✅ Workflow definitions seeded (at least 3)
- ✅ Leave request starts workflow automatically
- ✅ Advance request generates repayment schedule
- ✅ Server starts without errors
- ✅ All modules imported in app.module.ts

---

## 📞 Need Help?

- **API Issues**: Check server logs for detailed errors
- **Database Issues**: Use `npx prisma studio` to inspect data
- **Workflow Issues**: View workflow history via API
- **Documentation**: See `HRMS_ADVANCED_FEATURES.md`

---

**Estimated Setup Time**: 5 minutes  
**Difficulty**: Easy  
**Prerequisites**: Node.js, npm, existing HRMS installation

**Happy Building! 🚀**
