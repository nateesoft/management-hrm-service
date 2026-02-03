import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkUserDto {
  @ApiProperty({ description: 'Food ordering user ID to link' })
  @IsInt()
  foodOrderingUserId: number;
}
