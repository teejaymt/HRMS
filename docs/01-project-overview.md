# Project Overview & Architecture

## 📖 Introduction

This HRMS (Human Resource Management System) is designed specifically for businesses operating in Saudi Arabia, with full compliance to Saudi Labor Law, GOSI regulations, and Nitaqat requirements.

## 🏗️ Architecture Overview

### Monorepo Structure

```
HRMS/
├── hrms-backend/          # NestJS REST API
├── hrms-frontend/         # Next.js React Application
└── docs/                  # Documentation & Agent Instructions
```

### Technology Stack

#### Backend
- **Framework**: NestJS v11
- **Runtime**: Node.js with TypeScript
- **Database**: SQLite (development) / PostgreSQL (production ready)
- **ORM**: Prisma v7.2
- **Authentication**: JWT with Passport
- **Scheduling**: @nestjs/schedule for cron jobs
- **Validation**: class-validator & class-transformer

#### Frontend
- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Icons**: Heroicons
- **State Management**: React Context API
- **Forms**: Native React (no form library)

## 🎯 Core Modules

### Backend Modules

1. **Auth Module** - Authentication and authorization
2. **Employees Module** - Employee management with Saudi compliance
3. **Departments Module** - Department and organizational structure
4. **Attendance Module** - Time tracking and attendance
5. **Leaves Module** - Leave requests and balance management
6. **Payroll Module** - Salary processing with GOSI
7. **Onboarding Module** - New employee onboarding workflows
8. **Workflows Module** - Approval workflows
9. **Advance Request Module** - Salary advance requests
10. **Ticket Request Module** - Employee support tickets
11. **Biometric Module** - Biometric device integration
12. **Recruitment Module** - Job postings and applications
13. **ERP Module** - ERP system integration
14. **Salary History Module** - Historical salary tracking
15. **Employee Data Module** - Employee data management

### Frontend Pages

- `/auth` - Login and authentication
- `/dashboard` - Main dashboard
- `/employees` - Employee management
- `/departments` - Department management
- `/attendance` - Attendance tracking
- `/leaves` - Leave management
- `/payroll` - Payroll processing
- `/onboarding` - Onboarding workflows
- `/workflows` - Workflow configuration
- `/advance-requests` - Advance requests
- `/ticket-requests` - Support tickets
- `/biometric` - Biometric configuration
- `/recruitment` - Recruitment management
- `/erp-integration` - ERP integration
- `/reports` - Reporting and analytics
- `/admin` - Admin settings

## 🔐 Authentication & Authorization

### Roles
- **ADMIN** - Full system access
- **HR** - HR department access
- **MANAGER** - Department manager access
- **EMPLOYEE** - Self-service employee access

### JWT Authentication Flow
1. User logs in with email/password
2. Backend validates credentials and returns JWT token
3. Frontend stores token in localStorage
4. Token is sent in Authorization header for all API requests
5. Backend validates token and extracts user/role information

## 🗄️ Database Schema Overview

### Core Tables
- **User** - Authentication and user accounts
- **Employee** - Employee master data (Saudi compliant)
- **Department** - Organizational departments
- **Attendance** - Daily attendance records
- **Leave** - Leave requests and approvals
- **Payroll** - Monthly payroll records
- **OnboardingTask** - Onboarding checklists
- **Workflow** - Configurable workflows
- **AdvanceRequest** - Salary advance tracking
- **TicketRequest** - Support ticket system

### Saudi-Specific Fields
- Iqama/Saudi ID tracking
- GOSI registration
- Hijri date fields
- Arabic name fields
- Nitaqat/Saudization counters

## 🌐 API Architecture

### REST API Structure
```
/auth/*              - Authentication endpoints
/employees/*         - Employee CRUD operations
/departments/*       - Department CRUD operations
/attendance/*        - Attendance tracking
/leaves/*            - Leave management
/payroll/*           - Payroll processing
/workflows/*         - Workflow configuration
/biometric/*         - Biometric integration
/recruitment/*       - Job postings and applications
```

### Response Format
```typescript
// Success Response
{
  data: T,
  message?: string
}

// Error Response
{
  statusCode: number,
  message: string,
  error?: string
}
```

## 🔄 Data Flow

### Typical Request Flow
1. User interacts with Next.js frontend
2. Frontend calls API through `lib/api.ts` client
3. Request hits NestJS controller
4. Controller delegates to service layer
5. Service uses Prisma to query database
6. Response flows back through the layers
7. Frontend updates UI with response data

## 📦 Module Organization

### Backend Module Pattern
```typescript
module/
├── module.module.ts       // NestJS module definition
├── module.controller.ts   // HTTP endpoints
├── module.service.ts      // Business logic
└── dto/                   // Data transfer objects (optional)
    ├── create-module.dto.ts
    └── update-module.dto.ts
```

### Frontend Page Pattern
```typescript
app/module/
├── page.tsx              // Main page component
├── [id]/                 // Dynamic routes
│   └── page.tsx
└── components/           // Page-specific components (optional)
```

## 🚀 Development Workflow

### Starting the Application

**Backend**:
```bash
cd hrms-backend
npm install
npm run start:dev
```

**Frontend**:
```bash
cd hrms-frontend
npm install
npm run dev
```

### Environment Variables

**Backend** (.env):
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
```

**Frontend** (.env.local):
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📊 Key Business Logic

### Nitaqat/Saudization
- Track Saudi vs. non-Saudi employees per department
- Maintain saudiCount and nonSaudiCount
- Required for government compliance

### GOSI (Social Insurance)
- Track GOSI registration for all employees
- Automatic contribution calculation
- Expiry date tracking for Iqamas

### Hijri Calendar Support
- Dual date system (Gregorian + Hijri)
- Used for Saudi national records
- Required for official documents

### Workflow Engine
- Configurable multi-step approval workflows
- Role-based approval routing
- Automatic notifications

## 🎨 UI/UX Standards

### Branding
- **Primary Color**: Blue (#0066CC)
- **Company Name**: Business on Air
- **Logo**: Located in `/public/logo-icon.svg`

### Layout
- Responsive sidebar navigation
- Dashboard layout wrapper for all authenticated pages
- Auth pages have minimal layout

### Design System
- Tailwind CSS for styling
- Heroicons for icons
- Consistent spacing and typography
- Mobile-responsive design

## 🔒 Security Considerations

1. **JWT tokens** stored in localStorage
2. **Password hashing** with bcrypt
3. **Role-based access control** on all endpoints
4. **Input validation** with class-validator
5. **SQL injection protection** via Prisma ORM
6. **CORS** configuration for production

## 📈 Scalability Considerations

1. **Database**: SQLite for development, PostgreSQL adapter ready for production
2. **Caching**: Ready for Redis integration
3. **File Storage**: Local storage for development, S3-ready
4. **Job Scheduling**: NestJS Schedule for cron jobs
5. **Modularity**: Feature modules can be deployed independently

## 🧪 Testing Strategy

1. **Unit Tests**: Jest for service layer
2. **E2E Tests**: Jest for API endpoints
3. **Frontend Tests**: React Testing Library (to be implemented)
4. **Manual Testing**: Postman collections (to be created)

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Saudi Labor Law](https://hrsd.gov.sa/)
- [GOSI Guidelines](https://www.gosi.gov.sa/)

---

**Next**: [Backend Coding Standards](02-backend-standards.md)
