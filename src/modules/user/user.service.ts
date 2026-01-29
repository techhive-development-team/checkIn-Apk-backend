import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { CustomNotFoundException } from 'src/common/exceptions/custom.exceptions';
import { Prisma } from 'prisma/generated/client';
import { saveBase64Image } from 'src/common/store/image.upload';

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

  async findAll(filters?: { limit?: number; offset?: number }) {
    const { limit = 10, offset = 0 } = filters || {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        take: limit,
        skip: offset,
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.user.count({ where: { deletedAt: null } })
    ])
    return {
      data,
      meta: {
        total,
        limit,
        offset,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
      }
    }
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
      throw new CustomNotFoundException(`User with this ID ${id} not found`);
    }
    return user;
  }

  async findByEmployeeId(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { employeeId: id },
    });
    if (!user) {
      throw new CustomNotFoundException(`User with this ID ${id} not found`);
    }
    return user;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { userId: id }
    })
    if (!user) {
      throw new CustomNotFoundException(`User with ID ${id} not found`)
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    let logoPath: string | undefined;
    if (updateUserDto.logo) {
      logoPath = saveBase64Image(updateUserDto.logo)
      updateUserDto.logo = logoPath;
    }
    return this.prisma.user.update({
      data: {
        name: updateUserDto.name,
        email: updateUserDto.email,
        logo: updateUserDto.logo
      },
      where: { userId: id }
    })
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
