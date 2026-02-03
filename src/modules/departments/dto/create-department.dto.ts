import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Department code', example: 'KITCHEN' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Department name (Thai supported)', example: 'ฝ่ายครัว' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Description', example: 'ดูแลการปรุงอาหาร' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
