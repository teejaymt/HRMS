import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma.service';
import { PayrollStatus } from '@prisma/client';

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    employeeId: number;
    month: number;
    year: number;
    basicSalary: number;
    allowances?: number;
    bonuses?: number;
    deductions?: number;
    tax?: number;
  }) {
    // Check if payroll already exists for this employee, month, and year
    const existing = await this.prisma.payroll.findFirst({
      where: {
        employeeId: data.employeeId,
        month: data.month,
        year: data.year,
      },
      include: {
        employee: {
          select: { employeeCode: true, firstName: true, lastName: true },
        },
      },
    });

    if (existing) {
      throw new Error(
        `Payroll for employee ${existing.employee.employeeCode} (${existing.employee.firstName} ${existing.employee.lastName}) for period ${data.month}/${data.year} already exists.`,
      );
    }

    // Calculate individual allowances from the total allowances
    const totalAllowances = data.allowances || 0;
    const housingAllowance = totalAllowances * 0.5; // 50% housing
    const transportAllowance = totalAllowances * 0.3; // 30% transport
    const foodAllowance = totalAllowances * 0.2; // 20% food

    const grossSalary =
      data.basicSalary +
      (data.allowances || 0) +
      (data.bonuses || 0);

    const totalDeductions = (data.deductions || 0) + (data.tax || 0);
    const netSalary = grossSalary - totalDeductions;

    return this.prisma.payroll.create({
      data: {
        employeeId: data.employeeId,
        month: data.month,
        year: data.year,
        basicSalary: data.basicSalary,
        housingAllowance: housingAllowance,
        transportAllowance: transportAllowance,
        foodAllowance: foodAllowance,
        otherAllowances: 0,
        bonuses: data.bonuses || 0,
        overtimePay: 0,
        gosiEmployeeDeduction: 0,
        absenceDeduction: 0,
        lateDeduction: 0,
        loanDeduction: 0,
        otherDeductions: data.deductions || 0,
        gosiEmployerContribution: 0,
        grossSalary,
        totalDeductions,
        netSalary,
        status: PayrollStatus.PENDING,
      },
      include: { employee: true },
    });
  }

  findAll(filters?: { employeeId?: number; year?: number; month?: number }) {
    return this.prisma.payroll.findMany({
      where: filters,
      include: {
        employee: {
          select: { firstName: true, lastName: true, employeeCode: true },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  findOne(id: number) {
    return this.prisma.payroll.findUnique({
      where: { id },
      include: { employee: true },
    });
  }

  async markAsPaid(id: number, paymentMethod: string) {
    return this.prisma.payroll.update({
      where: { id },
      data: {
        status: PayrollStatus.PAID,
        paymentDate: new Date(),
        paymentMethod,
      },
    });
  }

  async deleteByMonthYear(month: number, year: number) {
    // Check if any payroll records are marked as PAID
    const paidRecords = await this.prisma.payroll.findMany({
      where: {
        month: month,
        year: year,
        status: PayrollStatus.PAID,
      },
    });

    if (paidRecords.length > 0) {
      throw new HttpException(
        `Cannot delete payroll for ${month}/${year}. ${paidRecords.length} record(s) are marked as PAID.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.prisma.payroll.deleteMany({
      where: {
        month: month,
        year: year,
      },
    });
    console.log(`Deleted ${result.count} payroll records for ${month}/${year}`);
    return result;
  }

  async deleteById(id: number) {
    // Check if the payroll is marked as PAID
    const payroll = await this.prisma.payroll.findUnique({
      where: { id },
    });

    if (!payroll) {
      throw new HttpException('Payroll record not found', HttpStatus.NOT_FOUND);
    }

    if (payroll.status === PayrollStatus.PAID) {
      throw new HttpException(
        'Cannot delete a payroll that has been marked as PAID',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prisma.payroll.delete({
      where: { id },
    });
  }
}
