import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../Prisma/prisma.service';
import { ERPSystem, SyncDirection, SyncAction, SyncStatus } from '@prisma/client';

@Injectable()
export class ErpService {
  private readonly logger = new Logger(ErpService.name);

  constructor(private prisma: PrismaService) {}

  // Create ERP integration configuration
  async createIntegration(data: {
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
    return this.prisma.eRPIntegration.create({
      data: {
        name: data.name,
        erpSystem: data.erpSystem,
        apiEndpoint: data.endpoint,
        apiKey: data.apiKey,
        username: data.username,
        password: data.password,
        syncDirection: data.syncDirection,
        syncFrequency: data.syncFrequency,
        employeeMapping: data.employeeMapping ? JSON.stringify(data.employeeMapping) : null,
        payrollMapping: data.payrollMapping ? JSON.stringify(data.payrollMapping) : null,
      },
    });
  }

  // Get all ERP integrations
  async getAllIntegrations() {
    const integrations = await this.prisma.eRPIntegration.findMany({
      include: {
        _count: {
          select: { syncLogs: true },
        },
      },
    });

    return integrations.map(integration => ({
      ...integration,
      employeeMapping: integration.employeeMapping ? JSON.parse(integration.employeeMapping) : null,
      payrollMapping: integration.payrollMapping ? JSON.parse(integration.payrollMapping) : null,
    }));
  }

  // Get integration by ID
  async getIntegrationById(id: number) {
    const integration = await this.prisma.eRPIntegration.findUnique({
      where: { id },
      include: {
        syncLogs: {
          take: 50,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!integration) return null;

    return {
      ...integration,
      employeeMapping: integration.employeeMapping ? JSON.parse(integration.employeeMapping) : null,
      payrollMapping: integration.payrollMapping ? JSON.parse(integration.payrollMapping) : null,
    };
  }

  // Sync employees to ERP
  async syncEmployees(integrationId: number) {
    const integration = await this.getIntegrationById(integrationId);
    
    if (!integration || !integration.isActive) {
      throw new HttpException('Integration not found or inactive', HttpStatus.NOT_FOUND);
    }

    const startTime = new Date();
    let status: SyncStatus = SyncStatus.SUCCESS;
    let recordsProcessed = 0;
    let errorDetails: any[] = [];

    try {
      // Get all active employees
      const employees = await this.prisma.employee.findMany({
        where: { status: 'ACTIVE' },
        include: {
          department: true,
          user: true,
        },
      });

      recordsProcessed = employees.length;

      // TODO: Implement actual ERP API call here
      // Example: await this.sendToERP(integration, employees);
      
      this.logger.log(`Synced ${recordsProcessed} employees to ${integration.erpSystem}`);
    } catch (error) {
      status = SyncStatus.FAILED;
      errorDetails.push({ error: error.message });
      this.logger.error(`Employee sync failed:`, error);
    }

    // Create sync log
    await this.prisma.eRPSyncLog.create({
      data: {
        erpIntegrationId: integrationId,
        integrationId,
        entityType: 'Employee',
        syncType: 'EMPLOYEE',
        direction: SyncDirection.TO_ERP,
        recordCount: recordsProcessed,
        recordsProcessed,
        successCount: status === SyncStatus.SUCCESS ? recordsProcessed : 0,
        recordsFailed: status !== SyncStatus.SUCCESS ? recordsProcessed : 0,
        errorCount: status !== SyncStatus.SUCCESS ? recordsProcessed : 0,
        status,
        errorDetails: errorDetails.length > 0 ? JSON.stringify(errorDetails) : null,
        syncStarted: startTime,
        syncCompleted: new Date(),
        duration: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
      },
    });

    // Update integration last sync time
    await this.prisma.eRPIntegration.update({
      where: { id: integrationId },
      data: {
        lastSyncTime: new Date(),
        ...(status === SyncStatus.SUCCESS && { lastSyncAt: new Date() }),
        ...(status !== SyncStatus.SUCCESS && {
          lastSyncAt: new Date(),
        }),
      },
    });

    return { status, recordsProcessed, errorDetails };
  }

  // Sync payroll to ERP
  async syncPayroll(integrationId: number, month: number, year: number) {
    const integration = await this.getIntegrationById(integrationId);
    
    if (!integration || !integration.isActive) {
      throw new HttpException('Integration not found or inactive', HttpStatus.NOT_FOUND);
    }

    const startTime = new Date();
    let status: SyncStatus = SyncStatus.SUCCESS;
    let recordsProcessed = 0;
    let errorDetails: any[] = [];

    try {
      // Get payroll records for the specified month/year
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const payrolls = await this.prisma.payroll.findMany({
        where: {
          payPeriodStart: { gte: startDate, lte: endDate },
        },
        include: {
          employee: true,
        },
      });

      recordsProcessed = payrolls.length;

      // TODO: Implement actual ERP API call here
      // Example: await this.sendPayrollToERP(integration, payrolls);
      
      this.logger.log(`Synced ${recordsProcessed} payroll records to ${integration.erpSystem}`);
    } catch (error) {
      status = SyncStatus.FAILED;
      errorDetails.push({ error: error.message });
      this.logger.error(`Payroll sync failed:`, error);
    }

    // Create sync log
    await this.prisma.eRPSyncLog.create({
      data: {
        erpIntegrationId: integrationId,
        integrationId,
        entityType: 'Payroll',
        syncType: 'PAYROLL',
        direction: SyncDirection.TO_ERP,
        recordCount: recordsProcessed,
        recordsProcessed,
        successCount: status === SyncStatus.SUCCESS ? recordsProcessed : 0,
        recordsFailed: status !== SyncStatus.SUCCESS ? recordsProcessed : 0,
        errorCount: status !== SyncStatus.SUCCESS ? recordsProcessed : 0,
        status,
        errorDetails: errorDetails.length > 0 ? JSON.stringify(errorDetails) : null,
        syncStarted: startTime,
        syncCompleted: new Date(),
        duration: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
      },
    });

    return { status, recordsProcessed, errorDetails };
  }

  // Get sync logs
  async getSyncLogs(integrationId?: number, entityType?: string) {
    return this.prisma.eRPSyncLog.findMany({
      where: {
        ...(integrationId && { integrationId }),
        ...(entityType && { entityType }),
      },
      include: {
        erpIntegration: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  // Scheduled sync every hour
  @Cron(CronExpression.EVERY_HOUR)
  async handleScheduledSync() {
    const integrations = await this.prisma.eRPIntegration.findMany({
      where: {
        isActive: true,
        syncFrequency: 'HOURLY',
      },
    });

    this.logger.log(`Starting scheduled ERP sync for ${integrations.length} integrations`);

    for (const integration of integrations) {
      try {
        if (integration.syncDirection === SyncDirection.TO_ERP || 
            integration.syncDirection === SyncDirection.BIDIRECTIONAL) {
          await this.syncEmployees(integration.id);
        }
      } catch (error) {
        this.logger.error(`Scheduled sync failed for ${integration.name}:`, error);
      }
    }
  }
}
