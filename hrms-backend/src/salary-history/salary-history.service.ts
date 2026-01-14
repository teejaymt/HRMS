import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma.service';
import { CreateSalaryHistoryDto } from './dto/create-salary-history.dto';

@Injectable()
export class SalaryHistoryService {
  constructor(private prisma: PrismaService) {}

  async create(createSalaryHistoryDto: CreateSalaryHistoryDto) {
    // Verify employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: createSalaryHistoryDto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${createSalaryHistoryDto.employeeId} not found`);
    }

    // Get previous salary if exists
    const previousSalary = await this.getCurrentSalary(createSalaryHistoryDto.employeeId);

    // Calculate percentage increase if previous salary exists
    let percentageIncrease = createSalaryHistoryDto.percentageIncrease;
    if (previousSalary && !percentageIncrease) {
      percentageIncrease = ((createSalaryHistoryDto.totalSalary - previousSalary.totalSalary) / previousSalary.totalSalary) * 100;
    }

    // Create salary history record
    return this.prisma.employeeSalaryHistory.create({
      data: {
        ...createSalaryHistoryDto,
        percentageIncrease,
        previousSalary: previousSalary?.totalSalary || 0,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });
  }

  async findByEmployee(employeeId: number) {
    return this.prisma.employeeSalaryHistory.findMany({
      where: { employeeId },
      orderBy: { effectiveDate: 'desc' },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });
  }

  async getCurrentSalary(employeeId: number) {
    return this.prisma.employeeSalaryHistory.findFirst({
      where: { employeeId },
      orderBy: { effectiveDate: 'desc' },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });
  }

  async getStatistics(employeeId: number) {
    const salaryHistory = await this.findByEmployee(employeeId);

    if (salaryHistory.length === 0) {
      return {
        totalChanges: 0,
        averageIncrease: 0,
        totalIncreaseAmount: 0,
        firstSalary: 0,
        currentSalary: 0,
      };
    }

    const totalChanges = salaryHistory.length;
    const firstSalary = salaryHistory[salaryHistory.length - 1].totalSalary;
    const currentSalary = salaryHistory[0].totalSalary;
    const totalIncreaseAmount = currentSalary - firstSalary;
    
    const increases = salaryHistory
      .filter(h => h.percentageIncrease !== null)
      .map(h => h.percentageIncrease || 0);
    
    const averageIncrease = increases.length > 0 
      ? increases.reduce((a, b) => a + b, 0) / increases.length 
      : 0;

    return {
      totalChanges,
      averageIncrease: Math.round(averageIncrease * 100) / 100,
      totalIncreaseAmount,
      firstSalary,
      currentSalary,
      salaryHistory: salaryHistory.slice(0, 5), // Last 5 changes
    };
  }

  async findRecentChanges(days: number = 30, limit: number = 50) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.employeeSalaryHistory.findMany({
      where: {
        effectiveDate: {
          gte: startDate,
        },
      },
      orderBy: { effectiveDate: 'desc' },
      take: limit,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const salaryHistory = await this.prisma.employeeSalaryHistory.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    if (!salaryHistory) {
      throw new NotFoundException(`Salary history record with ID ${id} not found`);
    }

    return salaryHistory;
  }

  async remove(id: number) {
    try {
      return await this.prisma.employeeSalaryHistory.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Salary history record with ID ${id} not found`);
    }
  }
}
