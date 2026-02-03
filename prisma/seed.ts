import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, BenefitType, EmployeeStatus, EmploymentType, Gender, SalaryStatus } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool, { schema: 'crm_management' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // Create Departments
  console.log('Creating departments...');
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { code: 'MANAGEMENT' },
      update: {},
      create: {
        code: 'MANAGEMENT',
        name: 'ฝ่ายบริหาร',
        description: 'ดูแลการบริหารจัดการร้าน',
      },
    }),
    prisma.department.upsert({
      where: { code: 'KITCHEN' },
      update: {},
      create: {
        code: 'KITCHEN',
        name: 'ฝ่ายครัว',
        description: 'ดูแลการปรุงอาหาร',
      },
    }),
    prisma.department.upsert({
      where: { code: 'SERVICE' },
      update: {},
      create: {
        code: 'SERVICE',
        name: 'ฝ่ายบริการ',
        description: 'ดูแลการบริการลูกค้า',
      },
    }),
    prisma.department.upsert({
      where: { code: 'CASHIER' },
      update: {},
      create: {
        code: 'CASHIER',
        name: 'ฝ่ายแคชเชียร์',
        description: 'ดูแลการรับเงินและออกบิล',
      },
    }),
  ]);

  const [managementDept, kitchenDept, serviceDept, cashierDept] = departments;

  // Create Positions
  console.log('Creating positions...');
  const positions = await Promise.all([
    // Management
    prisma.position.upsert({
      where: { code: 'MANAGER' },
      update: {},
      create: {
        code: 'MANAGER',
        name: 'ผู้จัดการ',
        description: 'ผู้จัดการร้าน',
        level: 4,
        baseSalary: 45000,
        departmentId: managementDept.id,
      },
    }),
    prisma.position.upsert({
      where: { code: 'ASST_MANAGER' },
      update: {},
      create: {
        code: 'ASST_MANAGER',
        name: 'ผู้ช่วยผู้จัดการ',
        description: 'ผู้ช่วยผู้จัดการร้าน',
        level: 3,
        baseSalary: 35000,
        departmentId: managementDept.id,
      },
    }),
    // Kitchen
    prisma.position.upsert({
      where: { code: 'HEAD_CHEF' },
      update: {},
      create: {
        code: 'HEAD_CHEF',
        name: 'หัวหน้าพ่อครัว',
        description: 'หัวหน้าฝ่ายครัว',
        level: 3,
        baseSalary: 35000,
        departmentId: kitchenDept.id,
      },
    }),
    prisma.position.upsert({
      where: { code: 'CHEF' },
      update: {},
      create: {
        code: 'CHEF',
        name: 'พ่อครัว',
        description: 'พนักงานปรุงอาหาร',
        level: 2,
        baseSalary: 22000,
        departmentId: kitchenDept.id,
      },
    }),
    prisma.position.upsert({
      where: { code: 'KITCHEN_HELPER' },
      update: {},
      create: {
        code: 'KITCHEN_HELPER',
        name: 'ผู้ช่วยครัว',
        description: 'ผู้ช่วยในครัว',
        level: 1,
        baseSalary: 15000,
        departmentId: kitchenDept.id,
      },
    }),
    // Service
    prisma.position.upsert({
      where: { code: 'HEAD_WAITER' },
      update: {},
      create: {
        code: 'HEAD_WAITER',
        name: 'หัวหน้าพนักงานเสิร์ฟ',
        description: 'หัวหน้าฝ่ายบริการ',
        level: 3,
        baseSalary: 25000,
        departmentId: serviceDept.id,
      },
    }),
    prisma.position.upsert({
      where: { code: 'WAITER' },
      update: {},
      create: {
        code: 'WAITER',
        name: 'พนักงานเสิร์ฟ',
        description: 'พนักงานบริการลูกค้า',
        level: 1,
        baseSalary: 15000,
        departmentId: serviceDept.id,
      },
    }),
    // Cashier
    prisma.position.upsert({
      where: { code: 'SR_CASHIER' },
      update: {},
      create: {
        code: 'SR_CASHIER',
        name: 'แคชเชียร์อาวุโส',
        description: 'แคชเชียร์อาวุโส',
        level: 2,
        baseSalary: 20000,
        departmentId: cashierDept.id,
      },
    }),
    prisma.position.upsert({
      where: { code: 'CASHIER' },
      update: {},
      create: {
        code: 'CASHIER',
        name: 'แคชเชียร์',
        description: 'พนักงานแคชเชียร์',
        level: 1,
        baseSalary: 16000,
        departmentId: cashierDept.id,
      },
    }),
  ]);

  const [
    managerPos,
    asstManagerPos,
    headChefPos,
    chefPos,
    kitchenHelperPos,
    headWaiterPos,
    waiterPos,
    srCashierPos,
    cashierPos,
  ] = positions;

  // Create Benefits
  console.log('Creating benefits...');
  const benefits = await Promise.all([
    prisma.benefit.upsert({
      where: { code: 'HEALTH_INS' },
      update: {},
      create: {
        code: 'HEALTH_INS',
        name: 'ประกันสุขภาพ',
        description: 'ประกันสุขภาพกลุ่ม',
        type: BenefitType.HEALTH_INSURANCE,
        defaultAmount: 1500,
      },
    }),
    prisma.benefit.upsert({
      where: { code: 'TRANSPORT' },
      update: {},
      create: {
        code: 'TRANSPORT',
        name: 'ค่าเดินทาง',
        description: 'ค่าเดินทางรายเดือน',
        type: BenefitType.TRANSPORTATION,
        defaultAmount: 1000,
      },
    }),
    prisma.benefit.upsert({
      where: { code: 'MEAL' },
      update: {},
      create: {
        code: 'MEAL',
        name: 'ค่าอาหาร',
        description: 'เบี้ยเลี้ยงค่าอาหาร',
        type: BenefitType.MEAL_ALLOWANCE,
        defaultAmount: 1500,
      },
    }),
    prisma.benefit.upsert({
      where: { code: 'PHONE' },
      update: {},
      create: {
        code: 'PHONE',
        name: 'ค่าโทรศัพท์',
        description: 'ค่าโทรศัพท์รายเดือน',
        type: BenefitType.PHONE_ALLOWANCE,
        defaultAmount: 500,
      },
    }),
  ]);

  const [healthBenefit, transportBenefit, mealBenefit, phoneBenefit] = benefits;

  // Create Employees
  console.log('Creating employees...');
  const employees = await Promise.all([
    prisma.employee.upsert({
      where: { employeeCode: 'EMP001' },
      update: {},
      create: {
        employeeCode: 'EMP001',
        foodOrderingUserId: 1,
        firstName: 'สมชาย',
        lastName: 'ใจดี',
        nickname: 'ชาย',
        email: 'somchai@restaurant.com',
        phone: '0812345678',
        gender: Gender.MALE,
        departmentId: managementDept.id,
        positionId: managerPos.id,
        employmentType: EmploymentType.FULL_TIME,
        baseSalary: 45000,
        startDate: new Date('2022-01-01'),
        status: EmployeeStatus.ACTIVE,
        bankAccount: '1234567890',
        bankName: 'กสิกรไทย',
      },
    }),
    prisma.employee.upsert({
      where: { employeeCode: 'EMP002' },
      update: {},
      create: {
        employeeCode: 'EMP002',
        foodOrderingUserId: 3,
        firstName: 'สมศรี',
        lastName: 'รักครัว',
        nickname: 'ศรี',
        email: 'somsri@restaurant.com',
        phone: '0823456789',
        gender: Gender.FEMALE,
        departmentId: kitchenDept.id,
        positionId: headChefPos.id,
        employmentType: EmploymentType.FULL_TIME,
        baseSalary: 35000,
        startDate: new Date('2022-03-15'),
        status: EmployeeStatus.ACTIVE,
        bankAccount: '2345678901',
        bankName: 'กรุงเทพ',
      },
    }),
    prisma.employee.upsert({
      where: { employeeCode: 'EMP003' },
      update: {},
      create: {
        employeeCode: 'EMP003',
        firstName: 'สมหญิง',
        lastName: 'บริการดี',
        nickname: 'หญิง',
        email: 'somying@restaurant.com',
        phone: '0834567890',
        gender: Gender.FEMALE,
        departmentId: serviceDept.id,
        positionId: headWaiterPos.id,
        employmentType: EmploymentType.FULL_TIME,
        baseSalary: 25000,
        startDate: new Date('2022-06-01'),
        status: EmployeeStatus.ACTIVE,
        bankAccount: '3456789012',
        bankName: 'กสิกรไทย',
      },
    }),
    prisma.employee.upsert({
      where: { employeeCode: 'EMP004' },
      update: {},
      create: {
        employeeCode: 'EMP004',
        foodOrderingUserId: 2,
        firstName: 'สมพงษ์',
        lastName: 'เสิร์ฟเก่ง',
        nickname: 'พงษ์',
        email: 'sompong@restaurant.com',
        phone: '0845678901',
        gender: Gender.MALE,
        departmentId: serviceDept.id,
        positionId: waiterPos.id,
        employmentType: EmploymentType.FULL_TIME,
        baseSalary: 15000,
        startDate: new Date('2023-01-15'),
        status: EmployeeStatus.ACTIVE,
        bankAccount: '4567890123',
        bankName: 'ไทยพาณิชย์',
      },
    }),
    prisma.employee.upsert({
      where: { employeeCode: 'EMP005' },
      update: {},
      create: {
        employeeCode: 'EMP005',
        firstName: 'สมนึก',
        lastName: 'คิดเลขเก่ง',
        nickname: 'นึก',
        email: 'somnuek@restaurant.com',
        phone: '0856789012',
        gender: Gender.MALE,
        departmentId: cashierDept.id,
        positionId: srCashierPos.id,
        employmentType: EmploymentType.FULL_TIME,
        baseSalary: 20000,
        startDate: new Date('2023-03-01'),
        status: EmployeeStatus.ACTIVE,
        bankAccount: '5678901234',
        bankName: 'กรุงไทย',
      },
    }),
  ]);

  // Assign Benefits to Employees
  console.log('Assigning benefits...');
  for (const employee of employees) {
    // All employees get health insurance and meal allowance
    await prisma.employeeBenefit.upsert({
      where: {
        employeeId_benefitId: {
          employeeId: employee.id,
          benefitId: healthBenefit.id,
        },
      },
      update: {},
      create: {
        employeeId: employee.id,
        benefitId: healthBenefit.id,
        amount: 1500,
      },
    });

    await prisma.employeeBenefit.upsert({
      where: {
        employeeId_benefitId: {
          employeeId: employee.id,
          benefitId: mealBenefit.id,
        },
      },
      update: {},
      create: {
        employeeId: employee.id,
        benefitId: mealBenefit.id,
        amount: 1500,
      },
    });

    // Manager gets phone allowance
    if (employee.employeeCode === 'EMP001') {
      await prisma.employeeBenefit.upsert({
        where: {
          employeeId_benefitId: {
            employeeId: employee.id,
            benefitId: phoneBenefit.id,
          },
        },
        update: {},
        create: {
          employeeId: employee.id,
          benefitId: phoneBenefit.id,
          amount: 1000,
        },
      });

      await prisma.employeeBenefit.upsert({
        where: {
          employeeId_benefitId: {
            employeeId: employee.id,
            benefitId: transportBenefit.id,
          },
        },
        update: {},
        create: {
          employeeId: employee.id,
          benefitId: transportBenefit.id,
          amount: 2000,
        },
      });
    }
  }

  // Create Salary Records for current and last month
  console.log('Creating salary records...');
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  for (const employee of employees) {
    // Calculate benefits
    const empBenefits = await prisma.employeeBenefit.findMany({
      where: { employeeId: employee.id, isActive: true },
    });
    const allowances = empBenefits.reduce((sum, eb) => sum + eb.amount, 0);
    const socialSecurity = Math.min(employee.baseSalary * 0.05, 750);
    const grossSalary = employee.baseSalary + allowances;
    const netSalary = grossSalary - socialSecurity;

    // Last month (paid)
    await prisma.salaryRecord.upsert({
      where: {
        employeeId_month_year: {
          employeeId: employee.id,
          month: lastMonth,
          year: lastMonthYear,
        },
      },
      update: {},
      create: {
        employeeId: employee.id,
        month: lastMonth,
        year: lastMonthYear,
        baseSalary: employee.baseSalary,
        overtimeHours: Math.floor(Math.random() * 10),
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
        status: SalaryStatus.PAID,
        paidAt: new Date(lastMonthYear, lastMonth, 25),
        paymentMethod: 'BANK_TRANSFER',
      },
    });

    // Current month (pending)
    await prisma.salaryRecord.upsert({
      where: {
        employeeId_month_year: {
          employeeId: employee.id,
          month: currentMonth,
          year: currentYear,
        },
      },
      update: {},
      create: {
        employeeId: employee.id,
        month: currentMonth,
        year: currentYear,
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
  }

  console.log('✅ Seed completed successfully!');
  console.log(`
  Created:
  - ${departments.length} Departments
  - ${positions.length} Positions
  - ${benefits.length} Benefits
  - ${employees.length} Employees
  - ${employees.length * 2} Salary Records
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
