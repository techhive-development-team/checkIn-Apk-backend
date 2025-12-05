import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  if (process.env.NODE_ENV !== 'production') {
    app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  }
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