import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto, QueryDepartmentDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryDepartmentDto) {
    const { search, isActive } = query;

    const where: Prisma.DepartmentWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const departments = await this.prisma.department.findMany({
      where,
      include: {
        _count: {
          select: {
            positions: true,
            employees: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return departments;
  }

  async findOne(id: number) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        positions: {
          where: { isActive: true },
          orderBy: { level: 'asc' },
        },
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async create(createDto: CreateDepartmentDto) {
    // Check if code already exists
    const existing = await this.prisma.department.findUnique({
      where: { code: createDto.code },
    });

    if (existing) {
      throw new ConflictException(`Department with code ${createDto.code} already exists`);
    }

    return this.prisma.department.create({
      data: createDto,
    });
  }

  async update(id: number, updateDto: UpdateDepartmentDto) {
    // Check if department exists
    await this.findOne(id);

    // Check if code is being changed and already exists
    if (updateDto.code) {
      const existing = await this.prisma.department.findFirst({
        where: {
          code: updateDto.code,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(`Department with code ${updateDto.code} already exists`);
      }
    }

    return this.prisma.department.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: number) {
    // Check if department exists
    const department = await this.findOne(id);

    // Check if department has employees
    const employeeCount = await this.prisma.employee.count({
      where: { departmentId: id },
    });

    if (employeeCount > 0) {
      throw new ConflictException(
        `Cannot delete department with ${employeeCount} employees. Please reassign employees first.`,
      );
    }

    return this.prisma.department.delete({
      where: { id },
    });
  }

  async getEmployees(id: number) {
    // Check if department exists
    await this.findOne(id);

    return this.prisma.employee.findMany({
      where: { departmentId: id },
      include: {
        position: true,
      },
      orderBy: { firstName: 'asc' },
    });
  }

  async getPositions(id: number) {
    // Check if department exists
    await this.findOne(id);

    return this.prisma.position.findMany({
      where: { departmentId: id },
      include: {
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { level: 'asc' },
    });
  }
}
