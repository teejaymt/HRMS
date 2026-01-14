import { Controller, Get, Post, Body, Query, Param, Patch, Delete } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  checkIn(@Body('employeeId') employeeId: number) {
    return this.attendanceService.checkIn(employeeId);
  }

  @Post('check-out')
  checkOut(@Body('employeeId') employeeId: number) {
    return this.attendanceService.checkOut(employeeId);
  }

  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.findAll({
      employeeId: employeeId ? +employeeId : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.attendanceService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(+id);
  }
}
