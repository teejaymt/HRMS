# Security Best Practices

## 📋 Table of Contents
1. [Authentication](#authentication)
2. [Authorization](#authorization)
3. [Data Validation](#data-validation)
4. [SQL Injection Prevention](#sql-injection-prevention)
5. [XSS Prevention](#xss-prevention)
6. [CSRF Protection](#csrf-protection)
7. [Password Security](#password-security)
8. [Sensitive Data](#sensitive-data)
9. [API Security](#api-security)
10. [Environment Variables](#environment-variables)

## 🔐 Authentication

### JWT Implementation
```typescript
// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
```

### JWT Strategy
```typescript
// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
```

### Token Best Practices
```typescript
// JWT Configuration
{
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: '8h',           // Token expires in 8 hours
    issuer: 'hrms-backend',
    audience: 'hrms-frontend',
  }
}

// Refresh token (future implementation)
{
  refreshToken: '...',
  expiresIn: '7d',             // Refresh token expires in 7 days
}
```

## 🛡️ Authorization

### Role-Based Access Control
```typescript
// roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

### Roles Guard
```typescript
// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;
    }

    return requiredRoles.some((role) => user.role === role);
  }
}
```

### Usage
```typescript
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  
  @Get()
  findAll() {
    // Accessible to all authenticated users
  }

  @Post()
  @Roles(Role.ADMIN, Role.HR)
  create() {
    // Only ADMIN and HR can create
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove() {
    // Only ADMIN can delete
  }
}
```

## ✅ Data Validation

### DTO Validation
```typescript
import { IsEmail, IsString, IsNotEmpty, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @IsOptional()
  @IsString()
  firstName?: string;
}
```

### Enable Validation Pipe
```typescript
// main.ts
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // Strip properties not in DTO
      forbidNonWhitelisted: true,  // Throw error on extra properties
      transform: true,        // Auto-transform payloads
    }),
  );

  await app.listen(3000);
}
```

### Custom Validators
```typescript
import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsSaudiId(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSaudiId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && /^\d{10}$/.test(value);
        },
        defaultMessage() {
          return 'Saudi ID must be exactly 10 digits';
        },
      },
    });
  };
}

// Usage
export class CreateEmployeeDto {
  @IsSaudiId()
  @IsOptional()
  saudiId?: string;
}
```

## 🛑 SQL Injection Prevention

### Use Prisma ORM (Parameterized Queries)
```typescript
// ✅ SAFE - Prisma automatically escapes
async findByEmail(email: string) {
  return this.prisma.user.findUnique({
    where: { email },  // Prisma handles escaping
  });
}

// ✅ SAFE - Prisma parameterized queries
async search(query: string) {
  return this.prisma.employee.findMany({
    where: {
      firstName: {
        contains: query,  // Prisma escapes this
        mode: 'insensitive',
      },
    },
  });
}

// ⚠️ AVOID - Raw SQL (unless absolutely necessary)
async rawQuery(id: number) {
  // If you must use raw SQL, use parameterized queries
  return this.prisma.$queryRaw`
    SELECT * FROM "Employee" WHERE id = ${id}
  `;
}

// ❌ NEVER DO THIS - String concatenation
async dangerousQuery(id: string) {
  // NEVER concatenate user input into SQL
  return this.prisma.$queryRawUnsafe(
    `SELECT * FROM "Employee" WHERE id = ${id}`  // SQL INJECTION!
  );
}
```

## 🚫 XSS Prevention

### Input Sanitization
```typescript
import { Transform } from 'class-transformer';
import DOMPurify from 'isomorphic-dompurify';

export class CreateEmployeeDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  firstName: string;

  @Transform(({ value }) => DOMPurify.sanitize(value))
  @IsString()
  @IsOptional()
  notes?: string;
}
```

### Output Encoding (Frontend)
```typescript
// React automatically escapes JSX
function EmployeeCard({ employee }: { employee: Employee }) {
  return (
    <div>
      {/* ✅ Safe - React escapes by default */}
      <h3>{employee.firstName} {employee.lastName}</h3>
      
      {/* ❌ Dangerous - Avoid dangerouslySetInnerHTML */}
      <div dangerouslySetInnerHTML={{ __html: employee.notes }} />
    </div>
  );
}
```

### Content Security Policy
```typescript
// main.ts
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }));

  await app.listen(3000);
}
```

## 🔒 CSRF Protection

### CSRF for Forms (Future Implementation)
```typescript
// Install csurf package
import * as csurf from 'csurf';

app.use(csurf({ cookie: true }));
```

### SameSite Cookies
```typescript
// Cookie configuration
{
  httpOnly: true,      // Prevent JavaScript access
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
  maxAge: 3600000,     // 1 hour
}
```

## 🔑 Password Security

### Password Hashing
```typescript
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// Hash password
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Password Requirements
```typescript
import { IsString, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number',
  })
  password: string;
}
```

### Password Reset
```typescript
@Injectable()
export class AuthService {
  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If email exists, reset link sent' };
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour
      },
    });

    // Send email with reset link
    await this.emailService.sendPasswordReset(user.email, resetToken);

    return { message: 'If email exists, reset link sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const users = await this.prisma.user.findMany({
      where: {
        resetTokenExpiry: { gte: new Date() },
      },
    });

    let user = null;
    for (const u of users) {
      if (await bcrypt.compare(token, u.resetToken || '')) {
        user = u;
        break;
      }
    }

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: 'Password reset successful' };
  }
}
```

## 🔐 Sensitive Data

### Don't Log Sensitive Data
```typescript
// ❌ Bad
console.log('User password:', user.password);
console.log('User data:', user); // Includes password

// ✅ Good
const { password, ...safeUser } = user;
console.log('User data:', safeUser);
```

### Exclude Sensitive Fields
```typescript
// Prisma query
async findUser(id: number) {
  return this.prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      // password: excluded
      // resetToken: excluded
    },
  });
}
```

### Redact in Responses
```typescript
class UserResponseDto {
  id: number;
  email: string;
  role: Role;
  // password and resetToken not included
}

@Get(':id')
async findOne(@Param('id') id: string): Promise<UserResponseDto> {
  const user = await this.usersService.findOne(+id);
  
  // Return only safe fields
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}
```

## 🌐 API Security

### Rate Limiting
```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,      // Time window in seconds
      limit: 10,    // Max requests per time window
    }),
  ],
})
export class AppModule {}

// Apply globally
app.useGlobalGuards(new ThrottlerGuard());

// Or per route
@UseGuards(ThrottlerGuard)
@Post('login')
async login() {}
```

### CORS Configuration
```typescript
// main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### API Versioning
```typescript
app.setGlobalPrefix('api/v1');
```

## 🔐 Environment Variables

### .env File
```env
# Never commit this file to git!
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NODE_ENV="development"
PORT=3000

# Frontend URL for CORS
FRONTEND_URL="http://localhost:3001"
```

### .env.example
```env
# Commit this file as a template
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-this-in-production"
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:3001"
```

### Accessing Environment Variables
```typescript
// Use process.env with defaults
const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
const port = parseInt(process.env.PORT || '3000');
```

### Validate Environment Variables
```typescript
// main.ts
function validateEnv() {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET === 'change-this-in-production') {
    throw new Error('JWT_SECRET must be changed in production!');
  }
}

validateEnv();
```

## ✅ Security Checklist

### Authentication & Authorization
- [ ] JWT tokens expire after reasonable time (8 hours)
- [ ] Passwords are hashed with bcrypt (10+ rounds)
- [ ] Role-based access control on all sensitive endpoints
- [ ] Authentication required for all non-public routes
- [ ] Failed login attempts are rate-limited

### Input Validation
- [ ] All inputs validated with DTOs and class-validator
- [ ] Validation pipe enabled globally
- [ ] Extra properties stripped from requests
- [ ] File uploads are validated (type, size)

### Data Protection
- [ ] Sensitive data (passwords) never logged
- [ ] Sensitive fields excluded from API responses
- [ ] Database uses Prisma ORM (prevents SQL injection)
- [ ] User input is sanitized before storage

### API Security
- [ ] CORS configured for specific origins only
- [ ] Rate limiting enabled
- [ ] Helmet middleware for security headers
- [ ] HTTPS enforced in production

### Environment & Configuration
- [ ] .env file not committed to git
- [ ] Environment variables validated on startup
- [ ] Different secrets for development/production
- [ ] JWT secret is strong and random

### Production Specific
- [ ] NODE_ENV=production in production
- [ ] Detailed error messages disabled
- [ ] Logging configured (no sensitive data)
- [ ] Database backups automated
- [ ] SSL/TLS certificates configured

---

**Next**: [Error Handling & Logging](10-error-handling.md)
