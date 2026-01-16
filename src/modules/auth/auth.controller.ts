import { Body, Controller, Get, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

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
}
