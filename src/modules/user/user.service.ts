import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { CustomConflictException, CustomNotFoundException } from 'src/common/exceptions/custom.exceptions';
import { Prisma, Role } from 'prisma/generated/client';
import { saveBase64Image } from 'src/common/store/image.upload';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly mailService: MailService
  ) { }

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

  async createAdmin(createUserDto: CreateUserDto) {
    const exist = await this.findByEmail(createUserDto.email);
    if (exist) {
      throw new CustomConflictException(`Company with email ${createUserDto.email} already exists`,)
    }
    let logoPath: string | undefined;
    if (createUserDto.logo) {
      logoPath = saveBase64Image(createUserDto.logo)
      createUserDto.logo = logoPath;
    }
    const rawPassword = randomBytes(6)
      .toString('base64')
      .replace(/[+/=]/g, 'A')
      .slice(0, 8);

    const password = await argon2.hash(rawPassword);
    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        password: password,
        email: createUserDto.email,
        logo: createUserDto.logo,
        role: Role.ADMIN
      }
    })

    if (createUserDto.name) {
      await this.mailService.sendAccountCreateMail(
        createUserDto.email,
        createUserDto.name,
        createUserDto.email,
        rawPassword,
        "CIA ADMIN"
      );
    }
    return user
  }

  async findAll(filters?: { limit?: number; offset?: number }) {
    const { limit = 10, offset = 0 } = filters || {};

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        take: limit,
        skip: offset, where: {
          deletedAt: null,
          OR: [
            { role: 'ADMIN' },
            { role: 'CLIENT' },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: {
          company: true,
          employee: true
        }
      }),
      this.prisma.user.count({ where: { deletedAt: null } })
    ])

    const data = users.map((user) => {
      let name: string | null = null;
      let logo: string | null = null;

      if (user.role === 'ADMIN') {
        name = user.name;
        logo = user.logo;
      }
      if (user.role === 'CLIENT') {
        name = user.company?.name || null;
        logo = user.company?.logo || null;
      }
      return {
        ...user,
        name: name,
        logo: logo,
      };
    });

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
      where: { userId: id },
      include: { company: true }
    })
    if (!user) {
      throw new CustomNotFoundException(`User with ID ${id} not found`)
    }
    let name: string | null = null;
    let logo: string | null = null;
    if (user.role === 'CLIENT') {
      name = user.company?.name || null;
      logo = user.company?.logo || null;
      user.name = name;
      user.logo = logo;
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
        logo: updateUserDto.logo,
        status: updateUserDto.status
      },
      where: { userId: id }
    })
  }

  async remove(id: string) {
    await this.prisma.user.update({
      where: {
        userId: id,
      },
      data: {
        deletedAt: new Date()
      }
    })
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
