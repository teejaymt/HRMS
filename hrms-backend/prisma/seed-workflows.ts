import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: 'file:./dev.db',
});

const prisma = new PrismaClient({
  adapter,
});

async function seedWorkflowDefinitions() {
  console.log('🔄 Seeding workflow definitions...');

  // Leave Approval Workflow
  const leaveWorkflow = await prisma.workflowDefinition.upsert({
    where: { name: 'Leave Approval - Standard' },
    update: {},
    create: {
      name: 'Leave Approval - Standard',
      description: 'Standard leave approval workflow: Manager → HR',
      entityType: 'LEAVE',
      isActive: true,
      steps: {
        create: [
          {
            stepOrder: 1,
            stepName: 'Manager Approval',
            approverRole: 'MANAGER',
            requiresApproval: true,
            isOptional: false,
          },
          {
            stepOrder: 2,
            stepName: 'HR Approval',
            approverRole: 'HR',
            requiresApproval: true,
            isOptional: false,
          },
        ],
      },
    },
  });
  console.log('✅ Created Leave Approval Workflow');

  // Leave Approval - Extended (for >7 days)
  const leaveExtendedWorkflow = await prisma.workflowDefinition.upsert({
    where: { name: 'Leave Approval - Extended' },
    update: {},
    create: {
      name: 'Leave Approval - Extended',
      description: 'Extended leave approval for >7 days: Manager → Dept Head → HR',
      entityType: 'LEAVE',
      isActive: false, // Can be activated when needed
      steps: {
        create: [
          {
            stepOrder: 1,
            stepName: 'Manager Approval',
            approverRole: 'MANAGER',
            requiresApproval: true,
            isOptional: false,
            conditionField: 'days',
            conditionValue: '>7',
          },
          {
            stepOrder: 2,
            stepName: 'Department Head Approval',
            approverRole: 'MANAGER',
            requiresApproval: true,
            isOptional: false,
          },
          {
            stepOrder: 3,
            stepName: 'HR Final Approval',
            approverRole: 'HR',
            requiresApproval: true,
            isOptional: false,
          },
        ],
      },
    },
  });
  console.log('✅ Created Extended Leave Approval Workflow');

  // Advance Request Workflow
  const advanceWorkflow = await prisma.workflowDefinition.upsert({
    where: { name: 'Advance Request - Standard' },
    update: {},
    create: {
      name: 'Advance Request - Standard',
      description: 'Salary advance approval: Manager → HR → Finance',
      entityType: 'ADVANCE',
      isActive: true,
      steps: {
        create: [
          {
            stepOrder: 1,
            stepName: 'Manager Approval',
            approverRole: 'MANAGER',
            requiresApproval: true,
            isOptional: false,
          },
          {
            stepOrder: 2,
            stepName: 'HR Review',
            approverRole: 'HR',
            requiresApproval: true,
            isOptional: false,
          },
          {
            stepOrder: 3,
            stepName: 'Finance Approval',
            approverRole: 'ADMIN',
            requiresApproval: true,
            isOptional: false,
          },
        ],
      },
    },
  });
  console.log('✅ Created Advance Request Workflow');

  // Ticket Request Workflow
  const ticketWorkflow = await prisma.workflowDefinition.upsert({
    where: { name: 'Air Ticket Request - Standard' },
    update: {},
    create: {
      name: 'Air Ticket Request - Standard',
      description: 'Air ticket approval: Manager → HR',
      entityType: 'TICKET',
      isActive: true,
      steps: {
        create: [
          {
            stepOrder: 1,
            stepName: 'Manager Approval',
            approverRole: 'MANAGER',
            requiresApproval: true,
            isOptional: false,
          },
          {
            stepOrder: 2,
            stepName: 'HR Final Approval',
            approverRole: 'HR',
            requiresApproval: true,
            isOptional: false,
          },
        ],
      },
    },
  });
  console.log('✅ Created Air Ticket Request Workflow');

  // Payroll Approval Workflow
  const payrollWorkflow = await prisma.workflowDefinition.upsert({
    where: { name: 'Payroll Processing - Monthly' },
    update: {},
    create: {
      name: 'Payroll Processing - Monthly',
      description: 'Monthly payroll approval: HR → Finance → Admin',
      entityType: 'PAYROLL',
      isActive: true,
      steps: {
        create: [
          {
            stepOrder: 1,
            stepName: 'HR Review',
            approverRole: 'HR',
            requiresApproval: true,
            isOptional: false,
          },
          {
            stepOrder: 2,
            stepName: 'Finance Verification',
            approverRole: 'ADMIN',
            requiresApproval: true,
            isOptional: false,
          },
          {
            stepOrder: 3,
            stepName: 'Final Authorization',
            approverRole: 'ADMIN',
            requiresApproval: true,
            isOptional: false,
          },
        ],
      },
    },
  });
  console.log('✅ Created Payroll Processing Workflow');

  console.log('✅ All workflow definitions seeded successfully!');
}

async function main() {
  try {
    await seedWorkflowDefinitions();
  } catch (error) {
    console.error('❌ Error seeding workflows:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
