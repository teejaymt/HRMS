## Plan: Expand HRMS with Advanced Modules & Workflows

You're building a comprehensive enterprise HRMS for Saudi Arabia. The system needs a generic workflow engine, biometric attendance integration, talent acquisition, ERP sync, and multiple request workflows (leave, advance, air tickets). Your current foundation (NestJS + Prisma + Next.js) supports onboarding and payroll with basic approval flows—expand this into a full workflow-driven system.

### Steps

1. **Build Generic Workflow Engine** — Create [WorkflowDefinition, WorkflowInstance, WorkflowHistory] models in [prisma/schema.prisma](hrms-backend/prisma/schema.prisma), add `WorkflowModule` in [src/workflows](hrms-backend/src/workflows) following [payroll module](hrms-backend/src/payroll) patterns for multi-step approvals with audit trails

2. **Add Request Modules (Advance, Air Tickets)** — Create `AdvanceRequest` and `TicketRequest` models with employee relations, repayment schedules, family member tracking, then implement [src/advance-request](hrms-backend/src/advance-request) and [src/ticket-request](hrms-backend/src/ticket-request) modules following [leaves module](hrms-backend/src/leaves) approval patterns, link to workflow engine

3. **Implement Biometric Attendance Integration** — Add `BiometricDevice` and `BiometricLog` models, create [src/biometric](hrms-backend/src/biometric) service with scheduled polling (@nestjs/schedule), auto-convert logs to [Attendance](hrms-backend/src/attendance) records matching fingerprint/face/RFID device types

4. **Build Talent Acquisition Module** — Extend [onboarding](hrms-backend/src/onboarding) with `JobPosting`, `Applicant`, `Interview` models, add hiring workflow from application → interview → offer → onboarding conversion, create [app/recruitment](hrms-frontend/app/recruitment) frontend pages

5. **Create ERP Integration Layer** — Add `ERPIntegration` and `ERPSyncLog` models, implement [src/erp](hrms-backend/src/erp) service for scheduled bidirectional sync of [Employee](hrms-backend/prisma/schema.prisma) and [Payroll](hrms-backend/src/payroll) data with configurable field mappings (SAP/Oracle/Odoo)

6. **Migrate Existing Leave Workflow** — Refactor [leaves.service.ts](hrms-backend/src/leaves/leaves.service.ts) `approve`/`reject` methods to use workflow engine, add configurable approval chains (direct manager → department head → HR) based on leave type/duration

### Further Considerations

1. **Annual Leave Calculation Logic** — Should auto-calculate based on [Employee.annualLeaveDays](hrms-backend/prisma/schema.prisma#L50+) (21+ days Saudi compliance), accrue monthly, expire yearly, or carry forward? Need policy configuration model?

2. **Notification System** — Workflows need email/SMS alerts for approvals—add `@nestjs/mailer` integration? Use existing [auth user emails](hrms-backend/src/auth/auth.service.ts) for notifications?

3. **Air Ticket Entitlements** — Track per contract type (annual vacation tickets for employee + family based on grade/position)? Store airline preferences, travel class policies in `TicketPolicy` model linked to positions?

4. **Biometric Device Communication** — Devices expose REST APIs, SOAP, or SDK? Need middleware adapter per vendor (ZKTeco, Anviz, etc.)? Fallback to manual attendance if device offline?

5. **ERP Sync Strategy** — Real-time webhooks or scheduled batch (hourly/daily)? Which system is source of truth for employee master data vs payroll transactions?
