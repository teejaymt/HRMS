import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { SalaryHistoryService } from './salary-history.service';
import { CreateSalaryHistoryDto } from './dto/create-salary-history.dto';

@Controller('salary-history')
export class SalaryHistoryController {
  constructor(private readonly salaryHistoryService: SalaryHistoryService) {}

  @Post()
  create(@Body() createSalaryHistoryDto: CreateSalaryHistoryDto) {
    return this.salaryHistoryService.create(createSalaryHistoryDto);
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.salaryHistoryService.findByEmployee(employeeId);
  }

  @Get('employee/:employeeId/current')
  getCurrentSalary(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.salaryHistoryService.getCurrentSalary(employeeId);
  }

  @Get('employee/:employeeId/statistics')
  getStatistics(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.salaryHistoryService.getStatistics(employeeId);
  }

  @Get('changes')
  findRecentChanges(
    @Query('days', ParseIntPipe) days: number = 30,
    @Query('limit', ParseIntPipe) limit: number = 50
  ) {
    return this.salaryHistoryService.findRecentChanges(days, limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salaryHistoryService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salaryHistoryService.remove(id);
  }
}
