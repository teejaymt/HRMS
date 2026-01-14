import { Module } from '@nestjs/common';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { PayrollAuditService } from './payroll-audit.service';
import { PrismaModule } from '../Prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PayrollController],
  providers: [PayrollService, PayrollAuditService],
  exports: [PayrollService, PayrollAuditService],
})
export class PayrollModule {}
