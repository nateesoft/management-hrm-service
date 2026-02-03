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
import { SalaryService } from './salary.service';
import {
  CreateSalaryDto,
  UpdateSalaryDto,
  QuerySalaryDto,
  GenerateSalaryDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, Public } from '../../common/decorators';

@ApiTags('Salary')
@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get salary records - ดึงบันทึกเงินเดือน' })
  findAll(@Query() query: QuerySalaryDto) {
    return this.salaryService.findAll(query);
  }

  @Get('summary')
  @Public()
  @ApiOperation({ summary: 'Get salary summary - สรุปเงินเดือน' })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'month', required: false })
  getSummary(
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    return this.salaryService.getSummary(
      year ? Number(year) : undefined,
      month ? Number(month) : undefined,
    );
  }

  @Get('by-month/:year/:month')
  @Public()
  @ApiOperation({ summary: 'Get records by month - ดึงบันทึกตามเดือน' })
  @ApiParam({ name: 'year', description: 'Year' })
  @ApiParam({ name: 'month', description: 'Month (1-12)' })
  findByMonth(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.salaryService.findByMonth(year, month);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get salary record by ID - ดึงบันทึกเงินเดือนตาม ID' })
  @ApiParam({ name: 'id', description: 'Salary record ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salaryService.findOne(id);
  }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create salary record - สร้างบันทึกเงินเดือน' })
  create(@Body() createDto: CreateSalaryDto) {
    return this.salaryService.create(createDto);
  }

  @Post('generate')
  @Public()
  @ApiOperation({
    summary: 'Generate salary records for month - สร้างบันทึกเงินเดือนอัตโนมัติ',
  })
  generate(@Body() generateDto: GenerateSalaryDto) {
    return this.salaryService.generate(generateDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update salary record (ADMIN) - แก้ไขบันทึกเงินเดือน' })
  @ApiParam({ name: 'id', description: 'Salary record ID' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSalaryDto,
  ) {
    return this.salaryService.update(id, updateDto);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve salary record (ADMIN) - อนุมัติเงินเดือน' })
  @ApiParam({ name: 'id', description: 'Salary record ID' })
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.salaryService.approve(id);
  }

  @Patch(':id/pay')
  @Public()
  @ApiOperation({ summary: 'Mark as paid - บันทึกการจ่าย' })
  @ApiParam({ name: 'id', description: 'Salary record ID' })
  @ApiQuery({ name: 'paymentMethod', required: false })
  @ApiQuery({ name: 'paymentRef', required: false })
  markAsPaid(
    @Param('id', ParseIntPipe) id: number,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('paymentRef') paymentRef?: string,
  ) {
    return this.salaryService.markAsPaid(id, paymentMethod, paymentRef);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete salary record (ADMIN) - ลบบันทึกเงินเดือน' })
  @ApiParam({ name: 'id', description: 'Salary record ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salaryService.remove(id);
  }
}
