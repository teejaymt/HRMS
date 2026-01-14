import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../Prisma/prisma.service';
import { BiometricType, BiometricLogType, AttendanceStatus } from '@prisma/client';

@Injectable()
export class BiometricService {
  private readonly logger = new Logger(BiometricService.name);

  constructor(private prisma: PrismaService) {}

  // Register a new biometric device
  async registerDevice(data: {
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
  }) {
    return this.prisma.biometricDevice.create({
      data: {
        ...data,
        isActive: true,
        isOnline: false,
      },
    });
  }

  // Get all devices
  async getAllDevices(activeOnly = true) {
    return this.prisma.biometricDevice.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: {
        _count: {
          select: { logs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get device by ID
  async getDeviceById(id: number) {
    return this.prisma.biometricDevice.findUnique({
      where: { id },
      include: {
        logs: {
          take: 50,
          orderBy: { timestamp: 'desc' },
        },
      },
    });
  }

  // Update device status
  async updateDeviceStatus(id: number, isOnline: boolean) {
    return this.prisma.biometricDevice.update({
      where: { id },
      data: {
        isOnline,
      },
    });
  }

  // Sync logs from device (placeholder - actual implementation depends on device API)
  async syncDeviceLogs(deviceId: number) {
    const device = await this.prisma.biometricDevice.findUnique({
      where: { id: deviceId },
    });

    if (!device || !device.isActive) {
      throw new HttpException('Device not found or inactive', HttpStatus.NOT_FOUND);
    }

    try {
      // TODO: Implement actual device communication based on vendor
      // This is a placeholder that shows the expected structure
      
      // Example: const logs = await this.fetchLogsFromDevice(device);
      // For now, we'll just mark the sync time
      
      await this.prisma.biometricDevice.update({
        where: { id: deviceId },
        data: {
          lastSyncTime: new Date(),
          isOnline: true,
        },
      });

      this.logger.log(`Synced logs from device ${device.name} (${device.deviceCode})`);
      
      return { success: true, message: 'Sync completed' };
    } catch (error) {
      this.logger.error(`Failed to sync device ${device.name}:`, error);
      
      await this.prisma.biometricDevice.update({
        where: { id: deviceId },
        data: { isOnline: false },
      });
      
      throw error;
    }
  }

  // Manually add a biometric log
  async addLog(data: {
    deviceId: number;
    employeeCode: string;
    timestamp: Date;
    logType: BiometricLogType;
    verifyMode?: string;
    rawData?: any;
  }) {
    // Try to find employee by code
    const employee = await this.prisma.employee.findFirst({
      where: { employeeCode: data.employeeCode },
    });

    return this.prisma.biometricLog.create({
      data: {
        deviceId: data.deviceId,
        employeeCode: data.employeeCode,
        employeeId: employee?.id,
        timestamp: data.timestamp,
        logType: data.logType,
        verifyMode: data.verifyMode,
        rawData: data.rawData ? JSON.stringify(data.rawData) : null,
        isProcessed: false,
      },
    });
  }

  // Process unprocessed biometric logs into attendance records
  async processUnprocessedLogs() {
    const unprocessedLogs = await this.prisma.biometricLog.findMany({
      where: { isProcessed: false },
      include: {
        device: true,
      },
      orderBy: { timestamp: 'asc' },
      take: 1000, // Process in batches
    });

    this.logger.log(`Processing ${unprocessedLogs.length} unprocessed biometric logs`);

    let processedCount = 0;
    let errorCount = 0;

    for (const log of unprocessedLogs) {
      try {
        // Find employee
        if (!log.employeeId) {
          const employee = await this.prisma.employee.findFirst({
            where: { employeeCode: log.employeeCode },
          });

          if (employee) {
            await this.prisma.biometricLog.update({
              where: { id: log.id },
              data: { employeeId: employee.id },
            });
            log.employeeId = employee.id;
          }
        }

        if (!log.employeeId) {
          this.logger.warn(`Employee not found for code: ${log.employeeCode}`);
          continue;
        }

        // Check if log is CHECK_IN or CHECK_OUT
        if (log.logType === BiometricLogType.CHECK_IN) {
          // Create or update attendance record for this date
          const attendanceDate = new Date(log.timestamp);
          attendanceDate.setHours(0, 0, 0, 0);

          const existingAttendance = await this.prisma.attendance.findFirst({
            where: {
              employeeId: log.employeeId,
              date: attendanceDate,
            },
          });

          if (existingAttendance) {
            // Update check-in time if earlier than existing
            if (!existingAttendance.checkIn || log.timestamp < existingAttendance.checkIn) {
              await this.prisma.attendance.update({
                where: { id: existingAttendance.id },
                data: { checkIn: log.timestamp },
              });
            }
          } else {
            // Create new attendance record
            const attendance = await this.prisma.attendance.create({
              data: {
                employeeId: log.employeeId,
                date: attendanceDate,
                checkIn: log.timestamp,
                status: AttendanceStatus.PRESENT,
              },
            });

            await this.prisma.biometricLog.update({
              where: { id: log.id },
              data: {
                isProcessed: true,
                processedAt: new Date(),
                attendanceId: attendance.id,
              },
            });
          }
        } else if (log.logType === BiometricLogType.CHECK_OUT) {
          // Find attendance record for this date
          const attendanceDate = new Date(log.timestamp);
          attendanceDate.setHours(0, 0, 0, 0);

          const attendance = await this.prisma.attendance.findFirst({
            where: {
              employeeId: log.employeeId,
              date: attendanceDate,
            },
          });

          if (attendance) {
            // Calculate work hours
            const checkIn = attendance.checkIn;
            let hoursWorked = 0;

            if (checkIn) {
              const diff = log.timestamp.getTime() - checkIn.getTime();
              hoursWorked = Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
            }

            await this.prisma.attendance.update({
              where: { id: attendance.id },
              data: {
                checkOut: log.timestamp,
                hoursWorked,
              },
            });

            await this.prisma.biometricLog.update({
              where: { id: log.id },
              data: {
                isProcessed: true,
                processedAt: new Date(),
                attendanceId: attendance.id,
              },
            });
          }
        }

        // Mark as processed even if not CHECK_IN/CHECK_OUT
        await this.prisma.biometricLog.update({
          where: { id: log.id },
          data: {
            isProcessed: true,
            processedAt: new Date(),
          },
        });

        processedCount++;
      } catch (error) {
        this.logger.error(`Error processing log ${log.id}:`, error);
        errorCount++;
      }
    }

    this.logger.log(`Processed ${processedCount} logs, ${errorCount} errors`);

    return { processedCount, errorCount, total: unprocessedLogs.length };
  }

  // Scheduled task to sync all active devices every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleScheduledDeviceSync() {
    const devices = await this.prisma.biometricDevice.findMany({
      where: { isActive: true },
    });

    this.logger.log(`Starting scheduled sync for ${devices.length} active devices`);

    for (const device of devices) {
      try {
        await this.syncDeviceLogs(device.id);
      } catch (error) {
        this.logger.error(`Failed to sync device ${device.name}:`, error);
      }
    }
  }

  // Scheduled task to process logs every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledLogProcessing() {
    try {
      await this.processUnprocessedLogs();
    } catch (error) {
      this.logger.error('Error in scheduled log processing:', error);
    }
  }

  // Get biometric logs
  async getLogs(filters?: {
    deviceId?: number;
    employeeId?: number;
    isProcessed?: boolean;
    startDate?: Date;
    endDate?: Date;
  }) {
    return this.prisma.biometricLog.findMany({
      where: {
        ...(filters?.deviceId && { deviceId: filters.deviceId }),
        ...(filters?.employeeId && { employeeId: filters.employeeId }),
        ...(filters?.isProcessed !== undefined && { isProcessed: filters.isProcessed }),
        ...(filters?.startDate || filters?.endDate) && {
          timestamp: {
            ...(filters.startDate && { gte: filters.startDate }),
            ...(filters.endDate && { lte: filters.endDate }),
          },
        },
      },
      include: {
        device: true,
      },
      orderBy: { timestamp: 'desc' },
      take: 500,
    });
  }
}
