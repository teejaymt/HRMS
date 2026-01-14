import { Controller, Get, Post, Body, Patch, Param, Query, Delete } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { PayrollAuditService } from './payroll-audit.service';

@Controller('payroll')
export class PayrollController {
  constructor(
    private readonly payrollService: PayrollService,
    private readonly payrollAuditService: PayrollAuditService,
  ) {}

  @Post()
  async create(@Body() data: any) {
    const result = await this.payrollService.create(data);
    
    // Log individual payroll creation
    await this.payrollAuditService.logPayrollProcess({
      processType: 'INDIVIDUAL',
      month: data.month,
      year: data.year,
      employeeCount: 1,
      successCount: 1,
      errorCount: 0,
      processedBy: data.processedBy || 'system',
      employeeDetails: [data.employeeId],
      notes: `Individual payroll created for employee ID ${data.employeeId}`,
    });

    return result;
  }

  @Post('bulk')
  async createBulk(@Body() data: {
    payrolls: any[];
    processedBy: string;
    month: number;
    year: number;
  }) {
    const results = {
      success: [] as any[],
      errors: [] as any[],
    };

    for (const payroll of data.payrolls) {
      try {
        const result = await this.payrollService.create(payroll);
        results.success.push(result);
      } catch (error: any) {
        results.errors.push({
          employeeId: payroll.employeeId,
          error: error.message,
        });
      }
    }

    // Log bulk payroll creation
    await this.payrollAuditService.logPayrollProcess({
      processType: 'BULK',
      month: data.month,
      year: data.year,
      employeeCount: data.payrolls.length,
      successCount: results.success.length,
      errorCount: results.errors.length,
      processedBy: data.processedBy,
      employeeDetails: data.payrolls.map((p) => p.employeeId),
      errorDetails: results.errors.map((e) => `Employee ${e.employeeId}: ${e.error}`),
      notes: `Bulk payroll run for ${data.month}/${data.year}`,
    });

    return {
      success: results.success.length,
      errors: results.errors.length,
      details: results,
    };
  }

  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.payrollService.findAll({
      employeeId: employeeId ? +employeeId : undefined,
      year: year ? +year : undefined,
      month: month ? +month : undefined,
    });
  }

  @Get('audit-logs')
  getAuditLogs(
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('processType') processType?: string,
  ) {
    const filters: any = {};
    if (month) filters.month = +month;
    if (year) filters.year = +year;
    if (processType) filters.processType = processType;
    return this.payrollAuditService.getAuditLogs(filters);
  }

  @Get('audit-logs/:id')
  getAuditLogById(@Param('id') id: string) {
    return this.payrollAuditService.getAuditLogById(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payrollService.findOne(+id);
  }

  @Patch(':id/paid')
  markAsPaid(@Param('id') id: string, @Body('paymentMethod') paymentMethod: string) {
    return this.payrollService.markAsPaid(+id, paymentMethod);
  }

  @Delete(':id')
  deleteById(@Param('id') id: string) {
    return this.payrollService.deleteById(+id);
  }

  @Delete('month/:year/:month')
  deleteByMonthYear(@Param('year') year: string, @Param('month') month: string) {
    return this.payrollService.deleteByMonthYear(+month, +year);
  }
}
