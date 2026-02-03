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
} from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto, QueryDepartmentDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

@ApiTags('Departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all departments - ดึงข้อมูลแผนกทั้งหมด' })
  findAll(@Query() query: QueryDepartmentDto) {
    return this.departmentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID - ดึงข้อมูลแผนกตาม ID' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create department (ADMIN) - สร้างแผนกใหม่' })
  create(@Body() createDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update department (ADMIN) - แก้ไขแผนก' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete department (ADMIN) - ลบแผนก' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.remove(id);
  }

  @Get(':id/employees')
  @ApiOperation({ summary: 'Get employees in department - ดึงพนักงานในแผนก' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  getEmployees(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.getEmployees(id);
  }

  @Get(':id/positions')
  @ApiOperation({ summary: 'Get positions in department - ดึงตำแหน่งในแผนก' })
  @ApiParam({ name: 'id', description: 'Department ID' })
  getPositions(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.getPositions(id);
  }
}
