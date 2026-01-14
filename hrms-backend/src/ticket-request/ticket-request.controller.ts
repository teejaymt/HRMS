import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TicketRequestService } from './ticket-request.service';
import { TicketType, TravelClass, RequestStatus, FamilyRelationship } from '@prisma/client';

@Controller('ticket-request')
export class TicketRequestController {
  constructor(private readonly ticketRequestService: TicketRequestService) {}

  // Create ticket request
  @Post()
  create(@Body() body: {
    employeeId: number;
    requestType?: TicketType;
    destination: string;
    departureDate: string;
    returnDate?: string;
    travelClass?: TravelClass;
    employeeTicketCost?: number;
    totalCost: number;
    familyMembers?: Array<{
      name: string;
      relationship: FamilyRelationship;
      dateOfBirth?: string;
      passportNumber?: string;
      ticketCost?: number;
    }>;
  }) {
    return this.ticketRequestService.create({
      ...body,
      departureDate: new Date(body.departureDate),
      returnDate: body.returnDate ? new Date(body.returnDate) : undefined,
      familyMembers: body.familyMembers?.map(member => ({
        ...member,
        dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth) : undefined,
      })),
    });
  }

  // Get all ticket requests with filters
  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: RequestStatus,
    @Query('requestType') requestType?: TicketType
  ) {
    return this.ticketRequestService.findAll({
      ...(employeeId && { employeeId: parseInt(employeeId) }),
      ...(status && { status }),
      ...(requestType && { requestType }),
    });
  }

  // Get pending requests
  @Get('pending')
  findPending() {
    return this.ticketRequestService.findPending();
  }

  // Get ticket request by ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketRequestService.findOne(id);
  }

  // Get ticket requests by employee
  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.ticketRequestService.findByEmployee(employeeId);
  }

  // Approve ticket request
  @Post(':id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { approvedBy: string }
  ) {
    return this.ticketRequestService.approve(id, body.approvedBy);
  }

  // Reject ticket request
  @Post(':id/reject')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { rejectedBy: string; rejectionReason: string }
  ) {
    return this.ticketRequestService.reject(id, body.rejectedBy, body.rejectionReason);
  }

  // Book ticket
  @Post(':id/book')
  book(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      bookedBy: string;
      bookingReference: string;
      ticketNumbers?: string[];
    }
  ) {
    return this.ticketRequestService.book(
      id,
      body.bookedBy,
      body.bookingReference,
      body.ticketNumbers
    );
  }

  // Add family member to ticket request
  @Post(':id/family-members')
  addFamilyMember(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      name: string;
      relationship: FamilyRelationship;
      dateOfBirth?: string;
      passportNumber?: string;
      ticketCost?: number;
    }
  ) {
    return this.ticketRequestService.addFamilyMember(id, {
      ...body,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
    });
  }
}
