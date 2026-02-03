import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalaryDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsInt()
  employeeId: number;

  @ApiProperty({ description: 'Month (1-12)', example: 1 })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ description: 'Year', example: 2025 })
  @IsInt()
  @Min(2020)
  year: number;

  @ApiProperty({ description: 'Base salary', example: 25000 })
  @IsNumber()
  @Min(0)
  baseSalary: number;

  @ApiPropertyOptional({ description: 'Overtime hours', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  overtimeHours?: number;

  @ApiPropertyOptional({ description: 'Overtime rate multiplier', default: 1.5 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  overtimeRate?: number;

  @ApiPropertyOptional({ description: 'Bonus amount', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  bonus?: number;

  @ApiPropertyOptional({ description: 'Allowances', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  allowances?: number;

  @ApiPropertyOptional({ description: 'Commission', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  commission?: number;

  @ApiPropertyOptional({ description: 'Social security deduction', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  socialSecurity?: number;

  @ApiPropertyOptional({ description: 'Tax deduction', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  tax?: number;

  @ApiPropertyOptional({ description: 'Other deductions', default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  otherDeductions?: number;

  @ApiPropertyOptional({ description: 'Notes for deductions' })
  @IsString()
  @IsOptional()
  deductionNotes?: string;

  @ApiPropertyOptional({ description: 'General notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
