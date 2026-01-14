import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { Role } from '@prisma/client';

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  // Create workflow definition
  @Post('definitions')
  createDefinition(@Body() body: {
    name: string;
    description?: string;
    entityType: string;
    steps: any[];
    isActive?: boolean;
  }) {
    return this.workflowsService.createDefinition(body);
  }

  // Get all workflow definitions
  @Get('definitions')
  getAllDefinitions() {
    return this.workflowsService.getAllDefinitions();
  }

  // Get workflow definition by ID
  @Get('definitions/:id')
  getDefinitionById(@Param('id', ParseIntPipe) id: number) {
    return this.workflowsService.getDefinitionById(id);
  }

  // Initiate a workflow
  @Post('instances')
  initiateWorkflow(@Body() body: {
    workflowId: number;
    entityType: string;
    entityId: number;
    initiatedBy: string;
  }) {
    return this.workflowsService.initiateWorkflow(body);
  }

  // Approve a workflow step
  @Post('instances/:id/approve')
  approveStep(
    @Param('id', ParseIntPipe) instanceId: number,
    @Body() body: {
      actorEmail: string;
      actorRole?: Role;
      comments?: string;
    }
  ) {
    return this.workflowsService.approveStep({
      instanceId,
      ...body,
    });
  }

  // Reject a workflow
  @Post('instances/:id/reject')
  rejectWorkflow(
    @Param('id', ParseIntPipe) instanceId: number,
    @Body() body: {
      actorEmail: string;
      actorRole?: Role;
      comments: string;
    }
  ) {
    return this.workflowsService.rejectWorkflow({
      instanceId,
      ...body,
    });
  }

  // Get workflow instance by ID
  @Get('instances/:id')
  getInstanceById(@Param('id', ParseIntPipe) id: number) {
    return this.workflowsService.getInstanceById(id);
  }

  // Get instances by entity
  @Get('instances/entity/:entityType/:entityId')
  getInstancesByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseIntPipe) entityId: number
  ) {
    return this.workflowsService.getInstancesByEntity(entityType, entityId);
  }

  // Get pending approvals for a user
  @Get('pending-approvals')
  getPendingApprovals(
    @Query('userEmail') userEmail: string,
    @Query('userRole') userRole?: Role
  ) {
    return this.workflowsService.getPendingApprovals(userEmail, userRole);
  }
}
