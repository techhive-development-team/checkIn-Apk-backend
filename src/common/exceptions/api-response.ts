export class BaseResponse<T = any> {
  statusCode: number;
  success: boolean;
  message?: string;
  data?: T;
  meta?: any;

  constructor(
    statusCode: number,
    success: boolean,
    message?: string,
    data?: T,
    meta?: any,
  ) {
    this.statusCode = statusCode;
    this.success = success;
    this.message = message;
    this.data = data;
    if (meta) {
      this.meta = meta;
    }
  }
}

export class ApiResponse {

  static success<T>(
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
    meta?: any,
  ): BaseResponse<T> {
    return new BaseResponse<T>(statusCode, true, message, data, meta);
  }

  static fail(
    message: string = 'Something went wrong',
    statusCode: number = 400,
    meta?: any,
  ): BaseResponse<null> {
    return new BaseResponse<null>(statusCode, false, message, null, meta);
  }

  static unauthorized(
    message: string = 'Unauthorized access',
    statusCode: number = 401,
    meta?: any,
  ): BaseResponse<null> {
    return new BaseResponse<null>(statusCode, false, message, null, meta);
  }

  static notFound(
    message: string = 'Resource not found',
    statusCode: number = 404,
    meta?: any,
  ): BaseResponse<null> {
    return new BaseResponse<null>(statusCode, false, message, null, meta);
  }

  static serverError(
    message: string = 'Internal server error',
    statusCode: number = 500,
    meta?: any,
  ): BaseResponse<null> {
    return new BaseResponse<null>(statusCode, false, message, null, meta);
  }

  static conflict(
    message: string = 'Conflict occurred',
    statusCode: number = 409,
    meta?: any,
  ): BaseResponse<null> {
    return new BaseResponse<null>(statusCode, false, message, null, meta);
  }
}
