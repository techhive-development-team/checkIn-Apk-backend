import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { PrismaService } from 'src/prisma.service';
import { UserService } from '../user/user.service';
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MailModule, AuthModule],
  controllers: [CompanyController],
  providers: [
    CompanyService,
    PrismaService,
    UserService,
  ],
  exports: [CompanyService], 
})
export class CompanyModule { }
