import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma.service';

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const { experiences, education, certificates, ...onboardingData } = data;

    return this.prisma.onboarding.create({
      data: {
        ...onboardingData,
        experiences: experiences ? { create: experiences } : undefined,
        education: education ? { create: education } : undefined,
        certificates: certificates ? { create: certificates } : undefined,
      },
      include: {
        experiences: true,
        education: true,
        certificates: true,
      },
    });
  }

  async findAll(filters?: { status?: string }) {
    return this.prisma.onboarding.findMany({
      where: filters ? { status: filters.status as any } : undefined,
      include: {
        experiences: true,
        education: true,
        certificates: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.onboarding.findUnique({
      where: { id },
      include: {
        experiences: true,
        education: true,
        certificates: true,
      },
    });
  }

  async update(id: number, data: any) {
    const { experiences, education, certificates, ...onboardingData } = data;

    // Delete existing related records if updating
    if (experiences !== undefined) {
      await this.prisma.onboardingExperience.deleteMany({
        where: { onboardingId: id },
      });
    }
    if (education !== undefined) {
      await this.prisma.onboardingEducation.deleteMany({
        where: { onboardingId: id },
      });
    }
    if (certificates !== undefined) {
      await this.prisma.onboardingCertificate.deleteMany({
        where: { onboardingId: id },
      });
    }

    return this.prisma.onboarding.update({
      where: { id },
      data: {
        ...onboardingData,
        experiences: experiences ? { create: experiences } : undefined,
        education: education ? { create: education } : undefined,
        certificates: certificates ? { create: certificates } : undefined,
      },
      include: {
        experiences: true,
        education: true,
        certificates: true,
      },
    });
  }

  async delete(id: number) {
    return this.prisma.onboarding.delete({
      where: { id },
    });
  }

  async completeOnboarding(id: number, completedBy: string) {
    // Get onboarding data with all related information
    const onboarding = await this.findOne(id);

    if (!onboarding) {
      throw new Error('Onboarding record not found');
    }

    if (onboarding.status === 'COMPLETED') {
      throw new Error('Onboarding already completed');
    }

    // Generate unique employee code
    const employeeCount = await this.prisma.employee.count();
    const employeeCode = `EMP${String(employeeCount + 1).padStart(4, '0')}`;

    // Create employee record
    const employee = await this.prisma.employee.create({
      data: {
        employeeCode,
        firstName: onboarding.firstName,
        lastName: onboarding.lastName,
        firstNameArabic: onboarding.firstNameArabic,
        lastNameArabic: onboarding.lastNameArabic,
        email: onboarding.email,
        phone: onboarding.phone,
        dateOfBirth: onboarding.dateOfBirth,
        gender: onboarding.gender as any,
        nationality: onboarding.nationality,
        isSaudi: onboarding.isSaudi,
        saudiId: onboarding.nationalId,
        iqamaNumber: onboarding.iqamaNumber,
        iqamaExpiryDate: onboarding.iqamaExpiry,
        passportNumber: onboarding.passportNumber,
        passportExpiry: onboarding.passportExpiry,
        address: onboarding.address,
        city: onboarding.city,
        zipCode: onboarding.postalCode,
        emergencyContact: onboarding.emergencyContactName,
        emergencyPhone: onboarding.emergencyContactPhone,
        emergencyRelation: onboarding.emergencyContactRelation,
        departmentId: onboarding.departmentId,
        position: onboarding.position || 'Staff',
        contractType: onboarding.contractType as any || 'UNLIMITED',
        joinDate: onboarding.joiningDate || new Date(),
        basicSalary: onboarding.basicSalary || 0,
        housingAllowance: onboarding.housingAllowance || 0,
        transportAllowance: onboarding.transportAllowance || 0,
        foodAllowance: onboarding.foodAllowance || 0,
        totalSalary:
          (onboarding.basicSalary || 0) +
          (onboarding.housingAllowance || 0) +
          (onboarding.transportAllowance || 0) +
          (onboarding.foodAllowance || 0),
        bankName: onboarding.bankName,
        bankAccountNumber: onboarding.bankAccountNumber,
        ibanNumber: onboarding.iban,
        status: 'ACTIVE',
        gosiContribution: false,
        gosiNumber: null,
        annualLeaveDays: 21, // Default Saudi labor law
        sickLeaveDays: 30,
        workingHoursPerDay: 8,
      },
    });

    // Note: Experience, Education, and Certificates from onboarding
    // are kept in the onboarding record for reference
    // To add them to Employee, we would need to create corresponding Employee tables

    // Update department counts if department is assigned
    if (onboarding.departmentId) {
      const dept = await this.prisma.department.findUnique({
        where: { id: onboarding.departmentId },
      });
      if (dept) {
        await this.prisma.department.update({
          where: { id: onboarding.departmentId },
          data: {
            saudiCount: onboarding.isSaudi
              ? dept.saudiCount + 1
              : dept.saudiCount,
            nonSaudiCount: !onboarding.isSaudi
              ? dept.nonSaudiCount + 1
              : dept.nonSaudiCount,
          },
        });
      }
    }

    // Update onboarding status
    const updatedOnboarding = await this.prisma.onboarding.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedBy,
        completedAt: new Date(),
        employeeId: employee.id,
      },
      include: {
        experiences: true,
        education: true,
        certificates: true,
      },
    });

    return {
      onboarding: updatedOnboarding,
      employee,
    };
  }

  async createFromExcel(data: any[]) {
    const results = {
      success: [] as any[],
      errors: [] as any[],
    };

    for (const row of data) {
      try {
        // Map Excel columns to onboarding fields
        const onboardingData = {
          // Personal Information
          firstName: row['First Name'] || row['firstName'],
          lastName: row['Last Name'] || row['lastName'],
          firstNameArabic: row['First Name (Arabic)'] || row['firstNameArabic'],
          lastNameArabic: row['Last Name (Arabic)'] || row['lastNameArabic'],
          email: row['Email'] || row['email'],
          phone: row['Phone'] || row['phone'],
          dateOfBirth: row['Date of Birth'] ? new Date(row['Date of Birth']) : undefined,
          gender: row['Gender'] || row['gender'],
          nationality: row['Nationality'] || row['nationality'],
          isSaudi: row['Is Saudi'] === 'Yes' || row['isSaudi'] === true,
          
          // ID Information
          nationalId: row['National ID / Saudi ID'] || row['nationalId'],
          iqamaNumber: row['Iqama Number'] || row['iqamaNumber'],
          iqamaExpiry: row['Iqama Expiry'] ? new Date(row['Iqama Expiry']) : undefined,
          passportNumber: row['Passport Number'] || row['passportNumber'],
          passportExpiry: row['Passport Expiry'] ? new Date(row['Passport Expiry']) : undefined,
          
          // Address
          address: row['Address'] || row['address'],
          city: row['City'] || row['city'],
          postalCode: row['Postal Code'] || row['postalCode'],
          
          // Emergency Contact
          emergencyContactName: row['Emergency Contact Name'] || row['emergencyContactName'],
          emergencyContactPhone: row['Emergency Contact Phone'] || row['emergencyContactPhone'],
          emergencyContactRelation: row['Emergency Contact Relation'] || row['emergencyContactRelation'],
          
          // Employment
          departmentId: row['Department ID'] ? parseInt(row['Department ID']) : undefined,
          position: row['Position'] || row['position'],
          contractType: row['Contract Type'] || row['contractType'] || 'UNLIMITED',
          joiningDate: row['Joining Date'] ? new Date(row['Joining Date']) : new Date(),
          
          // Salary
          basicSalary: row['Basic Salary'] ? parseFloat(row['Basic Salary']) : 0,
          housingAllowance: row['Housing Allowance'] ? parseFloat(row['Housing Allowance']) : 0,
          transportAllowance: row['Transport Allowance'] ? parseFloat(row['Transport Allowance']) : 0,
          foodAllowance: row['Food Allowance'] ? parseFloat(row['Food Allowance']) : 0,
          
          // Bank Details
          bankName: row['Bank Name'] || row['bankName'],
          bankAccountNumber: row['Bank Account Number'] || row['bankAccountNumber'],
          iban: row['IBAN'] || row['iban'],
          
          // Skills
          skills: row['Skills'] || row['skills'],
          
          status: 'PENDING',
        };

        // Parse education, experience, and certifications if provided in separate columns
        const education: any[] = [];
        const experiences: any[] = [];
        const certificates: any[] = [];

        // Education (expecting columns like "Education 1 - Degree", "Education 1 - Institution", etc.)
        for (let i = 1; i <= 5; i++) {
          const degree = row[`Education ${i} - Degree`];
          const institution = row[`Education ${i} - Institution`];
          if (degree && institution) {
            education.push({
              degree,
              institution,
              fieldOfStudy: row[`Education ${i} - Field`] || '',
              startDate: row[`Education ${i} - Start Date`] ? new Date(row[`Education ${i} - Start Date`]) : undefined,
              endDate: row[`Education ${i} - End Date`] ? new Date(row[`Education ${i} - End Date`]) : undefined,
              grade: row[`Education ${i} - Grade`],
            });
          }
        }

        // Experience (expecting columns like "Experience 1 - Company", "Experience 1 - Position", etc.)
        for (let i = 1; i <= 5; i++) {
          const company = row[`Experience ${i} - Company`];
          const position = row[`Experience ${i} - Position`];
          if (company && position) {
            experiences.push({
              company,
              position,
              startDate: row[`Experience ${i} - Start Date`] ? new Date(row[`Experience ${i} - Start Date`]) : new Date(),
              endDate: row[`Experience ${i} - End Date`] ? new Date(row[`Experience ${i} - End Date`]) : undefined,
              description: row[`Experience ${i} - Description`] || '',
            });
          }
        }

        // Certifications (expecting columns like "Certification 1 - Name", "Certification 1 - Issuer", etc.)
        for (let i = 1; i <= 5; i++) {
          const name = row[`Certification ${i} - Name`];
          const issuer = row[`Certification ${i} - Issuer`];
          if (name && issuer) {
            certificates.push({
              name,
              issuer,
              issueDate: row[`Certification ${i} - Issue Date`] ? new Date(row[`Certification ${i} - Issue Date`]) : new Date(),
              expiryDate: row[`Certification ${i} - Expiry Date`] ? new Date(row[`Certification ${i} - Expiry Date`]) : undefined,
            });
          }
        }

        const created = await this.create({
          ...onboardingData,
          experiences: experiences.length > 0 ? experiences : undefined,
          education: education.length > 0 ? education : undefined,
          certificates: certificates.length > 0 ? certificates : undefined,
        });

        results.success.push(created);
      } catch (error: any) {
        results.errors.push({
          row,
          error: error.message,
        });
      }
    }

    return results;
  }
}
