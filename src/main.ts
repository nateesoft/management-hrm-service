import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('HRM Management API')
    .setDescription('API for HR Management System - ระบบจัดการทรัพยากรบุคคล')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication')
    .addTag('Departments', 'Department Management - จัดการแผนก')
    .addTag('Positions', 'Position Management - จัดการตำแหน่ง')
    .addTag('Employees', 'Employee Management - จัดการพนักงาน')
    .addTag('Salary', 'Salary Management - จัดการเงินเดือน')
    .addTag('Benefits', 'Benefits Management - จัดการสวัสดิการ')
    .addTag('Attendance', 'Attendance Management - จัดการการเข้างาน')
    .addTag('Leave', 'Leave Management - จัดการการลา')
    .addTag('Dashboard', 'Dashboard & Reports - รายงานและสถิติ')
    .addTag('Integration', 'Integration with Food Ordering Service')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3005;
  await app.listen(port, '0.0.0.0');
  console.log(`HRM Service running on: http://0.0.0.0:${port}/api`);
  console.log(`Swagger docs: http://0.0.0.0:${port}/api/docs`);
}
bootstrap();
