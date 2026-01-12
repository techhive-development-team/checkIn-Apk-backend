import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { PrismaService } from 'src/prisma.service';
import { UserService } from '../user/user.service';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService, PrismaService, UserService],
})
export class CompanyModule { }
