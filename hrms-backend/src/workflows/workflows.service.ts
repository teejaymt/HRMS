import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma.service';
import { WorkflowStatus, WorkflowAction, Role } from '@prisma/client';

@Injectable()
export class WorkflowsService {
  constructor(private prisma: PrismaService) {}

  // Create a workflow definition
  async createDefinition(data: {
    name: string;
    description?: string;
    entityType: string;
    steps: any[];
    isActive?: boolean;
  }) {
    return this.prisma.workflowDefinition.create({
      data: {
        name: data.name,
        description: data.description,
        entityType: data.entityType,
        isActive: data.isActive ?? true,
        steps: {
          create: data.steps.map((step, index) => ({
            stepOrder: index + 1,
            stepName: step.stepName || step.name,
            approverRole: step.approverRole || step.role,
            requiresApproval: step.requiresApproval ?? true,
            isOptional: step.isOptional ?? false,
            conditionField: step.conditionField,
            conditionValue: step.conditionValue,
          })),
        },
      },
    });
  }

  // Get all workflow definitions
  async getAllDefinitions() {
    return this.prisma.workflowDefinition.findMany({
      where: { isActive: true },
      include: { steps: true },
    });
  }

  // Get workflow definition by ID
  async getDefinitionById(id: number) {
    const definition = await this.prisma.workflowDefinition.findUnique({
      where: { id },
      include: { steps: true },
    });
    
    if (!definition) {
      throw new NotFoundException('Workflow definition not found');
    }
    
    return definition;
  }

  // Initiate a workflow instance
  async initiateWorkflow(data: {
    workflowId: number;
    entityType: string;
    entityId: number;
    initiatedBy: string;
  }) {
    const definition = await this.getDefinitionById(data.workflowId);

    const instance = await this.prisma.workflowInstance.create({
      data: {
        workflowDefinitionId: data.workflowId,
        entityType: data.entityType,
        entityId: data.entityId,
        currentStep: 0,
        status: WorkflowStatus.IN_PROGRESS,
        initiatedBy: data.initiatedBy,
      },
    });

    // Create initial history entry
    await this.prisma.workflowHistory.create({
      data: {
        workflowInstanceId: instance.id,
        stepOrder: 0,
        stepName: 'Initiated',
        action: 'PENDING',
        actionBy: data.initiatedBy,
        comments: `Workflow initiated for ${data.entityType} ${data.entityId}`,
      },
    });

    return instance;
  }

  // Approve a workflow step
  async approveStep(data: {
    instanceId: number;
    actorEmail: string;
    actorRole?: Role;
    comments?: string;
  }) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: data.instanceId },
      include: { workflowDefinition: { include: { steps: true } } },
    });

    if (!instance) {
      throw new NotFoundException('Workflow instance not found');
    }

    if (instance.status !== WorkflowStatus.IN_PROGRESS) {
      throw new HttpException('Workflow is not in progress', HttpStatus.BAD_REQUEST);
    }

    const steps = instance.workflowDefinition.steps;
    const nextStep = instance.currentStep + 1;

    // Create history entry
    await this.prisma.workflowHistory.create({
      data: {
        workflowInstanceId: instance.id,
        stepOrder: nextStep,
        stepName: steps[nextStep - 1]?.stepName || `Step ${nextStep}`,
        action: 'APPROVED',
        actionBy: data.actorEmail,
        comments: data.comments,
      },
    });

    // Check if workflow is complete
    if (nextStep >= steps.length) {
      return this.prisma.workflowInstance.update({
        where: { id: instance.id },
        data: {
          currentStep: nextStep,
          status: WorkflowStatus.APPROVED,
          completedAt: new Date(),
        },
      });
    }

    // Move to next step
    return this.prisma.workflowInstance.update({
      where: { id: instance.id },
      data: {
        currentStep: nextStep,
      },
    });
  }

  // Reject a workflow
  async rejectWorkflow(data: {
    instanceId: number;
    actorEmail: string;
    actorRole?: Role;
    comments: string;
  }) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: data.instanceId },
    });

    if (!instance) {
      throw new NotFoundException('Workflow instance not found');
    }

    // Create history entry
    await this.prisma.workflowHistory.create({
      data: {
        workflowInstanceId: instance.id,
        stepOrder: instance.currentStep,
        stepName: `Step ${instance.currentStep}`,
        action: 'REJECTED',
        actionBy: data.actorEmail,
        comments: data.comments,
      },
    });

    // Update instance status
    return this.prisma.workflowInstance.update({
      where: { id: instance.id },
      data: {
        status: WorkflowStatus.REJECTED,
        completedAt: new Date(),
      },
    });
  }

  // Get workflow instance with history
  async getInstanceById(id: number) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id },
      include: {
        workflowDefinition: { include: { steps: true } },
        history: {
          orderBy: { actionAt: 'asc' },
        },
      },
    });

    if (!instance) {
      throw new NotFoundException('Workflow instance not found');
    }

    return instance;
  }

  // Get all instances for an entity
  async getInstancesByEntity(entityType: string, entityId: number) {
    return this.prisma.workflowInstance.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        workflowDefinition: { include: { steps: true } },
        history: {
          orderBy: { actionAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get pending approvals for a user
  async getPendingApprovals(userEmail: string, userRole?: Role) {
    // This is a simplified version - in production, you'd match against step approver requirements
    const instances = await this.prisma.workflowInstance.findMany({
      where: {
        status: WorkflowStatus.IN_PROGRESS,
      },
      include: {
        workflowDefinition: { include: { steps: true } },
        history: true,
      },
    });

    return instances.filter(instance => {
      const steps = instance.workflowDefinition.steps;
      const currentStep = steps[instance.currentStep];
      
      // Check if user role matches required approver role
      if (userRole && currentStep?.approverRole === userRole) {
        return true;
      }
      
      return false;
    });
  }
}
