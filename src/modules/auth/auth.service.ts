import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) { }

  async googleLogin(data: any) {
    if (!data) {
      return 'No user from Google';
    }
    const company = await this.prisma.company.findUnique({
      where: {
        email: data.email,
      },
    });
    if (!company) {
      await this.prisma.company.create({
        data: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          logo: data.picture,
        },
      });
    }
    
    return {
      message: 'Google login successful',
      data,
    };
  }
}
