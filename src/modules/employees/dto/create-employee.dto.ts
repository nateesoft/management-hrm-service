import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsEmail,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, EmploymentType } from '@prisma/client';

export class CreateEmployeeDto {
  @ApiProperty({ description: 'Employee code', example: 'EMP001' })
  @IsString()
  @IsNotEmpty()
  employeeCode: string;

  @ApiProperty({ description: 'First name (Thai supported)', example: 'สมชาย' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'ใจดี' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ description: 'Nickname', example: 'ชาย' })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional({ example: 'somchai@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '0891234567' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Date of birth', example: '1990-01-15' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Thai National ID', example: '1234567890123' })
  @IsString()
  @IsOptional()
  nationalId?: string;

  @ApiProperty({ description: 'Department ID' })
  @IsInt()
  departmentId: number;

  @ApiProperty({ description: 'Position ID' })
  @IsInt()
  positionId: number;

  @ApiPropertyOptional({ enum: EmploymentType, default: 'FULL_TIME' })
  @IsEnum(EmploymentType)
  @IsOptional()
  employmentType?: EmploymentType;

  @ApiPropertyOptional({ description: 'Start date', example: '2024-01-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'Base salary', example: 25000 })
  @IsNumber()
  @Min(0)
  baseSalary: number;

  @ApiPropertyOptional({ description: 'Bank account number' })
  @IsString()
  @IsOptional()
  bankAccount?: string;

  @ApiPropertyOptional({ description: 'Bank name', example: 'กสิกรไทย' })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiPropertyOptional({ description: 'Emergency contact name' })
  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @ApiPropertyOptional({ description: 'Emergency contact phone' })
  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;

  @ApiPropertyOptional({ description: 'Profile image URL' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Link to food-ordering user ID' })
  @IsInt()
  @IsOptional()
  foodOrderingUserId?: number;
}
