import { Body, Controller, Get, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { LoginDto } from './dto/login.dto';
import { CreateCompanyDto } from '../company/dto/create-company.dto';
import { CompanyService } from '../company/company.service';
import { ResetPasswordDto } from './dto/reset.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiResponse } from 'src/common/exceptions/api-response';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly companyService: CompanyService) { }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {

  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req) {
    const result = await this.authService.googleLogin(req.user);
    return ApiResponse.success(result, result.message);
  }

  @Post('login')
  async signIn(
    @Body(new ValidationPipe()) loginDto: LoginDto,
  ): Promise<ApiResponse> {
    const token = await this.authService.signIn(loginDto);
    return ApiResponse.success({ token });
  }

  @Post('signup')
  async signUp(@Body() createCompanyDto: CreateCompanyDto): Promise<ApiResponse> {
    const company = await this.companyService.create(createCompanyDto);
    return ApiResponse.success(company, 'Company created successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Req() req) {
    const result = await this.authService.resetPassword(resetPasswordDto, req.user);
    return ApiResponse.success(result, 'Password reset successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify-token')
  async verifyToken(@Req() req): Promise<ApiResponse> {
    return ApiResponse.success(req.user);
  }
}
