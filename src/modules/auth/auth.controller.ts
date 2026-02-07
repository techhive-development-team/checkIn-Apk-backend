import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { LoginDto } from './dto/login.dto';
import { CreateCompanyDto } from '../company/dto/create-company.dto';
import { CompanyService } from '../company/company.service';
import { ResetPasswordDto } from './dto/reset.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiResponse } from 'src/common/exceptions/api-response';
import type { Response } from 'express';
import { ForgotPasswordDto } from './dto/forgotPwd.dto';
import { PasswordResetDto } from './dto/pwdReset.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly companyService: CompanyService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    try {
      const result = await this.authService.googleLogin(req.user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/google?token=${result.token}`);
    } catch (error: any) {
      const frontendUrl =
        process.env.FRONTEND_URL || 'http://localhost:5173/login';
      const errorMessage = error?.message || 'Authentication failed';
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(errorMessage)}`,
      );
    }
  }

  @Post('login')
  async signIn(
    @Body(new ValidationPipe()) loginDto: LoginDto,
  ): Promise<ApiResponse> {
    const token = await this.authService.signIn(loginDto);
    return ApiResponse.success({ token });
  }

  @Post('signup')
  async signUp(
    @Body() createCompanyDto: CreateCompanyDto,
  ): Promise<ApiResponse> {
    const company = await this.companyService.create(createCompanyDto);
    return ApiResponse.success(company, 'Company created successfully. Your password has been sent to your email.');
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Req() req) {
    const result = await this.authService.resetPassword(
      resetPasswordDto,
      req.user,
    );
    return ApiResponse.success(result, 'Password reset successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify-token')
  async verifyToken(@Req() req): Promise<ApiResponse> {
    return ApiResponse.success(req.user);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(dto);
    return ApiResponse.success(
      result,
      'If this email exists, the reset email has been sent.',
    );
  }

  @Post('password-reset')
  async passwordRese(@Body() dto: PasswordResetDto) {
    const result = await this.authService.passwordReset(dto);
    return ApiResponse.success(result, 'Password reset successfully');
  }
}
