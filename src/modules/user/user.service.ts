import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from 'prisma/generated/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  create(createUserDto: CreateUserDto) {
    const data: Prisma.UserCreateInput = {
      email: createUserDto.email,
      password: createUserDto.password,
      ...(createUserDto.companyId && {
        company: {
          connect: { companyId: createUserDto.companyId },
        },
      }),
      ...(createUserDto.employeeId && {
        employee: {
          connect: { employeeId: createUserDto.employeeId },
        }
      })
    };
    return this.prisma.user.create({
      data
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      include: {
        company: true,
        employee: true,
      }
    });
  }

  findByEmail(email: string, googleId?: string) {
    return this.prisma.user.findUnique({
      where: { email, googleId },
    });
  }

  async findByCompanyId(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { companyId: id },
    });
    if (!user) {
      throw new NotFoundException(`User with this ID ${id} not found`);
    }
    return user;
  }

  async findByEmployeeId(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { employeeId: id },
    });
    if (!user) {
      throw new NotFoundException(`User with this ID ${id} not found`);
    }
    return user;
  }

  findOne(id: string) {
    return `This action returns a #${id} user`;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    return "";
  }

  async removeByCompanyId(id: string) {
    await this.findByCompanyId(id);
    return this.prisma.user.update({
      where: {
        companyId: id,
      },
      data: {
        deletedAt: new Date()
      }
    })
  }

  async removeByEmployeeId(id: string) {
    await this.findByEmployeeId(id);
    return this.prisma.user.update({
      where: {
        employeeId: id,
      },
      data: {
        deletedAt: new Date()
      }
    })
  }

  async updatePassword(userId: string, hashedPassword: string) {
    return this.prisma.user.update({
      where: {
        userId: userId,
      },
      data: {
        password: hashedPassword,
      },
    });
  }
}
