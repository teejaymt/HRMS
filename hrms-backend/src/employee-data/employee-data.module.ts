import { Module } from '@nestjs/common';
import { EmployeeDataController } from './employee-data.controller';
import { EmployeeDataService } from './employee-data.service';
import { PrismaModule } from '../Prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EmployeeDataController],
  providers: [EmployeeDataService],
  exports: [EmployeeDataService],
})
export class EmployeeDataModule {}
