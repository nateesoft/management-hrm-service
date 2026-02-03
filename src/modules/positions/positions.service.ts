import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePositionDto, UpdatePositionDto, QueryPositionDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryPositionDto) {
    const { search, departmentId, isActive } = query;

    const where: Prisma.PositionWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const positions = await this.prisma.position.findMany({
      where,
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: { employees: true },
        },
      },
      orderBy: [{ departmentId: 'asc' }, { level: 'asc' }],
    });

    return positions;
  }

  async findOne(id: number) {
    const position = await this.prisma.position.findUnique({
      where: { id },
      include: {
        department: true,
        _count: {
          select: { employees: true },
        },
      },
    });

    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    return position;
  }

  async create(createDto: CreatePositionDto) {
    // Check if code already exists
    const existing = await this.prisma.position.findUnique({
      where: { code: createDto.code },
    });

    if (existing) {
      throw new ConflictException(`Position with code ${createDto.code} already exists`);
    }

    // Check if department exists
    const department = await this.prisma.department.findUnique({
      where: { id: createDto.departmentId },
    });

    if (!department) {
      throw new BadRequestException(`Department with ID ${createDto.departmentId} not found`);
    }

    return this.prisma.position.create({
      data: createDto,
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  async update(id: number, updateDto: UpdatePositionDto) {
    // Check if position exists
    await this.findOne(id);

    // Check if code is being changed and already exists
    if (updateDto.code) {
      const existing = await this.prisma.position.findFirst({
        where: {
          code: updateDto.code,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(`Position with code ${updateDto.code} already exists`);
      }
    }

    // Check if department exists
    if (updateDto.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: updateDto.departmentId },
      });

      if (!department) {
        throw new BadRequestException(`Department with ID ${updateDto.departmentId} not found`);
      }
    }

    return this.prisma.position.update({
      where: { id },
      data: updateDto,
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  async remove(id: number) {
    // Check if position exists
    await this.findOne(id);

    // Check if position has employees
    const employeeCount = await this.prisma.employee.count({
      where: { positionId: id },
    });

    if (employeeCount > 0) {
      throw new ConflictException(
        `Cannot delete position with ${employeeCount} employees. Please reassign employees first.`,
      );
    }

    return this.prisma.position.delete({
      where: { id },
    });
  }

  async getEmployees(id: number) {
    // Check if position exists
    await this.findOne(id);

    return this.prisma.employee.findMany({
      where: { positionId: id },
      include: {
        department: {
          select: { id: true, name: true },
        },
      },
      orderBy: { firstName: 'asc' },
    });
  }
}
