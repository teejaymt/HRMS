import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ErpService } from './erp.service';
import { ERPSystem, SyncDirection } from '@prisma/client';

@Controller('erp')
export class ErpController {
  constructor(private readonly erpService: ErpService) {}

  // Create ERP integration
  @Post('integrations')
  createIntegration(@Body() body: {
    name: string;
    erpSystem: ERPSystem;
    endpoint: string;
    apiKey?: string;
    username?: string;
    password?: string;
    syncDirection?: SyncDirection;
    syncFrequency?: string;
    employeeMapping?: any;
    payrollMapping?: any;
  }) {
    return this.erpService.createIntegration(body);
  }

  // Get all ERP integrations
  @Get('integrations')
  getAllIntegrations() {
    return this.erpService.getAllIntegrations();
  }

  // Get ERP integration by ID
  @Get('integrations/:id')
  getIntegrationById(@Param('id', ParseIntPipe) id: number) {
    return this.erpService.getIntegrationById(id);
  }

  // Sync employees to ERP
  @Post('integrations/:id/sync-employees')
  syncEmployees(@Param('id', ParseIntPipe) id: number) {
    return this.erpService.syncEmployees(id);
  }

  // Sync payroll to ERP
  @Post('integrations/:id/sync-payroll')
  syncPayroll(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { month: number; year: number }
  ) {
    return this.erpService.syncPayroll(id, body.month, body.year);
  }

  // Get sync logs
  @Get('sync-logs')
  getSyncLogs(
    @Query('integrationId') integrationId?: string,
    @Query('entityType') entityType?: string
  ) {
    return this.erpService.getSyncLogs(
      integrationId ? parseInt(integrationId) : undefined,
      entityType
    );
  }
}
