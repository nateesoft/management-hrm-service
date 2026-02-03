import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  QueryEmployeeDto,
  LinkUserDto,
} from './dto';
import { Prisma, EmployeeStatus } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryEmployeeDto) {
    const {
      search,
      departmentId,
      positionId,
      status,
      employmentType,
      page = 1,
      limit = 20,
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.EmployeeWhereInput = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { nickname: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (positionId) {
      where.positionId = positionId;
    }

    if (status) {
      where.status = status;
    }

    if (employmentType) {
      where.employmentType = employmentType;
    }

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        include: {
          department: {
            select: { id: true, name: true, code: true },
          },
          position: {
            select: { id: true, name: true, code: true },
          },
        },
        skip,
        take: limit,
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      data: employees,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        employeeBenefits: {
          where: { isActive: true },
          include: {
            benefit: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async create(createDto: CreateEmployeeDto) {
    // Check if employee code already exists
    const existingCode = await this.prisma.employee.findUnique({
      where: { employeeCode: createDto.employeeCode },
    });

    if (existingCode) {
      throw new ConflictException(
        `Employee with code ${createDto.employeeCode} already exists`,
      );
    }

    // Check if email already exists
    if (createDto.email) {
      const existingEmail = await this.prisma.employee.findUnique({
        where: { email: createDto.email },
      });

      if (existingEmail) {
        throw new ConflictException(
          `Employee with email ${createDto.email} already exists`,
        );
      }
    }

    // Check if national ID already exists
    if (createDto.nationalId) {
      const existingNationalId = await this.prisma.employee.findUnique({
        where: { nationalId: createDto.nationalId },
      });

      if (existingNationalId) {
        throw new ConflictException(
          `Employee with national ID ${createDto.nationalId} already exists`,
        );
      }
    }

    // Check if food ordering user ID is already linked
    if (createDto.foodOrderingUserId) {
      const existingLink = await this.prisma.employee.findUnique({
        where: { foodOrderingUserId: createDto.foodOrderingUserId },
      });

      if (existingLink) {
        throw new ConflictException(
          `Food ordering user ID ${createDto.foodOrderingUserId} is already linked to another employee`,
        );
      }
    }

    // Check if department exists
    const department = await this.prisma.department.findUnique({
      where: { id: createDto.departmentId },
    });

    if (!department) {
      throw new BadRequestException(
        `Department with ID ${createDto.departmentId} not found`,
      );
    }

    // Check if position exists
    const position = await this.prisma.position.findUnique({
      where: { id: createDto.positionId },
    });

    if (!position) {
      throw new BadRequestException(
        `Position with ID ${createDto.positionId} not found`,
      );
    }

    return this.prisma.employee.create({
      data: {
        ...createDto,
        startDate: createDto.startDate ? new Date(createDto.startDate) : new Date(),
        dateOfBirth: createDto.dateOfBirth
          ? new Date(createDto.dateOfBirth)
          : undefined,
      },
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
        position: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  async update(id: number, updateDto: UpdateEmployeeDto) {
    // Check if employee exists
    const employee = await this.findOne(id);

    // Check for unique constraints
    if (updateDto.employeeCode && updateDto.employeeCode !== employee.employeeCode) {
      const existing = await this.prisma.employee.findUnique({
        where: { employeeCode: updateDto.employeeCode },
      });

      if (existing) {
        throw new ConflictException(
          `Employee with code ${updateDto.employeeCode} already exists`,
        );
      }
    }

    if (updateDto.email && updateDto.email !== employee.email) {
      const existing = await this.prisma.employee.findUnique({
        where: { email: updateDto.email },
      });

      if (existing) {
        throw new ConflictException(
          `Employee with email ${updateDto.email} already exists`,
        );
      }
    }

    if (updateDto.nationalId && updateDto.nationalId !== employee.nationalId) {
      const existing = await this.prisma.employee.findUnique({
        where: { nationalId: updateDto.nationalId },
      });

      if (existing) {
        throw new ConflictException(
          `Employee with national ID ${updateDto.nationalId} already exists`,
        );
      }
    }

    // Check department
    if (updateDto.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: updateDto.departmentId },
      });

      if (!department) {
        throw new BadRequestException(
          `Department with ID ${updateDto.departmentId} not found`,
        );
      }
    }

    // Check position
    if (updateDto.positionId) {
      const position = await this.prisma.position.findUnique({
        where: { id: updateDto.positionId },
      });

      if (!position) {
        throw new BadRequestException(
          `Position with ID ${updateDto.positionId} not found`,
        );
      }
    }

    const data: Prisma.EmployeeUpdateInput = { ...updateDto };

    if (updateDto.startDate) {
      data.startDate = new Date(updateDto.startDate);
    }

    if (updateDto.dateOfBirth) {
      data.dateOfBirth = new Date(updateDto.dateOfBirth);
    }

    return this.prisma.employee.update({
      where: { id },
      data,
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
        position: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  async remove(id: number) {
    // Check if employee exists
    await this.findOne(id);

    // Soft delete - change status to TERMINATED
    return this.prisma.employee.update({
      where: { id },
      data: {
        status: EmployeeStatus.TERMINATED,
        endDate: new Date(),
      },
    });
  }

  async linkUser(id: number, linkDto: LinkUserDto) {
    // Check if employee exists
    await this.findOne(id);

    // Check if food ordering user ID is already linked
    const existingLink = await this.prisma.employee.findUnique({
      where: { foodOrderingUserId: linkDto.foodOrderingUserId },
    });

    if (existingLink && existingLink.id !== id) {
      throw new ConflictException(
        `Food ordering user ID ${linkDto.foodOrderingUserId} is already linked to employee ${existingLink.employeeCode}`,
      );
    }

    return this.prisma.employee.update({
      where: { id },
      data: {
        foodOrderingUserId: linkDto.foodOrderingUserId,
      },
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
        position: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  async unlinkUser(id: number) {
    // Check if employee exists
    await this.findOne(id);

    return this.prisma.employee.update({
      where: { id },
      data: {
        foodOrderingUserId: null,
      },
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
        position: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  async getSalaryHistory(id: number) {
    // Check if employee exists
    await this.findOne(id);

    return this.prisma.salaryRecord.findMany({
      where: { employeeId: id },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async getBenefits(id: number) {
    // Check if employee exists
    await this.findOne(id);

    return this.prisma.employeeBenefit.findMany({
      where: { employeeId: id, isActive: true },
      include: {
        benefit: true,
      },
    });
  }

  async getAttendance(id: number, month?: number, year?: number) {
    // Check if employee exists
    await this.findOne(id);

    const where: Prisma.AttendanceWhereInput = { employeeId: id };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    return this.prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  // Generate next employee code
  async generateEmployeeCode(): Promise<string> {
    const lastEmployee = await this.prisma.employee.findFirst({
      orderBy: { id: 'desc' },
      select: { employeeCode: true },
    });

    if (!lastEmployee) {
      return 'EMP001';
    }

    const match = lastEmployee.employeeCode.match(/EMP(\d+)/);
    if (match) {
      const nextNum = parseInt(match[1], 10) + 1;
      return `EMP${String(nextNum).padStart(3, '0')}`;
    }

    return `EMP${String(Date.now()).slice(-6)}`;
  }
}
