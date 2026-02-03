import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { UserWebhookPayloadDto } from './dto';
import { EmployeeStatus } from '@prisma/client';

export interface FoodOrderingUser {
  id: number;
  username: string;
  name: string;
  role: string;
  isActive: boolean;
}

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);
  private readonly foodOrderingUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.foodOrderingUrl =
      this.configService.get<string>('FOOD_ORDERING_SERVICE_URL') ||
      'http://localhost:3001';
  }

  async syncAllUsers() {
    const results = {
      synced: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    try {
      const users = await this.fetchUsersFromFoodOrdering();

      // Get default department and position for new employees
      let defaultDepartment = await this.prisma.department.findFirst({
        where: { code: 'GENERAL' },
      });

      if (!defaultDepartment) {
        defaultDepartment = await this.prisma.department.create({
          data: {
            code: 'GENERAL',
            name: 'ทั่วไป',
            description: 'แผนกทั่วไป (สร้างอัตโนมัติ)',
          },
        });
      }

      let defaultPosition = await this.prisma.position.findFirst({
        where: { code: 'STAFF' },
      });

      if (!defaultPosition) {
        defaultPosition = await this.prisma.position.create({
          data: {
            code: 'STAFF',
            name: 'พนักงาน',
            description: 'ตำแหน่งพนักงานทั่วไป (สร้างอัตโนมัติ)',
            departmentId: defaultDepartment.id,
            baseSalary: 15000,
          },
        });
      }

      for (const user of users) {
        try {
          const result = await this.syncSingleUser(
            user,
            defaultDepartment.id,
            defaultPosition.id,
          );

          if (result.action === 'created') {
            results.created++;
          } else if (result.action === 'updated') {
            results.updated++;
          } else {
            results.skipped++;
          }
          results.synced++;
        } catch (error) {
          results.errors.push(`Failed to sync user ${user.username}: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`);
      results.errors.push(`Failed to fetch users: ${error.message}`);
    }

    return results;
  }

  async syncSingleUser(
    user: FoodOrderingUser,
    defaultDepartmentId: number,
    defaultPositionId: number,
  ): Promise<{ action: 'created' | 'updated' | 'skipped' }> {
    // Check if employee already linked
    const existingEmployee = await this.prisma.employee.findUnique({
      where: { foodOrderingUserId: user.id },
    });

    if (existingEmployee) {
      // Update status based on food-ordering user status
      const newStatus = user.isActive
        ? EmployeeStatus.ACTIVE
        : EmployeeStatus.INACTIVE;

      if (existingEmployee.status !== newStatus) {
        await this.prisma.employee.update({
          where: { id: existingEmployee.id },
          data: { status: newStatus },
        });
        return { action: 'updated' };
      }

      return { action: 'skipped' };
    }

    // Create new employee
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0] || user.username;
    const lastName = nameParts.slice(1).join(' ') || '';

    const employeeCode = await this.generateEmployeeCode();

    await this.prisma.employee.create({
      data: {
        employeeCode,
        foodOrderingUserId: user.id,
        firstName,
        lastName,
        departmentId: defaultDepartmentId,
        positionId: defaultPositionId,
        baseSalary: 15000,
        status: user.isActive ? EmployeeStatus.ACTIVE : EmployeeStatus.INACTIVE,
      },
    });

    return { action: 'created' };
  }

  async getUnlinkedUsers() {
    try {
      const users = await this.fetchUsersFromFoodOrdering();

      // Get all linked user IDs
      const linkedUserIds = await this.prisma.employee.findMany({
        where: { foodOrderingUserId: { not: null } },
        select: { foodOrderingUserId: true },
      });

      const linkedIds = new Set(linkedUserIds.map((e) => e.foodOrderingUserId));

      // Filter unlinked users
      return users.filter((user) => !linkedIds.has(user.id));
    } catch (error) {
      this.logger.error(`Failed to get unlinked users: ${error.message}`);
      return this.getMockUnlinkedUsers();
    }
  }

  async handleUserCreatedWebhook(payload: UserWebhookPayloadDto) {
    this.logger.log(`Received user created webhook for user: ${payload.username}`);

    // Check if already linked
    const existing = await this.prisma.employee.findUnique({
      where: { foodOrderingUserId: payload.id },
    });

    if (existing) {
      this.logger.log(`User ${payload.username} already linked to employee ${existing.employeeCode}`);
      return { status: 'skipped', message: 'User already linked' };
    }

    // Get default department and position
    let defaultDepartment = await this.prisma.department.findFirst({
      where: { code: 'GENERAL' },
    });

    if (!defaultDepartment) {
      defaultDepartment = await this.prisma.department.create({
        data: {
          code: 'GENERAL',
          name: 'ทั่วไป',
          description: 'แผนกทั่วไป (สร้างอัตโนมัติ)',
        },
      });
    }

    let defaultPosition = await this.prisma.position.findFirst({
      where: { code: 'STAFF' },
    });

    if (!defaultPosition) {
      defaultPosition = await this.prisma.position.create({
        data: {
          code: 'STAFF',
          name: 'พนักงาน',
          description: 'ตำแหน่งพนักงานทั่วไป (สร้างอัตโนมัติ)',
          departmentId: defaultDepartment.id,
          baseSalary: 15000,
        },
      });
    }

    // Create employee
    const nameParts = payload.name.split(' ');
    const firstName = nameParts[0] || payload.username;
    const lastName = nameParts.slice(1).join(' ') || '';

    const employeeCode = await this.generateEmployeeCode();

    const employee = await this.prisma.employee.create({
      data: {
        employeeCode,
        foodOrderingUserId: payload.id,
        firstName,
        lastName,
        departmentId: defaultDepartment.id,
        positionId: defaultPosition.id,
        baseSalary: 15000,
        status: payload.isActive !== false ? EmployeeStatus.ACTIVE : EmployeeStatus.INACTIVE,
      },
    });

    this.logger.log(`Created employee ${employeeCode} for user ${payload.username}`);

    return {
      status: 'created',
      employee: {
        id: employee.id,
        employeeCode: employee.employeeCode,
      },
    };
  }

  async handleUserUpdatedWebhook(payload: UserWebhookPayloadDto) {
    this.logger.log(`Received user updated webhook for user: ${payload.username}`);

    const employee = await this.prisma.employee.findUnique({
      where: { foodOrderingUserId: payload.id },
    });

    if (!employee) {
      this.logger.log(`User ${payload.username} not linked to any employee`);
      return { status: 'skipped', message: 'User not linked' };
    }

    // Update status
    const newStatus = payload.isActive !== false
      ? EmployeeStatus.ACTIVE
      : EmployeeStatus.INACTIVE;

    await this.prisma.employee.update({
      where: { id: employee.id },
      data: { status: newStatus },
    });

    this.logger.log(`Updated employee ${employee.employeeCode} status to ${newStatus}`);

    return {
      status: 'updated',
      employee: {
        id: employee.id,
        employeeCode: employee.employeeCode,
        newStatus,
      },
    };
  }

  private async fetchUsersFromFoodOrdering(): Promise<FoodOrderingUser[]> {
    try {
      const response = await fetch(`${this.foodOrderingUrl}/api/auth/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      this.logger.warn(`Cannot connect to food-ordering service: ${error.message}`);
      return this.getMockUsers();
    }
  }

  private getMockUsers(): FoodOrderingUser[] {
    return [
      { id: 1, username: 'admin', name: 'Admin User', role: 'ADMIN', isActive: true },
      { id: 2, username: 'staff', name: 'Staff User', role: 'STAFF', isActive: true },
      { id: 3, username: 'chef', name: 'Chef User', role: 'CHEF', isActive: true },
    ];
  }

  private getMockUnlinkedUsers(): FoodOrderingUser[] {
    return [];
  }

  private async generateEmployeeCode(): Promise<string> {
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
