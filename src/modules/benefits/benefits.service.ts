import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateBenefitDto,
  UpdateBenefitDto,
  AssignBenefitDto,
  UpdateEmployeeBenefitDto,
} from './dto';

@Injectable()
export class BenefitsService {
  constructor(private prisma: PrismaService) {}

  // Benefit Types
  async findAllBenefits(isActive?: boolean) {
    const where = isActive !== undefined ? { isActive } : {};

    return this.prisma.benefit.findMany({
      where,
      include: {
        _count: {
          select: { employeeBenefits: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOneBenefit(id: number) {
    const benefit = await this.prisma.benefit.findUnique({
      where: { id },
      include: {
        employeeBenefits: {
          where: { isActive: true },
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
        },
      },
    });

    if (!benefit) {
      throw new NotFoundException(`Benefit with ID ${id} not found`);
    }

    return benefit;
  }

  async createBenefit(createDto: CreateBenefitDto) {
    // Check if code already exists
    const existing = await this.prisma.benefit.findUnique({
      where: { code: createDto.code },
    });

    if (existing) {
      throw new ConflictException(`Benefit with code ${createDto.code} already exists`);
    }

    return this.prisma.benefit.create({
      data: createDto,
    });
  }

  async updateBenefit(id: number, updateDto: UpdateBenefitDto) {
    await this.findOneBenefit(id);

    if (updateDto.code) {
      const existing = await this.prisma.benefit.findFirst({
        where: {
          code: updateDto.code,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(`Benefit with code ${updateDto.code} already exists`);
      }
    }

    return this.prisma.benefit.update({
      where: { id },
      data: updateDto,
    });
  }

  async removeBenefit(id: number) {
    await this.findOneBenefit(id);

    // Check if benefit is assigned to employees
    const assignmentCount = await this.prisma.employeeBenefit.count({
      where: { benefitId: id, isActive: true },
    });

    if (assignmentCount > 0) {
      throw new ConflictException(
        `Cannot delete benefit with ${assignmentCount} active assignments`,
      );
    }

    return this.prisma.benefit.delete({
      where: { id },
    });
  }

  // Employee Benefits
  async findAllEmployeeBenefits(employeeId?: number, benefitId?: number) {
    const where: any = { isActive: true };

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (benefitId) {
      where.benefitId = benefitId;
    }

    return this.prisma.employeeBenefit.findMany({
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
          },
        },
        benefit: true,
      },
      orderBy: { employee: { firstName: 'asc' } },
    });
  }

  async findOneEmployeeBenefit(id: number) {
    const employeeBenefit = await this.prisma.employeeBenefit.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
          },
        },
        benefit: true,
      },
    });

    if (!employeeBenefit) {
      throw new NotFoundException(`Employee benefit with ID ${id} not found`);
    }

    return employeeBenefit;
  }

  async assignBenefit(assignDto: AssignBenefitDto) {
    // Check if employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: assignDto.employeeId },
    });

    if (!employee) {
      throw new BadRequestException(`Employee with ID ${assignDto.employeeId} not found`);
    }

    // Check if benefit exists
    const benefit = await this.prisma.benefit.findUnique({
      where: { id: assignDto.benefitId },
    });

    if (!benefit) {
      throw new BadRequestException(`Benefit with ID ${assignDto.benefitId} not found`);
    }

    // Check if assignment already exists
    const existing = await this.prisma.employeeBenefit.findUnique({
      where: {
        employeeId_benefitId: {
          employeeId: assignDto.employeeId,
          benefitId: assignDto.benefitId,
        },
      },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException(
          `Employee already has this benefit assigned`,
        );
      }

      // Reactivate existing assignment
      return this.prisma.employeeBenefit.update({
        where: { id: existing.id },
        data: {
          amount: assignDto.amount,
          startDate: assignDto.startDate ? new Date(assignDto.startDate) : new Date(),
          endDate: assignDto.endDate ? new Date(assignDto.endDate) : null,
          isActive: true,
          notes: assignDto.notes,
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
          benefit: true,
        },
      });
    }

    return this.prisma.employeeBenefit.create({
      data: {
        employeeId: assignDto.employeeId,
        benefitId: assignDto.benefitId,
        amount: assignDto.amount,
        startDate: assignDto.startDate ? new Date(assignDto.startDate) : new Date(),
        endDate: assignDto.endDate ? new Date(assignDto.endDate) : undefined,
        notes: assignDto.notes,
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
        benefit: true,
      },
    });
  }

  async updateEmployeeBenefit(id: number, updateDto: UpdateEmployeeBenefitDto) {
    await this.findOneEmployeeBenefit(id);

    const data: any = { ...updateDto };

    if (updateDto.endDate) {
      data.endDate = new Date(updateDto.endDate);
    }

    return this.prisma.employeeBenefit.update({
      where: { id },
      data,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
          },
        },
        benefit: true,
      },
    });
  }

  async removeEmployeeBenefit(id: number) {
    await this.findOneEmployeeBenefit(id);

    // Soft delete - deactivate
    return this.prisma.employeeBenefit.update({
      where: { id },
      data: {
        isActive: false,
        endDate: new Date(),
      },
    });
  }

  // Summary
  async getBenefitsSummary() {
    const benefits = await this.prisma.benefit.findMany({
      where: { isActive: true },
      include: {
        employeeBenefits: {
          where: { isActive: true },
        },
      },
    });

    return benefits.map((benefit) => ({
      id: benefit.id,
      code: benefit.code,
      name: benefit.name,
      type: benefit.type,
      defaultAmount: benefit.defaultAmount,
      employeeCount: benefit.employeeBenefits.length,
      totalMonthlyCost: benefit.employeeBenefits.reduce(
        (sum, eb) => sum + eb.amount,
        0,
      ),
    }));
  }
}
