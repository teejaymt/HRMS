import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './Prisma/prisma.module';
import { EmployeesModule } from './employees/employees.module';
import { DepartmentsModule } from './departments/departments.module';
import { LeavesModule } from './leaves/leaves.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PayrollModule } from './payroll/payroll.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { AdvanceRequestModule } from './advance-request/advance-request.module';
import { TicketRequestModule } from './ticket-request/ticket-request.module';
import { BiometricModule } from './biometric/biometric.module';
import { RecruitmentModule } from './recruitment/recruitment.module';
import { ErpModule } from './erp/erp.module';
import { SalaryHistoryModule } from './salary-history/salary-history.module';
import { EmployeeDataModule } from './employee-data/employee-data.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    EmployeesModule,
    DepartmentsModule,
    LeavesModule,
    AttendanceModule,
    PayrollModule,
    OnboardingModule,
    WorkflowsModule,
    AdvanceRequestModule,
    TicketRequestModule,
    BiometricModule,
    RecruitmentModule,
    ErpModule,
    SalaryHistoryModule,
    EmployeeDataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
