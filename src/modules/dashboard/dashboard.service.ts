import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmployeeStatus, SalaryStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Employee counts
    const [
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      newThisMonth,
    ] = await Promise.all([
      this.prisma.employee.count(),
      this.prisma.employee.count({ where: { status: EmployeeStatus.ACTIVE } }),
      this.prisma.employee.count({ where: { status: EmployeeStatus.ON_LEAVE } }),
      this.prisma.employee.count({
        where: {
          startDate: {
            gte: new Date(currentYear, currentMonth - 1, 1),
            lt: new Date(currentYear, currentMonth, 1),
          },
        },
      }),
    ]);

    // Salary summary for current month
    const salaryRecords = await this.prisma.salaryRecord.findMany({
      where: { month: currentMonth, year: currentYear },
    });

    const totalSalaryThisMonth = salaryRecords.reduce(
      (sum, r) => sum + r.netSalary,
      0,
    );
    const paidSalaryCount = salaryRecords.filter(
      (r) => r.status === SalaryStatus.PAID,
    ).length;
    const pendingSalaryCount = salaryRecords.filter(
      (r) => r.status === SalaryStatus.PENDING,
    ).length;

    // Department counts
    const departmentCount = await this.prisma.department.count({
      where: { isActive: true },
    });

    // Position counts
    const positionCount = await this.prisma.position.count({
      where: { isActive: true },
    });

    return {
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        onLeave: onLeaveEmployees,
        newThisMonth,
      },
      salary: {
        month: currentMonth,
        year: currentYear,
        totalAmount: totalSalaryThisMonth,
        paidCount: paidSalaryCount,
        pendingCount: pendingSalaryCount,
        totalRecords: salaryRecords.length,
      },
      departments: departmentCount,
      positions: positionCount,
    };
  }

  async getEmployeeStats() {
    // By status
    const byStatus = await this.prisma.employee.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // By employment type
    const byEmploymentType = await this.prisma.employee.groupBy({
      by: ['employmentType'],
      _count: { id: true },
    });

    // By department
    const byDepartment = await this.prisma.department.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    // By position
    const byPosition = await this.prisma.position.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { employees: true },
        },
        department: {
          select: { name: true },
        },
      },
    });

    // Average salary by department
    const avgSalaryByDept = await this.prisma.employee.groupBy({
      by: ['departmentId'],
      _avg: { baseSalary: true },
      where: { status: EmployeeStatus.ACTIVE },
    });

    const departments = await this.prisma.department.findMany({
      where: { id: { in: avgSalaryByDept.map((d) => d.departmentId) } },
    });

    const avgSalaryByDepartment = avgSalaryByDept.map((item) => ({
      departmentId: item.departmentId,
      departmentName:
        departments.find((d) => d.id === item.departmentId)?.name || 'Unknown',
      averageSalary: item._avg.baseSalary || 0,
    }));

    return {
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      byEmploymentType: byEmploymentType.map((e) => ({
        type: e.employmentType,
        count: e._count.id,
      })),
      byDepartment: byDepartment.map((d) => ({
        id: d.id,
        name: d.name,
        count: d._count.employees,
      })),
      byPosition: byPosition.map((p) => ({
        id: p.id,
        name: p.name,
        department: p.department.name,
        count: p._count.employees,
      })),
      avgSalaryByDepartment,
    };
  }

  async getSalarySummary(year?: number) {
    const targetYear = year || new Date().getFullYear();

    // Monthly summary for the year
    const monthlySummary = [];

    for (let month = 1; month <= 12; month++) {
      const records = await this.prisma.salaryRecord.findMany({
        where: { year: targetYear, month },
      });

      monthlySummary.push({
        month,
        year: targetYear,
        totalRecords: records.length,
        totalGross: records.reduce((sum, r) => sum + r.grossSalary, 0),
        totalNet: records.reduce((sum, r) => sum + r.netSalary, 0),
        totalBonus: records.reduce((sum, r) => sum + r.bonus, 0),
        totalOvertime: records.reduce((sum, r) => sum + r.overtimeAmount, 0),
        totalDeductions: records.reduce(
          (sum, r) => sum + r.socialSecurity + r.tax + r.otherDeductions,
          0,
        ),
        paidCount: records.filter((r) => r.status === SalaryStatus.PAID).length,
        pendingCount: records.filter((r) => r.status === SalaryStatus.PENDING)
          .length,
      });
    }

    // Year total
    const yearTotal = {
      totalGross: monthlySummary.reduce((sum, m) => sum + m.totalGross, 0),
      totalNet: monthlySummary.reduce((sum, m) => sum + m.totalNet, 0),
      totalBonus: monthlySummary.reduce((sum, m) => sum + m.totalBonus, 0),
      totalOvertime: monthlySummary.reduce((sum, m) => sum + m.totalOvertime, 0),
      totalDeductions: monthlySummary.reduce(
        (sum, m) => sum + m.totalDeductions,
        0,
      ),
    };

    return {
      year: targetYear,
      monthly: monthlySummary,
      yearTotal,
    };
  }

  async getDepartmentStats() {
    const departments = await this.prisma.department.findMany({
      where: { isActive: true },
      include: {
        employees: {
          where: { status: EmployeeStatus.ACTIVE },
          select: { baseSalary: true },
        },
        positions: {
          where: { isActive: true },
          include: {
            _count: {
              select: { employees: true },
            },
          },
        },
      },
    });

    return departments.map((dept) => ({
      id: dept.id,
      code: dept.code,
      name: dept.name,
      employeeCount: dept.employees.length,
      totalSalary: dept.employees.reduce((sum, e) => sum + e.baseSalary, 0),
      averageSalary:
        dept.employees.length > 0
          ? dept.employees.reduce((sum, e) => sum + e.baseSalary, 0) /
            dept.employees.length
          : 0,
      positions: dept.positions.map((pos) => ({
        id: pos.id,
        name: pos.name,
        employeeCount: pos._count.employees,
      })),
    }));
  }

  async getRecentActivities(limit = 10) {
    // Get recent employees
    const recentEmployees = await this.prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        status: true,
      },
    });

    // Get recent salary records
    const recentSalaryRecords = await this.prisma.salaryRecord.findMany({
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        employee: {
          select: {
            employeeCode: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Combine and sort activities
    const activities = [
      ...recentEmployees.map((e) => ({
        type: 'employee',
        action: 'created',
        timestamp: e.createdAt,
        data: {
          employeeCode: e.employeeCode,
          name: `${e.firstName} ${e.lastName}`,
          status: e.status,
        },
      })),
      ...recentSalaryRecords.map((s) => ({
        type: 'salary',
        action: s.status === SalaryStatus.PAID ? 'paid' : 'updated',
        timestamp: s.updatedAt,
        data: {
          employeeCode: s.employee.employeeCode,
          name: `${s.employee.firstName} ${s.employee.lastName}`,
          month: s.month,
          year: s.year,
          amount: s.netSalary,
          status: s.status,
        },
      })),
    ];

    // Sort by timestamp and limit
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}
