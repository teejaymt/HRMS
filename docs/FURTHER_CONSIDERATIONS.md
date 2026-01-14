# HRMS Advanced Modules - Further Considerations Addressed

This document addresses the specific questions raised in the implementation plan.

---

## 1. Annual Leave Calculation Logic

### Implementation Status: ✅ READY

**Current Setup**:
- Field `Employee.annualLeaveDays` stores entitlement (default: 21 days, Saudi minimum)
- Leave requests deduct from available balance

**Calculation Strategy**:
```typescript
// Accrual: Monthly calculation
monthlyAccrual = annualLeaveDays / 12  // 21 ÷ 12 = 1.75 days/month

// After 1 year of service
availableLeave = monthlyAccrual * monthsWorked

// Carry Forward (Year-end)
if (carryForwardAllowed) {
  nextYearBalance = min(unusedDays, maxCarryForward)
} else {
  nextYearBalance = 0  // Expires
}
```

**Policy Configuration Needed**:
Create `LeavePolicy` model:
```prisma
model LeavePolicy {
  id                  Int       @id @default(autoincrement())
  employmentType      EmploymentType  // FULL_TIME, PART_TIME, etc.
  contractType        ContractType    // LIMITED, UNLIMITED
  yearsOfService      Int?            // Policy changes after X years
  
  // Annual Leave
  annualLeaveDays     Int       @default(21)
  accrualMethod       String    @default("MONTHLY") // MONTHLY, YEARLY, NONE
  
  // Carry Forward
  carryForwardAllowed Boolean   @default(true)
  maxCarryForwardDays Int       @default(5)
  carryForwardExpiry  Int       @default(3) // Expires after X months
  
  // Encashment
  encashmentAllowed   Boolean   @default(true)
  maxEncashmentDays   Int       @default(10)
  
  // Sick Leave
  sickLeaveDays       Int       @default(30)
  sickLeave75Percent  Int       @default(60) // Days at 75% pay
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}
```

**Recommended Logic**:
1. **Accrual**: Monthly (1.75 days/month for 21-day entitlement)
2. **Carry Forward**: Yes, up to 5 days max
3. **Expiry**: Carried days expire after 3 months of new year
4. **Encashment**: Allow up to 10 unused days to be paid out

**Saudi Law Compliance**:
- Minimum 21 days after 1 year
- Can increase to 30 days after 5 years (configurable)
- Unused leave encashment on termination is mandatory

---

## 2. Notification System

### Implementation Status: 🟡 RECOMMENDED

**Current Setup**:
- User emails available in `User.email` and `Employee.email`
- Workflow actions logged in `WorkflowHistory`

**Recommended Implementation**:

### Step 1: Install Dependencies
```bash
npm install @nestjs/mailer nodemailer
npm install @types/nodemailer --save-dev
```

### Step 2: Create Notification Module
```typescript
// src/notifications/notifications.module.ts
import { MailerModule } from '@nestjs/mailer';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      defaults: {
        from: '"HRMS System" <noreply@company.sa>',
      },
    }),
  ],
})
export class NotificationsModule {}
```

### Step 3: Notification Service
```typescript
// src/notifications/notifications.service.ts
@Injectable()
export class NotificationsService {
  async sendLeaveApprovalNotification(leave: Leave, approver: string) {
    await this.mailerService.sendMail({
      to: leave.employee.email,
      subject: 'Leave Request Approved',
      template: './leave-approved',
      context: {
        employeeName: `${leave.employee.firstName} ${leave.employee.lastName}`,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        approver,
      },
    });
  }

  async sendWorkflowStepNotification(
    recipientEmail: string,
    entityType: string,
    entityId: number,
    action: 'PENDING' | 'APPROVED' | 'REJECTED',
  ) {
    // Send email based on action type
  }
}
```

### Integration Points:
1. **Leave Requests**: Notify on submit, approve, reject
2. **Advance Requests**: Notify on approval, payment
3. **Ticket Requests**: Notify on booking confirmation
4. **Workflow Steps**: Notify approvers when action needed
5. **Payroll**: Notify on payslip generation
6. **Documents**: Notify on expiry (Iqama, passport)

### SMS Integration (Optional):
Use SMS gateway for critical notifications:
- Leave rejections
- Advance payment confirmations
- Document expiry warnings (Iqama)

**Email Templates Needed**:
- `leave-submitted.hbs`
- `leave-approved.hbs`
- `leave-rejected.hbs`
- `advance-approved.hbs`
- `ticket-booked.hbs`
- `workflow-approval-needed.hbs`
- `document-expiry-warning.hbs`

---

## 3. Air Ticket Entitlements

### Implementation Status: ✅ PARTIAL (Model exists, policy needed)

**Current Implementation**:
- `TicketRequest` model tracks requests
- `TicketFamilyMember` tracks dependents
- `TravelClass` enum (ECONOMY, BUSINESS, FIRST_CLASS)
- `TicketType` enum (ANNUAL_LEAVE, HAJJ, EMERGENCY, BUSINESS)

**Policy Configuration Needed**:
```prisma
model TicketPolicy {
  id                  Int       @id @default(autoincrement())
  positionLevel       String    // 'Junior', 'Senior', 'Manager', 'Executive'
  contractType        ContractType
  
  // Entitlements
  ticketsPerYear      Int       @default(1)
  travelClass         TravelClass @default(ECONOMY)
  includeSpouse       Boolean   @default(true)
  maxChildren         Int       @default(3)
  maxDependents       Int       @default(0)
  
  // Budget
  maxAmount           Float?    // Maximum ticket cost
  
  // Hajj
  hajjTicketAfterYears Int      @default(2) // Eligible after X years
  
  // Destination
  allowedDestinations String?   // JSON array or 'ANY'
  restrictedCountries String?   // JSON array
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}
```

**Policy Rules by Position**:

| Position Level | Travel Class | Family Members | Tickets/Year | Max Amount (SAR) |
|---------------|--------------|----------------|--------------|------------------|
| Junior/Staff  | Economy      | Spouse + 2 kids| 1            | 5,000           |
| Senior        | Economy      | Spouse + 3 kids| 1            | 7,000           |
| Manager       | Business     | Spouse + 3 kids| 1            | 15,000          |
| Executive     | Business/First| Spouse + 4 kids| 1-2          | 30,000          |

**Business Logic**:
```typescript
async validateTicketRequest(employeeId: number, request: TicketRequest) {
  const employee = await getEmployee(employeeId);
  const policy = await getTicketPolicy(employee.position);
  
  // Check annual quota
  const usedTickets = await countTicketsThisYear(employeeId);
  if (usedTickets >= policy.ticketsPerYear) {
    throw new Error('Annual ticket quota exceeded');
  }
  
  // Check family member limits
  if (request.familyMembers.length > policy.maxChildren) {
    throw new Error('Exceeded family member limit');
  }
  
  // Check travel class eligibility
  if (request.travelClass > policy.travelClass) {
    throw new Error('Travel class not allowed for your grade');
  }
  
  // Check Hajj eligibility
  if (request.ticketType === 'HAJJ') {
    const yearsOfService = calculateYears(employee.joinDate);
    if (yearsOfService < policy.hajjTicketAfterYears) {
      throw new Error('Hajj ticket available after 2 years');
    }
    if (employee.hajjLeaveUsed) {
      throw new Error('Hajj ticket already used');
    }
  }
}
```

**Saudi Labor Law Requirements**:
- Annual vacation ticket for employee + family
- Destination: Usually home country
- Frequency: Once per year (some companies offer every 2 years)
- Hajj ticket: One-time, after completing 2 years

---

## 4. Biometric Device Communication

### Implementation Status: ✅ READY (Adapter pattern)

**Supported Communication Methods**:

### 1. REST API (Recommended)
```typescript
// src/biometric/adapters/rest-adapter.ts
export class RestBiometricAdapter {
  async fetchLogs(device: BiometricDevice): Promise<BiometricLog[]> {
    const response = await axios.get(
      `${device.apiEndpoint}/api/attendance/logs`,
      {
        headers: { 'X-API-Key': device.apiKey },
        params: { since: device.lastSync },
      }
    );
    return response.data.logs;
  }
}
```

### 2. SOAP API
```typescript
// src/biometric/adapters/soap-adapter.ts
import * as soap from 'soap';

export class SoapBiometricAdapter {
  async fetchLogs(device: BiometricDevice): Promise<BiometricLog[]> {
    const client = await soap.createClientAsync(device.apiEndpoint);
    const result = await client.GetAttendanceLogsAsync({
      deviceId: device.serialNumber,
      since: device.lastSync,
    });
    return this.parseSoapResponse(result);
  }
}
```

### 3. SDK Integration (ZKTeco Example)
```typescript
// src/biometric/adapters/zkteco-adapter.ts
import { ZKLib } from 'node-zklib';

export class ZKTecoAdapter {
  async fetchLogs(device: BiometricDevice): Promise<BiometricLog[]> {
    const zkInstance = new ZKLib(device.ipAddress, device.port, 10000);
    await zkInstance.connect();
    
    const attendances = await zkInstance.getAttendances();
    await zkInstance.disconnect();
    
    return attendances.map(att => ({
      employeeCode: att.deviceUserId,
      timestamp: att.recordTime,
      logType: this.mapZKLogType(att.type),
      verifyMode: 'FINGERPRINT',
    }));
  }
}
```

### Vendor-Specific Adapters

**ZKTeco Devices**:
- Protocol: TCP/IP
- SDK: node-zklib
- Default Port: 4370
- Methods: `getAttendances()`, `getUsers()`

**Anviz Devices**:
- Protocol: TCP/IP or USB
- SDK: Anviz SDK
- Default Port: 5010

**Generic REST Devices**:
- Protocol: HTTPS
- Authentication: API Key or Basic Auth
- Endpoints: `/api/logs`, `/api/users`

### Fallback Strategy (Offline Device)

```typescript
// src/biometric/biometric.service.ts
@Injectable()
export class BiometricService {
  @Cron('*/15 * * * *') // Every 15 minutes
  async syncAllDevices() {
    const devices = await this.getActiveDevices();
    
    for (const device of devices) {
      try {
        await this.syncDevice(device.id);
      } catch (error) {
        console.error(`Device ${device.deviceName} offline:`, error);
        
        // Mark device as offline
        await this.prisma.biometricDevice.update({
          where: { id: device.id },
          data: { isActive: false },
        });
        
        // Send alert to admin
        await this.notifyDeviceOffline(device);
      }
    }
  }
}
```

**Manual Attendance Entry**:
When device is offline, HR can manually enter attendance:
```typescript
POST /attendance/manual
{
  "employeeId": 1,
  "date": "2026-01-09",
  "checkIn": "08:00",
  "checkOut": "17:00",
  "reason": "Biometric device offline"
}
```

---

## 5. ERP Sync Strategy

### Implementation Status: ✅ READY

**Sync Options Implemented**:

### Option 1: Scheduled Batch Sync (Recommended)
```typescript
// src/erp/erp.service.ts
@Injectable()
export class ErpService {
  @Cron('0 2 * * *') // Daily at 2 AM
  async scheduledSync() {
    const integrations = await this.getActiveIntegrations();
    
    for (const integration of integrations) {
      if (integration.syncFrequency === 'DAILY') {
        await this.syncEmployees(integration.id);
        await this.syncPayroll(integration.id);
      }
    }
  }
}
```

**Frequency Options**:
- `HOURLY`: Real-time critical data (employee status changes)
- `DAILY`: Standard sync (payroll, attendance) - **RECOMMENDED**
- `WEEKLY`: Historical data, reports
- `MANUAL`: On-demand via API

### Option 2: Real-Time Webhooks
```typescript
// Receive webhook from ERP when employee updated
@Post('erp/webhook/employee-updated')
async handleEmployeeUpdate(@Body() data: any) {
  const employee = await this.findEmployeeByErpId(data.erpEmployeeId);
  
  await this.prisma.employee.update({
    where: { id: employee.id },
    data: this.mapErpFieldsToHrms(data),
  });
  
  await this.logSync('FROM_ERP', 'EMPLOYEE', 'SUCCESS');
}
```

### Source of Truth Strategy

**HRMS is Master for**:
- ✅ Employee personal data (name, contact, documents)
- ✅ Attendance records
- ✅ Leave requests
- ✅ Performance reviews
- ✅ Violations/warnings

**ERP is Master for**:
- ✅ Chart of accounts
- ✅ Cost centers
- ✅ General ledger entries

**Bidirectional (Sync Both Ways)**:
- ⚠️ Salary components (with conflict resolution)
- ⚠️ Payroll transactions
- ⚠️ Department structure

### Conflict Resolution
```typescript
enum SyncConflictStrategy {
  HRMS_WINS = 'HRMS_WINS',      // HRMS overwrites ERP
  ERP_WINS = 'ERP_WINS',         // ERP overwrites HRMS
  LATEST_WINS = 'LATEST_WINS',   // Most recent update wins
  MANUAL = 'MANUAL',             // Log conflict, require manual resolution
}
```

### Field Mapping Configuration
```typescript
// Stored as JSON in ERPIntegration.employeeFieldMap
{
  "HRMS_TO_ERP": {
    "employeeCode": "PERNR",           // SAP Personnel Number
    "firstName": "VORNA",              // First Name
    "lastName": "NACHN",               // Last Name
    "basicSalary": "BETRG",            // Amount
    "departmentId": "KOSTL",           // Cost Center
    "position": "PLANS"                // Position
  },
  "ERP_TO_HRMS": {
    "PERNR": "employeeCode",
    "VORNA": "firstName",
    "KOSTL": "departmentId"
  }
}
```

### Sync Process Flow
```
1. Fetch changes from HRMS since lastSyncAt
2. Transform data using field mapping
3. Send to ERP API
4. Receive ERP response
5. Handle errors/conflicts
6. Log sync results in ERPSyncLog
7. Update lastSyncAt timestamp
8. Repeat for reverse direction (ERP → HRMS)
```

### Error Handling
```typescript
try {
  await this.syncToERP(employees);
} catch (error) {
  await this.prisma.erpSyncLog.create({
    data: {
      erpIntegrationId: integration.id,
      syncType: 'EMPLOYEE',
      direction: 'TO_ERP',
      status: 'FAILED',
      recordsProcessed: 0,
      recordsFailed: employees.length,
      errorDetails: JSON.stringify({
        error: error.message,
        stack: error.stack,
        failedRecords: employees.map(e => e.id),
      }),
    },
  });
  
  // Alert admin
  await this.notifySync Failure(integration, error);
}
```

**Recommended Strategy**:
- **Scheduled**: DAILY at 2 AM (after payroll processing)
- **Direction**: BIDIRECTIONAL with conflict logging
- **Source of Truth**: HRMS for employee data, ERP for financials
- **Backup**: Database backup before each sync

---

## Summary

All "Further Considerations" have been addressed:

1. ✅ **Annual Leave**: Accrual logic defined, policy model designed
2. 🟡 **Notifications**: Architecture provided, ready to implement
3. ✅ **Air Tickets**: Policy model designed with Saudi compliance
4. ✅ **Biometric**: Multi-vendor adapters, offline fallback ready
5. ✅ **ERP Sync**: Scheduled strategy with conflict resolution

**Next Steps**:
1. Run database migration: `npx prisma migrate dev`
2. Seed workflows: `ts-node prisma/seed-workflows.ts`
3. Implement notification service (optional but recommended)
4. Configure biometric devices via API
5. Test workflow approvals end-to-end

---

**Document Version**: 1.0  
**Last Updated**: January 2026
