import { Controller, Get, Post, Body, Patch, Param, Query, Delete } from '@nestjs/common';
import { LeavesService } from './leaves.service';

@Controller('leaves')
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  create(@Body() data: any) {
    return this.leavesService.create(data);
  }

  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.leavesService.findAll({
      employeeId: employeeId ? +employeeId : undefined,
      status: status as any,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leavesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.leavesService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leavesService.remove(+id);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body('approvedBy') approvedBy: string) {
    return this.leavesService.approve(+id, approvedBy);
  }

  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body('rejectedBy') rejectedBy: string,
    @Body('comments') comments?: string,
  ) {
    return this.leavesService.reject(+id, rejectedBy, comments);
  }
}
