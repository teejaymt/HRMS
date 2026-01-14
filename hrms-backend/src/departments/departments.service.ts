import { Injectable } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  create(data: { name: string; description?: string }) {
    return this.prisma.department.create({ data });
  }

  async findAll() {
    const departments = await this.prisma.department.findMany({
      include: {
        employees: {
          where: {
            status: 'ACTIVE', // Only count active employees
          },
          select: {
            isSaudi: true,
          },
        },
      },
    });

    // Calculate actual counts from active employees only
    return departments.map(dept => {
      const saudiCount = dept.employees.filter(emp => emp.isSaudi).length;
      const nonSaudiCount = dept.employees.filter(emp => !emp.isSaudi).length;
      
      return {
        ...dept,
        saudiCount,
        nonSaudiCount,
        employees: undefined, // Remove employees array from response
      };
    });
  }

  findOne(id: number) {
    return this.prisma.department.findUnique({
      where: { id },
      include: { employees: true },
    });
  }

  update(id: number, data: any) {
    return this.prisma.department.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.department.delete({ where: { id } });
  }
}
