import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma.service';
import { LeaveStatus } from '@prisma/client';
import { WorkflowsService } from '../workflows/workflows.service';

@Injectable()
export class LeavesService {
  constructor(
    private prisma: PrismaService,
    private workflowsService: WorkflowsService,
  ) {}

  async create(data: any) {
    const days = Math.ceil(
      (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;
    
    const leave = await this.prisma.leave.create({
      data: { ...data, days },
      include: { employee: true },
    });

    // Find workflow definition for leaves
    const workflowDefs = await this.workflowsService.getAllDefinitions();
    const workflowDef = workflowDefs.find(def => def.entityType === 'LEAVE');
    
    if (workflowDef) {
      await this.workflowsService.initiateWorkflow({
        workflowId: workflowDef.id,
        entityType: 'LEAVE',
        entityId: leave.id,
        initiatedBy: leave.employee.email,
      });
    }

    return leave;
  }

  findAll(filters?: { employeeId?: number; status?: LeaveStatus }) {
    return this.prisma.leave.findMany({
      where: filters,
      include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.leave.findUnique({
      where: { id },
      include: { employee: true },
    });
  }

  async approve(id: number, approvedBy: string) {
    const leave = await this.prisma.leave.update({
      where: { id },
      data: {
        status: LeaveStatus.APPROVED,
        approvedBy,
        approvedAt: new Date(),
      },
    });

    const workflows = await this.workflowsService.getInstancesByEntity('LEAVE', id);
    if (workflows.length > 0) {
      const activeWorkflow = workflows.find(w => w.status === 'IN_PROGRESS');
      if (activeWorkflow) {
        await this.workflowsService.approveStep({
          instanceId: activeWorkflow.id,
          actorEmail: approvedBy,
        });
      }
    }

    return leave;
  }

  async reject(id: number, rejectedBy: string, comments?: string) {
    const leave = await this.prisma.leave.update({
      where: { id },
      data: {
        status: LeaveStatus.REJECTED,
        rejectedBy,
        rejectedAt: new Date(),
        comments,
      },
    });

    const workflows = await this.workflowsService.getInstancesByEntity('LEAVE', id);
    if (workflows.length > 0) {
      const activeWorkflow = workflows.find(w => w.status === 'IN_PROGRESS');
      if (activeWorkflow) {
        await this.workflowsService.rejectWorkflow({
          instanceId: activeWorkflow.id,
          actorEmail: rejectedBy,
          comments: comments || 'Rejected',
        });
      }
    }

    return leave;
  }

  async update(id: number, data: any) {
    const updateData = { ...data };
    
    // Recalculate days if dates are updated
    if (data.startDate || data.endDate) {
      const leave = await this.prisma.leave.findUnique({ where: { id } });
      if (!leave) {
        throw new HttpException('Leave not found', HttpStatus.NOT_FOUND);
      }
      const startDate = data.startDate ? new Date(data.startDate) : leave.startDate;
      const endDate = data.endDate ? new Date(data.endDate) : leave.endDate;
      updateData.days = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    }

    return this.prisma.leave.update({
      where: { id },
      data: updateData,
      include: { employee: true },
    });
  }

  async remove(id: number) {
    return this.prisma.leave.delete({
      where: { id },
    });
  }
}
