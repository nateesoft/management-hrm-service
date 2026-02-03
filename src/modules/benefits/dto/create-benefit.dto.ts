import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BenefitType } from '@prisma/client';

export class CreateBenefitDto {
  @ApiProperty({ description: 'Benefit code', example: 'HEALTH_INS' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Benefit name (Thai supported)', example: 'ประกันสุขภาพ' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: BenefitType })
  @IsEnum(BenefitType)
  type: BenefitType;

  @ApiPropertyOptional({ description: 'Default amount', example: 1500 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultAmount?: number;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
