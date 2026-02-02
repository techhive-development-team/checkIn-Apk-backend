import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { join } from 'path';
import * as bodyParser from 'body-parser';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  
  app.setBaseViewsDir(join(__dirname, '..', 'src/templates'));
  app.setViewEngine('hbs');

  if (process.env.NODE_ENV !== 'production') {
    app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  }
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((err: any) => ({
          field: err.property,
          message: Object.values(err.constraints)[0],
        }));
        return new BadRequestException({
          statusCode: 400,
          error: 'Validation Error',
          data: formattedErrors,
        });
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();