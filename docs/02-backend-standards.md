# Backend Coding Standards (NestJS)

## 📋 Table of Contents
1. [Module Structure](#module-structure)
2. [Controllers](#controllers)
3. [Services](#services)
4. [DTOs and Validation](#dtos-and-validation)
5. [Decorators](#decorators)
6. [Error Handling](#error-handling)
7. [TypeScript Standards](#typescript-standards)
8. [Dependency Injection](#dependency-injection)
9. [Async Operations](#async-operations)
10. [Testing](#testing)

## 🏗️ Module Structure

### Module Template
```typescript
import { Module } from '@nestjs/common';
import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';
import { PrismaModule } from '../Prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ModuleController],
  providers: [ModuleService],
  exports: [ModuleService], // Only if needed by other modules
})
export class ModuleModule {}
```

### Module Organization Rules
1. **One module per feature** - Each feature should have its own module
2. **Import PrismaModule** - Always import when database access is needed
3. **Export services** - Only export services that other modules need to consume
4. **Keep modules focused** - Single responsibility principle

### File Naming
- Module: `module-name.module.ts`
- Controller: `module-name.controller.ts`
- Service: `module-name.service.ts`
- DTO: `create-module-name.dto.ts`, `update-module-name.dto.ts`

## 🎮 Controllers

### Controller Template
```typescript
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
import { ModuleService } from './module.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('module-name')
@UseGuards(JwtAuthGuard)
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post()
  @Roles(Role.ADMIN, Role.HR)
  create(@Body() createDto: any) {
    return this.moduleService.create(createDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.moduleService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moduleService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.HR)
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.moduleService.update(+id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.moduleService.remove(+id);
  }
}
```

### Controller Best Practices

#### 1. Route Naming
- Use **plural nouns** for resource routes: `/employees`, `/departments`
- Use **kebab-case** for multi-word routes: `/advance-requests`
- Use **descriptive action names**: `/employees/stats`, `/payroll/process`

#### 2. HTTP Methods
- **GET** - Retrieve data (idempotent)
- **POST** - Create new resources
- **PATCH** - Partial update of resources
- **PUT** - Full replacement (rarely used)
- **DELETE** - Remove resources

#### 3. Param Handling
```typescript
// Route parameters (required)
@Get(':id')
findOne(@Param('id') id: string)

// Query parameters (optional)
@Get()
findAll(@Query('status') status?: string)

// Body (for POST/PATCH)
@Post()
create(@Body() data: CreateDto)
```

#### 4. Guard Usage
```typescript
// Apply to entire controller
@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {}

// Apply to specific routes with roles
@Post()
@Roles(Role.ADMIN, Role.HR)
create(@Body() data: any) {}
```

#### 5. Controller Responsibilities
- **DO**: Route definition, request/response handling, guard application
- **DON'T**: Business logic, database queries, data transformation
- **DELEGATE**: All business logic to services

## 🔧 Services

### Service Template
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma.service';

@Injectable()
export class ModuleService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.model.create({
      data,
      include: {
        relatedModel: true,
      },
    });
  }

  async findAll(filters?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.model.findMany({
        where,
        skip,
        take: limit,
        include: {
          relatedModel: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.model.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const item = await this.prisma.model.findUnique({
      where: { id },
      include: {
        relatedModel: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    return item;
  }

  async update(id: number, data: any) {
    await this.findOne(id); // Verify exists

    return this.prisma.model.update({
      where: { id },
      data,
      include: {
        relatedModel: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Verify exists

    return this.prisma.model.delete({
      where: { id },
    });
  }
}
```

### Service Best Practices

#### 1. Always Use Dependency Injection
```typescript
@Injectable()
export class EmployeesService {
  constructor(
    private prisma: PrismaService,
    private otherService: OtherService,
  ) {}
}
```

#### 2. Error Handling
```typescript
// Throw specific NestJS exceptions
throw new NotFoundException('Employee not found');
throw new BadRequestException('Invalid data');
throw new UnauthorizedException('Access denied');
throw new ConflictException('Email already exists');
```

#### 3. Include Related Data
```typescript
// Use Prisma include for related data
return this.prisma.employee.findUnique({
  where: { id },
  include: {
    department: true,
    user: true,
    leaves: true,
  },
});
```

#### 4. Pagination Pattern
```typescript
async findAll(filters?: { page?: number; limit?: number }) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    this.prisma.model.findMany({ skip, take: limit }),
    this.prisma.model.count(),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}
```

#### 5. Transaction Handling
```typescript
async createWithTransaction(data: any) {
  return this.prisma.$transaction(async (tx) => {
    const employee = await tx.employee.create({ data: employeeData });
    const user = await tx.user.create({ data: userData });
    return { employee, user };
  });
}
```

## 📝 DTOs and Validation

### DTO Template
```typescript
import { IsString, IsEmail, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  firstName?: string;
}
```

### Validation Best Practices

#### 1. Use class-validator Decorators
```typescript
@IsString()
@IsNotEmpty()
name: string;

@IsEmail()
email: string;

@IsNumber()
@Min(0)
salary: number;

@IsOptional()
@IsString()
middleName?: string;

@IsEnum(EmploymentType)
employmentType: EmploymentType;

@IsDate()
@Type(() => Date)
joinDate: Date;
```

#### 2. Transform Data
```typescript
import { Transform } from 'class-transformer';

@Transform(({ value }) => value.trim())
@IsString()
name: string;

@Transform(({ value }) => parseInt(value))
@IsNumber()
age: number;
```

#### 3. Nested Validation
```typescript
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEmployeeDto {
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
```

## 🎨 Decorators

### Common Decorators

#### 1. Module Decorators
```typescript
@Module({ imports, controllers, providers, exports })
@Global() // Make module globally available
```

#### 2. Controller Decorators
```typescript
@Controller('path')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor)
```

#### 3. Route Decorators
```typescript
@Get(), @Post(), @Patch(), @Put(), @Delete()
@HttpCode(201)
@Header('Cache-Control', 'no-cache')
```

#### 4. Parameter Decorators
```typescript
@Body(), @Param(), @Query(), @Headers(), @Req(), @Res()
```

#### 5. Custom Decorators
```typescript
// Create custom decorator
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

## ⚠️ Error Handling

### Standard Error Responses

```typescript
// Not Found
throw new NotFoundException(`Employee with ID ${id} not found`);

// Bad Request
throw new BadRequestException('Invalid email format');

// Unauthorized
throw new UnauthorizedException('Invalid credentials');

// Forbidden
throw new ForbiddenException('You do not have permission');

// Conflict
throw new ConflictException('Email already exists');

// Internal Server Error
throw new InternalServerErrorException('Something went wrong');
```

### Try-Catch Pattern
```typescript
async create(data: any) {
  try {
    return await this.prisma.employee.create({ data });
  } catch (error) {
    if (error.code === 'P2002') { // Unique constraint
      throw new ConflictException('Email already exists');
    }
    throw new InternalServerErrorException('Failed to create employee');
  }
}
```

## 📘 TypeScript Standards

### 1. Type Everything
```typescript
// Use explicit types
async findOne(id: number): Promise<Employee> {
  return this.prisma.employee.findUnique({ where: { id } });
}

// Use Prisma generated types
import { Employee, Department } from '@prisma/client';
```

### 2. Avoid `any` Type
```typescript
// BAD
async create(data: any) {}

// GOOD
async create(data: CreateEmployeeDto) {}
// OR use Prisma types
async create(data: Prisma.EmployeeCreateInput) {}
```

### 3. Use Interfaces
```typescript
interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
}

async findAll(options?: PaginationOptions) {}
```

### 4. Use Enums
```typescript
// Use Prisma generated enums
import { Role, EmploymentType } from '@prisma/client';

// Or create custom enums
enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
```

## 💉 Dependency Injection

### Constructor Injection
```typescript
@Injectable()
export class EmployeesService {
  constructor(
    private prisma: PrismaService,
    private departmentsService: DepartmentsService,
  ) {}
}
```

### Module Imports
```typescript
@Module({
  imports: [
    PrismaModule,
    DepartmentsModule, // Import to use DepartmentsService
  ],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
```

## ⚡ Async Operations

### Always Use async/await
```typescript
// GOOD
async findOne(id: number): Promise<Employee> {
  return await this.prisma.employee.findUnique({ where: { id } });
}

// Parallel operations
async getStats() {
  const [totalEmployees, activeEmployees, departments] = await Promise.all([
    this.prisma.employee.count(),
    this.prisma.employee.count({ where: { status: 'ACTIVE' } }),
    this.prisma.department.count(),
  ]);

  return { totalEmployees, activeEmployees, departments };
}
```

## 🧪 Testing

### Service Test Template
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { PrismaService } from '../Prisma/prisma.service';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeesService, PrismaService],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an employee', async () => {
    const createDto = { firstName: 'John', lastName: 'Doe' };
    const result = { id: 1, ...createDto };
    
    jest.spyOn(prisma.employee, 'create').mockResolvedValue(result as any);
    
    expect(await service.create(createDto)).toEqual(result);
  });
});
```

## 📚 Quick Reference

### Imports You'll Need
```typescript
// Common NestJS imports
import { Injectable, Controller, Get, Post } from '@nestjs/common';
import { Module } from '@nestjs/common';

// Exceptions
import { 
  NotFoundException, 
  BadRequestException,
  UnauthorizedException,
  ConflictException 
} from '@nestjs/common';

// Prisma
import { PrismaService } from '../Prisma/prisma.service';
import { Prisma } from '@prisma/client';

// Validation
import { IsString, IsEmail, IsOptional } from 'class-validator';
```

---

**Next**: [Frontend Coding Standards](03-frontend-standards.md)
