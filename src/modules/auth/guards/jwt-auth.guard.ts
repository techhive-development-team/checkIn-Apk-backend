import {
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { BaseResponse } from 'src/common/exceptions/api-response';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        if (err || !user) {
            const response = context.switchToHttp().getResponse<Response>();
            const apiErrorResponse = new BaseResponse(
                401,
                false,
                'Invalid or expired token',
                null,
            );
            response.status(401).json(apiErrorResponse);
            return;
        }
        return user;
    }
}
