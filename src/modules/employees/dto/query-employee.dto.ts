import { IsOptional, IsString, IsEnum, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EmployeeStatus, EmploymentType } from '@prisma/client';

export class QueryEmployeeDto {
  @ApiPropertyOptional({ description: 'Search by name, code, or email' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by department ID' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  departmentId?: number;

  @ApiPropertyOptional({ description: 'Filter by position ID' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  positionId?: number;

  @ApiPropertyOptional({ enum: EmployeeStatus })
  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;

  @ApiPropertyOptional({ enum: EmploymentType })
  @IsEnum(EmploymentType)
  @IsOptional()
  employmentType?: EmploymentType;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
