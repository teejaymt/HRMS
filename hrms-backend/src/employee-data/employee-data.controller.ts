import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { EmployeeDataService } from './employee-data.service';
import {
  CreateEducationDto,
  CreateExperienceDto,
  CreateCertificationDto,
  CreateEmployeeDocumentDto,
  CreateDependentDto,
  CreateDependentDocumentDto,
} from './dto/employee-data.dto';

@Controller('employee-data')
export class EmployeeDataController {
  constructor(private readonly employeeDataService: EmployeeDataService) {}

  // ========== Education Endpoints ==========
  @Post('education')
  createEducation(@Body() createDto: CreateEducationDto) {
    return this.employeeDataService.createEducation(createDto);
  }

  @Get('education/employee/:employeeId')
  getEducationByEmployee(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.employeeDataService.getEducationByEmployee(employeeId);
  }

  @Delete('education/:id')
  deleteEducation(@Param('id', ParseIntPipe) id: number) {
    return this.employeeDataService.deleteEducation(id);
  }

  // ========== Experience Endpoints ==========
  @Post('experience')
  createExperience(@Body() createDto: CreateExperienceDto) {
    return this.employeeDataService.createExperience(createDto);
  }

  @Get('experience/employee/:employeeId')
  getExperienceByEmployee(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.employeeDataService.getExperienceByEmployee(employeeId);
  }

  @Delete('experience/:id')
  deleteExperience(@Param('id', ParseIntPipe) id: number) {
    return this.employeeDataService.deleteExperience(id);
  }

  // ========== Certification Endpoints ==========
  @Post('certification')
  createCertification(@Body() createDto: CreateCertificationDto) {
    return this.employeeDataService.createCertification(createDto);
  }

  @Get('certification/employee/:employeeId')
  getCertificationByEmployee(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.employeeDataService.getCertificationByEmployee(employeeId);
  }

  @Delete('certification/:id')
  deleteCertification(@Param('id', ParseIntPipe) id: number) {
    return this.employeeDataService.deleteCertification(id);
  }

  // ========== Employee Document Endpoints ==========
  @Post('documents')
  createDocument(@Body() createDto: CreateEmployeeDocumentDto) {
    return this.employeeDataService.createDocument(createDto);
  }

  @Get('documents/employee/:employeeId')
  getDocumentsByEmployee(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.employeeDataService.getDocumentsByEmployee(employeeId);
  }

  @Delete('documents/:id')
  deleteDocument(@Param('id', ParseIntPipe) id: number) {
    return this.employeeDataService.deleteDocument(id);
  }

  // ========== Dependent Endpoints ==========
  @Post('dependents')
  createDependent(@Body() createDto: CreateDependentDto) {
    return this.employeeDataService.createDependent(createDto);
  }

  @Get('dependents/employee/:employeeId')
  getDependentsByEmployee(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.employeeDataService.getDependentsByEmployee(employeeId);
  }

  @Delete('dependents/:id')
  deleteDependent(@Param('id', ParseIntPipe) id: number) {
    return this.employeeDataService.deleteDependent(id);
  }

  // ========== Dependent Document Endpoints ==========
  @Post('dependent-documents')
  createDependentDocument(@Body() createDto: CreateDependentDocumentDto) {
    return this.employeeDataService.createDependentDocument(createDto);
  }

  @Get('dependent-documents/:dependentId')
  getDependentDocuments(@Param('dependentId', ParseIntPipe) dependentId: number) {
    return this.employeeDataService.getDependentDocuments(dependentId);
  }

  @Delete('dependent-documents/:id')
  deleteDependentDocument(@Param('id', ParseIntPipe) id: number) {
    return this.employeeDataService.deleteDependentDocument(id);
  }
}
