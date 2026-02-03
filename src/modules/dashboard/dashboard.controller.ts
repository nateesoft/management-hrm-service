import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards';
import { Public } from '../../common/decorators';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@Public() // Allow public access for dashboard data
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get dashboard overview - ภาพรวมระบบ' })
  getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('employee-stats')
  @ApiOperation({ summary: 'Get employee statistics - สถิติพนักงาน' })
  getEmployeeStats() {
    return this.dashboardService.getEmployeeStats();
  }

  @Get('salary-summary')
  @ApiOperation({ summary: 'Get salary summary - สรุปเงินเดือน' })
  @ApiQuery({ name: 'year', required: false, description: 'Year (default: current year)' })
  getSalarySummary(@Query('year') year?: string) {
    return this.dashboardService.getSalarySummary(
      year ? parseInt(year, 10) : undefined,
    );
  }

  @Get('department-stats')
  @ApiOperation({ summary: 'Get department statistics - สถิติตามแผนก' })
  getDepartmentStats() {
    return this.dashboardService.getDepartmentStats();
  }

  @Get('recent-activities')
  @ApiOperation({ summary: 'Get recent activities - กิจกรรมล่าสุด' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of activities (default: 10)' })
  getRecentActivities(@Query('limit') limit?: string) {
    return this.dashboardService.getRecentActivities(
      limit ? parseInt(limit, 10) : 10,
    );
  }
}
