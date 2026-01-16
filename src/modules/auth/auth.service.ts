import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CompanyService } from '../company/company.service';
import axios from 'axios';
import { CreateCompanyDto } from '../company/dto/create-company.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private companyService: CompanyService,
    private userService: UserService
  ) { }

  async googleLogin(data: any) {
    if (!data?.accessToken) {
      throw new UnauthorizedException('Missing Google access token');
    }

    const googleUser = await this.verifyGoogleToken(data.accessToken);

    const {
      sub: googleId,
      email,
      given_name: firstName,
      family_name: lastName,
      picture,
    } = googleUser;

    let user = await this.userService.findByEmail(email, googleId);
    let isNewUser = false;

    if (!user) {
      const createCompanyDto: CreateCompanyDto = {
        name: `${firstName} ${lastName}`,
        email,
        logo: picture,
        companyType: '',
        address: '',
        phone: '',
      };

      user = await this.companyService.createByGoogle(createCompanyDto, googleId);
      isNewUser = true;
    }

    const token = this.jwtService.sign({
      sub: user.userId,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    });


    return {
      message: isNewUser ? 'Google registration successful' : 'Google login successful',
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
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async signIn(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }
    if (!user.password) {
      throw new UnauthorizedException('This account uses Google login');
    }
    const isPasswordValid = await argon2.verify(
      user.password,
      loginDto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    const token = this.jwtService.sign({ user });
    return {
      message: 'Google login successful',
      token,
    };
  }

}
