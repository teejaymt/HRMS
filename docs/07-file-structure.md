# File Structure & Naming Conventions

## 📋 Table of Contents
1. [Project Structure](#project-structure)
2. [Backend Structure](#backend-structure)
3. [Frontend Structure](#frontend-structure)
4. [Naming Conventions](#naming-conventions)
5. [Import Organization](#import-organization)
6. [File Templates](#file-templates)
7. [Best Practices](#best-practices)

## 🏗️ Project Structure

### Root Directory
```
HRMS/
├── docs/                      # Agent instructions and documentation
│   ├── 00-README.md
│   ├── 01-project-overview.md
│   ├── 02-backend-standards.md
│   ├── 03-frontend-standards.md
│   ├── 04-database-standards.md
│   ├── 05-api-standards.md
│   ├── 06-saudi-compliance.md
│   └── 07-file-structure.md
│
├── hrms-backend/              # NestJS backend application
│   ├── prisma/
│   ├── src/
│   ├── test/
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
├── hrms-frontend/             # Next.js frontend application
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
├── start-all.bat              # Windows startup script
├── start-all.sh               # Linux/Mac startup script
└── README.md                  # Project README
```

## 🔧 Backend Structure

### Complete Backend Directory Structure
```
hrms-backend/
├── prisma/
│   ├── migrations/            # Database migrations
│   │   └── YYYYMMDDHHMMSS_migration_name/
│   │       └── migration.sql
│   ├── schema.prisma          # Prisma schema
│   ├── seed.ts                # Database seeding script
│   └── seed-workflows.ts      # Workflow-specific seeds
│
├── src/
│   ├── main.ts                # Application entry point
│   ├── app.module.ts          # Root module
│   ├── app.controller.ts      # Root controller
│   ├── app.service.ts         # Root service
│   │
│   ├── Prisma/                # Prisma service module (capital P!)
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── auth/                  # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.decorator.ts
│   │   └── roles.guard.ts
│   │
│   ├── employees/             # Employee module
│   │   ├── employees.module.ts
│   │   ├── employees.controller.ts
│   │   ├── employees.service.ts
│   │   └── dto/              # Optional: DTOs
│   │       ├── create-employee.dto.ts
│   │       └── update-employee.dto.ts
│   │
│   ├── departments/           # Department module
│   │   ├── departments.module.ts
│   │   ├── departments.controller.ts
│   │   └── departments.service.ts
│   │
│   ├── attendance/            # Attendance module
│   │   ├── attendance.module.ts
│   │   ├── attendance.controller.ts
│   │   └── attendance.service.ts
│   │
│   ├── leaves/                # Leave management module
│   │   ├── leaves.module.ts
│   │   ├── leaves.controller.ts
│   │   └── leaves.service.ts
│   │
│   ├── payroll/               # Payroll module
│   │   ├── payroll.module.ts
│   │   ├── payroll.controller.ts
│   │   └── payroll.service.ts
│   │
│   ├── onboarding/            # Onboarding module
│   │   ├── onboarding.module.ts
│   │   ├── onboarding.controller.ts
│   │   └── onboarding.service.ts
│   │
│   ├── workflows/             # Workflow engine module
│   │   ├── workflows.module.ts
│   │   ├── workflows.controller.ts
│   │   └── workflows.service.ts
│   │
│   ├── advance-request/       # Advance request module
│   │   ├── advance-request.module.ts
│   │   ├── advance-request.controller.ts
│   │   └── advance-request.service.ts
│   │
│   ├── ticket-request/        # Support ticket module
│   │   ├── ticket-request.module.ts
│   │   ├── ticket-request.controller.ts
│   │   └── ticket-request.service.ts
│   │
│   ├── biometric/             # Biometric integration module
│   │   ├── biometric.module.ts
│   │   ├── biometric.controller.ts
│   │   └── biometric.service.ts
│   │
│   ├── recruitment/           # Recruitment module
│   │   ├── recruitment.module.ts
│   │   ├── recruitment.controller.ts
│   │   └── recruitment.service.ts
│   │
│   ├── erp/                   # ERP integration module
│   │   ├── erp.module.ts
│   │   ├── erp.controller.ts
│   │   └── erp.service.ts
│   │
│   ├── salary-history/        # Salary history module
│   │   ├── salary-history.module.ts
│   │   ├── salary-history.controller.ts
│   │   └── salary-history.service.ts
│   │
│   └── employee-data/         # Employee data module
│       ├── employee-data.module.ts
│       ├── employee-data.controller.ts
│       └── employee-data.service.ts
│
├── test/                      # E2E tests
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── public/                    # Static files
│   ├── index.html
│   └── dashboard.html
│
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── nest-cli.json
├── eslint.config.mjs
├── .env                       # Environment variables (gitignored)
├── .env.example               # Example environment file
│
└── Scripts (root level)
    ├── create-admin.ts        # Create admin user
    ├── reset-password.ts      # Reset password utility
    ├── list-users.ts          # List all users
    └── start-backend.bat      # Start script
```

### Module File Organization

#### Standard Module (3 files)
```
employees/
├── employees.module.ts        # Module definition
├── employees.controller.ts    # HTTP endpoints
└── employees.service.ts       # Business logic
```

#### Module with DTOs
```
employees/
├── employees.module.ts
├── employees.controller.ts
├── employees.service.ts
└── dto/
    ├── create-employee.dto.ts
    ├── update-employee.dto.ts
    └── filter-employee.dto.ts
```

#### Module with Guards/Decorators
```
auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── jwt.strategy.ts
├── jwt-auth.guard.ts
├── roles.decorator.ts
└── roles.guard.ts
```

## 🎨 Frontend Structure

### Complete Frontend Directory Structure
```
hrms-frontend/
├── app/                       # Next.js App Router
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   ├── globals.css            # Global styles
│   ├── favicon.ico            # Favicon
│   │
│   ├── auth/                  # Authentication pages
│   │   └── login/
│   │       └── page.tsx
│   │
│   ├── dashboard/             # Dashboard
│   │   └── page.tsx
│   │
│   ├── employees/             # Employee management
│   │   ├── page.tsx           # Employee list
│   │   ├── [id]/              # Dynamic route
│   │   │   └── page.tsx       # Employee detail
│   │   └── new/               # Create new
│   │       └── page.tsx
│   │
│   ├── departments/           # Department management
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── attendance/            # Attendance tracking
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── leaves/                # Leave management
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── new/
│   │       └── page.tsx
│   │
│   ├── payroll/               # Payroll processing
│   │   ├── page.tsx
│   │   ├── process/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── onboarding/            # Onboarding workflows
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── workflows/             # Workflow configuration
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── advance-requests/      # Advance requests
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── ticket-requests/       # Support tickets
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── biometric/             # Biometric configuration
│   │   └── page.tsx
│   │
│   ├── recruitment/           # Recruitment
│   │   ├── page.tsx
│   │   ├── jobs/
│   │   │   └── page.tsx
│   │   └── applications/
│   │       └── page.tsx
│   │
│   ├── erp-integration/       # ERP integration
│   │   └── page.tsx
│   │
│   ├── reports/               # Reporting
│   │   ├── page.tsx
│   │   ├── attendance/
│   │   │   └── page.tsx
│   │   └── payroll/
│   │       └── page.tsx
│   │
│   ├── audit-logs/            # Audit logs
│   │   └── page.tsx
│   │
│   └── admin/                 # Admin settings
│       ├── page.tsx
│       ├── users/
│       │   └── page.tsx
│       └── settings/
│           └── page.tsx
│
├── components/                # Reusable components
│   ├── layout/                # Layout components
│   │   ├── DashboardLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   │
│   ├── ui/                    # UI components (optional)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   └── Input.tsx
│   │
│   └── shared/                # Shared components (optional)
│       ├── LoadingSpinner.tsx
│       ├── ErrorMessage.tsx
│       └── ConfirmDialog.tsx
│
├── lib/                       # Utility libraries
│   ├── api.ts                 # API client
│   ├── auth-context.tsx       # Auth context provider
│   ├── utils.ts               # Utility functions
│   └── constants.ts           # Constants
│
├── public/                    # Static assets
│   ├── logo.svg
│   ├── logo-icon.svg
│   └── images/
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── .env.local                 # Environment variables (gitignored)
└── start-frontend.bat         # Start script
```

### Page Component Structure

#### List Page
```typescript
// app/employees/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchEmployees();
  }, []);
  
  async function fetchEmployees() {
    // Fetch logic
  }
  
  return (
    <div>
      {/* Page content */}
    </div>
  );
}
```

#### Detail Page (Dynamic Route)
```typescript
// app/employees/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';

export default function EmployeeDetailPage() {
  const params = useParams();
  const id = params.id;
  
  return (
    <div>
      {/* Detail content */}
    </div>
  );
}
```

## 📝 Naming Conventions

### File Naming

#### Backend Files
```
✅ GOOD
employees.module.ts
employees.controller.ts
employees.service.ts
create-employee.dto.ts
jwt-auth.guard.ts
roles.decorator.ts

❌ AVOID
Employees.module.ts            // Don't capitalize
employee.module.ts             // Use plural for modules
employees-module.ts            // Use dot notation
EmployeesModule.ts             // PascalCase for files
```

#### Frontend Files
```
✅ GOOD
page.tsx                       // Next.js page
layout.tsx                     // Next.js layout
DashboardLayout.tsx            // Component (PascalCase)
Sidebar.tsx                    // Component (PascalCase)
api.ts                         // Utility (camelCase)
auth-context.tsx               // Context (kebab-case)

❌ AVOID
dashboard-layout.tsx           // Use PascalCase for components
Api.ts                         // Use camelCase for utilities
authContext.tsx                // Use kebab-case for multi-word utils
```

### Folder Naming

#### Backend Folders
```
✅ GOOD
employees/                     // Plural, lowercase
advance-request/               // Kebab-case for multi-word
ticket-request/

❌ AVOID
employee/                      // Use plural
advanceRequest/                // Use kebab-case
advance_request/               // No underscores
```

#### Frontend Folders
```
✅ GOOD
app/employees/                 // Plural, lowercase
app/advance-requests/          // Kebab-case
components/layout/             // Lowercase
lib/                           // Lowercase

❌ AVOID
app/Employees/                 // Don't capitalize
app/advanceRequests/           // Use kebab-case
Components/Layout/             // Don't capitalize folders
```

### Variable Naming

#### TypeScript/JavaScript
```typescript
✅ GOOD
const employeeName = 'Ahmed';           // camelCase
const MAX_EMPLOYEES = 100;              // SCREAMING_SNAKE_CASE for constants
const API_BASE_URL = 'http://...';      // SCREAMING_SNAKE_CASE for constants

class EmployeeService { }               // PascalCase for classes
interface Employee { }                  // PascalCase for interfaces
enum Role { }                           // PascalCase for enums
type EmployeeData = { }                 // PascalCase for types

❌ AVOID
const EmployeeName = 'Ahmed';           // Don't use PascalCase for variables
const employee_name = 'Ahmed';          // Don't use snake_case
const EMPLOYEENAME = 'Ahmed';           // Don't use all caps for regular vars
```

### Database Naming (Prisma)

```prisma
✅ GOOD
model Employee { }                      // PascalCase, singular
model AdvanceRequest { }                // PascalCase for multi-word
enum Role { }                           // PascalCase
enum EmployeeStatus { }                 // PascalCase

// Fields
firstName          String               // camelCase
dateOfBirth        DateTime             // camelCase
iqamaExpiryDate    DateTime             // camelCase

❌ AVOID
model Employees { }                     // Use singular
model advance_request { }               // Use PascalCase
model advanceRequest { }                // Use PascalCase

// Fields
first_name         String               // Use camelCase
FirstName          String               // Use camelCase
```

## 📦 Import Organization

### Backend Import Order
```typescript
// 1. Node.js built-ins
import * as fs from 'fs';
import * as path from 'path';

// 2. External packages
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// 3. Internal modules (absolute imports)
import { PrismaService } from '../Prisma/prisma.service';
import { DepartmentsService } from '../departments/departments.service';

// 4. Types/Interfaces
import type { Employee, Department } from '@prisma/client';

// 5. DTOs
import { CreateEmployeeDto } from './dto/create-employee.dto';
```

### Frontend Import Order
```typescript
// 1. React imports
import { useState, useEffect } from 'react';

// 2. Next.js imports
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

// 3. External packages
import { format } from 'date-fns';

// 4. Internal imports (alias @/)
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/layout/DashboardLayout';

// 5. Types
import type { Employee } from '@prisma/client';

// 6. Styles (if any)
import styles from './page.module.css';
```

## 📄 File Templates

### Backend Module Template
```typescript
// employees/employees.module.ts
import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { PrismaModule } from '../Prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
```

### Backend Controller Template
```typescript
// employees/employees.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  findAll(@Query() filters: any) {
    return this.employeesService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(+id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.HR)
  create(@Body() createDto: any) {
    return this.employeesService.create(createDto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.HR)
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.employeesService.update(+id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.employeesService.remove(+id);
  }
}
```

### Backend Service Template
```typescript
// employees/employees.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: any) {
    return this.prisma.employee.findMany({
      include: {
        department: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        user: true,
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async create(data: any) {
    return this.prisma.employee.create({
      data,
      include: {
        department: true,
      },
    });
  }

  async update(id: number, data: any) {
    await this.findOne(id); // Verify exists

    return this.prisma.employee.update({
      where: { id },
      data,
      include: {
        department: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Verify exists

    return this.prisma.employee.delete({
      where: { id },
    });
  }
}
```

### Frontend Page Template
```typescript
// app/employees/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    try {
      setLoading(true);
      const data = await api.employees.getAll();
      setEmployees(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <button
          onClick={() => router.push('/employees/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Add Employee
        </button>
      </div>

      <div className="grid gap-4">
        {employees.map((employee: any) => (
          <div key={employee.id} className="p-4 border rounded-lg">
            <h3 className="font-semibold">{employee.firstName} {employee.lastName}</h3>
            <p className="text-gray-600">{employee.position}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## ✅ Best Practices

### File Organization
1. **Group by feature** - Keep related files together in modules
2. **One component per file** - Don't mix multiple components
3. **Index files** - Avoid using index.ts/tsx (explicit is better than implicit)
4. **Flat structure** - Don't nest too deeply (max 3-4 levels)

### Naming Consistency
1. **Be consistent** - Follow the same pattern throughout the project
2. **Be descriptive** - Names should explain what they do
3. **Avoid abbreviations** - Use `employee` not `emp`, `department` not `dept`
4. **Use domain language** - Use business terminology

### Module Organization
1. **Keep modules focused** - One responsibility per module
2. **Minimize dependencies** - Reduce coupling between modules
3. **Export only what's needed** - Don't over-expose internals
4. **Use barrel exports sparingly** - Explicit imports are clearer

### Import Management
1. **Group imports logically** - See import order sections above
2. **Use absolute imports** - Use `@/lib/api` instead of `../../lib/api`
3. **Avoid circular dependencies** - Restructure if needed
4. **Import types separately** - Use `import type` for types

---

**Documentation Complete!** 🎉

This completes the agent instruction documentation for the HRMS project. All coding standards, conventions, and best practices are now documented for AI agents to follow.
