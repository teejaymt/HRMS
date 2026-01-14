import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma.service';
import { AdvanceType, RequestStatus } from '@prisma/client';

@Injectable()
export class AdvanceRequestService {
  constructor(private prisma: PrismaService) {}

  // Create advance request
  async create(data: {
    employeeId: number;
    requestType?: AdvanceType;
    amount: number;
    reason: string;
    requiredDate?: Date;
    repaymentMonths?: number;
  }) {
    const monthlyDeduction = data.amount / (data.repaymentMonths || 1);

    return this.prisma.advanceRequest.create({
      data: {
        employeeId: data.employeeId,
        requestType: data.requestType || AdvanceType.SALARY_ADVANCE,
        amount: data.amount,
        reason: data.reason,
        repaymentMonths: data.repaymentMonths || 1,
        monthlyDeduction,
        remainingAmount: data.amount,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
          },
        },
      },
    });
  }

  // Get all advance requests
  async findAll(filters?: {
    employeeId?: number;
    status?: RequestStatus;
    requestType?: AdvanceType;
  }) {
    return this.prisma.advanceRequest.findMany({
      where: filters,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get advance request by ID
  async findOne(id: number) {
    const request = await this.prisma.advanceRequest.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
            basicSalary: true,
            department: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Advance request not found');
    }

    return request;
  }

  // Approve advance request
  async approve(id: number, approvedBy: string) {
    const request = await this.findOne(id);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Request is not pending');
    }

    return this.prisma.advanceRequest.update({
      where: { id },
      data: {
        status: RequestStatus.APPROVED,
        approvedBy,
        approvedAt: new Date(),
      },
      include: {
        employee: true,
      },
    });
  }

  // Reject advance request
  async reject(id: number, rejectedBy: string, rejectionReason: string) {
    const request = await this.findOne(id);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Request is not pending');
    }

    return this.prisma.advanceRequest.update({
      where: { id },
      data: {
        status: RequestStatus.REJECTED,
        rejectedBy,
        rejectedAt: new Date(),
        rejectionReason,
      },
      include: {
        employee: true,
      },
    });
  }

  // Disburse advance amount
  async disburse(id: number, disbursedBy: string, disbursedAmount?: number) {
    const request = await this.findOne(id);

    if (request.status !== RequestStatus.APPROVED) {
      throw new BadRequestException('Request must be approved first');
    }

    const amount = disbursedAmount || request.amount;

    return this.prisma.advanceRequest.update({
      where: { id },
      data: {
        disbursedAmount: amount,
        disbursedAt: new Date(),
      },
    });
  }

  // Record a repayment
  async recordRepayment(id: number, amount: number) {
    const request = await this.findOne(id);

    const newTotalRepaid = (request.totalRepaid || 0) + amount;
    const newRemainingBalance = request.amount - newTotalRepaid;
    const isFullyRepaid = newRemainingBalance <= 0;

    return this.prisma.advanceRequest.update({
      where: { id },
      data: {
        totalRepaid: newTotalRepaid,
        remainingAmount: newRemainingBalance,
        isFullyRepaid,
      },
    });
  }

  // Get advance requests for an employee
  async findByEmployee(employeeId: number) {
    return this.prisma.advanceRequest.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get pending advance requests
  async findPending() {
    return this.prisma.advanceRequest.findMany({
      where: { status: RequestStatus.PENDING },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Get active advances (not fully repaid)
  async findActiveAdvances(employeeId?: number) {
    return this.prisma.advanceRequest.findMany({
      where: {
        ...(employeeId && { employeeId }),
        status: RequestStatus.APPROVED,
        isFullyRepaid: false,
        disbursedAmount: { not: null },
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }
}
