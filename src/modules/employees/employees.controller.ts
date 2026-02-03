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
import { EmployeesService } from './employees.service';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  QueryEmployeeDto,
  LinkUserDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, Public } from '../../common/decorators';

@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all employees - ดึงข้อมูลพนักงานทั้งหมด' })
  findAll(@Query() query: QueryEmployeeDto) {
    return this.employeesService.findAll(query);
  }

  @Get('generate-code')
  @Public()
  @ApiOperation({ summary: 'Generate next employee code - สร้างรหัสพนักงานถัดไป' })
  generateCode() {
    return this.employeesService.generateEmployeeCode();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID - ดึงข้อมูลพนักงานตาม ID' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.findOne(id);
  }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create employee - สร้างพนักงานใหม่' })
  create(@Body() createDto: CreateEmployeeDto) {
    return this.employeesService.create(createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update employee (ADMIN) - แก้ไขข้อมูลพนักงาน' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Terminate employee (ADMIN) - ยกเลิกพนักงาน' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.remove(id);
  }

  @Post(':id/link-user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Link employee to food-ordering user - เชื่อมพนักงานกับ user ในระบบสั่งอาหาร',
  })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  linkUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() linkDto: LinkUserDto,
  ) {
    return this.employeesService.linkUser(id, linkDto);
  }

  @Post(':id/unlink-user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Unlink employee from food-ordering user - ยกเลิกการเชื่อมกับ user ในระบบสั่งอาหาร',
  })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  unlinkUser(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.unlinkUser(id);
  }

  @Get(':id/salary-history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get employee salary history - ดึงประวัติเงินเดือน' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  getSalaryHistory(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.getSalaryHistory(id);
  }

  @Get(':id/benefits')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get employee benefits - ดึงสวัสดิการพนักงาน' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  getBenefits(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.getBenefits(id);
  }

  @Get(':id/attendance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get employee attendance - ดึงบันทึกการเข้างาน' })
  @ApiParam({ name: 'id', description: 'Employee ID' })
  @ApiQuery({ name: 'month', required: false, description: 'Month (1-12)' })
  @ApiQuery({ name: 'year', required: false, description: 'Year' })
  getAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.employeesService.getAttendance(id, month, year);
  }
}
