import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma.service';
import { TicketType, TravelClass, RequestStatus, FamilyRelationship } from '@prisma/client';

@Injectable()
export class TicketRequestService {
  constructor(private prisma: PrismaService) {}

  // Create ticket request
  async create(data: {
    employeeId: number;
    requestType?: TicketType;
    destination: string;
    departureDate: Date;
    returnDate?: Date;
    travelClass?: TravelClass;
    employeeTicketCost?: number;
    totalCost: number;
    familyMembers?: Array<{
      name: string;
      relationship: FamilyRelationship;
      dateOfBirth?: Date;
      passportNumber?: string;
      ticketCost?: number;
    }>;
  }) {
    const familyMembersData = data.familyMembers || [];
    const totalFamilyCost = familyMembersData.reduce((sum, member) => sum + (member.ticketCost || 0), 0);

    return this.prisma.ticketRequest.create({
      data: {
        employeeId: data.employeeId,
        travelYear: new Date().getFullYear(),
        requestType: data.requestType || TicketType.ANNUAL_LEAVE,
        destination: data.destination,
        departureDate: data.departureDate,
        returnDate: data.returnDate,
        travelClass: data.travelClass || TravelClass.ECONOMY,
        employeeTicketCost: data.employeeTicketCost,
        totalCost: data.totalCost,
        totalFamilyMembers: familyMembersData.length,
        totalFamilyCost,
        familyMembers: {
          create: familyMembersData,
        },
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
        familyMembers: true,
      },
    });
  }

  // Get all ticket requests
  async findAll(filters?: {
    employeeId?: number;
    status?: RequestStatus;
    requestType?: TicketType;
  }) {
    return this.prisma.ticketRequest.findMany({
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
        familyMembers: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get ticket request by ID
  async findOne(id: number) {
    const request = await this.prisma.ticketRequest.findUnique({
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
            department: true,
          },
        },
        familyMembers: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Ticket request not found');
    }

    return request;
  }

  // Approve ticket request
  async approve(id: number, approvedBy: string) {
    const request = await this.findOne(id);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Request is not pending');
    }

    return this.prisma.ticketRequest.update({
      where: { id },
      data: {
        status: RequestStatus.APPROVED,
        approvedBy,
        approvedAt: new Date(),
      },
      include: {
        employee: true,
        familyMembers: true,
      },
    });
  }

  // Reject ticket request
  async reject(id: number, rejectedBy: string, rejectionReason: string) {
    const request = await this.findOne(id);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Request is not pending');
    }

    return this.prisma.ticketRequest.update({
      where: { id },
      data: {
        status: RequestStatus.REJECTED,
        rejectedBy,
        rejectedAt: new Date(),
        rejectionReason,
      },
      include: {
        employee: true,
        familyMembers: true,
      },
    });
  }

  // Book ticket
  async book(id: number, bookedBy: string, bookingReference: string, ticketNumbers?: string[]) {
    const request = await this.findOne(id);

    if (request.status !== RequestStatus.APPROVED) {
      throw new BadRequestException('Request must be approved first');
    }

    return this.prisma.ticketRequest.update({
      where: { id },
      data: {
        isBooked: true,
        bookingReference,
        ticketNumbers: ticketNumbers ? JSON.stringify(ticketNumbers) : null,
      },
    });
  }

  // Add family member to ticket request
  async addFamilyMember(ticketRequestId: number, data: {
    name: string;
    relationship: FamilyRelationship;
    dateOfBirth?: Date;
    passportNumber?: string;
    ticketCost?: number;
  }) {
    const request = await this.findOne(ticketRequestId);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Cannot add family member to non-pending request');
    }

    const familyMember = await this.prisma.ticketFamilyMember.create({
      data: {
        ticketRequestId,
        ...data,
      },
    });

    // Update totals
    const newTotalFamilyMembers = request.totalFamilyMembers + 1;
    const newTotalFamilyCost = request.totalFamilyCost + (data.ticketCost || 0);
    const newTotalCost = (request.employeeTicketCost || 0) + newTotalFamilyCost;

    await this.prisma.ticketRequest.update({
      where: { id: ticketRequestId },
      data: {
        totalFamilyMembers: newTotalFamilyMembers,
        totalFamilyCost: newTotalFamilyCost,
        totalCost: newTotalCost,
      },
    });

    return familyMember;
  }

  // Get ticket requests for an employee
  async findByEmployee(employeeId: number) {
    return this.prisma.ticketRequest.findMany({
      where: { employeeId },
      include: {
        familyMembers: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get pending ticket requests
  async findPending() {
    return this.prisma.ticketRequest.findMany({
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
        familyMembers: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
