import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { BiometricService } from './biometric.service';
import { BiometricType, BiometricLogType } from '@prisma/client';

@Controller('biometric')
export class BiometricController {
  constructor(private readonly biometricService: BiometricService) {}

  // Register a new biometric device
  @Post('devices')
  registerDevice(
    @Body()
    body: {
      deviceCode: string;
      deviceName: string;
      name: string;
      deviceType: BiometricType;
      ipAddress: string;
      port?: number;
      location: string;
      vendor?: string;
      model?: string;
      serialNumber?: string;
      connectionType?: string;
      username?: string;
      password?: string;
    },
  ) {
    return this.biometricService.registerDevice(body);
  }

  // Get all devices
  @Get('devices')
  getAllDevices(@Query('activeOnly', ParseBoolPipe) activeOnly?: boolean) {
    return this.biometricService.getAllDevices(activeOnly ?? true);
  }

  // Get device by ID
  @Get('devices/:id')
  getDeviceById(@Param('id', ParseIntPipe) id: number) {
    return this.biometricService.getDeviceById(id);
  }

  // Sync logs from a device
  @Post('devices/:id/sync')
  syncDeviceLogs(@Param('id', ParseIntPipe) id: number) {
    return this.biometricService.syncDeviceLogs(id);
  }

  // Update device status
  @Post('devices/:id/status')
  updateDeviceStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isOnline: boolean },
  ) {
    return this.biometricService.updateDeviceStatus(id, body.isOnline);
  }

  // Manually add a biometric log
  @Post('logs')
  addLog(
    @Body()
    body: {
      deviceId: number;
      employeeCode: string;
      timestamp: string;
      logType: BiometricLogType;
      verifyMode?: string;
      rawData?: any;
    },
  ) {
    return this.biometricService.addLog({
      ...body,
      timestamp: new Date(body.timestamp),
    });
  }

  // Get biometric logs
  @Get('logs')
  getLogs(
    @Query('deviceId') deviceId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('isProcessed') isProcessed?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.biometricService.getLogs({
      ...(deviceId && { deviceId: parseInt(deviceId) }),
      ...(employeeId && { employeeId: parseInt(employeeId) }),
      ...(isProcessed && { isProcessed: isProcessed === 'true' }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    });
  }

  // Manually trigger log processing
  @Post('logs/process')
  processUnprocessedLogs() {
    return this.biometricService.processUnprocessedLogs();
  }
}
