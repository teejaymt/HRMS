import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AdvanceRequestService } from './advance-request.service';
import { AdvanceType, RequestStatus } from '@prisma/client';

@Controller('advance-request')
export class AdvanceRequestController {
  constructor(private readonly advanceRequestService: AdvanceRequestService) {}

  // Create advance request
  @Post()
  create(@Body() body: {
    employeeId: number;
    requestType?: AdvanceType;
    amount: number;
    reason: string;
    requiredDate?: string;
    repaymentMonths?: number;
  }) {
    return this.advanceRequestService.create({
      ...body,
      requiredDate: body.requiredDate ? new Date(body.requiredDate) : undefined,
    });
  }

  // Get all advance requests with filters
  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: RequestStatus,
    @Query('requestType') requestType?: AdvanceType
  ) {
    return this.advanceRequestService.findAll({
      ...(employeeId && { employeeId: parseInt(employeeId) }),
      ...(status && { status }),
      ...(requestType && { requestType }),
    });
  }

  // Get pending requests
  @Get('pending')
  findPending() {
    return this.advanceRequestService.findPending();
  }

  // Get active advances (not fully repaid)
  @Get('active')
  findActiveAdvances(@Query('employeeId') employeeId?: string) {
    return this.advanceRequestService.findActiveAdvances(
      employeeId ? parseInt(employeeId) : undefined
    );
  }

  // Get advance request by ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.advanceRequestService.findOne(id);
  }

  // Get advance requests by employee
  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.advanceRequestService.findByEmployee(employeeId);
  }

  // Approve advance request
  @Post(':id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { approvedBy: string }
  ) {
    return this.advanceRequestService.approve(id, body.approvedBy);
  }

  // Reject advance request
  @Post(':id/reject')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { rejectedBy: string; rejectionReason: string }
  ) {
    return this.advanceRequestService.reject(id, body.rejectedBy, body.rejectionReason);
  }

  // Disburse advance amount
  @Post(':id/disburse')
  disburse(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { disbursedBy: string; disbursedAmount?: number }
  ) {
    return this.advanceRequestService.disburse(id, body.disbursedBy, body.disbursedAmount);
  }

  // Record repayment
  @Post(':id/repayment')
  recordRepayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { amount: number }
  ) {
    return this.advanceRequestService.recordRepayment(id, body.amount);
  }
}
