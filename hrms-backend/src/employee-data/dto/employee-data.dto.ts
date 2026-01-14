import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';

// Education DTOs
export class CreateEducationDto {
  @IsNotEmpty()
  @IsNumber()
  employeeId: number;

  @IsNotEmpty()
  @IsString()
  degree: string;

  @IsNotEmpty()
  @IsString()
  fieldOfStudy: string;

  @IsNotEmpty()
  @IsString()
  institution: string;

  @IsOptional()
  @IsString()
  institutionArabic?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsBoolean()
  isHighest?: boolean;

  @IsOptional()
  @IsString()
  certificatePath?: string;
}

// Experience DTOs
export class CreateExperienceDto {
  @IsNotEmpty()
  @IsNumber()
  employeeId: number;

  @IsNotEmpty()
  @IsString()
  company: string;

  @IsOptional()
  @IsString()
  companyArabic?: string;

  @IsNotEmpty()
  @IsString()
  position: string;

  @IsOptional()
  @IsString()
  positionArabic?: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  responsibilities?: string;

  @IsOptional()
  @IsNumber()
  salary?: number;

  @IsOptional()
  @IsString()
  reasonForLeaving?: string;

  @IsOptional()
  @IsString()
  certificatePath?: string;
}

// Certification DTOs
export class CreateCertificationDto {
  @IsNotEmpty()
  @IsNumber()
  employeeId: number;

  @IsNotEmpty()
  @IsString()
  certificationName: string;

  @IsNotEmpty()
  @IsString()
  issuingOrganization: string;

  @IsNotEmpty()
  @IsDateString()
  issueDate: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  credentialId?: string;

  @IsOptional()
  @IsString()
  credentialUrl?: string;

  @IsOptional()
  @IsString()
  certificatePath?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// Document DTOs
export class CreateEmployeeDocumentDto {
  @IsNotEmpty()
  @IsNumber()
  employeeId: number;

  @IsNotEmpty()
  @IsString()
  documentType: string;

  @IsNotEmpty()
  @IsString()
  documentName: string;

  @IsNotEmpty()
  @IsString()
  documentPath: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  verifiedBy?: string;

  @IsOptional()
  @IsDateString()
  verifiedAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

// Dependent DTOs
export class CreateDependentDto {
  @IsNotEmpty()
  @IsNumber()
  employeeId: number;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  fullNameArabic?: string;

  @IsNotEmpty()
  @IsString()
  relationship: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  dateOfBirthHijri?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  iqamaNumber?: string;

  @IsOptional()
  @IsString()
  passportNumber?: string;

  @IsOptional()
  @IsBoolean()
  isOnSponsor?: boolean;

  @IsOptional()
  @IsBoolean()
  isInsured?: boolean;
}

// Dependent Document DTOs
export class CreateDependentDocumentDto {
  @IsNotEmpty()
  @IsNumber()
  dependentId: number;

  @IsNotEmpty()
  @IsString()
  documentType: string;

  @IsNotEmpty()
  @IsString()
  documentName: string;

  @IsNotEmpty()
  @IsString()
  documentPath: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
