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
import { PositionsService } from './positions.service';
import { CreatePositionDto, UpdatePositionDto, QueryPositionDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

@ApiTags('Positions')
@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all positions - ดึงข้อมูลตำแหน่งทั้งหมด' })
  findAll(@Query() query: QueryPositionDto) {
    return this.positionsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get position by ID - ดึงข้อมูลตำแหน่งตาม ID' })
  @ApiParam({ name: 'id', description: 'Position ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.positionsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create position (ADMIN) - สร้างตำแหน่งใหม่' })
  create(@Body() createDto: CreatePositionDto) {
    return this.positionsService.create(createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update position (ADMIN) - แก้ไขตำแหน่ง' })
  @ApiParam({ name: 'id', description: 'Position ID' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePositionDto,
  ) {
    return this.positionsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete position (ADMIN) - ลบตำแหน่ง' })
  @ApiParam({ name: 'id', description: 'Position ID' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.positionsService.remove(id);
  }

  @Get(':id/employees')
  @ApiOperation({ summary: 'Get employees in position - ดึงพนักงานในตำแหน่ง' })
  @ApiParam({ name: 'id', description: 'Position ID' })
  getEmployees(@Param('id', ParseIntPipe) id: number) {
    return this.positionsService.getEmployees(id);
  }
}
