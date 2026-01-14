import { Module } from '@nestjs/common';
import { AdvanceRequestController } from './advance-request.controller';
import { AdvanceRequestService } from './advance-request.service';
import { PrismaModule } from '../Prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdvanceRequestController],
  providers: [AdvanceRequestService],
  exports: [AdvanceRequestService],
})
export class AdvanceRequestModule {}
