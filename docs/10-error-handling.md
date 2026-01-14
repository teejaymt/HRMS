# Error Handling & Logging

## 📋 Table of Contents
1. [Error Handling Philosophy](#error-handling-philosophy)
2. [NestJS Exception Handling](#nestjs-exception-handling)
3. [Custom Exceptions](#custom-exceptions)
4. [Global Exception Filter](#global-exception-filter)
5. [Frontend Error Handling](#frontend-error-handling)
6. [Logging Standards](#logging-standards)
7. [Error Response Format](#error-response-format)
8. [Best Practices](#best-practices)

## 🎯 Error Handling Philosophy

### Principles
1. **Fail Fast** - Catch errors early and explicitly
2. **Be Specific** - Use specific exception types
3. **User-Friendly** - Provide helpful error messages
4. **Log Everything** - Log errors for debugging
5. **Never Expose Internals** - Don't leak implementation details

### Error Categories
- **Client Errors (4xx)** - User made a mistake
- **Server Errors (5xx)** - System has a problem
- **Validation Errors** - Invalid input data
- **Business Logic Errors** - Operation not allowed
- **Database Errors** - Data access failures

## 🚨 NestJS Exception Handling

### Built-in HTTP Exceptions

```typescript
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';

// 400 Bad Request
throw new BadRequestException('Invalid email format');

// 401 Unauthorized
throw new UnauthorizedException('Invalid credentials');

// 403 Forbidden
throw new ForbiddenException('You do not have permission');

// 404 Not Found
throw new NotFoundException('Employee not found');

// 409 Conflict
throw new ConflictException('Email already exists');

// 422 Unprocessable Entity
throw new UnprocessableEntityException('Validation failed');

// 500 Internal Server Error
throw new InternalServerErrorException('Something went wrong');
```

### Service Layer Error Handling

```typescript
@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async create(data: CreateEmployeeDto) {
    try {
      return await this.prisma.employee.create({
        data: {
          ...data,
          employeeCode: await this.generateEmployeeCode(),
        },
      });
    } catch (error) {
      // Prisma unique constraint violation
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'field';
        throw new ConflictException(`${field} already exists`);
      }

      // Prisma foreign key constraint
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid department ID');
      }

      // Log unexpected errors
      console.error('Failed to create employee:', error);
      throw new InternalServerErrorException('Failed to create employee');
    }
  }

  async update(id: number, data: UpdateEmployeeDto) {
    // Verify employee exists
    await this.findOne(id);

    try {
      return await this.prisma.employee.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }

      console.error(`Failed to update employee ${id}:`, error);
      throw new InternalServerErrorException('Failed to update employee');
    }
  }

  async remove(id: number) {
    // Verify employee exists
    await this.findOne(id);

    try {
      return await this.prisma.employee.delete({
        where: { id },
      });
    } catch (error) {
      console.error(`Failed to delete employee ${id}:`, error);
      throw new InternalServerErrorException('Failed to delete employee');
    }
  }
}
```

### Controller Error Handling

```typescript
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // Service will throw NotFoundException if not found
    return this.employeesService.findOne(+id);
  }

  @Post()
  async create(@Body() createDto: CreateEmployeeDto) {
    // Service will throw ConflictException if email exists
    return this.employeesService.create(createDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmployeeDto,
  ) {
    // Validate ID is a number
    const employeeId = parseInt(id);
    if (isNaN(employeeId)) {
      throw new BadRequestException('Invalid employee ID');
    }

    return this.employeesService.update(employeeId, updateDto);
  }
}
```

## 🔧 Custom Exceptions

### Business Logic Exception
```typescript
// exceptions/business-logic.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessLogicException extends HttpException {
  constructor(message: string, details?: any) {
    super(
      {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message,
        error: 'Business Logic Error',
        details,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

// Usage
if (employee.leaveBalance < requestedDays) {
  throw new BusinessLogicException(
    'Insufficient leave balance',
    {
      available: employee.leaveBalance,
      requested: requestedDays,
    }
  );
}
```

### Iqama Expiry Exception
```typescript
// exceptions/iqama-expired.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class IqamaExpiredException extends HttpException {
  constructor(employeeId: number, expiryDate: Date) {
    super(
      {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Employee Iqama has expired',
        error: 'Iqama Expired',
        employeeId,
        expiryDate,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

// Usage
if (employee.iqamaExpiryDate < new Date()) {
  throw new IqamaExpiredException(employee.id, employee.iqamaExpiryDate);
}
```

## 🎛️ Global Exception Filter

### Exception Filter Implementation
```typescript
// filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log the error
    console.error('Exception caught:', {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      status,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    // Send response
    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### Apply Global Filter
```typescript
// main.ts
import { AllExceptionsFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(3000);
}
```

## 🌐 Frontend Error Handling

### API Client Error Handling
```typescript
// lib/api.ts
class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('token') 
      : null;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        // Parse error response
        const error = await response.json().catch(() => ({ 
          message: 'An error occurred',
          statusCode: response.status,
        }));

        // Handle specific status codes
        if (response.status === 401) {
          // Unauthorized - redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/auth/login';
          }
          throw new Error('Session expired. Please login again.');
        }

        if (response.status === 403) {
          throw new Error('You do not have permission to perform this action.');
        }

        if (response.status === 404) {
          throw new Error('The requested resource was not found.');
        }

        if (response.status === 409) {
          throw new Error(error.message || 'A conflict occurred.');
        }

        if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }

        // Default error message
        throw new Error(error.message || 'Request failed');
      }

      return response.json();
    } catch (error: any) {
      // Network error
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error(
          `Cannot connect to server. Please check your connection.`
        );
      }
      
      // Re-throw other errors
      throw error;
    }
  }
}
```

### Component Error Handling
```typescript
'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function CreateEmployeePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  async function handleSubmit(data: any) {
    try {
      setLoading(true);
      setError(null);
      setValidationErrors({});

      await api.employees.create(data);
      
      // Success - redirect
      router.push('/employees');
    } catch (err: any) {
      // Handle validation errors
      if (err.validationErrors) {
        setValidationErrors(err.validationErrors);
      } else {
        // Generic error
        setError(err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Form fields with validation error display */}
        <div>
          <input type="email" name="email" />
          {validationErrors.email && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.email}
            </p>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Employee'}
        </button>
      </form>
    </div>
  );
}
```

### Error Boundary (React)
```typescript
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 📝 Logging Standards

### Console Logging (Development)
```typescript
// Development logging
console.log('Employee created:', employee.id);
console.warn('Iqama expiring soon:', employee.iqamaExpiryDate);
console.error('Failed to create employee:', error);
```

### Structured Logging (Production)
```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  async create(data: CreateEmployeeDto) {
    this.logger.log('Creating employee', { email: data.email });

    try {
      const employee = await this.prisma.employee.create({ data });
      
      this.logger.log('Employee created successfully', {
        id: employee.id,
        email: employee.email,
      });

      return employee;
    } catch (error) {
      this.logger.error('Failed to create employee', {
        error: error.message,
        stack: error.stack,
        data,
      });

      throw error;
    }
  }
}
```

### Log Levels
```typescript
logger.log('Info message');        // General information
logger.debug('Debug details');     // Debugging information
logger.warn('Warning message');    // Warning - potential issues
logger.error('Error occurred');    // Error - something failed
logger.verbose('Verbose details'); // Detailed information
```

### Don't Log Sensitive Data
```typescript
// ❌ BAD - Logs password
logger.log('User login', { email, password });

// ✅ GOOD - Excludes password
logger.log('User login', { email });

// ❌ BAD - Logs full user object (includes password)
logger.log('User created', user);

// ✅ GOOD - Logs only safe fields
const { password, resetToken, ...safeUser } = user;
logger.log('User created', safeUser);
```

## 📋 Error Response Format

### Standard Error Response
```json
{
  "statusCode": 404,
  "message": "Employee with ID 123 not found",
  "error": "Not Found",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/employees/123"
}
```

### Validation Error Response
```json
{
  "statusCode": 400,
  "message": [
    "firstName should not be empty",
    "email must be an email",
    "basicSalary must be a positive number"
  ],
  "error": "Bad Request",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/employees"
}
```

### Business Logic Error Response
```json
{
  "statusCode": 422,
  "message": "Insufficient leave balance",
  "error": "Business Logic Error",
  "details": {
    "available": 5,
    "requested": 10
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/leaves"
}
```

## ✅ Best Practices

### Error Handling
1. **Always catch exceptions** - Don't let errors crash the app
2. **Be specific** - Use appropriate exception types
3. **Provide context** - Include relevant details in error messages
4. **Log errors** - Log all errors for debugging
5. **Don't expose internals** - Hide implementation details from users
6. **Handle Prisma errors** - Catch and convert Prisma errors to HTTP exceptions
7. **Validate early** - Catch validation errors before processing

### User Experience
1. **User-friendly messages** - Explain what went wrong in simple terms
2. **Actionable errors** - Tell users how to fix the problem
3. **Avoid technical jargon** - Use plain language
4. **Consistent format** - Use same error format throughout
5. **Show errors inline** - Display validation errors next to form fields

### Logging
1. **Use structured logging** - Include context and metadata
2. **Log levels** - Use appropriate log levels
3. **Don't log sensitive data** - Exclude passwords, tokens, etc.
4. **Include timestamp** - Always include when error occurred
5. **Include request context** - User ID, request ID, etc.
6. **Production logging** - Use proper logging service (Winston, Pino)

### Development vs Production
```typescript
// Development
if (process.env.NODE_ENV === 'development') {
  // Show detailed error messages
  console.error('Full error:', error);
}

// Production
if (process.env.NODE_ENV === 'production') {
  // Hide internal details
  logger.error('Error occurred', {
    message: error.message,
    userId: user?.id,
  });
  
  // Send generic message to client
  throw new InternalServerErrorException('An error occurred');
}
```

## 🔍 Common Error Scenarios

### Prisma Error Codes
```typescript
// P2002: Unique constraint violation
if (error.code === 'P2002') {
  throw new ConflictException('Already exists');
}

// P2003: Foreign key constraint
if (error.code === 'P2003') {
  throw new BadRequestException('Invalid reference');
}

// P2025: Record not found
if (error.code === 'P2025') {
  throw new NotFoundException('Record not found');
}
```

### Authentication Errors
```typescript
// Invalid credentials
throw new UnauthorizedException('Invalid email or password');

// Token expired
throw new UnauthorizedException('Session expired. Please login again.');

// No permission
throw new ForbiddenException('You do not have permission');
```

### Validation Errors
```typescript
// Built-in validation
@Post()
create(@Body() dto: CreateEmployeeDto) {
  // ValidationPipe automatically throws BadRequestException
}

// Custom validation
if (!isValidSaudiId(data.saudiId)) {
  throw new BadRequestException('Invalid Saudi ID format');
}
```

---

**End of Agent Instructions Documentation** 🎉

All 10 comprehensive guides have been created to ensure consistent, high-quality code from AI agents working on this HRMS project.
