import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IntegrationService, FoodOrderingUser } from './integration.service';
import { UserWebhookPayloadDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

@ApiTags('Integration')
@Controller('integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Post('sync-users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Sync users from food-ordering service (ADMIN) - ดึงข้อมูล user จากระบบสั่งอาหาร',
  })
  syncUsers() {
    return this.integrationService.syncAllUsers();
  }

  @Get('unlinked-users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get unlinked users from food-ordering - ดึง user ที่ยังไม่เชื่อมกับพนักงาน',
  })
  getUnlinkedUsers(): Promise<FoodOrderingUser[]> {
    return this.integrationService.getUnlinkedUsers();
  }

  @Post('webhook/user-created')
  @ApiOperation({
    summary: 'Webhook: User created in food-ordering service',
    description: 'Called by food-ordering service when a new user is created',
  })
  handleUserCreated(@Body() payload: UserWebhookPayloadDto) {
    return this.integrationService.handleUserCreatedWebhook(payload);
  }

  @Post('webhook/user-updated')
  @ApiOperation({
    summary: 'Webhook: User updated in food-ordering service',
    description: 'Called by food-ordering service when a user is updated',
  })
  handleUserUpdated(@Body() payload: UserWebhookPayloadDto) {
    return this.integrationService.handleUserUpdatedWebhook(payload);
  }
}
