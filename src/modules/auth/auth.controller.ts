import { Body, Controller, Get, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { LoginDto } from './dto/login.dto';
import { CreateCompanyDto } from '../company/dto/create-company.dto';
import { CompanyService } from '../company/company.service';

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
    return this.authService.googleLogin(req.user);
  }

  @Post('login')
  async signIn(
    @Body(new ValidationPipe()) loginDto: LoginDto,
  ) {
    return this.authService.signIn(loginDto)
  }

  @Post('signup')
  async signUp(@Body() createCompanyDto: CreateCompanyDto) {
    const company = this.companyService.create(createCompanyDto);
    return {
      statusCode: 200,
      message: 'Company created successfully',
      data: company,
    };
  }
}
