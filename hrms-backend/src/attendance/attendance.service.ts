import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async checkIn(employeeId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
      create: {
        employeeId,
        date: today,
        checkIn: new Date(),
        status: AttendanceStatus.PRESENT,
      },
      update: {
        checkIn: new Date(),
        status: AttendanceStatus.PRESENT,
      },
      include: { employee: true },
    });
  }

  async checkOut(employeeId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    });

    if (!attendance || !attendance.checkIn) {
      throw new HttpException('No check-in record found for today', HttpStatus.BAD_REQUEST);
    }

    const workHours =
      (new Date().getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60);

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: new Date(),
        workHours: parseFloat(workHours.toFixed(2)),
      },
      include: { employee: true },
    });
  }

  findAll(filters?: {
    employeeId?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    return this.prisma.attendance.findMany({
      where: {
        ...(filters?.employeeId && { employeeId: filters.employeeId }),
        ...(filters?.startDate &&
          filters?.endDate && {
            date: {
              gte: filters.startDate,
              lte: filters.endDate,
            },
          }),
      },
      include: {
        employee: {
          select: { firstName: true, lastName: true, employeeCode: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.attendance.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: { select: { name: true } },
          },
        },
      },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.attendance.update({
      where: { id },
      data,
      include: {
        employee: {
          select: { firstName: true, lastName: true, employeeCode: true },
        },
      },
    });
  }

  async remove(id: number) {
    return this.prisma.attendance.delete({
      where: { id },
    });
  }
}
