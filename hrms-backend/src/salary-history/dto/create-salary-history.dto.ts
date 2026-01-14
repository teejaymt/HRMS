import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum SalaryChangeType {
  INITIAL = 'INITIAL',
  PROMOTION = 'PROMOTION',
  ANNUAL_INCREMENT = 'ANNUAL_INCREMENT',
  PERFORMANCE_BONUS = 'PERFORMANCE_BONUS',
  COST_OF_LIVING = 'COST_OF_LIVING',
  ADJUSTMENT = 'ADJUSTMENT',
  DEMOTION = 'DEMOTION',
  CORRECTION = 'CORRECTION',
}

export class CreateSalaryHistoryDto {
  @IsNotEmpty()
  @IsNumber()
  employeeId: number;

  @IsNotEmpty()
  @IsDateString()
  effectiveDate: string;

  @IsOptional()
  @IsString()
  effectiveDateHijri?: string;

  @IsNotEmpty()
  @IsNumber()
  basicSalary: number;

  @IsOptional()
  @IsNumber()
  housingAllowance?: number;

  @IsOptional()
  @IsNumber()
  transportAllowance?: number;

  @IsOptional()
  @IsNumber()
  foodAllowance?: number;

  @IsOptional()
  @IsNumber()
  otherAllowances?: number;

  @IsNotEmpty()
  @IsNumber()
  totalSalary: number;

  @IsOptional()
  @IsNumber()
  gosiEmployerShare?: number;

  @IsOptional()
  @IsNumber()
  gosiEmployeeShare?: number;

  @IsOptional()
  @IsString()
  changeReason?: string;

  @IsOptional()
  @IsEnum(SalaryChangeType)
  changeType?: SalaryChangeType;

  @IsOptional()
  @IsNumber()
  previousSalary?: number;

  @IsOptional()
  @IsNumber()
  percentageIncrease?: number;

  @IsOptional()
  @IsString()
  changedBy?: string;

  @IsOptional()
  @IsString()
  approvedBy?: string;

  @IsOptional()
  @IsDateString()
  approvalDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
