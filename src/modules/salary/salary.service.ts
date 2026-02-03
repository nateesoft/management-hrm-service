import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSalaryDto,
  UpdateSalaryDto,
  QuerySalaryDto,
  GenerateSalaryDto,
} from './dto';
import { Prisma, SalaryStatus, EmployeeStatus } from '@prisma/client';

@Injectable()
export class SalaryService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QuerySalaryDto) {
    const { employeeId, month, year, status, page = 1, limit = 20 } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.SalaryRecordWhereInput = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (month) {
      where.month = month;
    }

    if (year) {
      where.year = year;
    }

    if (status) {
      where.status = status;
    }

    const [records, total] = await Promise.all([
      this.prisma.salaryRecord.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              employeeCode: true,
              firstName: true,
              lastName: true,
              position: {
                select: { name: true },
              },
              department: {
                select: { name: true },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
      this.prisma.salaryRecord.count({ where }),
    ]);

    return {
      data: records,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const record = await this.prisma.salaryRecord.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            position: true,
            department: true,
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException(`Salary record with ID ${id} not found`);
    }

    return record;
  }

  async findByMonth(year: number, month: number) {
    const records = await this.prisma.salaryRecord.findMany({
      where: { year, month },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            position: {
              select: { name: true },
            },
            department: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { employee: { firstName: 'asc' } },
    });

    // Calculate summary
    const summary = {
      totalRecords: records.length,
      totalGrossSalary: records.reduce((sum, r) => sum + r.grossSalary, 0),
      totalNetSalary: records.reduce((sum, r) => sum + r.netSalary, 0),
      totalDeductions: records.reduce(
        (sum, r) => sum + r.socialSecurity + r.tax + r.otherDeductions,
        0,
      ),
      paidCount: records.filter((r) => r.status === SalaryStatus.PAID).length,
      pendingCount: records.filter((r) => r.status === SalaryStatus.PENDING).length,
    };

    return { data: records, summary };
  }

  async create(createDto: CreateSalaryDto) {
    // Check if employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: createDto.employeeId },
    });

    if (!employee) {
      throw new BadRequestException(
        `Employee with ID ${createDto.employeeId} not found`,
      );
    }

    // Check if record already exists for this month
    const existing = await this.prisma.salaryRecord.findUnique({
      where: {
        employeeId_month_year: {
          employeeId: createDto.employeeId,
          month: createDto.month,
          year: createDto.year,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Salary record for employee ${createDto.employeeId} for ${createDto.month}/${createDto.year} already exists`,
      );
    }

    // Calculate overtime amount
    const hourlyRate = createDto.baseSalary / (22 * 8); // Assuming 22 working days, 8 hours/day
    const overtimeHours = createDto.overtimeHours || 0;
    const overtimeRate = createDto.overtimeRate || 1.5;
    const overtimeAmount = hourlyRate * overtimeHours * overtimeRate;

    // Calculate totals
    const grossSalary =
      createDto.baseSalary +
      overtimeAmount +
      (createDto.bonus || 0) +
      (createDto.allowances || 0) +
      (createDto.commission || 0);

    const totalDeductions =
      (createDto.socialSecurity || 0) +
      (createDto.tax || 0) +
      (createDto.otherDeductions || 0);

    const netSalary = grossSalary - totalDeductions;

    return this.prisma.salaryRecord.create({
      data: {
        ...createDto,
        overtimeAmount,
        grossSalary,
        netSalary,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async update(id: number, updateDto: UpdateSalaryDto) {
    const record = await this.findOne(id);

    // Recalculate if salary-related fields are updated
    const baseSalary = updateDto.baseSalary ?? record.baseSalary;
    const overtimeHours = updateDto.overtimeHours ?? record.overtimeHours;
    const overtimeRate = updateDto.overtimeRate ?? record.overtimeRate;
    const bonus = updateDto.bonus ?? record.bonus;
    const allowances = updateDto.allowances ?? record.allowances;
    const commission = updateDto.commission ?? record.commission;
    const socialSecurity = updateDto.socialSecurity ?? record.socialSecurity;
    const tax = updateDto.tax ?? record.tax;
    const otherDeductions = updateDto.otherDeductions ?? record.otherDeductions;

    const hourlyRate = baseSalary / (22 * 8);
    const overtimeAmount = hourlyRate * overtimeHours * overtimeRate;

    const grossSalary = baseSalary + overtimeAmount + bonus + allowances + commission;
    const totalDeductions = socialSecurity + tax + otherDeductions;
    const netSalary = grossSalary - totalDeductions;

    return this.prisma.salaryRecord.update({
      where: { id },
      data: {
        ...updateDto,
        overtimeAmount,
        grossSalary,
        netSalary,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.salaryRecord.delete({
      where: { id },
    });
  }

  async approve(id: number) {
    const record = await this.findOne(id);

    if (record.status !== SalaryStatus.PENDING) {
      throw new BadRequestException(
        `Can only approve PENDING records. Current status: ${record.status}`,
      );
    }

    return this.prisma.salaryRecord.update({
      where: { id },
      data: { status: SalaryStatus.APPROVED },
    });
  }

  async markAsPaid(id: number, paymentMethod?: string, paymentRef?: string) {
    const record = await this.findOne(id);

    if (record.status === SalaryStatus.PAID) {
      throw new BadRequestException('Record is already marked as paid');
    }

    if (record.status === SalaryStatus.CANCELLED) {
      throw new BadRequestException('Cannot mark cancelled record as paid');
    }

    return this.prisma.salaryRecord.update({
      where: { id },
      data: {
        status: SalaryStatus.PAID,
        paidAt: new Date(),
        paymentMethod,
        paymentRef,
      },
    });
  }

  async generate(generateDto: GenerateSalaryDto) {
    const { month, year, employeeIds } = generateDto;

    // Get employees to generate salary for
    const where: Prisma.EmployeeWhereInput = {
      status: EmployeeStatus.ACTIVE,
    };

    if (employeeIds && employeeIds.length > 0) {
      where.id = { in: employeeIds };
    }

    const employees = await this.prisma.employee.findMany({
      where,
      include: {
        employeeBenefits: {
          where: { isActive: true },
          include: { benefit: true },
        },
      },
    });

    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const employee of employees) {
      try {
        // Check if record already exists
        const existing = await this.prisma.salaryRecord.findUnique({
          where: {
            employeeId_month_year: {
              employeeId: employee.id,
              month,
              year,
            },
          },
        });

        if (existing) {
          results.skipped++;
          continue;
        }

        // Calculate allowances from benefits
        const allowances = employee.employeeBenefits.reduce(
          (sum, eb) => sum + eb.amount,
          0,
        );

        // Calculate social security (5% of base, max 750)
        const socialSecurity = Math.min(employee.baseSalary * 0.05, 750);

        const hourlyRate = employee.baseSalary / (22 * 8);
        const grossSalary = employee.baseSalary + allowances;
        const netSalary = grossSalary - socialSecurity;

        await this.prisma.salaryRecord.create({
          data: {
            employeeId: employee.id,
            month,
            year,
            baseSalary: employee.baseSalary,
            overtimeHours: 0,
            overtimeRate: 1.5,
            overtimeAmount: 0,
            bonus: 0,
            allowances,
            commission: 0,
            socialSecurity,
            tax: 0,
            otherDeductions: 0,
            grossSalary,
            netSalary,
            status: SalaryStatus.PENDING,
          },
        });

        results.created++;
      } catch (error) {
        results.errors.push(
          `Failed to create record for employee ${employee.employeeCode}: ${error.message}`,
        );
      }
    }

    return results;
  }

  async getSummary(year?: number, month?: number) {
    const where: Prisma.SalaryRecordWhereInput = {};

    if (year) {
      where.year = year;
    }

    if (month) {
      where.month = month;
    }

    const records = await this.prisma.salaryRecord.findMany({ where });

    return {
      totalRecords: records.length,
      totalGrossSalary: records.reduce((sum, r) => sum + r.grossSalary, 0),
      totalNetSalary: records.reduce((sum, r) => sum + r.netSalary, 0),
      totalBonus: records.reduce((sum, r) => sum + r.bonus, 0),
      totalOvertime: records.reduce((sum, r) => sum + r.overtimeAmount, 0),
      totalDeductions: records.reduce(
        (sum, r) => sum + r.socialSecurity + r.tax + r.otherDeductions,
        0,
      ),
      byStatus: {
        pending: records.filter((r) => r.status === SalaryStatus.PENDING).length,
        approved: records.filter((r) => r.status === SalaryStatus.APPROVED).length,
        paid: records.filter((r) => r.status === SalaryStatus.PAID).length,
        cancelled: records.filter((r) => r.status === SalaryStatus.CANCELLED).length,
      },
    };
  }
}
