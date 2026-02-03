import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateSalaryDto } from './create-salary.dto';

export class UpdateSalaryDto extends PartialType(
  OmitType(CreateSalaryDto, ['employeeId', 'month', 'year'] as const),
) {}
