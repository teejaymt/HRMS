# API Design Conventions

## 📋 Table of Contents
1. [RESTful Principles](#restful-principles)
2. [Endpoint Naming](#endpoint-naming)
3. [HTTP Methods](#http-methods)
4. [Request/Response Format](#requestresponse-format)
5. [Status Codes](#status-codes)
6. [Error Handling](#error-handling)
7. [Pagination](#pagination)
8. [Filtering & Searching](#filtering--searching)
9. [Authentication](#authentication)
10. [Versioning](#versioning)

## 🌐 RESTful Principles

### Resource-Oriented Design
```
GET    /employees           # List all employees
GET    /employees/123       # Get specific employee
POST   /employees           # Create new employee
PATCH  /employees/123       # Update employee
DELETE /employees/123       # Delete employee
```

### Nested Resources
```
GET    /employees/123/leaves           # Get leaves for employee 123
POST   /employees/123/leaves           # Create leave for employee 123
GET    /departments/5/employees        # Get employees in department 5
```

### Non-CRUD Actions
```
POST   /payroll/process                # Process payroll
POST   /employees/123/terminate        # Terminate employee
POST   /leaves/123/approve             # Approve leave
POST   /workflows/123/submit           # Submit workflow
GET    /employees/stats                # Get employee statistics
GET    /attendance/summary             # Get attendance summary
```

## 📝 Endpoint Naming

### URL Structure
```
/api/{resource}
/api/{resource}/{id}
/api/{resource}/{id}/{sub-resource}
/api/{resource}/{id}/{sub-resource}/{sub-id}
/api/{resource}/{action}
```

### Naming Rules

#### 1. Use Plural Nouns for Collections
```
✅ GOOD
GET /employees
GET /departments
GET /leaves

❌ AVOID
GET /employee
GET /department
GET /leave
```

#### 2. Use Kebab-Case for Multi-Word Resources
```
✅ GOOD
GET /advance-requests
GET /ticket-requests
GET /onboarding-tasks

❌ AVOID
GET /advanceRequests
GET /advance_requests
GET /AdvanceRequests
```

#### 3. Use Nouns, Not Verbs
```
✅ GOOD
GET    /employees
POST   /employees
DELETE /employees/123

❌ AVOID
GET    /getEmployees
POST   /createEmployee
DELETE /deleteEmployee
```

#### 4. Use Sub-Resources for Relationships
```
✅ GOOD
GET /employees/123/leaves
GET /departments/5/employees

❌ AVOID
GET /leaves?employeeId=123
GET /employees?departmentId=5
```

## 🔨 HTTP Methods

### Standard CRUD Operations

#### GET - Retrieve
```typescript
// Get all
@Get('employees')
findAll(@Query() filters: FilterDto) {
  return this.employeesService.findAll(filters);
}

// Get one
@Get('employees/:id')
findOne(@Param('id') id: string) {
  return this.employeesService.findOne(+id);
}
```

#### POST - Create
```typescript
@Post('employees')
@HttpCode(201)
create(@Body() createDto: CreateEmployeeDto) {
  return this.employeesService.create(createDto);
}
```

#### PATCH - Partial Update
```typescript
@Patch('employees/:id')
update(
  @Param('id') id: string,
  @Body() updateDto: UpdateEmployeeDto
) {
  return this.employeesService.update(+id, updateDto);
}
```

#### PUT - Full Replacement (Rarely Used)
```typescript
@Put('employees/:id')
replace(
  @Param('id') id: string,
  @Body() replaceDto: ReplaceEmployeeDto
) {
  return this.employeesService.replace(+id, replaceDto);
}
```

#### DELETE - Remove
```typescript
@Delete('employees/:id')
@HttpCode(204)
remove(@Param('id') id: string) {
  return this.employeesService.remove(+id);
}
```

### Custom Actions (POST)
```typescript
// Process payroll
@Post('payroll/process')
processPayroll(@Body() data: ProcessPayrollDto) {
  return this.payrollService.process(data);
}

// Approve leave
@Post('leaves/:id/approve')
approveLeave(
  @Param('id') id: string,
  @Body() approvalDto: ApprovalDto
) {
  return this.leavesService.approve(+id, approvalDto);
}

// Submit workflow
@Post('workflows/:id/submit')
submitWorkflow(@Param('id') id: string) {
  return this.workflowsService.submit(+id);
}
```

## 📦 Request/Response Format

### Request Body Structure

#### Create Request
```json
POST /employees
{
  "firstName": "Ahmed",
  "lastName": "Al-Mansour",
  "firstNameArabic": "أحمد",
  "lastNameArabic": "المنصور",
  "email": "ahmed@company.com",
  "phone": "+966501234567",
  "departmentId": 1,
  "position": "Software Engineer",
  "joinDate": "2024-01-15",
  "basicSalary": 10000,
  "isSaudi": true,
  "nationality": "Saudi",
  "saudiId": "1234567890"
}
```

#### Update Request (Partial)
```json
PATCH /employees/123
{
  "position": "Senior Software Engineer",
  "basicSalary": 15000
}
```

#### Bulk Operations
```json
POST /employees/bulk
{
  "employees": [
    { "firstName": "Ahmed", "lastName": "Ali", ... },
    { "firstName": "Sarah", "lastName": "Khan", ... }
  ]
}
```

### Response Structure

#### Success Response (Single Resource)
```typescript
// Controller
@Get(':id')
async findOne(@Param('id') id: string) {
  return this.employeesService.findOne(+id);
}

// Response
{
  "id": 123,
  "employeeCode": "EMP123",
  "firstName": "Ahmed",
  "lastName": "Al-Mansour",
  "email": "ahmed@company.com",
  "position": "Software Engineer",
  "department": {
    "id": 1,
    "name": "IT",
    "nameArabic": "تقنية المعلومات"
  },
  "status": "ACTIVE",
  "joinDate": "2024-01-15T00:00:00.000Z",
  "createdAt": "2024-01-10T10:30:00.000Z",
  "updatedAt": "2024-01-15T14:20:00.000Z"
}
```

#### Success Response (Collection)
```typescript
// Controller
@Get()
async findAll(@Query() filters: FilterDto) {
  return this.employeesService.findAll(filters);
}

// Response
{
  "items": [
    {
      "id": 123,
      "firstName": "Ahmed",
      "lastName": "Al-Mansour",
      ...
    },
    {
      "id": 124,
      "firstName": "Sarah",
      "lastName": "Khan",
      ...
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15
}
```

#### Create Response (201 Created)
```json
POST /employees
Status: 201 Created

{
  "id": 125,
  "employeeCode": "EMP125",
  "firstName": "Ahmed",
  "lastName": "Al-Mansour",
  "email": "ahmed@company.com",
  ...
}
```

#### Delete Response (204 No Content)
```
DELETE /employees/123
Status: 204 No Content

(No response body)
```

## 📊 Status Codes

### Success Codes (2xx)

```typescript
// 200 OK - Default success
@Get(':id')
findOne() { }  // Returns 200

// 201 Created - Resource created
@Post()
@HttpCode(201)
create() { }

// 204 No Content - Success with no response body
@Delete(':id')
@HttpCode(204)
remove() { }
```

### Client Error Codes (4xx)

```typescript
// 400 Bad Request - Invalid input
throw new BadRequestException('Invalid email format');

// 401 Unauthorized - Not authenticated
throw new UnauthorizedException('Invalid credentials');

// 403 Forbidden - Authenticated but not authorized
throw new ForbiddenException('You do not have permission');

// 404 Not Found - Resource doesn't exist
throw new NotFoundException('Employee not found');

// 409 Conflict - Duplicate or constraint violation
throw new ConflictException('Email already exists');

// 422 Unprocessable Entity - Validation errors
throw new UnprocessableEntityException('Validation failed');
```

### Server Error Codes (5xx)

```typescript
// 500 Internal Server Error
throw new InternalServerErrorException('Something went wrong');

// 503 Service Unavailable
throw new ServiceUnavailableException('Database connection failed');
```

## ⚠️ Error Handling

### Standard Error Response Format
```json
{
  "statusCode": 400,
  "message": "Invalid email format",
  "error": "Bad Request",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/employees"
}
```

### Validation Errors
```json
{
  "statusCode": 400,
  "message": [
    "firstName must be a string",
    "email must be a valid email",
    "basicSalary must be a positive number"
  ],
  "error": "Bad Request"
}
```

### Custom Error Handler
```typescript
// Exception filter
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### Prisma Error Handling
```typescript
async create(data: CreateEmployeeDto) {
  try {
    return await this.prisma.employee.create({ data });
  } catch (error) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      throw new ConflictException(`${error.meta.target} already exists`);
    }
    
    // Foreign key constraint
    if (error.code === 'P2003') {
      throw new BadRequestException('Invalid department ID');
    }
    
    throw new InternalServerErrorException('Failed to create employee');
  }
}
```

## 📄 Pagination

### Query Parameters
```
GET /employees?page=1&limit=10
```

### Controller Implementation
```typescript
@Get()
async findAll(
  @Query('page') page?: string,
  @Query('limit') limit?: string,
) {
  return this.employeesService.findAll({
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10,
  });
}
```

### Service Implementation
```typescript
async findAll(options: { page?: number; limit?: number }) {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    this.prisma.employee.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.employee.count(),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPreviousPage: page > 1,
  };
}
```

### Response Format
```json
{
  "items": [...],
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

## 🔍 Filtering & Searching

### Query Parameters
```
GET /employees?status=ACTIVE
GET /employees?departmentId=5
GET /employees?search=ahmed
GET /employees?status=ACTIVE&departmentId=5&search=engineer
GET /employees?startDate=2024-01-01&endDate=2024-12-31
```

### Controller
```typescript
@Get()
async findAll(
  @Query('status') status?: string,
  @Query('departmentId') departmentId?: string,
  @Query('search') search?: string,
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
) {
  return this.employeesService.findAll({
    status,
    departmentId: departmentId ? parseInt(departmentId) : undefined,
    search,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  });
}
```

### Service
```typescript
async findAll(filters: {
  status?: string;
  departmentId?: number;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const where: any = {};

  // Status filter
  if (filters.status) {
    where.status = filters.status;
  }

  // Department filter
  if (filters.departmentId) {
    where.departmentId = filters.departmentId;
  }

  // Search filter (multiple fields)
  if (filters.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { employeeCode: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Date range filter
  if (filters.startDate && filters.endDate) {
    where.joinDate = {
      gte: filters.startDate,
      lte: filters.endDate,
    };
  }

  return this.prisma.employee.findMany({
    where,
    include: {
      department: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}
```

### Sorting
```
GET /employees?sortBy=firstName&order=asc
GET /employees?sortBy=joinDate&order=desc
```

```typescript
@Get()
async findAll(
  @Query('sortBy') sortBy?: string,
  @Query('order') order?: 'asc' | 'desc',
) {
  return this.employeesService.findAll({
    sortBy: sortBy || 'createdAt',
    order: order || 'desc',
  });
}
```

## 🔐 Authentication

### JWT Authentication Header
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Protected Routes
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('employees')
@UseGuards(JwtAuthGuard)  // Protect entire controller
export class EmployeesController {
  
  @Get()
  findAll() {
    // Only accessible with valid JWT
  }
  
  @Post()
  @Roles(Role.ADMIN, Role.HR)  // Additional role check
  create(@Body() data: CreateEmployeeDto) {
    // Only ADMIN or HR can create
  }
}
```

### Getting Current User
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Usage
@Get('me')
getProfile(@CurrentUser() user: User) {
  return user;
}
```

### Login Endpoint
```typescript
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}

// Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@hrms.com",
    "role": "ADMIN"
  }
}
```

## 🔄 Versioning

### URL Versioning (Recommended)
```typescript
@Controller('v1/employees')
export class EmployeesV1Controller { }

@Controller('v2/employees')
export class EmployeesV2Controller { }

// URLs:
// /v1/employees
// /v2/employees
```

### Header Versioning
```typescript
// Request header
Accept: application/vnd.company.v1+json

// NestJS setup
import { VersioningType } from '@nestjs/common';

app.enableVersioning({
  type: VersioningType.HEADER,
  header: 'Accept',
});
```

## 📋 API Documentation Examples

### Employees API

```typescript
/**
 * Get all employees
 * 
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @param status - Filter by status (ACTIVE, INACTIVE, etc.)
 * @param departmentId - Filter by department ID
 * @param search - Search by name, email, or employee code
 * 
 * @returns Paginated list of employees
 */
@Get()
async findAll(@Query() filters: FilterEmployeesDto) { }

/**
 * Get employee by ID
 * 
 * @param id - Employee ID
 * @returns Employee details with relations
 * @throws NotFoundException if employee not found
 */
@Get(':id')
async findOne(@Param('id') id: string) { }

/**
 * Create new employee
 * 
 * @param data - Employee data
 * @returns Created employee
 * @throws ConflictException if email exists
 * @throws BadRequestException if invalid data
 */
@Post()
@HttpCode(201)
async create(@Body() data: CreateEmployeeDto) { }
```

## ✅ Best Practices Summary

1. **Use RESTful conventions** - Stick to standard HTTP methods and resource naming
2. **Return appropriate status codes** - 200, 201, 204, 400, 404, 409, 500, etc.
3. **Include pagination** for list endpoints
4. **Support filtering and searching** via query parameters
5. **Use consistent response formats** across all endpoints
6. **Handle errors gracefully** with meaningful messages
7. **Protect sensitive endpoints** with authentication and authorization
8. **Document your API** - Use JSDoc comments or Swagger
9. **Version your API** when making breaking changes
10. **Validate all inputs** using DTOs and class-validator
11. **Include related data** using Prisma includes
12. **Use transactions** for multi-step operations
13. **Return timestamps** (createdAt, updatedAt) in responses
14. **Support bulk operations** when appropriate
15. **Use kebab-case** for multi-word URLs

---

**Next**: [Saudi Compliance Guidelines](06-saudi-compliance.md)
