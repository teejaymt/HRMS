import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../Prisma/prisma.service';
import {
  JobPostingStatus,
  ApplicantStatus,
  RecruitmentStage,
  InterviewType,
  InterviewStatus,
  InterviewMode,
  InterviewRecommendation,
} from '@prisma/client';

@Injectable()
export class RecruitmentService {
  constructor(private prisma: PrismaService) {}

  // ===== Job Postings =====

  // Create job posting
  async createJobPosting(data: {
    jobTitle: string;
    jobTitleArabic?: string;
    departmentId?: number;
    description: string;
    requirements: string;
    responsibilities?: string;
    experienceYears?: number;
    educationLevel?: string;
    salaryRangeMin?: number;
    salaryRangeMax?: number;
    benefits?: string;
    positionCount?: number;
    saudiRequired?: boolean;
    employmentType?: any;
    contractType?: any;
    postedBy: string;
  }) {
    return this.prisma.jobPosting.create({
      data: {
        jobTitle: data.jobTitle,
        jobTitleArabic: data.jobTitleArabic,
        position: data.jobTitle,
        description: data.description,
        requirements: data.requirements,
        responsibilities: data.responsibilities || '',
        salaryMin: data.salaryRangeMin,
        salaryMax: data.salaryRangeMax,
        benefits: data.benefits,
        employmentType: data.employmentType,
        contractType: data.contractType,
        status: JobPostingStatus.DRAFT,
        postedBy: data.postedBy,
        ...(data.departmentId && {
          department: {
            connect: { id: data.departmentId },
          },
        }),
      },
      include: {
        department: true,
      },
    });
  }

  // Get all job postings
  async getAllJobPostings(filters?: {
    status?: JobPostingStatus;
    departmentId?: number;
  }) {
    return this.prisma.jobPosting.findMany({
      where: filters,
      include: {
        department: true,
        _count: {
          select: { applicants: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get job posting by ID
  async getJobPostingById(id: number) {
    const posting = await this.prisma.jobPosting.findUnique({
      where: { id },
      include: {
        department: true,
        applicants: {
          include: {
            interviews: true,
          },
        },
      },
    });

    if (!posting) {
      throw new NotFoundException('Job posting not found');
    }

    return posting;
  }

  // Publish job posting
  async publishJobPosting(id: number) {
    return this.prisma.jobPosting.update({
      where: { id },
      data: {
        status: JobPostingStatus.PUBLISHED,
        publishedDate: new Date(),
      },
    });
  }

  // Close job posting
  async closeJobPosting(id: number) {
    return this.prisma.jobPosting.update({
      where: { id },
      data: {
        status: JobPostingStatus.CLOSED,
      },
    });
  }

  // ===== Applicants =====

  // Create applicant/application
  async createApplicant(data: {
    jobPostingId: number;
    firstName: string;
    lastName: string;
    firstNameArabic?: string;
    lastNameArabic?: string;
    email: string;
    phone: string;
    nationality?: string;
    isSaudi?: boolean;
    resumePath?: string;
    coverLetter?: string;
    portfolioUrl?: string;
    sourceChannel?: string;
    referredBy?: string;
  }) {
    return this.prisma.applicant.create({
      data: {
        ...data,
        status: ApplicantStatus.NEW,
        currentStage: RecruitmentStage.APPLICATION_REVIEW,
      },
      include: {
        jobPosting: true,
      },
    });
  }

  // Get all applicants
  async getAllApplicants(filters?: {
    jobPostingId?: number;
    status?: ApplicantStatus;
    currentStage?: RecruitmentStage;
  }) {
    return this.prisma.applicant.findMany({
      where: filters,
      include: {
        jobPosting: true,
        interviews: true,
      },
      orderBy: { appliedDate: 'desc' },
    });
  }

  // Get applicant by ID
  async getApplicantById(id: number) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id },
      include: {
        jobPosting: {
          include: {
            department: true,
          },
        },
        interviews: {
          orderBy: { scheduledDate: 'asc' },
        },
      },
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    return applicant;
  }

  // Update applicant status
  async updateApplicantStatus(id: number, status: ApplicantStatus, currentStage?: RecruitmentStage) {
    return this.prisma.applicant.update({
      where: { id },
      data: {
        status,
        ...(currentStage && { currentStage }),
      },
    });
  }

  // Shortlist applicant
  async shortlistApplicant(id: number) {
    return this.updateApplicantStatus(
      id,
      ApplicantStatus.SHORTLISTED,
      RecruitmentStage.PHONE_SCREENING
    );
  }

  // Reject applicant
  async rejectApplicant(id: number) {
    return this.updateApplicantStatus(id, ApplicantStatus.REJECTED);
  }

  // Score applicant
  async scoreApplicant(id: number, score: number, scoredBy: string) {
    if (score < 0 || score > 100) {
      throw new BadRequestException('Score must be between 0 and 100');
    }

    return this.prisma.applicant.update({
      where: { id },
      data: { score, scoredBy },
    });
  }

  // ===== Interviews =====

  // Schedule interview
  async scheduleInterview(data: {
    applicantId: number;
    interviewType: InterviewType;
    interviewMode?: InterviewMode;
    scheduledDate: Date;
    duration?: number;
    location?: string;
    meetingLink?: string;
    interviewers?: string;
  }) {
    const interview = await this.prisma.interview.create({
      data: {
        ...data,
        status: InterviewStatus.SCHEDULED,
      },
      include: {
        applicant: true,
      },
    });

    // Update applicant status
    await this.updateApplicantStatus(
      data.applicantId,
      ApplicantStatus.INTERVIEW_SCHEDULED
    );

    return interview;
  }

  // Get all interviews
  async getAllInterviews(filters?: {
    applicantId?: number;
    status?: InterviewStatus;
    interviewType?: InterviewType;
  }) {
    return this.prisma.interview.findMany({
      where: filters,
      include: {
        applicant: {
          include: {
            jobPosting: true,
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  // Get interview by ID
  async getInterviewById(id: number) {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        applicant: {
          include: {
            jobPosting: true,
          },
        },
      },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    return interview;
  }

  // Complete interview with feedback
  async completeInterview(id: number, data: {
    feedback?: string;
    rating?: number;
    recommendation?: InterviewRecommendation;
    technicalScore?: number;
    behavioralScore?: number;
    notes?: string;
    conductedBy?: string;
  }) {
    const interview = await this.prisma.interview.update({
      where: { id },
      data: {
        ...data,
        status: InterviewStatus.COMPLETED,
        completedAt: new Date(),
      },
      include: {
        applicant: true,
      },
    });

    // Update applicant status
    await this.updateApplicantStatus(
      interview.applicantId,
      ApplicantStatus.INTERVIEWED
    );

    return interview;
  }

  // Cancel interview
  async cancelInterview(id: number) {
    return this.prisma.interview.update({
      where: { id },
      data: { status: InterviewStatus.CANCELLED },
    });
  }

  // Reschedule interview
  async rescheduleInterview(id: number, scheduledDate: Date) {
    return this.prisma.interview.update({
      where: { id },
      data: {
        scheduledDate,
        status: InterviewStatus.RESCHEDULED,
      },
    });
  }

  // Extend offer to applicant
  async extendOffer(applicantId: number) {
    return this.updateApplicantStatus(
      applicantId,
      ApplicantStatus.OFFER_EXTENDED,
      RecruitmentStage.OFFER_EXTENDED
    );
  }

  // Mark offer as accepted
  async acceptOffer(applicantId: number, onboardingId?: number) {
    return this.prisma.applicant.update({
      where: { id: applicantId },
      data: {
        status: ApplicantStatus.OFFER_ACCEPTED,
        currentStage: RecruitmentStage.ONBOARDING_PREPARATION,
        ...(onboardingId && { onboardingId }),
      },
    });
  }

  // Mark offer as rejected
  async rejectOffer(applicantId: number) {
    return this.updateApplicantStatus(applicantId, ApplicantStatus.OFFER_REJECTED);
  }

  // Get recruitment dashboard stats
  async getRecruitmentStats() {
    const [
      openPositions,
      newApplicants,
      scheduledInterviews,
      offersPending,
    ] = await Promise.all([
      this.prisma.jobPosting.count({
        where: { status: JobPostingStatus.PUBLISHED },
      }),
      this.prisma.applicant.count({
        where: { status: ApplicantStatus.NEW },
      }),
      this.prisma.interview.count({
        where: { status: InterviewStatus.SCHEDULED },
      }),
      this.prisma.applicant.count({
        where: { status: ApplicantStatus.OFFER_EXTENDED },
      }),
    ]);

    return {
      openPositions,
      newApplicants,
      scheduledInterviews,
      offersPending,
    };
  }

  // Create applicants from Excel upload
  async createApplicantsFromExcel(data: any[]) {
    const results = {
      success: [] as any[],
      errors: [] as any[],
    };

    for (const row of data) {
      try {
        // Map Excel columns to applicant fields
        const applicantData = {
          jobPostingId: row['Job Posting ID'] ? parseInt(row['Job Posting ID']) : undefined,
          fullName: row['Full Name'] || row['fullName'],
          email: row['Email'] || row['email'],
          phone: row['Phone'] || row['phone'],
          nationality: row['Nationality'] || row['nationality'],
          currentLocation: row['Current Location'] || row['currentLocation'],
          yearsOfExperience: row['Years of Experience'] ? parseFloat(row['Years of Experience']) : undefined,
          currentJobTitle: row['Current Job Title'] || row['currentJobTitle'],
          currentCompany: row['Current Company'] || row['currentCompany'],
          currentSalary: row['Current Salary'] ? parseFloat(row['Current Salary']) : undefined,
          expectedSalary: row['Expected Salary'] ? parseFloat(row['Expected Salary']) : undefined,
          noticePeriodDays: row['Notice Period (Days)'] ? parseInt(row['Notice Period (Days)']) : undefined,
          education: row['Education'] || row['education'],
          skills: row['Skills'] || row['skills'],
          linkedinUrl: row['LinkedIn URL'] || row['linkedinUrl'],
          portfolioUrl: row['Portfolio URL'] || row['portfolioUrl'],
          status: ApplicantStatus.NEW,
          currentStage: RecruitmentStage.APPLICATION_REVIEW,
          source: row['Source'] || 'Excel Import',
        };

        const created = await this.createApplicant(applicantData as any);
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
