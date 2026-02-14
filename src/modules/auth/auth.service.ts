import { MailService } from './../mail/mail.service';
import { Injectable } from '@nestjs/common';
import { CompanyService } from '../company/company.service';
import { CustomUnauthorizedException } from 'src/common/exceptions/custom.exceptions';
import axios from 'axios';
import { CreateCompanyDto } from '../company/dto/create-company.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';
import { ResetPasswordDto } from './dto/reset.dto';
import { PrismaService } from 'src/prisma.service';
import { randomBytes } from 'crypto';
import { ForgotPasswordDto } from './dto/forgotPwd.dto';
import { PasswordResetDto } from './dto/pwdReset.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private companyService: CompanyService,
    private userService: UserService,
    private prisma: PrismaService,
    private readonly mailService: MailService,
  ) { }

  async googleLogin(data: any) {
    if (!data?.accessToken) {
      throw new CustomUnauthorizedException('Missing Google access token');
    }

    const googleUser = await this.verifyGoogleToken(data.accessToken);

    const {
      sub: googleId,
      email,
      given_name: firstName,
      family_name: lastName,
      picture,
    } = googleUser;
    const base64Logo = picture ? await this.imageUrlToBase64(picture) : '';

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.googleId !== googleId) {
      if (existingUser.password) {
        throw new CustomUnauthorizedException(
          'This email is registered with password login. Please use password login or reset your password.',
        );
      }
      throw new CustomUnauthorizedException(
        'This email is already registered with a different account.',
      );
    }

    let user = await this.userService.findByEmail(email, googleId);
    let isNewUser = false;

    if (!user) {
      const createCompanyDto: CreateCompanyDto = {
        name: `${firstName} ${lastName}`,
        email,
        logo: base64Logo.toString(),
        companyType: '',
        address: '',
        phone: '',
      };

      user = await this.companyService.createByGoogle(
        createCompanyDto,
        googleId,
      );
      isNewUser = true;
    }

    // Check if user has admin or client role only
    if (user.role !== 'ADMIN' && user.role !== 'CLIENT') {
      throw new CustomUnauthorizedException(
        'Only Admin and Client users can access this portal.',
      );
    }

    const token = this.jwtService.sign({ user });

    return {
      message: isNewUser
        ? 'Google registration successful'
        : 'Google login successful',
      token,
    };
  }

  private async verifyGoogleToken(accessToken: string) {
    try {
      const { data } = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return data;
    } catch (error) {
      throw new CustomUnauthorizedException('Invalid Google token');
    }
  }

  async employeeSignIn(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (user?.role === 'ADMIN' || user?.role === 'CLIENT') {
      throw new CustomUnauthorizedException('Only Employee can access this portal.');
    }
    if (!user) {
      throw new CustomUnauthorizedException('Invalid email');
    }
    if (!user.password) {
      throw new CustomUnauthorizedException(
        'This account uses Google login. Please login with Google.',
      );
    }

    const isPasswordValid = await argon2.verify(
      user.password,
      loginDto.password,
    );
    if (!isPasswordValid) {
      throw new CustomUnauthorizedException('Invalid password');
    }
    const token = this.jwtService.sign({ user });
    return token;
  }

  async signIn(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new CustomUnauthorizedException('Invalid email');
    }
    if (!user.password) {
      throw new CustomUnauthorizedException(
        'This account uses Google login. Please login with Google.',
      );
    }

    if (user.role !== 'ADMIN' && user.role !== 'CLIENT') {
      throw new CustomUnauthorizedException('Only Admin and Client users can access this portal.');
    }

    if (user.role === 'CLIENT' && user.companyId) {
      const company = await this.companyService.findOne(user.companyId);
      user.name = company.name;
      user.logo = company.logo;
    }

    const isPasswordValid = await argon2.verify(
      user.password,
      loginDto.password,
    );
    if (!isPasswordValid) {
      throw new CustomUnauthorizedException('Invalid password');
    }
    const token = this.jwtService.sign({ user });
    return token;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, user: any) {
    const userData = await this.userService.findByEmail(user.email);
    if (!userData) {
      throw new CustomUnauthorizedException('Invalid email');
    }
    if (!userData.password) {
      throw new CustomUnauthorizedException('This account uses Google login');
    }
    const isPasswordValid = await argon2.verify(
      userData.password,
      resetPasswordDto.currentPassword,
    );
    if (!isPasswordValid) {
      throw new CustomUnauthorizedException('Invalid password');
    }
    const hashedNewPassword = await argon2.hash(resetPasswordDto.newPassword);
    await this.userService.updatePassword(userData.userId, hashedNewPassword);
    return {
      statusCode: 201,
      message: 'Password reset successful',
    };
  }

  async imageUrlToBase64(imageUrl: string): Promise<string> {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(response.data);
    const contentType = response.headers['content-type'] || 'image/jpeg';

    return `data:${contentType};base64,${buffer.toString('base64')}`;
  }

  async forgotPassword(forgotPassworddto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPassworddto.email },
      include: { company: true },
    });

    if (!user) {
      return { message: 'If this email exists, a reset link has been sent.' };
    }

    const token = randomBytes(32).toString('hex');
    const expiredAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.forgetPassword.upsert({
      where: { userId: user.userId },
      update: { token, expiredAt },
      create: { userId: user.userId, token, expiredAt },
    });

    const frontendUrl = 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    if (user.company)
      await this.mailService.sendForgotPasswordEmail(
        user.email,
        user.company.name || 'User',
        resetLink,
      );

    return { message: 'If this email exists, a reset email has been sent.' };
  }

  async passwordReset(passwordResetDto: PasswordResetDto) {
    const record = await this.prisma.forgetPassword.findFirst({
      where: { token: passwordResetDto.token },
    });

    if (!record) {
      throw new Error('Invalid or expired token');
    }

    if (new Date() > record.expiredAt) {
      await this.prisma.forgetPassword.delete({
        where: { userId: record.userId },
      });
      throw new Error('Token expired');
    }

    const hashedPassword = await argon2.hash(passwordResetDto.newPassword);

    await this.prisma.user.update({
      where: { userId: record.userId },
      data: { password: hashedPassword },
    });

    await this.prisma.forgetPassword.delete({
      where: { userId: record.userId },
    });

    return { message: 'Password reset successfully' };
  }
}
