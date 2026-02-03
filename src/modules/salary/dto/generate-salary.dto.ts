import { IsInt, Min, Max, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateSalaryDto {
  @ApiProperty({ description: 'Month (1-12)', example: 1 })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ description: 'Year', example: 2025 })
  @IsInt()
  @Min(2020)
  year: number;

  @ApiPropertyOptional({
    description: 'Specific employee IDs to generate (empty = all active employees)',
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  employeeIds?: number[];
}
