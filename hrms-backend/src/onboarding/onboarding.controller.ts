import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OnboardingService } from './onboarding.service';
import * as XLSX from 'xlsx';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  create(@Body() data: any) {
    return this.onboardingService.create(data);
  }

  @Post('upload-excel')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(@UploadedFile() file: Express.Multer.File) {
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
      const results = await this.onboardingService.createFromExcel(data);
      
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

  @Get()
  findAll(@Query('status') status?: string) {
    const filters = status ? { status } : undefined;
    return this.onboardingService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.onboardingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.onboardingService.update(+id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.onboardingService.delete(+id);
  }

  @Post(':id/complete')
  completeOnboarding(
    @Param('id') id: string,
    @Body('completedBy') completedBy: string,
  ) {
    return this.onboardingService.completeOnboarding(+id, completedBy);
  }
}
