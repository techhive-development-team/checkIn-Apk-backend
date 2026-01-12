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
    if(createCompanyDto.logo){
      
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

      await tx.user.create({
        data: {
          email: createCompanyDto.email,
          companyId: company.companyId,
          role: Role.CLIENT,
          password: password,
        },
      });

      return company;
    });
  }

  findAll() {
    return this.prisma.company.findMany();
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
    await this.findOne(id);

    return this.prisma.company.update({
      where: { companyId: id },
      data: updateCompanyDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.company.delete({
      where: { companyId: id },
    });
  }
}
