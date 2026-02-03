import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BenefitsService } from './benefits.service';
import {
  CreateBenefitDto,
  UpdateBenefitDto,
  AssignBenefitDto,
  UpdateEmployeeBenefitDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, Public } from '../../common/decorators';

@ApiTags('Benefits')
@Controller('benefits')
export class BenefitsController {
  constructor(private readonly benefitsService: BenefitsService) {}

  // Benefit Types
  @Get()
  @ApiOperation({ summary: 'Get all benefit types - ดึงประเภทสวัสดิการทั้งหมด' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAllBenefits(@Query('isActive') isActive?: string) {
    const active = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.benefitsService.findAllBenefits(active);
  }

  @Get('summary')
  @Public()
  @ApiOperation({ summary: 'Get benefits summary - สรุปสวัสดิการ' })
  getSummary() {
    return this.benefitsService.getBenefitsSummary();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get benefit type by ID - ดึงประเภทสวัสดิการตาม ID' })
  @ApiParam({ name: 'id', description: 'Benefit ID' })
  findOneBenefit(@Param('id', ParseIntPipe) id: number) {
    return this.benefitsService.findOneBenefit(id);
  }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create benefit type - สร้างประเภทสวัสดิการ' })
  createBenefit(@Body() createDto: CreateBenefitDto) {
    return this.benefitsService.createBenefit(createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update benefit type (ADMIN) - แก้ไขประเภทสวัสดิการ' })
  @ApiParam({ name: 'id', description: 'Benefit ID' })
  updateBenefit(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBenefitDto,
  ) {
    return this.benefitsService.updateBenefit(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete benefit type (ADMIN) - ลบประเภทสวัสดิการ' })
  @ApiParam({ name: 'id', description: 'Benefit ID' })
  removeBenefit(@Param('id', ParseIntPipe) id: number) {
    return this.benefitsService.removeBenefit(id);
  }

  // Employee Benefits
  @Get('employee-benefits')
  @Public()
  @ApiOperation({ summary: 'Get employee benefits - ดึงสวัสดิการพนักงาน' })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'benefitId', required: false })
  findAllEmployeeBenefits(
    @Query('employeeId') employeeId?: string,
    @Query('benefitId') benefitId?: string,
  ) {
    return this.benefitsService.findAllEmployeeBenefits(
      employeeId ? Number(employeeId) : undefined,
      benefitId ? Number(benefitId) : undefined,
    );
  }

  @Get('employee-benefits/:id')
  @Public()
  @ApiOperation({ summary: 'Get employee benefit by ID' })
  @ApiParam({ name: 'id', description: 'Employee Benefit ID' })
  findOneEmployeeBenefit(@Param('id', ParseIntPipe) id: number) {
    return this.benefitsService.findOneEmployeeBenefit(id);
  }

  @Post('assign')
  @Public()
  @ApiOperation({
    summary: 'Assign benefit to employee - เพิ่มสวัสดิการให้พนักงาน',
  })
  assignBenefit(@Body() assignDto: AssignBenefitDto) {
    return this.benefitsService.assignBenefit(assignDto);
  }

  @Patch('employee-benefits/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update employee benefit (ADMIN)' })
  @ApiParam({ name: 'id', description: 'Employee Benefit ID' })
  updateEmployeeBenefit(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEmployeeBenefitDto,
  ) {
    return this.benefitsService.updateEmployeeBenefit(id, updateDto);
  }

  @Delete('employee-benefits/:id')
  @Public()
  @ApiOperation({
    summary: 'Remove benefit from employee - ยกเลิกสวัสดิการพนักงาน',
  })
  @ApiParam({ name: 'id', description: 'Employee Benefit ID' })
  removeEmployeeBenefit(@Param('id', ParseIntPipe) id: number) {
    return this.benefitsService.removeEmployeeBenefit(id);
  }
}
