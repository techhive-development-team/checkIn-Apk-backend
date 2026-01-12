import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { PrismaService } from './prisma.service';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { EmployeeModule } from './modules/employee/employee.module';
import { CompanyModule } from './modules/company/company.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    MulterModule.register({
      dest: './uploads/images',
    }),
    UserModule,
    AuthModule,
    EmployeeModule,
    CompanyModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware)
      .forRoutes('cats');
  }
}
