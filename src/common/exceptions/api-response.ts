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
}
