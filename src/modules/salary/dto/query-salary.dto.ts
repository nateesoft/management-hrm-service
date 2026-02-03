import { IsOptional, IsInt, IsEnum, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SalaryStatus } from '@prisma/client';

export class QuerySalaryDto {
  @ApiPropertyOptional({ description: 'Filter by employee ID' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  employeeId?: number;

  @ApiPropertyOptional({ description: 'Filter by month (1-12)' })
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  @Type(() => Number)
  month?: number;

  @ApiPropertyOptional({ description: 'Filter by year' })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  year?: number;

  @ApiPropertyOptional({ enum: SalaryStatus })
  @IsEnum(SalaryStatus)
  @IsOptional()
  status?: SalaryStatus;

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
