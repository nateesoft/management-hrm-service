import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { PositionsModule } from './modules/positions/positions.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { SalaryModule } from './modules/salary/salary.module';
import { BenefitsModule } from './modules/benefits/benefits.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { IntegrationModule } from './modules/integration/integration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    DepartmentsModule,
    PositionsModule,
    EmployeesModule,
    SalaryModule,
    BenefitsModule,
    DashboardModule,
    IntegrationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
