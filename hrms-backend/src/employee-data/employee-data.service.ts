import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma.service';
import {
  CreateEducationDto,
  CreateExperienceDto,
  CreateCertificationDto,
  CreateEmployeeDocumentDto,
  CreateDependentDto,
  CreateDependentDocumentDto,
} from './dto/employee-data.dto';

@Injectable()
export class EmployeeDataService {
  constructor(private prisma: PrismaService) {}

  // ========== Education Services ==========
  async createEducation(createDto: CreateEducationDto) {
    await this.verifyEmployee(createDto.employeeId);
    return this.prisma.employeeEducation.create({
      data: {
        ...createDto,
        startDate: createDto.startDate ? new Date(createDto.startDate) : undefined,
        endDate: createDto.endDate ? new Date(createDto.endDate) : undefined,
      },
    });
  }

  async getEducationByEmployee(employeeId: number) {
    await this.verifyEmployee(employeeId);
    return this.prisma.employeeEducation.findMany({
      where: { employeeId },
      orderBy: { endDate: 'desc' },
    });
  }

  async deleteEducation(id: number) {
    return this.prisma.employeeEducation.delete({ where: { id } });
  }

  // ========== Experience Services ==========
  async createExperience(createDto: CreateExperienceDto) {
    await this.verifyEmployee(createDto.employeeId);
    return this.prisma.employeeExperience.create({
      data: {
        ...createDto,
        startDate: new Date(createDto.startDate),
        endDate: createDto.endDate ? new Date(createDto.endDate) : undefined,
      },
    });
  }

  async getExperienceByEmployee(employeeId: number) {
    await this.verifyEmployee(employeeId);
    return this.prisma.employeeExperience.findMany({
      where: { employeeId },
      orderBy: { startDate: 'desc' },
    });
  }

  async deleteExperience(id: number) {
    return this.prisma.employeeExperience.delete({ where: { id } });
  }

  // ========== Certification Services ==========
  async createCertification(createDto: CreateCertificationDto) {
    await this.verifyEmployee(createDto.employeeId);
    return this.prisma.employeeCertification.create({
      data: {
        ...createDto,
        issueDate: new Date(createDto.issueDate),
        expiryDate: createDto.expiryDate ? new Date(createDto.expiryDate) : undefined,
      },
    });
  }

  async getCertificationByEmployee(employeeId: number) {
    await this.verifyEmployee(employeeId);
    return this.prisma.employeeCertification.findMany({
      where: { employeeId },
      orderBy: { issueDate: 'desc' },
    });
  }

  async deleteCertification(id: number) {
    return this.prisma.employeeCertification.delete({ where: { id } });
  }

  // ========== Employee Document Services ==========
  async createDocument(createDto: CreateEmployeeDocumentDto) {
    await this.verifyEmployee(createDto.employeeId);
    return this.prisma.employeeDocument.create({
      data: {
        ...createDto,
        documentType: createDto.documentType as any,
        expiryDate: createDto.expiryDate ? new Date(createDto.expiryDate) : undefined,
        verifiedAt: createDto.verifiedAt ? new Date(createDto.verifiedAt) : undefined,
      },
    });
  }

  async getDocumentsByEmployee(employeeId: number) {
    await this.verifyEmployee(employeeId);
    return this.prisma.employeeDocument.findMany({
      where: { employeeId },
      orderBy: { uploadDate: 'desc' },
    });
  }

  async deleteDocument(id: number) {
    return this.prisma.employeeDocument.delete({ where: { id } });
  }

  // ========== Dependent Services ==========
  async createDependent(createDto: CreateDependentDto) {
    await this.verifyEmployee(createDto.employeeId);
    return this.prisma.employeeDependent.create({
      data: {
        ...createDto,
        relationship: createDto.relationship as any,
        gender: createDto.gender as any,
        dateOfBirth: createDto.dateOfBirth ? new Date(createDto.dateOfBirth) : undefined,
      },
    });
  }

  async getDependentsByEmployee(employeeId: number) {
    await this.verifyEmployee(employeeId);
    return this.prisma.employeeDependent.findMany({
      where: { employeeId },
      include: {
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteDependent(id: number) {
    return this.prisma.employeeDependent.delete({ where: { id } });
  }

  // ========== Dependent Document Services ==========
  async createDependentDocument(createDto: CreateDependentDocumentDto) {
    const dependent = await this.prisma.employeeDependent.findUnique({
      where: { id: createDto.dependentId },
    });
    if (!dependent) {
      throw new NotFoundException(`Dependent with ID ${createDto.dependentId} not found`);
    }

    return this.prisma.dependentDocument.create({
      data: {
        ...createDto,
        documentType: createDto.documentType as any,
        expiryDate: createDto.expiryDate ? new Date(createDto.expiryDate) : undefined,
      },
    });
  }

  async getDependentDocuments(dependentId: number) {
    return this.prisma.dependentDocument.findMany({
      where: { dependentId },
      orderBy: { uploadDate: 'desc' },
    });
  }

  async deleteDependentDocument(id: number) {
    return this.prisma.dependentDocument.delete({ where: { id } });
  }

  // ========== Helper Methods ==========
  private async verifyEmployee(employeeId: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }
    return employee;
  }
}
