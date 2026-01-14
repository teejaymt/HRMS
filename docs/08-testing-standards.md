# Testing Standards

## 📋 Table of Contents
1. [Testing Philosophy](#testing-philosophy)
2. [Test Organization](#test-organization)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [E2E Testing](#e2e-testing)
6. [Test Coverage](#test-coverage)
7. [Mocking Strategies](#mocking-strategies)
8. [Best Practices](#best-practices)

## 🎯 Testing Philosophy

### Testing Pyramid
```
       /\
      /E2E\          <- Few, slow, expensive
     /------\
    /Integr.\       <- Some, medium speed
   /----------\
  /Unit Tests \    <- Many, fast, cheap
 /--------------\
```

### What to Test
- ✅ Business logic in services
- ✅ API endpoints (E2E)
- ✅ Data transformations
- ✅ Error handling
- ✅ Edge cases
- ❌ Trivial getters/setters
- ❌ Third-party library code
- ❌ Database queries (test service logic, not Prisma)

## 📁 Test Organization

### Backend Test Structure
```
hrms-backend/
├── src/
│   └── employees/
│       ├── employees.service.ts
│       ├── employees.service.spec.ts      # Unit tests
│       ├── employees.controller.ts
│       └── employees.controller.spec.ts   # Unit tests
│
└── test/
    ├── employees.e2e-spec.ts              # E2E tests
    └── jest-e2e.json                      # E2E Jest config
```

### Frontend Test Structure (Future)
```
hrms-frontend/
├── app/
│   └── employees/
│       ├── page.tsx
│       └── page.test.tsx                  # Component tests
│
├── components/
│   └── layout/
│       ├── Sidebar.tsx
│       └── Sidebar.test.tsx               # Component tests
│
└── lib/
    ├── api.ts
    └── api.test.ts                        # Unit tests
```

## 🧪 Unit Testing

### Service Unit Test Template
```typescript
// employees.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { PrismaService } from '../Prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: PrismaService,
          useValue: {
            employee: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of employees', async () => {
      const mockEmployees = [
        { id: 1, firstName: 'Ahmed', lastName: 'Ali', email: 'ahmed@test.com' },
        { id: 2, firstName: 'Sarah', lastName: 'Khan', email: 'sarah@test.com' },
      ];

      jest.spyOn(prisma.employee, 'findMany').mockResolvedValue(mockEmployees as any);

      const result = await service.findAll();

      expect(result).toEqual(mockEmployees);
      expect(prisma.employee.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return an employee by id', async () => {
      const mockEmployee = {
        id: 1,
        firstName: 'Ahmed',
        lastName: 'Ali',
        email: 'ahmed@test.com',
      };

      jest.spyOn(prisma.employee, 'findUnique').mockResolvedValue(mockEmployee as any);

      const result = await service.findOne(1);

      expect(result).toEqual(mockEmployee);
      expect(prisma.employee.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when employee not found', async () => {
      jest.spyOn(prisma.employee, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Employee with ID 999 not found');
    });
  });

  describe('create', () => {
    it('should create a new employee', async () => {
      const createDto = {
        firstName: 'Ahmed',
        lastName: 'Ali',
        email: 'ahmed@test.com',
      };

      const mockCreated = {
        id: 1,
        ...createDto,
        employeeCode: 'EMP001',
      };

      jest.spyOn(prisma.employee, 'create').mockResolvedValue(mockCreated as any);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCreated);
      expect(prisma.employee.create).toHaveBeenCalledWith({
        data: expect.objectContaining(createDto),
        include: expect.any(Object),
      });
    });
  });

  describe('update', () => {
    it('should update an employee', async () => {
      const updateDto = { position: 'Senior Engineer' };
      const mockEmployee = { id: 1, firstName: 'Ahmed' };
      const mockUpdated = { ...mockEmployee, ...updateDto };

      jest.spyOn(prisma.employee, 'findUnique').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prisma.employee, 'update').mockResolvedValue(mockUpdated as any);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(mockUpdated);
      expect(prisma.employee.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when updating non-existent employee', async () => {
      jest.spyOn(prisma.employee, 'findUnique').mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete an employee', async () => {
      const mockEmployee = { id: 1, firstName: 'Ahmed' };

      jest.spyOn(prisma.employee, 'findUnique').mockResolvedValue(mockEmployee as any);
      jest.spyOn(prisma.employee, 'delete').mockResolvedValue(mockEmployee as any);

      const result = await service.remove(1);

      expect(result).toEqual(mockEmployee);
      expect(prisma.employee.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
```

### Controller Unit Test Template
```typescript
// employees.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

describe('EmployeesController', () => {
  let controller: EmployeesController;
  let service: EmployeesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        {
          provide: EmployeesService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
    service = module.get<EmployeesService>(EmployeesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      const mockEmployees = [{ id: 1, firstName: 'Ahmed' }];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockEmployees as any);

      const result = await controller.findAll({});

      expect(result).toEqual(mockEmployees);
      expect(service.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with correct id', async () => {
      const mockEmployee = { id: 1, firstName: 'Ahmed' };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockEmployee as any);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockEmployee);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });
});
```

## 🔗 Integration Testing

### Integration Test Template
```typescript
// employees.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma.service';
import { EmployeesModule } from './employees.module';

describe('EmployeesModule Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EmployeesModule],
    }).compile();

    app = module.createNestApplication();
    prisma = module.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.employee.deleteMany();
  });

  it('should create and retrieve an employee', async () => {
    const createDto = {
      firstName: 'Ahmed',
      lastName: 'Ali',
      email: 'ahmed@test.com',
      position: 'Engineer',
    };

    // Create employee
    const created = await prisma.employee.create({
      data: {
        ...createDto,
        employeeCode: 'EMP001',
      },
    });

    expect(created.id).toBeDefined();
    expect(created.firstName).toBe(createDto.firstName);

    // Retrieve employee
    const found = await prisma.employee.findUnique({
      where: { id: created.id },
    });

    expect(found).toBeDefined();
    expect(found?.email).toBe(createDto.email);
  });
});
```

## 🌐 E2E Testing

### E2E Test Template
```typescript
// test/employees.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/Prisma/prisma.service';

describe('Employees (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@hrms.com', password: 'admin123' });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean test data
    await prisma.employee.deleteMany({
      where: { email: { contains: '@test.com' } },
    });
  });

  describe('GET /employees', () => {
    it('should return all employees', () => {
      return request(app.getHttpServer())
        .get('/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .get('/employees')
        .expect(401);
    });
  });

  describe('POST /employees', () => {
    it('should create a new employee', () => {
      const createDto = {
        firstName: 'Ahmed',
        lastName: 'Ali',
        email: 'ahmed@test.com',
        position: 'Engineer',
        basicSalary: 10000,
      };

      return request(app.getHttpServer())
        .post('/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.firstName).toBe(createDto.firstName);
          expect(res.body.email).toBe(createDto.email);
          expect(res.body.id).toBeDefined();
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'Ahmed' }) // Missing required fields
        .expect(400);
    });
  });

  describe('GET /employees/:id', () => {
    it('should return employee by id', async () => {
      // Create test employee
      const employee = await prisma.employee.create({
        data: {
          firstName: 'Ahmed',
          lastName: 'Ali',
          email: 'ahmed@test.com',
          employeeCode: 'TEST001',
          position: 'Engineer',
          basicSalary: 10000,
          totalSalary: 10000,
        },
      });

      return request(app.getHttpServer())
        .get(`/employees/${employee.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(employee.id);
          expect(res.body.email).toBe(employee.email);
        });
    });

    it('should return 404 for non-existent employee', () => {
      return request(app.getHttpServer())
        .get('/employees/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /employees/:id', () => {
    it('should update employee', async () => {
      const employee = await prisma.employee.create({
        data: {
          firstName: 'Ahmed',
          lastName: 'Ali',
          email: 'ahmed@test.com',
          employeeCode: 'TEST001',
          position: 'Engineer',
          basicSalary: 10000,
          totalSalary: 10000,
        },
      });

      const updateDto = { position: 'Senior Engineer' };

      return request(app.getHttpServer())
        .patch(`/employees/${employee.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.position).toBe(updateDto.position);
        });
    });
  });

  describe('DELETE /employees/:id', () => {
    it('should delete employee', async () => {
      const employee = await prisma.employee.create({
        data: {
          firstName: 'Ahmed',
          lastName: 'Ali',
          email: 'ahmed@test.com',
          employeeCode: 'TEST001',
          position: 'Engineer',
          basicSalary: 10000,
          totalSalary: 10000,
        },
      });

      await request(app.getHttpServer())
        .delete(`/employees/${employee.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify deletion
      const deleted = await prisma.employee.findUnique({
        where: { id: employee.id },
      });

      expect(deleted).toBeNull();
    });
  });
});
```

## 📊 Test Coverage

### Running Coverage
```bash
# Unit tests with coverage
npm run test:cov

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```

### Coverage Goals
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

### Focus Areas
- ✅ Business logic services
- ✅ Data transformations
- ✅ Error handling paths
- ✅ Edge cases
- ⚠️ Controllers (basic coverage)
- ⚠️ Simple getters/setters (skip)

## 🎭 Mocking Strategies

### Mock PrismaService
```typescript
const mockPrismaService = {
  employee: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  department: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};
```

### Mock External Services
```typescript
const mockEmailService = {
  sendEmail: jest.fn().mockResolvedValue(true),
};

const mockS3Service = {
  uploadFile: jest.fn().mockResolvedValue('https://s3.../file.pdf'),
};
```

### Mock HTTP Requests
```typescript
jest.mock('node-fetch');
const fetch = require('node-fetch');

fetch.mockResolvedValue({
  json: async () => ({ data: 'mocked' }),
  ok: true,
});
```

## ✅ Best Practices

### General
1. **Write tests first** (TDD) or alongside implementation
2. **Test behavior, not implementation** - Focus on what, not how
3. **One assertion per test** - Keep tests focused
4. **Use descriptive names** - Test names should explain what they test
5. **Arrange-Act-Assert** pattern - Clear test structure

### Naming
```typescript
describe('EmployeesService', () => {
  describe('findOne', () => {
    it('should return an employee by id', () => {});
    it('should throw NotFoundException when employee not found', () => {});
  });
});
```

### Setup/Teardown
```typescript
beforeAll(() => {
  // Run once before all tests
});

beforeEach(() => {
  // Run before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Run after each test
});

afterAll(() => {
  // Run once after all tests
  await app.close();
});
```

### Async Testing
```typescript
// Use async/await
it('should create employee', async () => {
  const result = await service.create(dto);
  expect(result).toBeDefined();
});

// Or return promise
it('should create employee', () => {
  return service.create(dto).then(result => {
    expect(result).toBeDefined();
  });
});
```

### Testing Exceptions
```typescript
it('should throw NotFoundException', async () => {
  await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  await expect(service.findOne(999)).rejects.toThrow('Employee with ID 999 not found');
});
```

### Snapshot Testing (Use Sparingly)
```typescript
it('should match snapshot', () => {
  const result = formatEmployee(employee);
  expect(result).toMatchSnapshot();
});
```

---

**Next**: [Security Best Practices](09-security-standards.md)
