import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UserService } from '../user/user.service';
import { Role } from 'prisma/generated/enums';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { saveBase64Image } from 'src/common/store/image.upload';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService, private readonly userService: UserService) { }

  async create(createCompanyDto: CreateCompanyDto) {
    const existed = await this.findByEmail(createCompanyDto.email);
    const existedInUser = await this.userService.findByEmail(createCompanyDto.email);
    if (existed || existedInUser) {
      throw new ConflictException(
        `Company with email ${createCompanyDto.email} already exists`,
      );
    }
    let logoPath: string | undefined;
    if (createCompanyDto.logo) {
      logoPath = saveBase64Image(createCompanyDto.logo)
      createCompanyDto.logo = logoPath
    }
    const rawPassword = randomBytes(6)
      .toString('base64')
      .replace(/[+/=]/g, 'A')
      .slice(0, 8);

    const password = await argon2.hash(rawPassword);

    return this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: createCompanyDto,
      });

      const user = await tx.user.create({
        data: {
          email: createCompanyDto.email,
          companyId: company.companyId,
          role: Role.CLIENT,
          password,
        },
      });

      return user;
    });
  }

  async createByGoogle(createCompanyDto: CreateCompanyDto, googleId: string) {
    const existed = await this.findByEmail(createCompanyDto.email);
    const existedInUser = await this.userService.findByEmail(createCompanyDto.email);
    if (existed || existedInUser) {
      throw new ConflictException(
        `Company with email ${createCompanyDto.email} already exists`,
      );
    }
    let logoPath: string | undefined;
    if (createCompanyDto.logo) {
      logoPath = saveBase64Image(createCompanyDto.logo)
      createCompanyDto.logo = logoPath
    }
    return this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: createCompanyDto,
      });

      const user = await tx.user.create({
        data: {
          email: createCompanyDto.email,
          googleId,
          companyId: company.companyId,
          role: Role.CLIENT,
          password: null,
        },
      });

      return user;
    });
  }

  async findAll(filters?: { limit?: number; offset?: number }) {
    const { limit = 10, offset = 0 } = filters || {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.company.findMany({
        take: limit,
        skip: offset,
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.company.count({ where: { deletedAt: null } }),
    ]);

    return {
      data,
      meta: {
        total,
        limit,
        offset,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  findByEmail(email: string) {
    return this.prisma.company.findUnique({
      where: { email },
    });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { companyId: id },
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.findOne(id);
    if (updateCompanyDto.email && updateCompanyDto.email !== company.email) {
      const existed = await this.findByEmail(updateCompanyDto.email);
      const existedInUser = await this.userService.findByEmail(updateCompanyDto.email);
      if (existed || existedInUser) {
        throw new ConflictException(
          `Company with email ${updateCompanyDto.email} already exists`,
        );
      }
    }
    let logoPath: string | undefined;
    if (updateCompanyDto.logo) {
      logoPath = saveBase64Image(updateCompanyDto.logo)
      updateCompanyDto.logo = logoPath;
    }
    return this.prisma.$transaction(async (tx) => {
      const updatedCompany = await tx.company.update({
        where: { companyId: id },
        data: updateCompanyDto,
      });
      if (updateCompanyDto.email) {
        await tx.user.updateMany({
          where: { companyId: id },
          data: { email: updateCompanyDto.email },
        });
      }
      return updatedCompany;
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.userService.removeByCompanyId(id);
    return this.prisma.company.update({
      where: {
        companyId: id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

}
