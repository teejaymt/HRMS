import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma.service';
import { EmployeeStatus, Gender, EmploymentType } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.employee.create({
      data: {
        ...data,
        employeeCode: await this.generateEmployeeCode(),
      },
      include: {
        department: true,
        user: true,
      },
    });
  }

  async bulkCreate(employees: any[], createdBy?: string) {
    const results = {
      success: [] as any[],
      errors: [] as any[],
      total: employees.length,
    };

    for (const [index, employee] of employees.entries()) {
      try {
        // Validate required fields
        if (!employee.firstName || !employee.lastName || !employee.email) {
          results.errors.push({
            row: index + 1,
            employee,
            error: 'Missing required fields (firstName, lastName, email)',
          });
          continue;
        }

        // Check if email already exists
        const existingEmployee = await this.prisma.employee.findUnique({
          where: { email: employee.email },
        });

        if (existingEmployee) {
          results.errors.push({
            row: index + 1,
            employee,
            error: `Email ${employee.email} already exists`,
          });
          continue;
        }

        // Create employee
        const created = await this.prisma.employee.create({
          data: {
            employeeCode: await this.generateEmployeeCode(),
            firstName: employee.firstName,
            lastName: employee.lastName,
            firstNameArabic: employee.firstNameArabic || null,
            lastNameArabic: employee.lastNameArabic || null,
            email: employee.email,
            phone: employee.phone || null,
            dateOfBirth: employee.dateOfBirth
              ? new Date(employee.dateOfBirth)
              : null,
            gender: employee.gender || Gender.MALE,
            nationality: employee.nationality || null,
            saudiId: employee.saudiId || null,
            iqamaNumber: employee.iqamaNumber || null,
            iqamaExpiryDate: employee.iqamaExpiry
              ? new Date(employee.iqamaExpiry)
              : null,
            passportNumber: employee.passportNumber || null,
            passportExpiry: employee.passportExpiry
              ? new Date(employee.passportExpiry)
              : null,
            position: employee.position || null,
            positionArabic: employee.positionArabic || null,
            departmentId: employee.departmentId
              ? parseInt(employee.departmentId)
              : null,
            joinDate: employee.joiningDate
              ? new Date(employee.joiningDate)
              : new Date(),
            employmentType: employee.employmentType || EmploymentType.FULL_TIME,
            basicSalary: employee.basicSalary
              ? parseFloat(employee.basicSalary)
              : 0,
            housingAllowance: employee.housingAllowance
              ? parseFloat(employee.housingAllowance)
              : 0,
            transportAllowance: employee.transportAllowance
              ? parseFloat(employee.transportAllowance)
              : 0,
            totalSalary: (employee.basicSalary ? parseFloat(employee.basicSalary) : 0) +
              (employee.housingAllowance ? parseFloat(employee.housingAllowance) : 0) +
              (employee.transportAllowance ? parseFloat(employee.transportAllowance) : 0),
            bankName: employee.bankName || null,
            bankAccountNumber: employee.bankAccountNumber || null,
            ibanNumber: employee.iban || null,
            status: employee.status || EmployeeStatus.ACTIVE,
          },
        });

        // Create user account if password is provided
        if (employee.password) {
          const bcrypt = require('bcrypt');
          const hashedPassword = await bcrypt.hash(employee.password, 10);

          await this.prisma.user.create({
            data: {
              email: employee.email,
              password: hashedPassword,
              role: employee.role || 'EMPLOYEE',
              employee: {
                connect: { id: created.id },
              },
            },
          });
        }

        results.success.push(created);
      } catch (error) {
        results.errors.push({
          row: index + 1,
          employee,
          error: error.message,
        });
      }
    }

    return {
      ...results,
      successCount: results.success.length,
      errorCount: results.errors.length,
    };
  }

  async findAll(filters?: {
    departmentId?: number;
    status?: EmployeeStatus;
    search?: string;
  }) {
    return this.prisma.employee.findMany({
      where: {
        ...(filters?.departmentId && { departmentId: filters.departmentId }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.search && {
          OR: [
            { firstName: { contains: filters.search } },
            { lastName: { contains: filters.search } },
            { email: { contains: filters.search } },
            { employeeCode: { contains: filters.search } },
          ],
        }),
      },
      include: {
        department: true,
        user: { select: { email: true, role: true, isActive: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        user: true,
        leaves: { take: 10, orderBy: { createdAt: 'desc' } },
        attendances: { take: 30, orderBy: { date: 'desc' } },
        payrolls: { take: 12, orderBy: { year: 'desc' } },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async update(id: number, data: any) {
    await this.findOne(id);
    return this.prisma.employee.update({
      where: { id },
      data,
      include: { department: true, user: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.employee.update({
      where: { id },
      data: { status: EmployeeStatus.TERMINATED },
    });
  }

  async getStats() {
    const total = await this.prisma.employee.count();
    const active = await this.prisma.employee.count({
      where: { status: EmployeeStatus.ACTIVE },
    });
    const onLeave = await this.prisma.employee.count({
      where: { status: EmployeeStatus.ON_LEAVE },
    });

    return { total, active, onLeave };
  }

  private async generateEmployeeCode(): Promise<string> {
    const count = await this.prisma.employee.count();
    return `EMP${String(count + 1).padStart(5, '0')}`;
  }
}
