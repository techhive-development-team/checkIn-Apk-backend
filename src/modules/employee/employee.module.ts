import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { PrismaService } from 'src/prisma.service';
import { CompanyService } from '../company/company.service';
import { UserService } from '../user/user.service';

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService, PrismaService, CompanyService, UserService],
})
export class EmployeeModule { }
