import { IsInt, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserWebhookPayloadDto {
  @ApiProperty({ description: 'User ID from food-ordering service' })
  @IsInt()
  id: number;

  @ApiProperty({ description: 'Username' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Display name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'User role' })
  @IsString()
  role: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
