import { Injectable } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma.service';

@Injectable()
export class PayrollAuditService {
  constructor(private prisma: PrismaService) {}

  async logPayrollProcess(data: {
    processType: 'BULK' | 'INDIVIDUAL';
    month: number;
    year: number;
    employeeCount: number;
    successCount: number;
    errorCount: number;
    processedBy: string;
    employeeDetails?: number[]; // Array of employee IDs
    errorDetails?: string[];
    notes?: string;
  }) {
    return this.prisma.payrollAuditLog.create({
      data: {
        processType: data.processType,
        month: data.month,
        year: data.year,
        employeeCount: data.employeeCount,
        successCount: data.successCount,
        errorCount: data.errorCount,
        processedBy: data.processedBy,
        employeeDetails: data.employeeDetails ? JSON.stringify(data.employeeDetails) : null,
        errorDetails: data.errorDetails ? JSON.stringify(data.errorDetails) : null,
        notes: data.notes,
      },
    });
  }

  async getAuditLogs(filters?: {
    month?: number;
    year?: number;
    processType?: string;
  }) {
    return this.prisma.payrollAuditLog.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAuditLogById(id: number) {
    return this.prisma.payrollAuditLog.findUnique({
      where: { id },
    });
  }
}
