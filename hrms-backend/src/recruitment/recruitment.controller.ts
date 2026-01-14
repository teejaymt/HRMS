import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
  Patch,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RecruitmentService } from './recruitment.service';
import {
  JobPostingStatus,
  ApplicantStatus,
  RecruitmentStage,
  InterviewType,
  InterviewStatus,
  InterviewMode,
  InterviewRecommendation,
} from '@prisma/client';
import * as XLSX from 'xlsx';

@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  // ===== Job Postings =====

  @Post('job-postings')
  createJobPosting(@Body() body: any) {
    return this.recruitmentService.createJobPosting(body);
  }

  @Get('job-postings')
  getAllJobPostings(
    @Query('status') status?: JobPostingStatus,
    @Query('departmentId') departmentId?: string
  ) {
    return this.recruitmentService.getAllJobPostings({
      ...(status && { status }),
      ...(departmentId && { departmentId: parseInt(departmentId) }),
    });
  }

  @Get('job-postings/:id')
  getJobPostingById(@Param('id', ParseIntPipe) id: number) {
    return this.recruitmentService.getJobPostingById(id);
  }

  @Post('job-postings/:id/publish')
  publishJobPosting(@Param('id', ParseIntPipe) id: number) {
    return this.recruitmentService.publishJobPosting(id);
  }

  @Post('job-postings/:id/close')
  closeJobPosting(@Param('id', ParseIntPipe) id: number) {
    return this.recruitmentService.closeJobPosting(id);
  }

  // ===== Applicants =====

  @Post('applicants')
  createApplicant(@Body() body: any) {
    return this.recruitmentService.createApplicant(body);
  }

  @Post('applicants/upload-excel')
  @UseInterceptors(FileInterceptor('file'))
  async uploadApplicantsExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      throw new BadRequestException('Only Excel files are allowed');
    }

    try {
      // Parse Excel file
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        throw new BadRequestException('Excel file is empty');
      }

      // Process the data
      const results = await this.recruitmentService.createApplicantsFromExcel(data);
      
      return {
        success: true,
        totalRecords: data.length,
        processed: results.success.length,
        errors: results.errors.length,
        details: results,
      };
    } catch (error: any) {
      throw new BadRequestException(`Error processing Excel file: ${error.message}`);
    }
  }

  @Get('applicants')
  getAllApplicants(
    @Query('jobPostingId') jobPostingId?: string,
    @Query('status') status?: ApplicantStatus,
    @Query('currentStage') currentStage?: RecruitmentStage
  ) {
    return this.recruitmentService.getAllApplicants({
      ...(jobPostingId && { jobPostingId: parseInt(jobPostingId) }),
      ...(status && { status }),
      ...(currentStage && { currentStage }),
    });
  }

  @Get('applicants/:id')
  getApplicantById(@Param('id', ParseIntPipe) id: number) {
    return this.recruitmentService.getApplicantById(id);
  }

  @Patch('applicants/:id/status')
  updateApplicantStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: ApplicantStatus; currentStage?: RecruitmentStage }
  ) {
    return this.recruitmentService.updateApplicantStatus(
      id,
      body.status,
      body.currentStage
    );
  }

  @Post('applicants/:id/shortlist')
  shortlistApplicant(@Param('id', ParseIntPipe) id: number) {
    return this.recruitmentService.shortlistApplicant(id);
  }

  @Post('applicants/:id/reject')
  rejectApplicant(@Param('id', ParseIntPipe) id: number) {
    return this.recruitmentService.rejectApplicant(id);
  }

  @Post('applicants/:id/score')
  scoreApplicant(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { score: number; scoredBy: string }
  ) {
    return this.recruitmentService.scoreApplicant(id, body.score, body.scoredBy);
  }

  @Post('applicants/:id/extend-offer')
  extendOffer(@Param('id', ParseIntPipe) id: number) {
    return this.recruitmentService.extendOffer(id);
  }

  @Post('applicants/:id/accept-offer')
  acceptOffer(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { onboardingId?: number }
  ) {
    return this.recruitmentService.acceptOffer(id, body.onboardingId);
  }

  @Post('applicants/:id/reject-offer')
  rejectOffer(@Param('id', ParseIntPipe) id: number) {
    return this.recruitmentService.rejectOffer(id);
  }

  // ===== Interviews =====

  @Post('interviews')
  scheduleInterview(@Body() body: {
    applicantId: number;
    interviewType: InterviewType;
    interviewMode?: InterviewMode;
    scheduledDate: string;
    duration?: number;
    location?: string;
    meetingLink?: string;
    interviewers?: string;
  }) {
    return this.recruitmentService.scheduleInterview({
      ...body,
      scheduledDate: new Date(body.scheduledDate),
    });
  }

  @Get('interviews')
  getAllInterviews(
    @Query('applicantId') applicantId?: string,
    @Query('status') status?: InterviewStatus,
    @Query('interviewType') interviewType?: InterviewType
  ) {
    return this.recruitmentService.getAllInterviews({
      ...(applicantId && { applicantId: parseInt(applicantId) }),
      ...(status && { status }),
      ...(interviewType && { interviewType }),
    });
  }

  @Get('interviews/:id')
  getInterviewById(@Param('id', ParseIntPipe) id: number) {
    return this.recruitmentService.getInterviewById(id);
  }

  @Post('interviews/:id/complete')
  completeInterview(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      feedback?: string;
      rating?: number;
      recommendation?: InterviewRecommendation;
      technicalScore?: number;
      behavioralScore?: number;
      notes?: string;
      conductedBy?: string;
    }
  ) {
    return this.recruitmentService.completeInterview(id, body);
  }

  @Post('interviews/:id/cancel')
  cancelInterview(@Param('id', ParseIntPipe) id: number) {
    return this.recruitmentService.cancelInterview(id);
  }

  @Post('interviews/:id/reschedule')
  rescheduleInterview(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { scheduledDate: string }
  ) {
    return this.recruitmentService.rescheduleInterview(
      id,
      new Date(body.scheduledDate)
    );
  }

  // ===== Dashboard Stats =====

  @Get('stats/dashboard')
  getRecruitmentStats() {
    return this.recruitmentService.getRecruitmentStats();
  }
}
