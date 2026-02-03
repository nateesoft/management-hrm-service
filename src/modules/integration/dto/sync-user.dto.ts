import { IsInt, IsOptional, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SyncUsersDto {
  @ApiPropertyOptional({
    description: 'Specific user IDs to sync (empty = sync all)',
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  userIds?: number[];
}
