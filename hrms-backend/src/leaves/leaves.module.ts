import { Module } from '@nestjs/common';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { PrismaModule } from '../Prisma/prisma.module';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [PrismaModule, WorkflowsModule],
  controllers: [LeavesController],
  providers: [LeavesService],
})
export class LeavesModule {}
