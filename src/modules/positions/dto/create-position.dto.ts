import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePositionDto {
  @ApiProperty({ description: 'Position code', example: 'CHEF' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Position name (Thai supported)', example: 'พ่อครัว' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Description', example: 'รับผิดชอบการปรุงอาหาร' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Hierarchy level (1 = lowest)', example: 2, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  level?: number;

  @ApiPropertyOptional({ description: 'Default base salary for this position', example: 25000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  baseSalary?: number;

  @ApiProperty({ description: 'Department ID' })
  @IsInt()
  departmentId: number;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
