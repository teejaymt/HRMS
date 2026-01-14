import { Module } from '@nestjs/common';
import { SalaryHistoryController } from './salary-history.controller';
import { SalaryHistoryService } from './salary-history.service';
import { PrismaModule } from '../Prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SalaryHistoryController],
  providers: [SalaryHistoryService],
  exports: [SalaryHistoryService],
})
export class SalaryHistoryModule {}
