import {
  BadRequestException,
  ConflictException as NestConflictException,
  NotFoundException as NestNotFoundException,
  UnauthorizedException as NestUnauthorizedException,
} from '@nestjs/common';

export class ValidationException extends BadRequestException {
  constructor(message: string, data?: any) {
    super({
      statusCode: 400,
      success: false,
      message,
      data: data || null,
    });
  }

  static multiple(errors: { field: string; message: string }[]) {
    return new BadRequestException({
      statusCode: 400,
      success: false,
      message: 'Validation failed',
      data: errors,
    });
  }
}

export class CustomNotFoundException extends NestNotFoundException {
  constructor(message: string, data?: any) {
    super({
      statusCode: 404,
      success: false,
      message,
      data: data || null,
    });
  }
}

export class CustomConflictException extends NestConflictException {
  constructor(message: string, data?: any) {
    super({
      statusCode: 409,
      success: false,
      message,
      data: data || null,
    });
  }
}

export class CustomUnauthorizedException extends NestUnauthorizedException {
  constructor(message: string, data?: any) {
    super({
      statusCode: 401,
      success: false,
      message,
      data: data || null,
    });
  }
}
